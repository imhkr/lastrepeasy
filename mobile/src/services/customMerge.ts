// Pure merge of the user's own changes over a book plan (no React Native imports, node-testable).
import type { Plan, PlanDay, PlanExercise } from "../types/plans.ts";

export interface ExEdit {
  name?: string;
  sets?: number;
  reps?: string;
  rest?: string;
}

export interface CustomStore {
  days: Record<string, string[]>; // "planId:week" -> names of added days, in order
  ex: Record<string, PlanExercise[]>; // "planId:week:day" -> added exercises, in order
  edits: Record<string, ExEdit>; // "planId:week:day:exerciseId" -> user changes to one exercise
  order: Record<string, string[]>; // "planId:week:day" -> exercise ids in the user's order
  hidden: Record<string, string[]>; // "planId:week:day" -> exercise ids the user removed
  dayNames: Record<string, string>; // "planId:week:day" -> new name for a book day
}

export const EMPTY_STORE: CustomStore = { days: {}, ex: {}, edits: {}, order: {}, hidden: {}, dayNames: {} };
export const withDefaults = (s: Partial<CustomStore> | null | undefined): CustomStore => ({ ...EMPTY_STORE, ...(s ?? {}) });

export const dayStoreKey = (planId: string, week: number) => `${planId}:${week}`;
export const exStoreKey = (planId: string, week: number, day: number) => `${planId}:${week}:${day}`;
export const editKey = (planId: string, week: number, day: number, exId: string) => `${planId}:${week}:${day}:${exId}`;

function applyEdit(e: PlanExercise, ed?: ExEdit): PlanExercise {
  if (!ed) return e;
  const groups = ed.sets != null || ed.reps != null
    ? [{ sets: ed.sets ?? e.groups.reduce((n, g) => n + g.sets, 0), reps: ed.reps ?? e.groups[0]?.reps ?? "8-12", effort: e.groups[0]?.effort ?? "" }]
    : e.groups;
  return { ...e, name: ed.name ?? e.name, rest: ed.rest ?? e.rest, groups, edited: true };
}

/** Book days first, then custom days. Added exercises go after the book ones; edits, removals and order are applied last. */
export function mergeCustom(plan: Plan, store: CustomStore): Plan {
  return {
    ...plan,
    weeks: plan.weeks.map((w) => {
      const extraDays: PlanDay[] = (store.days[dayStoreKey(plan.id, w.week)] ?? []).map((name) => ({ day: name, custom: true, exercises: [] }));
      const days = [...w.days, ...extraDays].map((d, i) => {
        const dk = exStoreKey(plan.id, w.week, i);
        const gone = new Set(store.hidden[dk] ?? []);
        const all = [...d.exercises, ...(store.ex[dk] ?? [])];
        const shown = all.filter((e) => !gone.has(e.id)).map((e) => applyEdit(e, store.edits[editKey(plan.id, w.week, i, e.id)]));
        const rank = new Map((store.order[dk] ?? []).map((id, n) => [id, n]));
        // Stable sort: unranked exercises (e.g. added later) keep their place at the end.
        const sorted = shown
          .map((e, n) => ({ e, n }))
          .sort((a, b) => (rank.get(a.e.id) ?? 1e6 + a.n) - (rank.get(b.e.id) ?? 1e6 + b.n))
          .map((x) => x.e);
        return {
          ...d,
          day: store.dayNames[dk] ?? d.day,
          hidden: all.filter((e) => gone.has(e.id)).map((e) => ({ id: e.id, name: e.name })),
          exercises: sorted,
        };
      });
      return { ...w, days };
    }),
  };
}

export function makeExercise(name: string, sets: number, reps: string, rest: string): PlanExercise {
  return {
    id: `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    custom: true,
    warmup: "",
    rest,
    subs: [],
    groups: [{ sets: Math.max(1, Math.round(sets) || 1), reps: reps.trim() || "8-12", effort: "" }],
  };
}

/** Moves one id inside a list; returns the same order when the move is off either end. */
export function moveId(ids: string[], id: string, dir: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** After deleting day `removed` of a week, re-keys every per-day map so later days keep their data. Keys look like "plan:week:day[:id]". */
export function shiftDayKeys<T>(map: Record<string, T>, planId: string, week: number, removed: number): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const [p, w, d, ...rest] = k.split(":");
    if (p !== planId || Number(w) !== week || d === undefined || Number(d) < removed) out[k] = v;
    else if (Number(d) > removed) out[[p, w, Number(d) - 1, ...rest].join(":")] = v;
  }
  return out;
}
