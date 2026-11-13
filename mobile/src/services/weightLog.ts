import { loadJson, saveJson } from "./kv";
import { LiftEntry, SetLog, e1rm, topSet } from "./weightMath";

const KEY = "lifts_v1";
export const slugId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dayOf = (iso: string) => iso.slice(0, 10);

export async function getAllLifts(): Promise<LiftEntry[]> {
  return loadJson<LiftEntry[]>(KEY, []);
}

/** Save today's sets for an exercise (replaces an earlier save from the same day). */
export async function logLift(exerciseName: string, sets: SetLog[]): Promise<LiftEntry | null> {
  const valid = sets.filter((s) => s.kg > 0 && s.reps > 0);
  if (!valid.length) return null;
  const exerciseId = slugId(exerciseName);
  const date = new Date().toISOString();
  const entry: LiftEntry = { id: `${exerciseId}_${dayOf(date)}`, exerciseId, exerciseName, date, sets: valid };
  const all = await getAllLifts();
  await saveJson(KEY, [...all.filter((e) => e.id !== entry.id), entry]);
  return entry;
}

/** Most recent saved lift for this exercise from an earlier day than today. */
export async function lastLiftBeforeToday(exerciseName: string): Promise<LiftEntry | null> {
  const id = slugId(exerciseName);
  const today = dayOf(new Date().toISOString());
  const past = (await getAllLifts())
    .filter((e) => e.exerciseId === id && dayOf(e.date) < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? null;
}

/** Today's already-saved sets for this exercise, if any. */
export async function todaysLift(exerciseName: string): Promise<LiftEntry | null> {
  const id = `${slugId(exerciseName)}_${dayOf(new Date().toISOString())}`;
  return (await getAllLifts()).find((e) => e.id === id) ?? null;
}

/** Best estimated 1RM for this exercise from earlier days (0 if none). */
export async function bestE1rmBeforeToday(exerciseName: string): Promise<number> {
  const id = slugId(exerciseName);
  const today = dayOf(new Date().toISOString());
  return (await getAllLifts())
    .filter((e) => e.exerciseId === id && dayOf(e.date) < today)
    .reduce((m, e) => {
      const t = topSet(e.sets);
      return t ? Math.max(m, e1rm(t)) : m;
    }, 0);
}

const DONE_KEY = "done_days";
export const dayKey = (planId: string, week: number | string, day: number | string) => `${planId}:${week}:${day}`;
export const getDoneDays = () => loadJson<string[]>(DONE_KEY, []);
export async function setDayDone(key: string, done: boolean): Promise<void> {
  const all = await getDoneDays();
  await saveJson(DONE_KEY, done ? [...new Set([...all, key])] : all.filter((k) => k !== key));
}
