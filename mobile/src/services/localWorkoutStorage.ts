import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { WorkoutAnalysisResult } from "../types/workout";

const STORAGE_KEY = "@formflow_saved_workouts_v1";

export async function getSavedWorkouts(): Promise<WorkoutAnalysisResult[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getSavedWorkoutById(
  jobId: string
): Promise<WorkoutAnalysisResult | null> {
  const list = await getSavedWorkouts();
  return list.find((item) => item.job_id === jobId) || null;
}

async function downloadFileIfMobile(
  remoteUrl: string | null | undefined,
  localFileName: string
): Promise<string | null> {
  if (!remoteUrl) return null;
  if (Platform.OS === "web") return remoteUrl;

  try {
    const baseDir = FileSystem.documentDirectory;
    if (!baseDir) return remoteUrl;
    const folder = `${baseDir}formflow_saved/`;
    const folderInfo = await FileSystem.getInfoAsync(folder);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }
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
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  return savedRecord;
}

export async function removeSavedWorkout(jobId: string): Promise<WorkoutAnalysisResult[]> {
  const currentList = await getSavedWorkouts();
  const nextList = currentList.filter((w) => w.job_id !== jobId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  return nextList;
}
