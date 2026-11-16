import json

import pytest

from app.services import keypool
from app.services.keypool import AllRoutesFailed, KeyPool, KeyPoolError, mask

BASE = "https://coarena.example/api/v1"
KEYS = ["coa_aaaaaaaaaaaaaaaaaaaaaaaaaaaa1111", "coa_bbbbbbbbbbbbbbbbbbbbbbbbbbbb2222", "coa_cccccccccccccccccccccccccccc3333"]
MODELS = ["model-a", "model-b"]


def ok_body(model="model-a"):
    return json.dumps({"model": model, "choices": [{"message": {"content": "{}"}}]})


class FakeHTTP:
    """Records every call and answers from a script: {(masked_key, model): status} or a callable."""

    def __init__(self, script):
        self.script = script
        self.calls = []

    def __call__(self, url, headers, payload, timeout):
        key = headers["Authorization"].split(" ", 1)[1]
        model = payload["model"]
        self.calls.append((mask(key), model))
        answer = self.script.get((mask(key), model), self.script.get(mask(key), 200))
        return (answer, ok_body(model)) if isinstance(answer, int) else answer


def make_pool(script, models=None, keys=None, max_strikes=3):
    fake = FakeHTTP(script)
    pool = KeyPool(BASE, keys or KEYS, models or MODELS, max_strikes=max_strikes)
    keypool._post_json = fake
    return pool, fake


@pytest.fixture(autouse=True)
def restore_http():
    original = keypool._post_json
    yield
    keypool._post_json = original


def test_round_robin_order():
    pool, fake = make_pool({})
    for _ in range(4):
        pool.chat([{"role": "user", "content": "hi"}])
    assert [c[0] for c in fake.calls] == [mask(k) for k in KEYS] + [mask(KEYS[0])]
    assert all(model == "model-a" for _, model in fake.calls)


def test_401_marks_key_unhealthy_and_skips_it():
    pool, fake = make_pool({mask(KEYS[0]): 401})
    pool.chat([{"role": "user", "content": "hi"}])
    assert pool.stats()["keys"][0]["healthy"] is False
    for _ in range(3):
        pool.chat([{"role": "user", "content": "hi"}])
    assert mask(KEYS[0]) not in [k for k, _ in fake.calls[2:]]


def test_402_on_model_a_falls_through_to_model_b_without_burning_key():
    pool, fake = make_pool({(mask(KEYS[0]), "model-a"): 402})
    pool.chat([{"role": "user", "content": "hi"}])
    assert fake.calls[:2] == [(mask(KEYS[0]), "model-a"), (mask(KEYS[0]), "model-b")]
    st = pool.stats()["keys"][0]
    assert st["healthy"] is True
    assert st["failures"] == 0


def test_402_on_every_model_counts_one_strike_and_rotates():
    pool, fake = make_pool({mask(KEYS[0]): 402})
    # key 1 fails both models (one strike), key 2 succeeds
    body = pool.chat([{"role": "user", "content": "hi"}])
    assert body["model"] == "model-a"
    assert pool.stats()["keys"][0]["failures"] == 1
    assert pool.stats()["keys"][0]["healthy"] is True
    assert fake.calls[-1][0] == mask(KEYS[1])


def test_repeated_strikes_kill_key():
    pool, _ = make_pool({mask(k): 429 for k in KEYS}, max_strikes=1)
    with pytest.raises(AllRoutesFailed):
        pool.chat([{"role": "user", "content": "hi"}])
    assert all(st["healthy"] is False for st in pool.stats()["keys"])
    # nothing healthy left, and it fails without touching the network again
    with pytest.raises(AllRoutesFailed) as err:
        pool.chat([{"role": "user", "content": "hi"}])
    assert err.value.attempts == []


def test_auth_failure_exhausts_all_keys():
    pool, fake = make_pool({mask(k): 401 for k in KEYS})
    with pytest.raises(AllRoutesFailed) as err:
        pool.chat([{"role": "user", "content": "hi"}])
    assert len(err.value.attempts) == len(KEYS)  # 401 breaks out of the model loop per key
    assert len(fake.calls) == len(KEYS)


def test_all_routes_failed_after_exhausting_models():
    pool, _ = make_pool({mask(k): 500 for k in KEYS})
    with pytest.raises(AllRoutesFailed) as err:
        pool.chat([{"role": "user", "content": "hi"}])
    assert len(err.value.attempts) == len(KEYS) * len(MODELS)


def test_stats_masks_keys_and_never_leaks_raw():
    pool, _ = make_pool({})
    text = json.dumps(pool.stats())
    assert mask(KEYS[0]) in text
    for k in KEYS:
        assert k not in text
    assert all("key" in st and st["key"].startswith("coa_") for st in pool.stats()["keys"])
    assert repr(pool).find(KEYS[0]) == -1


def test_from_env_raises_when_no_keys(monkeypatch):
    monkeypatch.setattr(keypool, "_load_dotenv_if_present", lambda: None)
    monkeypatch.setenv("COARENA_BASE_URL", BASE)
    for i in range(1, 5):
        monkeypatch.delenv(f"COARENA_API_KEY_{i}", raising=False)
    monkeypatch.delenv("COARENA_ADJUDICATE_MODEL", raising=False)
    monkeypatch.delenv("COARENA_VISION_MODEL", raising=False)
    with pytest.raises(KeyPoolError):
        KeyPool.from_env()


def test_from_env_skips_empty_slots_and_builds_model_ladder(monkeypatch):
    monkeypatch.setattr(keypool, "_load_dotenv_if_present", lambda: None)
    monkeypatch.setenv("COARENA_BASE_URL", BASE)
    monkeypatch.setenv("COARENA_ADJUDICATE_MODEL", "gpt-6-luna")
    monkeypatch.setenv("COARENA_VISION_MODEL", "gemini-3-8-flash")
    monkeypatch.setenv("COARENA_API_KEY_1", KEYS[0])
    monkeypatch.setenv("COARENA_API_KEY_2", "")
    monkeypatch.setenv("COARENA_API_KEY_3", KEYS[2])
    monkeypatch.delenv("COARENA_API_KEY_4", raising=False)
    pool = KeyPool.from_env()
    assert [ks.key for ks in pool.keys] == [KEYS[0], KEYS[2]]
    assert pool.models == ["gpt-6-luna", "gemini-3-8-flash"]


def test_json_schema_passed_through_as_response_format():
    seen = {}

    def fake(url, headers, payload, timeout):
        seen.update(payload)
        return 200, ok_body()

    keypool._post_json = fake
    pool = KeyPool(BASE, KEYS, MODELS)
    schema = {"name": "verdict", "schema": {"type": "object"}}
    pool.chat([{"role": "user", "content": "hi"}], json_schema=schema, max_tokens=64)
    assert seen["response_format"] == {"type": "json_schema", "json_schema": schema}
    assert seen["max_tokens"] == 64
    assert seen["model"] == "model-a"


def test_mask_short_and_long_keys():
    assert mask("coa_a5911d0be920fac59396776f16a3a895") == "coa_...a895"
    assert mask("abcd") != "abcd"
    assert "abcd" not in mask("abcd")
