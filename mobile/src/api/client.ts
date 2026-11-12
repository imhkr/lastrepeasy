import { Platform } from "react-native";
import { PresetCatalogItem, WorkoutAnalysisResult } from "../types/workout";

// Default local backend URL: Android Emulator uses 10.0.2.2, iOS/Web uses localhost
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

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
  formData.append("file", {
    uri: fileUri,
    name: fileName || "workout.mp4",
    type: mimeType,
  } as any);

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
