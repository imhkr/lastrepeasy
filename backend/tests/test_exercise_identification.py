"""Exercise identification must refuse rather than guess.

The old mapping matched the substring "press", so a triceps pressdown was coached with incline
bench-press bands, and anything unrecognised fell through to the lat pullover. Both are the exact
failure this rewrite was opened to fix: a lifter being corrected against the wrong exercise's rules
looks identical to a lifter being corrected wrongly, and there is no way for them to tell.

So the contract is: a recognised movement gets its profile, everything else gets None.
"""
from __future__ import annotations

import pytest

from app.services.nippard_ai import detect_exercise_profile
from app.services.ghost import GHOST_PROFILES

# Real ids from mobile/src/data/plans.json, which is what the app actually sends.
NOT_A_CHEST_PRESS = [
    "triceps-pressdown",
    "triceps-pressdown-bar",
    "machine-shoulder-press",
    "seated-db-shoulder-press",
    "leg-press",
    "leg-press-calf-press",
    "hack-squat",
    "smith-machine-squat",
    "seated-leg-curl",
    "leg-extension",
    "db-walking-lunge",
    "ez-bar-skull-crusher",
    "deficit-pushup",
    "paused-assisted-dip",
    "cable-crunch",
    "stomach-vacuums",
]

IS_A_CHEST_PRESS = ["low-incline-db-press", "machine-chest-press", "cable-flye", "pec-deck"]


@pytest.mark.parametrize("exercise_id", NOT_A_CHEST_PRESS)
def test_non_press_movements_get_no_chest_press_profile(exercise_id):
    """Every one of these contains a press-like word or is a leg movement, and none of them is an
    incline dumbbell press."""
    assert detect_exercise_profile(exercise_id) != "incline_press_nippard"


@pytest.mark.parametrize("exercise_id", IS_A_CHEST_PRESS)
def test_real_chest_presses_are_recognised(exercise_id):
    assert detect_exercise_profile(exercise_id) == "incline_press_nippard"


def test_curls_and_hinges_still_route_correctly():
    assert detect_exercise_profile("hammer-curl") == "bayesian_curl_nippard"
    assert detect_exercise_profile("stiff-leg-deadlift") == "rdl_hinge_nippard"
    assert detect_exercise_profile("snatch-grip-rdl") == "rdl_hinge_nippard"


def test_unrecognised_input_returns_none_not_a_default():
    """Falling back to lat-pullover meant every unknown clip was coached as a back exercise."""
    for hint in ("", "   ", "some random text", "zercher carry"):
        assert detect_exercise_profile(hint) is None, hint


def test_hyphenated_and_spaced_ids_behave_the_same():
    """The app sends `leg-press`; a user typing might send `leg press`. Normalising separators is
    what lets one keyword list handle both."""
    assert detect_exercise_profile("leg-press") is None
    assert detect_exercise_profile("leg press") is None
    assert detect_exercise_profile("low_incline_db_press") == "incline_press_nippard"
    assert detect_exercise_profile("low incline db press") == "incline_press_nippard"


def test_ghost_is_only_offered_for_a_profile_that_has_one():
    """The ghost draws a target arm. Offering it for a squat would draw an arm on a leg lift, which
    is the cartoonish overlay this work removed."""
    assert detect_exercise_profile("hack-squat") not in GHOST_PROFILES
    assert detect_exercise_profile("triceps-pressdown") not in GHOST_PROFILES
