"""Keep the phone's rubric copy identical to the canonical JSON.

A stale generated file would mean the phone judges with old bands while the server uses new
ones -- two tiers disagreeing about the same rep, which is precisely the drift this design
set out to eliminate. So the check is a byte comparison, not a spot check.
"""
from __future__ import annotations

import json
from pathlib import Path

from app.services.rubric_codegen import OUT_PATH, emit, load_all


def test_generated_file_is_up_to_date():
    rubrics = load_all()
    expected = emit(rubrics, out_path=OUT_PATH)
    assert OUT_PATH.exists(), (
        "rubrics.generated.ts is missing. Run: cd backend && .venv/bin/python -m app.services.rubric_codegen"
    )
    actual = OUT_PATH.read_text()
    assert actual == expected, (
        "mobile/src/live/rubrics.generated.ts is stale relative to backend/app/rubrics/*.json.\n"
        "Run: cd backend && .venv/bin/python -m app.services.rubric_codegen"
    )


def test_every_rubric_is_emitted():
    rubrics = load_all()
    text = OUT_PATH.read_text() if OUT_PATH.exists() else ""
    for rid in rubrics:
        assert f'"{rid}"' in text, f"rubric {rid} missing from the generated file"


def test_generated_module_parses_as_valid_json_payload():
    """The emitted text must contain a parseable object, or the phone gets an empty rubric map."""
    text = OUT_PATH.read_text()
    start = text.index("{", text.index("export const RUBRICS"))
    end = text.rindex("}") + 1
    parsed = json.loads(text[start:end])
    assert isinstance(parsed, dict) and parsed, "generated payload is empty"
