import { loadJson, saveJson } from "./kv";

const KEY = "live_coach_issues";
const MAX_ISSUES = 200;

export interface LiveIssue {
  id: string;
  exerciseId: string;
  exerciseName: string;
  repIndex: number;
  checkId: string;
  severity: "error" | "warning";
  textEn: string;
  textHi: string;
  source: "local" | "ai";
  createdAt: string;
}

export async function getLiveIssues(exerciseId?: string): Promise<LiveIssue[]> {
  const all = await loadJson<LiveIssue[]>(KEY, []);
  if (!exerciseId) return all;
  return all.filter((x) => x.exerciseId === exerciseId);
}

export async function addLiveIssues(items: LiveIssue[]): Promise<LiveIssue[]> {
  if (!items.length) return getLiveIssues();
  const prev = await loadJson<LiveIssue[]>(KEY, []);
  const next = [...items, ...prev].slice(0, MAX_ISSUES);
  await saveJson(KEY, next);
  return next;
}

export async function deleteLiveIssue(id: string): Promise<LiveIssue[]> {
  const prev = await loadJson<LiveIssue[]>(KEY, []);
  const next = prev.filter((x) => x.id !== id);
  await saveJson(KEY, next);
  return next;
}

export async function clearLiveIssues(exerciseId?: string): Promise<LiveIssue[]> {
  if (!exerciseId) {
    await saveJson<LiveIssue[]>(KEY, []);
    return [];
  }
  const prev = await loadJson<LiveIssue[]>(KEY, []);
  const next = prev.filter((x) => x.exerciseId !== exerciseId);
  await saveJson(KEY, next);
  return next;
}
