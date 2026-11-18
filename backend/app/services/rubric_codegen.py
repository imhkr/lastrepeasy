"""Emit the canonical rubric JSON into a TypeScript module for the phone.

The rubrics live in `backend/app/rubrics/` because Render deploys with rootDir=backend, so
anything at the repo root never reaches the container. The phone cannot import across that
boundary -- Metro bundles from `mobile/` -- so the JSON is copied into a generated TS file
at build time.

A generated copy can silently go stale, which is the exact failure this codegen exists to
prevent: the phone judging an exercise with week-old bands while the server uses new ones.
`tests/test_rubric_codegen.py` asserts the committed file matches, so a rubric edit without
regeneration fails CI instead of shipping.

Usage:
    cd backend && .venv/bin/python -m app.services.rubric_codegen
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict

RUBRIC_DIR = Path(__file__).resolve().parents[1] / "rubrics"
OUT_PATH = Path(__file__).resolve().parents[3] / "mobile" / "src" / "live" / "rubrics.generated.ts"

HEADER = """// GENERATED FILE -- do not edit by hand.
// Source: backend/app/rubrics/*.json
// Regenerate: cd backend && .venv/bin/python -m app.services.rubric_codegen
//
// The drift test (backend/tests/test_rubric_codegen.py) fails when this file does not match
// the JSON, so a rubric change cannot reach one tier and miss the other.
"""


def load_all(rubric_dir: Path = RUBRIC_DIR) -> Dict[str, Any]:
    """Parse every rubric file, keyed by the `id` inside it.

    The filename is not trusted as the key: a copy-pasted file keeps its old `id`, and
    silently loading two rubrics under one id would make judging depend on file order.
    """
    out: Dict[str, Any] = {}
    for path in sorted(rubric_dir.glob("*.json")):
        data = json.loads(path.read_text())
        rid = data.get("id")
        if not rid:
            raise ValueError(f"{path.name}: rubric has no 'id'")
        if rid in out:
            raise ValueError(f"duplicate rubric id {rid!r} ({path.name} and an earlier file)")
        data["_source_file"] = path.name
        out[rid] = data
    if not out:
        raise ValueError(f"no rubrics found in {rubric_dir}")
    return out


def emit(rubrics: Dict[str, Any], out_path: Path = OUT_PATH) -> str:
    payload = json.dumps(rubrics, indent=2, sort_keys=True, ensure_ascii=False)
    body = (
        HEADER
        + "\nexport type Rubric = Record<string, unknown>;\n\n"
        + "export const RUBRICS: Record<string, Rubric> = "
        + payload
        + ";\n"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(body)
    return body


def main() -> int:
    rubrics = load_all()
    text = emit(rubrics)
    print(f"{len(rubrics)} rubrics -> {OUT_PATH} ({len(text)} bytes)")
    for rid in sorted(rubrics):
        print(f"  {rid}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
