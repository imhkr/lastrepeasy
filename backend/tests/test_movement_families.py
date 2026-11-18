"""The movement-family map.

This is the thing that makes 90 exercises tractable: they are 13 families, and a family shares one
rubric skeleton. The tests pin the parts that are easy to get subtly wrong -- a press-like word
routing a non-press into the chest family, an unmatched id being guessed instead of reported -- and
pin the census itself so a plan change cannot silently drop exercises into "unclassified".
"""
from __future__ import annotations

import pytest

from app.services.movement_families import (
    FAMILIES,
    UNCLASSIFIED,
    census,
    classify,
    coverage,
    plan_exercise_ids,
)


def test_every_family_declares_a_track_and_its_measures():
    for name, spec in FAMILIES.items():
        assert spec["track"]["joint"], name
        assert spec["track"]["axis"] in ("forearm", "distance"), name
        assert spec["measures"], name
        assert spec["faults"], name


def test_the_track_matches_the_joint_a_family_is_judged_on():
    # A squat counts on the knee; a press counts on the elbow. If these drift apart a family will
    # be counted by one joint and judged by another, which silently produces the wrong rep count.
    assert FAMILIES["squat_lunge"]["track"]["joint"] == "knee"
    assert FAMILIES["chest_press"]["track"]["joint"] == "elbow"
    assert FAMILIES["curl"]["track"]["joint"] == "elbow"
    assert FAMILIES["calf"]["track"]["joint"] == "ankle"
    # Only the press counts off a learned press line; everything else is axis-free.
    assert FAMILIES["chest_press"]["track"]["axis"] == "forearm"
    assert FAMILIES["squat_lunge"]["track"]["axis"] == "distance"


@pytest.mark.parametrize("exercise_id,family", [
    # The original bug: "press" alone routed everything to a chest press.
    ("triceps-pressdown", "triceps"),
    ("triceps-pressdown-bar", "triceps"),
    ("dual-cable-triceps-press", "triceps"),
    ("seated-db-french-press", "triceps"),
    ("ez-bar-skull-crusher", "triceps"),
    ("machine-shoulder-press", "shoulder_press"),
    ("seated-db-shoulder-press", "shoulder_press"),
    ("leg-press", "leg_isolation"),
    ("leg-press-calf-press", "calf"),
    # Real chest work.
    ("machine-chest-press", "chest_press"),
    ("low-incline-db-press", "chest_press"),
    ("deficit-pushup", "chest_press"),
    ("paused-assisted-dip", "chest_press"),
    # Raises are not presses and not flies.
    ("machine-lateral-raise", "lateral_raise"),
    ("cable-reverse-flye-mechanical-dropset", "lateral_raise"),
    # Legs.
    ("hack-squat", "squat_lunge"),
    ("db-walking-lunge", "squat_lunge"),
    ("seated-leg-curl", "leg_isolation"),
    ("leg-extension", "leg_isolation"),
    ("stiff-leg-deadlift", "hinge"),
    ("snatch-grip-rdl", "hinge"),
    ("standing-calf-raise", "calf"),
    ("machine-hip-abduction", "hip_isolation"),
    # Pulls.
    ("pull-up-wide-grip", "row_pulldown"),
    ("lying-paused-rope-face-pull", "row_pulldown"),
    ("lat-focused-cable-row", "row_pulldown"),
    # Core.
    ("cable-crunch", "core"),
    ("roman-chair-leg-raise", "core"),
    ("ab-wheel-rollout", "core"),
])
def test_known_movements_land_in_the_right_family(exercise_id, family):
    assert classify(exercise_id) == family


def test_an_unmatched_id_is_reported_not_guessed():
    assert classify("some-invented-movement") == UNCLASSIFIED


def test_hyphens_and_underscores_are_equivalent():
    """The app sends hyphenated ids while a user or a doc may use underscores or spaces."""
    assert classify("low_incline_db_press") == classify("low-incline-db-press")
    assert classify("low incline db press") == "chest_press"


def test_the_whole_plan_is_classified_except_undefined_placeholders():
    ids = plan_exercise_ids()
    assert len(ids) >= 90, f"expected the full plan, got {len(ids)} ids"
    groups = census(ids)
    leftover = set(groups.get(UNCLASSIFIED, []))
    # These two are literal placeholders in the plan with no movement defined, so there is nothing
    # to classify them as. Anything else appearing here means a new exercise broke the rules.
    assert leftover <= {"weak-point-exercise-1", "weak-point-exercise-2-optional"}, sorted(leftover)


def test_families_cover_the_plan_without_huge_gaps():
    total, counts = coverage()
    assert total >= 90
    assert sum(counts.values()) == total
    # The biggest family should not be most of the plan: that would mean the classification is too
    # coarse to give a family its own rubric.
    assert max(counts.values()) / total < 0.25, counts
    assert len(counts) <= len(FAMILIES) + 1, counts
