import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { loadJson, saveJson } from "./kv";

export type PhotoLabel = "Front" | "Side" | "Back";

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string; // ISO
  label: PhotoLabel;
  weightKg?: number;
  waistCm?: number;
}

const KEY = "photos_v1";

export async function getPhotos(): Promise<ProgressPhoto[]> {
  const list = await loadJson<ProgressPhoto[]>(KEY, []);
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

export async function addPhoto(srcUri: string, label: PhotoLabel, weightKg?: number, waistCm?: number): Promise<ProgressPhoto> {
  const id = `ph_${Date.now()}`;
  let uri = srcUri;
  if (Platform.OS !== "web" && FileSystem.documentDirectory) {
    // Copy out of the picker's cache so the photo is still there next week.
    const dir = `${FileSystem.documentDirectory}formflow_photos/`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    uri = `${dir}${id}.jpg`;
    await FileSystem.copyAsync({ from: srcUri, to: uri });
  }
  const photo: ProgressPhoto = { id, uri, date: new Date().toISOString(), label, weightKg, waistCm };
  await saveJson(KEY, [photo, ...(await loadJson<ProgressPhoto[]>(KEY, []))]);
  return photo;
}

export async function removePhoto(id: string): Promise<void> {
  await saveJson(KEY, (await loadJson<ProgressPhoto[]>(KEY, [])).filter((p) => p.id !== id));
}

export const daysBetween = (a: string, b: string) =>
  Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000);
