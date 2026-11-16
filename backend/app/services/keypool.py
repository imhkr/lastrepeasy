"""
Rotating API-key pool for the Coarena cloud adjudication tier.

The endpoint is OpenAI-compatible: POST {base}/chat/completions with a Bearer key.
Measured behaviour on the real keys: gpt-6-luna is fast, gemini-3-8-flash handles
vision, and claude-* models return 402 Payment Required. So a 402 is a model
problem, not a dead key - we try the next model on the same key first, and only
strike the key when every model refuses it. 401/403 means the key itself is broken,
so it goes sticky-unhealthy at once.

Keys are masked everywhere they can be seen: stats(), reprs, exception messages.
Sync on purpose; a request is 1-3 s and the caller runs it in its own thread.
"""
from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import httpx

DEFAULT_MAX_STRIKES = 3
AUTH_STATUSES = (401, 403)  # key is broken, never try it again
RETRY_STATUSES = (402, 429)  # model/payment or rate limit: one strike if it repeats for the whole key


class KeyPoolError(RuntimeError):
    """Configuration or routing failure in the key pool."""


class AllRoutesFailed(KeyPoolError):
    """Every key and every model refused the request. `attempts` holds masked 'key/model:status' strings."""

    def __init__(self, attempts: List[str]):
        self.attempts = attempts
        super().__init__("all routes failed: " + (", ".join(attempts) if attempts else "no healthy keys"))


def mask(key: str) -> str:
    """coa_a5911d0be920fac59396776f16a3a895 -> coa_...a895. Short keys lose everything but their last 4."""
    if len(key) <= 8:
        return "***" + key[-2:] if len(key) > 2 else "***"
    return f"{key[:4]}...{key[-4:]}"


def _load_dotenv_if_present() -> None:
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if not env_path.exists():
        return
    try:
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'").strip('"')
            if k and k not in os.environ:
                os.environ[k] = v
    except Exception:
        pass


@dataclass
class KeyState:
    key: str = field(repr=False)  # never let a raw key reach a repr or a log line
    failures: int = 0  # consecutive whole-key failures (402/429 on every model)
    healthy: bool = True
    last_used: Optional[float] = None
    last_status: Optional[int] = None

    @property
    def masked(self) -> str:
        return mask(self.key)


def _post_json(url: str, headers: Dict[str, str], payload: Dict, timeout: float) -> Tuple[int, str]:
    """One HTTP call. Returns (status, body text). Tests monkeypatch this, so nothing else does I/O.

    trust_env is off on purpose. httpx 0.28 parses the proxy environment at client construction
    and raises InvalidURL on a bracketed IPv6 entry in NO_PROXY (macOS dev shells commonly set
    NO_PROXY to include [::1]). That turned every adjudication call into a hard failure with an
    error that looks nothing like a proxy problem. This call targets one known HTTPS host, so
    the proxy environment buys nothing and only adds a crash surface.
    """
    with httpx.Client(timeout=timeout, trust_env=False) as client:
        resp = client.post(url, headers=headers, json=payload)
        return resp.status_code, resp.text


