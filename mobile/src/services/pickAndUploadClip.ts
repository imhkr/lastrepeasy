import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadWorkoutVideo } from "../api/client";
import { WorkoutAnalysisResult } from "../types/workout";

export const MAX_CLIP_SEC = 20;

/** Pick a clip (max 20 s) from the library and send it for analysis. Returns null if cancelled/rejected. */
export async function pickAndUploadClip(exerciseHint?: string): Promise<WorkoutAnalysisResult | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Permission Required", "Please allow video library access to upload workout clips.");
    return null;
  }
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    allowsEditing: true,
    videoMaxDuration: MAX_CLIP_SEC,
    quality: 1,
  });
  if (picked.canceled || !picked.assets?.length) return null;

  const asset = picked.assets[0];
  if (asset.duration && asset.duration > (MAX_CLIP_SEC + 0.5) * 1000) {
    Alert.alert("Clip too long", `Please pick a video of ${MAX_CLIP_SEC} seconds or less.`);
    return null;
  }
  return uploadWorkoutVideo(asset.uri, asset.fileName || "workout_clip.mp4", asset.mimeType || "video/mp4", exerciseHint);
}
