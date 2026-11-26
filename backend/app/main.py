"""
FormFlow AI Backend API (FastAPI).
Endpoints:
- GET  /api/health                      -> Health & pipeline capabilities check
- GET  /api/presets                     -> Pre-configured Jeff Nippard workout presets
- POST /api/analyze/youtube             -> Analyze a YouTube workout URL (or Jeff Nippard preset)
- POST /api/analyze/upload              -> Upload & analyze a workout video file (MP4/MOV)
- POST /api/analyze/demo/{preset_id}    -> Run instant end-to-end analysis on a Jeff Nippard preset
- GET  /api/jobs/{job_id}               -> Poll job status or retrieve complete WorkoutAnalysisResult
"""
from __future__ import annotations

import os
import shutil
import traceback
import uuid

import cv2
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.schemas import (
    AdjudicateRequest,
    AdjudicateResponse,
    AnalyzeYoutubeRequest,
    AngleSeriesPoint,
    JobStatus,
    PresetCatalogItem,
    RepCheckOut,
    RepReportOut,
    WorkoutAnalysisResult,
)
from app.services.flow_renderer import render_keyframes_and_flow_videos
from app.services.coach_overlay import render_compare, render_ghost_video, render_speed
from app.services.ghost import GHOST_PROFILES, build_ghost_track
from app.services.press_coach import analyze_reps, set_lines, set_score
from app.services.nippard_ai import (
    JEFF_NIPPARD_PRESETS,
    build_exercise_analysis,
    detect_exercise_profile,
)
from app.services.pose_analyzer import (
    analyze_video_pose_timeline,
    detect_five_workout_phases,
)
from app.services.video_ingestor import (
    generate_synthetic_workout_video,
    ingest_youtube_or_fallback,
)


BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
OUTPUTS_DIR = STORAGE_DIR / "outputs"
FRAMES_DIR = STORAGE_DIR / "frames"

for d in (UPLOADS_DIR, OUTPUTS_DIR, FRAMES_DIR):
    d.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="FormFlow AI — Jeff Nippard Workout Biomechanics & Step-by-Step Flow Engine",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/media/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")
app.mount("/media/frames", StaticFiles(directory=str(FRAMES_DIR)), name="frames")

# In-memory job store
JOBS: Dict[str, WorkoutAnalysisResult] = {}


MAX_UPLOAD_SEC = 20
MAX_UPLOAD_MB = 80


def _clip_seconds(path: str) -> float:
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    cap.release()
    return frames / fps if fps else 0.0


def _resolve_base_url(request: Request) -> str:
    env_url = os.getenv("PUBLIC_BASE_URL", "").strip()
    if env_url:
        return env_url.rstrip("/")
    return str(request.base_url).rstrip("/")