def _dedupe(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for i in items:
        if i and i not in seen:
            seen.add(i)
            out.append(i)
    return out


class KeyPool:
    def __init__(
        self,
        base_url: str,
        keys: List[str],
        models: List[str],
        max_strikes: int = DEFAULT_MAX_STRIKES,
    ):
        if not keys:
            raise KeyPoolError("KeyPool needs at least one API key.")
        if not models:
            raise KeyPoolError("KeyPool needs at least one model.")
        self.base_url = base_url.rstrip("/")
        self.keys: List[KeyState] = [KeyState(k) for k in _dedupe([k.strip() for k in keys])]
        self.models = _dedupe([m.strip() for m in models])
        self.max_strikes = max(1, int(max_strikes))
        self._cursor = 0  # index of the key the next request starts from

    @classmethod
    def from_env(cls) -> "KeyPool":
        _load_dotenv_if_present()
        base_url = os.getenv("COARENA_BASE_URL", "").strip()
        keys = [os.getenv(f"COARENA_API_KEY_{i}", "").strip() for i in range(1, 5)]
        keys = [k for k in keys if k]
        if not keys:
            raise KeyPoolError("No Coarena API keys configured: set COARENA_API_KEY_1..4 in .env.")
        if not base_url:
            raise KeyPoolError("COARENA_BASE_URL is not set: the key pool has nowhere to send requests.")

        extras = [m.strip() for m in os.getenv("COARENA_FALLBACK_MODELS", "").split(",")]
        models = _dedupe(
            [
                os.getenv("COARENA_ADJUDICATE_MODEL", "").strip(),
                os.getenv("COARENA_VISION_MODEL", "").strip(),
                *extras,
            ]
        )
        if not models:
            raise KeyPoolError("Set COARENA_ADJUDICATE_MODEL and/or COARENA_VISION_MODEL in .env.")
        try:
            max_strikes = int(os.getenv("COARENA_KEY_MAX_STRIKES", str(DEFAULT_MAX_STRIKES)))
        except ValueError:
            raise KeyPoolError("COARENA_KEY_MAX_STRIKES must be a whole number.")
        return cls(base_url=base_url, keys=keys, models=models, max_strikes=max_strikes)

    def _order(self) -> List[Tuple[int, KeyState]]:
        """Healthy keys only, starting where the last request left off."""
        n = len(self.keys)
        return [
            ((self._cursor + i) % n, self.keys[(self._cursor + i) % n])
            for i in range(n)
            if self.keys[(self._cursor + i) % n].healthy
        ]

    def _models_for(self, model: Optional[str]) -> List[str]:
        return _dedupe([model or "", *self.models])

    def _strike(self, ks: KeyState) -> None:
        ks.failures += 1
        if ks.failures >= self.max_strikes:
            ks.healthy = False

    def chat(
        self,
        messages: List[Dict],
        model: Optional[str] = None,
        max_tokens: int = 1024,
        json_schema: Optional[Dict] = None,
        timeout: float = 30.0,
    ) -> Dict:
        """Try each healthy key with each model in order; return the first parsed JSON body."""
        models = self._models_for(model)
        attempts: List[str] = []
        url = f"{self.base_url}/chat/completions"

        for idx, ks in self._order():
            headers = {"Authorization": f"Bearer {ks.key}", "Content-Type": "application/json"}
            statuses: List[int] = []
            broke_on_auth = False
            for name in models:
                payload: Dict = {"model": name, "messages": messages, "max_tokens": max_tokens}
                if json_schema is not None:
                    payload["response_format"] = {"type": "json_schema", "json_schema": json_schema}
                ks.last_used = time.time()
                try:
                    status, body = _post_json(url, headers, payload, timeout)
                except Exception as exc:  # network/timeout: this route failed, keep the key alive
                    ks.last_status = None
                    attempts.append(f"{ks.masked}/{name}:net({type(exc).__name__})")
                    continue
                ks.last_status = status
                attempts.append(f"{ks.masked}/{name}:{status}")
                if 200 <= status < 300:
                    ks.failures = 0
                    self._cursor = (idx + 1) % len(self.keys)
                    try:
                        return json.loads(body)
                    except json.JSONDecodeError:
                        attempts.append(f"{ks.masked}/{name}:badjson")
                        continue
                if status in AUTH_STATUSES:
                    ks.healthy = False  # auth is broken for this key, no point retrying it
                    ks.failures = self.max_strikes
                    broke_on_auth = True
                    break
                statuses.append(status)

            if not broke_on_auth and statuses and all(s in RETRY_STATUSES for s in statuses):
                self._strike(ks)  # every model refused this key: one strike
            self._cursor = (idx + 1) % len(self.keys)

        raise AllRoutesFailed(attempts)

    def stats(self) -> Dict:
        return {
            "base_url": self.base_url,
            "models": list(self.models),
            "max_strikes": self.max_strikes,
            "keys": [
                {
                    "key": ks.masked,
                    "healthy": ks.healthy,
                    "failures": ks.failures,
                    "last_status": ks.last_status,
                    "last_used": ks.last_used,
                }
                for ks in self.keys
            ],
        }

    def __repr__(self) -> str:
        return f"KeyPool(keys={[ks.masked for ks in self.keys]}, models={self.models})"
