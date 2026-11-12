export type JobStatus =
  | "queued"
  | "ingesting"
  | "tracking_pose"
  | "extracting_cues"
  | "rendering_video"
  | "completed"
  | "failed";

export interface JointAngleMetric {
  joint_name: string;
  joint_key: "elbow" | "shoulder" | "hip" | "knee" | "ankle" | "wrist" | "torso" | string;
  measured_deg: number;
  ideal_range_deg: [number, number];
  status: "optimal" | "adjust" | "caution" | string;
  cue: string;
}

export interface HandleAndStanceInfo {
  grip_type: string;
  handle_height_and_path: string;
  wrist_alignment: string;
  foot_and_ankle_position: string;
  torso_angle_deg: number;
}

export interface FlowPhaseStep {
  step_number: number;
  phase_id: string;
  title: string;
  timestamp_sec: number;
  start_sec: number;
  end_sec: number;
  keyframe_url?: string | null;
  coaching_summary: string;
  handle_and_wrist_note: string;
  ankle_and_base_note: string;
  joint_metrics: JointAngleMetric[];
}

export interface AngleSeriesPoint {
  time_sec: number;
  elbow_deg: number;
  shoulder_deg: number;
  hip_deg: number;
  knee_deg: number;
  ankle_deg: number;
  wrist_deg: number;
  torso_lean_deg: number;
}

export interface WorkoutAnalysisResult {
  job_id: string;
  status: JobStatus;
  progress_pct: number;
  progress_message: string;
  error?: string | null;

  source_type: string;
  source_url?: string | null;
  exercise_name: string;
  target_muscles: string[];
  coach_style: string;
  duration_sec: number;

  overall_form_score: number;
  handle_and_stance?: HandleAndStanceInfo | null;
  key_takeaways: string[];
  voice_script_english?: string;
  voice_script_hinglish?: string;

  steps: FlowPhaseStep[];
  angle_timeline: AngleSeriesPoint[];

  source_video_url?: string | null;
  step_by_step_flow_video_url?: string | null;
  annotated_full_video_url?: string | null;

  // Offline phone storage metadata
  saved_at?: string;
  local_flow_video_uri?: string | null;
  local_full_video_uri?: string | null;
}

export interface PresetCatalogItem {
  preset_id: string;
  title: string;
  coach: string;
  youtube_reference_url: string;
  target_muscles: string[];
  highlight_cue: string;
  default_grip: string;
}