def _run_analysis_pipeline(
    job_id: str,
    source_type: str,
    video_path: str,
    profile_hint: str,
    custom_exercise_hint: Optional[str],
    public_base_url: str,
    youtube_url: Optional[str] = None,
    start_sec: Optional[float] = None,
    end_sec: Optional[float] = None,
) -> None:
    job = JOBS[job_id]
    try:
        # Step 1: Ingest video
        job.status = JobStatus.INGESTING
        job.progress_pct = 15
        job.progress_message = "Ingesting workout video & normalizing frame rate..."

        if source_type == "youtube" and youtube_url:
            ingest_youtube_or_fallback(
                youtube_url=youtube_url,
                output_path=video_path,
                start_sec=start_sec,
                end_sec=end_sec,
            )
        elif source_type == "demo" or not os.path.exists(video_path):
            generate_synthetic_workout_video(
                output_path=video_path,
                exercise_title=custom_exercise_hint or "Jeff Nippard Workout Analysis",
            )

        source_filename = os.path.basename(video_path)
        job.source_video_url = f"{public_base_url}/media/uploads/{source_filename}"

        # Step 2: Pose & Joint Angle Tracking
        job.status = JobStatus.TRACKING_POSE
        job.progress_pct = 42
        job.progress_message = "Tracking 33 body landmarks (elbow, wrist/handle, torso, knee, ankle angles)..."

        timeline, duration_sec = analyze_video_pose_timeline(
            video_path,
            sample_fps=15.0 if source_type == "upload" else 8.0,
            allow_synthetic=source_type != "upload",  # never invent joints for a real user clip
        )
        job.duration_sec = duration_sec

        phase_tuples = detect_five_workout_phases(timeline, duration_sec)

        # Step 3: Extract Jeff Nippard Biomechanical Cues & Handle/Ankle Alignment
        job.status = JobStatus.EXTRACTING_CUES
        job.progress_pct = 68
        job.progress_message = "Evaluating handle position, wrist stack, ankle dorsiflexion & Jeff Nippard cues..."

        profile_id = detect_exercise_profile(profile_hint)
        (
            exercise_name,
            target_muscles,
            handle_info,
            takeaways,
            steps,
            voice_en,
            voice_hi,
        ) = build_exercise_analysis(
            profile_id=profile_id,
            phase_tuples=phase_tuples,
            keyframe_urls={},
            custom_hint=custom_exercise_hint,
        )

        # Step 4: Render Step-by-Step Start-to-End Flow Video + Annotated Keyframes
        job.status = JobStatus.RENDERING_VIDEO
        job.progress_pct = 85
        job.progress_message = "Rendering Step-by-Step Start-to-End Flow Video with HUD angle overlays..."

        kf_urls, flow_video_url, full_video_url = render_keyframes_and_flow_videos(
            source_video_path=video_path,
            job_id=job_id,
            exercise_name=exercise_name,
            timeline=timeline,
            phase_tuples=phase_tuples,
            steps=steps,
            frames_dir=str(FRAMES_DIR),
            outputs_dir=str(OUTPUTS_DIR),
            public_base_url=public_base_url,
        )

        # Ghost-arm coaching video. Only for a clip we can actually identify: an unrecognised
        # exercise gets no ghost at all, rather than being coached against a press's geometry.
        ghost_lines: List[str] = []
        ghost_pts: Optional[int] = None
        if source_type == "upload" and profile_id in GHOST_PROFILES:
            try:
                cap = cv2.VideoCapture(video_path)
                vw, vh = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                cap.release()
                track = build_ghost_track(profile_id, timeline, vw, vh)
                if track is not None:
                    reps = analyze_reps(track)
                    ghost_name = f"{job_id}_ghost.mp4"
                    render_ghost_video(video_path, track, reps, os.path.join(str(OUTPUTS_DIR), ghost_name))
                    job.ghost_video_url = f"{public_base_url}/media/outputs/{ghost_name}"
                    ghost_lines = set_lines(reps)
                    ghost_pts = set_score(reps) if reps else None
                    job.rep_reports = []
                    for r in reps:
                        outs = []
                        for c in r.checks:
                            img_url = None
                            try:
                                fname = f"{job_id}_r{r.index}_{c.key}.jpg"
                                fpath = os.path.join(str(FRAMES_DIR), fname)
                                if c.key == "speed" and c.status in ("almost", "fix"):
                                    render_speed(c, fpath)
                                elif c.key in ("hands", "depth", "lockout") and c.status in ("almost", "fix"):
                                    render_compare(video_path, track, r.end_t if c.key == "lockout" else r.bottom_t, c, fpath)
                                elif c.key == "hands" and c.status == "unsure":
                                    render_compare(video_path, track, r.bottom_t, c, fpath)  # no verdict, but show the right way
                                else:
                                    fpath = None
                                if fpath and os.path.exists(fpath):
                                    img_url = f"{public_base_url}/media/frames/{fname}"
                            except Exception:
                                img_url = None
                            outs.append(RepCheckOut(key=c.key, label=c.label, status=c.status, message=c.message, message_hi=c.message_hi, image_url=img_url))
                        job.rep_reports.append(RepReportOut(index=r.index, checks=outs))
                    job.my_form_fixes_hi = set_lines(reps, hindi=True)
            except Exception:
                traceback.print_exc()  # the other videos still work without the coaching video

        # Populate final job result
        job.exercise_name = exercise_name
        job.target_muscles = target_muscles
        job.handle_and_stance = handle_info
        job.key_takeaways = takeaways
        job.voice_script_english = voice_en
        job.voice_script_hinglish = voice_hi
        job.steps = steps
        job.step_by_step_flow_video_url = flow_video_url
        job.annotated_full_video_url = full_video_url
        job.angle_timeline = [
            AngleSeriesPoint(
                time_sec=m.time_sec,
                elbow_deg=m.elbow_deg,
                shoulder_deg=m.shoulder_deg,
                hip_deg=m.hip_deg,
                knee_deg=m.knee_deg,
                ankle_deg=m.ankle_deg,
                wrist_deg=m.wrist_deg,
                torso_lean_deg=m.torso_lean_deg,
            )
            for m in timeline
        ]

        # Compute overall form score from optimal vs adjust metrics
        total_metrics = sum(len(s.joint_metrics) for s in steps)
        optimal_metrics = sum(
            1 for s in steps for jm in s.joint_metrics if jm.status == "optimal"
        )
        ratio = optimal_metrics / max(1, total_metrics)
        if source_type == "upload":
            # Honest score for the user's own clip: no floor.
            job.my_form_fixes.extend(ghost_lines)
            if ghost_pts is not None:
                # The ghost measures what matters for this lift, so skip the generic joint-range list.
                job.overall_form_score = ghost_pts
            else:
                job.overall_form_score = int(round(100 * ratio))
                seen = set()
                for s in steps:
                    for jm in s.joint_metrics:
                        if jm.status != "optimal" and jm.joint_name not in seen and len(seen) < 6:
                            seen.add(jm.joint_name)
                            lo, hi = jm.ideal_range_deg
                            job.my_form_fixes.append(
                                f"{s.title.split('. ', 1)[-1]}: {jm.joint_name} was {jm.measured_deg:.0f}°, aim for {lo:.0f}–{hi:.0f}°. {jm.cue}"
                            )
            if not job.my_form_fixes:
                job.my_form_fixes.append("Clean set. Every angle we tracked was in range.")
        else:
            job.overall_form_score = max(84, min(99, int(round(82 + 17 * ratio))))

        job.status = JobStatus.COMPLETED
        job.progress_pct = 100
        job.progress_message = "Analysis & Step-by-Step Flow Video Ready"
    except Exception as exc:
        job.status = JobStatus.FAILED
        job.error = str(exc)
        job.progress_message = f"Failed: {exc}"


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "formflow-ai-backend",
        # Render sets this at build time, so "did my push actually deploy?" is answerable
        # from outside instead of assumed.
        "commit": (os.getenv("RENDER_GIT_COMMIT") or "dev")[:7],
        "features": [
            "pose_angle_tracking",
            "handle_wrist_ankle_biomechanics",
            "jeff_nippard_cues",
            "step_by_step_flow_video_generator",
        ],
    }


