from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

try:
    from pydantic import BaseModel, Field  # type: ignore
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False

    class BaseModel:  # type: ignore
        def __init__(self, **kwargs: Any):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def model_dump(self) -> Dict[str, Any]:
            return self._serialize(self.__dict__)

        def dict(self) -> Dict[str, Any]:
            return self.model_dump()

        @classmethod
        def _serialize(cls, obj: Any) -> Any:
            if isinstance(obj, Enum):
                return obj.value
            if hasattr(obj, "model_dump"):
                return obj.model_dump()
            if isinstance(obj, list):
                return [cls._serialize(x) for x in obj]
            if isinstance(obj, dict):
                return {k: cls._serialize(v) for k, v in obj.items()}
            return obj

    def Field(default: Any = None, **kwargs: Any) -> Any:  # type: ignore
        if "default_factory" in kwargs:
            return kwargs["default_factory"]()
        return default


class JobStatus(str, Enum):
    QUEUED = "queued"
    INGESTING = "ingesting"
    TRACKING_POSE = "tracking_pose"
    EXTRACTING_CUES = "extracting_cues"
    RENDERING_VIDEO = "rendering_video"
    COMPLETED = "completed"
    FAILED = "failed"


class JointAngleMetric(BaseModel):
    joint_name: str = Field(..., description="Human readable joint name, e.g., 'Elbow Flexion', 'Wrist / Handle Angle'")
    joint_key: str = Field(..., description="Internal key: elbow, shoulder, hip, knee, ankle, wrist")
    measured_deg: float = Field(..., description="Measured angle in degrees at this phase")
    ideal_range_deg: List[float] = Field(..., description="[min_deg, max_deg] recommended biomechanical range")
    status: str = Field(..., description="optimal | adjust | caution")
    cue: str = Field(..., description="Actionable posture/angle feedback, e.g., '45° scapular plane tuck'")


class HandleAndStanceInfo(BaseModel):
    grip_type: str = Field(..., description="e.g., Neutral / Semi-Supinated MAG Grip, Pronated Medium-Wide, Rope Attachment")
    handle_height_and_path: str = Field(..., description="e.g., High pulley (above head), pull down & in toward hips in a sweeping arc")
    wrist_alignment: str = Field(..., description="e.g., Neutral stacked wrist (172°), avoid excessive ulnar deviation or wrist curl")
    foot_and_ankle_position: str = Field(..., description="e.g., Split stance or hip-width, ~82° ankle dorsiflexion, planted heel stability")
    torso_angle_deg: float = Field(..., description="Torso lean relative to vertical in degrees")


class FlowPhaseStep(BaseModel):
    step_number: int = 1
    phase_id: str = Field(..., description="setup | eccentric | stretch_pause | concentric | lockout")
    title: str = Field(..., description="e.g., '1. Setup & Handle Grip' or '2. Deep Stretch (Eccentric)'")
    timestamp_sec: float = Field(..., description="Key timestamp in the source video in seconds")
    start_sec: float = Field(..., description="Phase start timestamp in seconds")
    end_sec: float = Field(..., description="Phase end timestamp in seconds")
    keyframe_url: Optional[str] = Field(None, description="URL to annotated HUD keyframe image")
    coaching_summary: str = Field(..., description="Jeff Nippard style evidence-based cue for this phase")
    handle_and_wrist_note: str = Field(..., description="Specific note on hand/handle/wrist position at this point")
    ankle_and_base_note: str = Field(..., description="Specific note on foot/ankle/knee stability at this point")
    joint_metrics: List[JointAngleMetric] = Field(default_factory=list)


class AngleSeriesPoint(BaseModel):
    time_sec: float = 0.0
    elbow_deg: float = 0.0
    shoulder_deg: float = 0.0
    hip_deg: float = 0.0
    knee_deg: float = 0.0
    ankle_deg: float = 0.0
    wrist_deg: float = 0.0
    torso_lean_deg: float = 0.0


class RepCheckOut(BaseModel):
    key: str
    label: str
    status: str  # good | almost | fix | unsure
    message: str
    message_hi: str = ""  # the same advice in Hinglish
    image_url: Optional[str] = None  # picture: what you did vs how it should look


class RepReportOut(BaseModel):
    index: int
    checks: List[RepCheckOut] = Field(default_factory=list)


class WorkoutAnalysisResult(BaseModel):
    job_id: str = ""
    status: JobStatus = JobStatus.QUEUED
    progress_pct: int = 0
    progress_message: str = "Queued..."
    error: Optional[str] = None

    # Metadata
    source_type: str = "upload"  # youtube | upload | demo
    source_url: Optional[str] = None
    exercise_name: str = "Analyzing Exercise..."
    target_muscles: List[str] = Field(default_factory=list)
    coach_style: str = "Jeff Nippard Science-Based Biomechanics"
    duration_sec: float = 0.0

    # Core Biomechanics Summary
    overall_form_score: int = 92
    handle_and_stance: Optional[HandleAndStanceInfo] = None
    key_takeaways: List[str] = Field(default_factory=list)
    my_form_fixes: List[str] = Field(
        default_factory=list,
        description="Personal corrections for an uploaded clip: measured angle vs ideal range per phase.",
    )
    voice_script_english: str = Field(
        default="",
        description="Spoken coaching script in clear English covering setup, handle/wrist placement, ankle base, and target muscle focus.",
    )
    voice_script_hinglish: str = Field(
        default="",
        description="Spoken coaching script in natural gym Hinglish covering setup, handle/wrist placement, ankle base, and target muscle focus.",
    )

    # Step-by-Step Start-to-End Flow
    steps: List[FlowPhaseStep] = Field(default_factory=list)

    # Time-series joint angles across the rep
    angle_timeline: List[AngleSeriesPoint] = Field(default_factory=list)

    # Output Media URLs
    source_video_url: Optional[str] = None
    step_by_step_flow_video_url: Optional[str] = None
    annotated_full_video_url: Optional[str] = None
    my_form_fixes_hi: List[str] = Field(default_factory=list)  # same list, in Hinglish
    rep_reports: List[RepReportOut] = Field(default_factory=list)  # per-rep checklist in plain words
    ghost_video_url: Optional[str] = None  # user's own clip with the green target arm drawn on it


class AnalyzeYoutubeRequest(BaseModel):
    youtube_url: str = Field(..., description="YouTube video or Shorts URL (e.g. Jeff Nippard workout clip)")
    exercise_hint: Optional[str] = Field(None, description="Optional exercise name or timestamp hint")
    start_sec: Optional[float] = Field(None, description="Optional start trim in seconds")
    end_sec: Optional[float] = Field(None, description="Optional end trim in seconds")


class PresetCatalogItem(BaseModel):
    preset_id: str = ""
    title: str = ""
    coach: str = "Jeff Nippard"
    youtube_reference_url: str = ""
    target_muscles: List[str] = Field(default_factory=list)
    highlight_cue: str = ""
    default_grip: str = ""
