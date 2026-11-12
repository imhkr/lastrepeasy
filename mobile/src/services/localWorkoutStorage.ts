import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { WorkoutAnalysisResult } from "../types/workout";

const WEB_STORAGE_KEY = "@formflow_saved_workouts_v1";
const INDEX_FILENAME = "saved_workouts_index.json";

// In-memory fallback cache so storage never throws even if native modules are unavailable
let memoryCache: WorkoutAnalysisResult[] = [];

function getFolderUri(): string | null {
  if (Platform.OS === "web") return null;
  const baseDir = FileSystem.documentDirectory;
  if (!baseDir) return null;
  return `${baseDir}formflow_saved/`;
}

async function ensureFolderExists(): Promise<string | null> {
  const folder = getFolderUri();
  if (!folder) return null;
  try {
    const info = await FileSystem.getInfoAsync(folder);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }
    return folder;
  } catch {
    return null;
  }
}

export async function getSavedWorkouts(): Promise<WorkoutAnalysisResult[]> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(WEB_STORAGE_KEY);
      if (!raw) return memoryCache;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : memoryCache;
    }

    const folder = await ensureFolderExists();
    if (!folder) return memoryCache;

    const indexUri = `${folder}${INDEX_FILENAME}`;
    const info = await FileSystem.getInfoAsync(indexUri);
    if (!info.exists) return memoryCache;

    const raw = await FileSystem.readAsStringAsync(indexUri);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryCache = parsed;
      return parsed;
    }
    return memoryCache;
  } catch {
    return memoryCache;
  }
}

async function writeSavedWorkoutsIndex(list: WorkoutAnalysisResult[]): Promise<void> {
  memoryCache = list;
  try {
    const serialized = JSON.stringify(list);
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(WEB_STORAGE_KEY, serialized);
      return;
    }

    const folder = await ensureFolderExists();
    if (!folder) return;
    const indexUri = `${folder}${INDEX_FILENAME}`;
    await FileSystem.writeAsStringAsync(indexUri, serialized);
  } catch {
    // Keep memoryCache intact even if disk write fails
  }
}

export async function getSavedWorkoutById(
  jobId: string
): Promise<WorkoutAnalysisResult | null> {
  try {
    const list = await getSavedWorkouts();
    return list.find((item) => item.job_id === jobId) || null;
  } catch {
    return null;
  }
}

async function downloadFileIfMobile(
  remoteUrl: string | null | undefined,
  localFileName: string
): Promise<string | null> {
  if (!remoteUrl) return null;
  if (Platform.OS === "web") return remoteUrl;

  try {
    const folder = await ensureFolderExists();
    if (!folder) return remoteUrl;

    const targetUri = `${folder}${localFileName}`;
    const existing = await FileSystem.getInfoAsync(targetUri);
    if (existing.exists) {
      return targetUri;
    }
    const dl = await FileSystem.downloadAsync(remoteUrl, targetUri);
    return dl.uri;
  } catch {
    return remoteUrl;
  }
}

export async function saveWorkoutToPhoneStorage(
  workout: WorkoutAnalysisResult
): Promise<WorkoutAnalysisResult> {
  try {
    const jobId = workout.job_id;

    // Download Flow Video, Full Video, and 5 Phase Keyframes to phone storage
    const localFlowUri = await downloadFileIfMobile(
      workout.step_by_step_flow_video_url,
      `${jobId}_flow.mp4`
    );
    const localFullUri = await downloadFileIfMobile(
      workout.annotated_full_video_url,
      `${jobId}_full.mp4`
    );

    const updatedSteps = await Promise.all(
      (workout.steps || []).map(async (step) => {
        const localKf = await downloadFileIfMobile(
          step.keyframe_url,
          `${jobId}_${step.phase_id}.jpg`
        );
        return {
          ...step,
          keyframe_url: localKf || step.keyframe_url,
        };
      })
    );

    const savedRecord: WorkoutAnalysisResult = {
      ...workout,
      steps: updatedSteps,
      saved_at: new Date().toISOString(),
      local_flow_video_uri: localFlowUri || workout.step_by_step_flow_video_url,
      local_full_video_uri: localFullUri || workout.annotated_full_video_url,
      step_by_step_flow_video_url: localFlowUri || workout.step_by_step_flow_video_url,
      annotated_full_video_url: localFullUri || workout.annotated_full_video_url,
    };

    const currentList = await getSavedWorkouts();
    const filtered = currentList.filter((w) => w.job_id !== jobId);
    const nextList = [savedRecord, ...filtered];
    await writeSavedWorkoutsIndex(nextList);
    return savedRecord;
  } catch {
    return workout;
  }
}

export async function removeSavedWorkout(jobId: string): Promise<WorkoutAnalysisResult[]> {
  try {
    const currentList = await getSavedWorkouts();
    const nextList = currentList.filter((w) => w.job_id !== jobId);
    await writeSavedWorkoutsIndex(nextList);
    return nextList;
  } catch {
    return memoryCache;
  }
}