@app.get("/api/presets", response_model=List[PresetCatalogItem])
def list_presets():
    return JEFF_NIPPARD_PRESETS


@app.post("/api/analyze/youtube", response_model=WorkoutAnalysisResult)
def analyze_youtube(
    payload: AnalyzeYoutubeRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    job_id = uuid.uuid4().hex[:10]
    base_url = _resolve_base_url(request)
    video_path = str(UPLOADS_DIR / f"{job_id}_source.mp4")

    job = WorkoutAnalysisResult(
        job_id=job_id,
        status=JobStatus.QUEUED,
        progress_pct=5,
        progress_message="Queued YouTube workout clip for biomechanics analysis...",
        source_type="youtube",
        source_url=payload.youtube_url,
    )
    JOBS[job_id] = job

    profile_hint = f"{payload.youtube_url} {payload.exercise_hint or ''}"
    background_tasks.add_task(
        _run_analysis_pipeline,
        job_id=job_id,
        source_type="youtube",
        video_path=video_path,
        profile_hint=profile_hint,
        custom_exercise_hint=payload.exercise_hint,
        public_base_url=base_url,
        youtube_url=payload.youtube_url,
        start_sec=payload.start_sec,
        end_sec=payload.end_sec,
    )
    return job


@app.post("/api/analyze/demo/{preset_id}", response_model=WorkoutAnalysisResult)
def analyze_demo_preset(
    preset_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
):
    preset = next((p for p in JEFF_NIPPARD_PRESETS if p.preset_id == preset_id), JEFF_NIPPARD_PRESETS[0])
    job_id = uuid.uuid4().hex[:10]
    base_url = _resolve_base_url(request)
    video_path = str(UPLOADS_DIR / f"{job_id}_source.mp4")

    job = WorkoutAnalysisResult(
        job_id=job_id,
        status=JobStatus.QUEUED,
        progress_pct=5,
        progress_message=f"Starting Jeff Nippard preset: {preset.title}...",
        source_type="demo",
        source_url=preset.youtube_reference_url,
        exercise_name=preset.title,
    )
    JOBS[job_id] = job

    background_tasks.add_task(
        _run_analysis_pipeline,
        job_id=job_id,
        source_type="demo",
        video_path=video_path,
        profile_hint=preset.preset_id,
        custom_exercise_hint=preset.title,
        public_base_url=base_url,
    )
    return job


@app.post("/api/analyze/upload", response_model=WorkoutAnalysisResult)
async def analyze_uploaded_video(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    exercise_hint: Optional[str] = Form(None),
):
    job_id = uuid.uuid4().hex[:10]
    base_url = _resolve_base_url(request)
    ext = Path(file.filename or "workout.mp4").suffix or ".mp4"
    video_path = str(UPLOADS_DIR / f"{job_id}_upload{ext}")

    with open(video_path, "wb") as out_f:
        shutil.copyfileobj(file.file, out_f)

    if os.path.getsize(video_path) > MAX_UPLOAD_MB * 1024 * 1024 or _clip_seconds(video_path) > MAX_UPLOAD_SEC + 0.5:
        os.remove(video_path)
        raise HTTPException(status_code=400, detail=f"Clip must be {MAX_UPLOAD_SEC} seconds or shorter.")

    job = WorkoutAnalysisResult(
        job_id=job_id,
        status=JobStatus.QUEUED,
        progress_pct=10,
        progress_message="Uploaded video received. Starting pose & angle extraction...",
        source_type="upload",
        exercise_name=exercise_hint or "Uploaded Workout Video",
    )
    JOBS[job_id] = job

    background_tasks.add_task(
        _run_analysis_pipeline,
        job_id=job_id,
        source_type="upload",
        video_path=video_path,
        profile_hint=exercise_hint or file.filename or "lat_pullover_nippard",
        custom_exercise_hint=exercise_hint,
        public_base_url=base_url,
    )
    return job


@app.get("/api/jobs/{job_id}", response_model=WorkoutAnalysisResult)
def get_job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job


# ------------------------------------------------------------------ live coach (tier 1)

def _adjudicate_blocking(payload: AdjudicateRequest, rubric: dict, local: dict):
    from app.services import vlm_judge

    evidence = {
        "exercise": payload.exercise_id,
        "rep": payload.rep_index,
        "view": payload.view,
        "keyframes": payload.keyframes,
        "landmarks": payload.landmarks,
    }
    return vlm_judge.adjudicate(evidence, rubric, local)


@app.post("/api/live/adjudicate", response_model=AdjudicateResponse)
async def live_adjudicate(payload: AdjudicateRequest):
    """Second opinion on one rep from the vision model.

    The phone judges every rep on-device in ~20 ms and that verdict is what the lifter hears while
    the set is happening. This is the slower, more accurate check that catches what a single 2D
    angle cannot see, and it is deliberately non-blocking: if it fails, the on-device verdict
    already stood and the response says so rather than surfacing an error mid-rep.
    """
    from app.services import vlm_judge
    from app.services.rubric_engine import load_rubric

    if not payload.keyframes:
        raise HTTPException(status_code=400, detail="at least one keyframe is required")
    if len(payload.keyframes) > vlm_judge.MAX_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"at most {vlm_judge.MAX_IMAGES} keyframes; more adds latency without accuracy",
        )

    try:
        rubric = load_rubric(payload.exercise_id)
    except KeyError as exc:
        # A 404 here is the honest answer: there is no rubric, so there is nothing to judge against.
        raise HTTPException(status_code=404, detail=str(exc).strip('"')) from exc

    rubric_dict = {
        "id": rubric.id,
        "name": getattr(rubric, "name", rubric.id),
        "family": rubric.family,
        "view": list(rubric.view) if isinstance(rubric.view, tuple) else rubric.view,
        "checks": list(rubric.checks),
    }
    local = {c.id: c.status for c in payload.checks}

    # The key pool is synchronous and a call is 1-3 s, so it runs off the event loop.
    try:
        verdict = await run_in_threadpool(_adjudicate_blocking, payload, rubric_dict, local)
    except Exception as exc:
        # Never fail the set over a second opinion. The local verdict is reported as final and the
        # caller can see that no remote opinion was obtained.
        return AdjudicateResponse(
            checks=[{"id": c.id, "status": c.status, "reason": "local only: remote unavailable"} for c in payload.checks],
            overall="",
            confidence=0.0,
            agrees_with_local=True,
            disagreements=[f"remote_unavailable: {type(exc).__name__}"],
        )

    try:
        vlm_judge.log_adjudication(f"{payload.exercise_id}/{payload.rep_index}", local, verdict)
    except Exception:
        traceback.print_exc()  # the verdict is already computed; logging must not lose it

    return AdjudicateResponse(
        checks=verdict.checks,
        overall=verdict.overall,
        confidence=verdict.confidence,
        agrees_with_local=verdict.agrees_with_local,
        disagreements=verdict.disagreements,
    )
