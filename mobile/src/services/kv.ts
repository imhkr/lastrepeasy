import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { resetSavedWorkoutsCache } from "./localWorkoutStorage";

// Tiny JSON store: localStorage on web, a file in the app's document folder on phones.
// Same approach as localWorkoutStorage so data survives restarts.
const cache = new Map<string, unknown>();

const fileUri = (key: string) => (FileSystem.documentDirectory ? `${FileSystem.documentDirectory}ff_${key}.json` : null);

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    if (Platform.OS === "web") {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(`@ff_${key}`) : null;
      return raw ? (JSON.parse(raw) as T) : (cache.get(key) as T) ?? fallback;
    }
    const uri = fileUri(key);
    if (!uri) return (cache.get(key) as T) ?? fallback;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return (cache.get(key) as T) ?? fallback;
    return JSON.parse(await FileSystem.readAsStringAsync(uri)) as T;
  } catch {
    return (cache.get(key) as T) ?? fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  cache.set(key, value);
  try {
    const raw = JSON.stringify(value);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(`@ff_${key}`, raw);
      return;
    }
    const uri = fileUri(key);
    if (uri) await FileSystem.writeAsStringAsync(uri, raw);
  } catch {
    // memory cache still holds the value for this session
  }
}

export async function clearAllLocalData(): Promise<void> {
  cache.clear();
  resetSavedWorkoutsCache();
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        const keys: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && (k.startsWith("@ff_") || k.startsWith("@formflow_"))) keys.push(k);
        }
        keys.forEach((k) => window.localStorage.removeItem(k));
      }
      return;
    }
    const baseDir = FileSystem.documentDirectory;
    if (!baseDir) return;
    const entries = await FileSystem.readDirectoryAsync(baseDir).catch(() => [] as string[]);
    await Promise.all(
      entries
        .filter((name) => name.startsWith("ff_"))
        .map((name) => FileSystem.deleteAsync(`${baseDir}${name}`, { idempotent: true }).catch(() => {}))
    );
    await FileSystem.deleteAsync(`${baseDir}formflow_saved/`, { idempotent: true }).catch(() => {});
    await FileSystem.deleteAsync(`${baseDir}formflow_photos/`, { idempotent: true }).catch(() => {});
  } catch {
    // ignore cleanup errors
  }
}
