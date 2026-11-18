import { Platform } from "react-native";
import { File } from "expo-file-system";
import { PresetCatalogItem, WorkoutAnalysisResult } from "../types/workout";

// Default local backend URL: Android Emulator uses 10.0.2.2, iOS/Web uses localhost
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

// Installed (release) builds always talk to the deployed server; dev runs use EXPO_PUBLIC_API_URL or the local backend.
const PROD_URL = "https://formflow-backend-r8dh.onrender.com";
export const API_BASE_URL = __DEV__ ? process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST : PROD_URL;

export async function fetchPresets(): Promise<PresetCatalogItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/presets`);
  if (!res.ok) {
    throw new Error(`Failed to load presets (${res.status})`);
  }
  return res.json();
}

export async function startYoutubeAnalysis(
  youtubeUrl: string,
  exerciseHint?: string,
  startSec?: number,
  endSec?: number
): Promise<WorkoutAnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/youtube`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      youtube_url: youtubeUrl,
      exercise_hint: exerciseHint || undefined,
      start_sec: startSec,
      end_sec: endSec,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`YouTube analysis request failed: ${errText}`);
  }
  return res.json();
}

export async function startPresetDemoAnalysis(presetId: string): Promise<WorkoutAnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/demo/${encodeURIComponent(presetId)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Preset demo failed: ${errText}`);
  }
  return res.json();
}

export async function uploadWorkoutVideo(
  fileUri: string,
  fileName: string,
  mimeType: string = "video/mp4",
  exerciseHint?: string
): Promise<WorkoutAnalysisResult> {
  const formData = new FormData();
  if (Platform.OS === "web") {
    formData.append("file", await (await fetch(fileUri)).blob(), fileName || "workout.mp4");
  } else {
    // Expo's fetch rejects the old {uri,name,type} object; it needs a real File/Blob.
    formData.append("file", new File(fileUri) as any);
  }

  if (exerciseHint) {
    formData.append("exercise_hint", exerciseHint);
  }

  const res = await fetch(`${API_BASE_URL}/api/analyze/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Video upload failed: ${errText}`);
  }
  return res.json();
}

export async function fetchJobResult(jobId: string): Promise<WorkoutAnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${encodeURIComponent(jobId)}`);
  if (!res.ok) {
    throw new Error(`Job status check failed (${res.status})`);
  }
  return res.json();
}

export type AdjudicateCheck = { id: string; status: string };

export type AdjudicateResult = {
  checks: { id: string; status: string; cue?: { en: string; hi: string } }[];
  overall: string;
  confidence: number;
  agrees_with_local: boolean;
  disagreements: string[];
};

// The second opinion on one finished rep. The phone has already judged it and already told the
// lifter, so this is deliberately not on the critical path: it returns whatever the server says
// and the caller decides what to do with a disagreement. No key material is involved here -- the
// phone holds none, and the backend is the only thing that talks to the model.
export async function adjudicateRep(input: {
  exerciseId: string;
  repIndex: number;
  view?: string;
  checks: AdjudicateCheck[];
  keyframes: string[];
  landmarks?: Record<string, number>[];
}): Promise<AdjudicateResult> {
  const res = await fetch(`${API_BASE_URL}/api/live/adjudicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exercise_id: input.exerciseId,
      rep_index: input.repIndex,
      view: input.view,
      checks: input.checks,
      keyframes: input.keyframes,
      landmarks: input.landmarks ?? [],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adjudication failed (${res.status}): ${text}`);
  }
  return res.json();
}
