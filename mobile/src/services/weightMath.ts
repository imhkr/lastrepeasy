// Pure lift-comparison math. No React Native imports so it can be tested with plain node.

export interface SetLog {
  kg: number;
  reps: number;
}

export interface LiftEntry {
  id: string; // `${exerciseId}_${YYYY-MM-DD}` — one entry per exercise per day
  exerciseId: string;
  exerciseName: string;
  date: string; // ISO timestamp
  sets: SetLog[];
}

export type Verdict = "first" | "up" | "same" | "down";

export interface Comparison {
  verdict: Verdict;
  prevTop: SetLog | null;
  nowTop: SetLog | null;
  deltaKg: number; // heaviest set now minus heaviest set last time
  deltaE1rm: number;
  deltaVolume: number; // total kg x reps
}

/** Epley estimated one-rep max, 1 decimal. */
export const e1rm = (s: SetLog): number =>
  s.reps <= 0 || s.kg <= 0 ? 0 : Math.round(s.kg * (1 + s.reps / 30) * 10) / 10;

export const volume = (sets: SetLog[]): number => sets.reduce((a, s) => a + s.kg * s.reps, 0);

/** The set that shows the most strength (highest estimated 1RM). */
export function topSet(sets: SetLog[]): SetLog | null {
  const valid = sets.filter((s) => s.kg > 0 && s.reps > 0);
  if (!valid.length) return null;
  return valid.reduce((best, s) => (e1rm(s) > e1rm(best) ? s : best));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function compareLifts(prev: LiftEntry | null, nowSets: SetLog[]): Comparison {
  const nowTop = topSet(nowSets);
  const prevTop = prev ? topSet(prev.sets) : null;
  if (!prevTop || !nowTop) {
    return { verdict: "first", prevTop, nowTop, deltaKg: 0, deltaE1rm: 0, deltaVolume: 0 };
  }
  const deltaE1rm = round1(e1rm(nowTop) - e1rm(prevTop));
  const verdict: Verdict = deltaE1rm > 0.5 ? "up" : deltaE1rm < -0.5 ? "down" : "same";
  return {
    verdict,
    prevTop,
    nowTop,
    deltaKg: round1(nowTop.kg - prevTop.kg),
    deltaE1rm,
    deltaVolume: Math.round(volume(nowSets) - volume(prev!.sets)),
  };
}

/** "+2.5 kg", "-1 kg", "same weight" */
export function formatKgDelta(d: number): string {
  if (d === 0) return "same weight";
  return `${d > 0 ? "+" : ""}${d} kg`;
}
