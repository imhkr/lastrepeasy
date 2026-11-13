import { loadJson, saveJson } from "./kv";
import { CustomStore, EMPTY_STORE, ExEdit, dayStoreKey, editKey, exStoreKey, makeExercise, moveId, shiftDayKeys, withDefaults } from "./customMerge";
import type { Plan } from "../types/plans";

const KEY = "custom_plan";
export const loadCustom = async () => withDefaults(await loadJson<Partial<CustomStore>>(KEY, EMPTY_STORE));

async function update(fn: (s: CustomStore) => CustomStore) {
  await saveJson(KEY, fn(await loadCustom()));
}

const weeksOf = (plan: Plan, week: number, allWeeks: boolean) => (allWeeks ? plan.weeks.map((w) => w.week) : [week]);

/** Appends a day. With allWeeks it lands at the end of every week/cycle, so abs or arms stay available all programme. */
export const addDay = (plan: Plan, week: number, name: string, allWeeks: boolean) =>
  update((s) => {
    const days = { ...s.days };
    for (const wk of weeksOf(plan, week, allWeeks)) days[dayStoreKey(plan.id, wk)] = [...(days[dayStoreKey(plan.id, wk)] ?? []), name.trim()];
    return { ...s, days };
  });

export const removeDay = (plan: Plan, week: number, dayIndex: number, baseCount: number) =>
  update((s) => {
    const k = dayStoreKey(plan.id, week);
    const sh = <T,>(m: Record<string, T>) => shiftDayKeys(m, plan.id, week, dayIndex);
    return {
      days: { ...s.days, [k]: (s.days[k] ?? []).filter((_, i) => i !== dayIndex - baseCount) },
      ex: sh(s.ex), edits: sh(s.edits), order: sh(s.order), hidden: sh(s.hidden), dayNames: sh(s.dayNames),
    };
  });

/** Renames any day. Custom days are renamed in place; book days get an override. allWeeks matches by day position. */
export const renameDay = (plan: Plan, week: number, dayIndex: number, baseCount: number, name: string, allWeeks: boolean) =>
  update((s) => {
    const days = { ...s.days };
    const dayNames = { ...s.dayNames };
    const n = name.trim();
    for (const wk of weeksOf(plan, week, allWeeks)) {
      if (dayIndex >= baseCount) {
        const k = dayStoreKey(plan.id, wk);
        if (days[k]?.[dayIndex - baseCount] !== undefined) days[k] = days[k].map((d, i) => (i === dayIndex - baseCount ? n : d));
      } else dayNames[exStoreKey(plan.id, wk, dayIndex)] = n;
    }
    return { ...s, days, dayNames };
  });

export const addExercise = (plan: Plan, week: number, dayIndex: number, name: string, sets: number, reps: string, rest: string, allWeeks: boolean) =>
  update((s) => {
    const ex = { ...s.ex };
    for (const wk of weeksOf(plan, week, allWeeks)) {
      const k = exStoreKey(plan.id, wk, dayIndex);
      ex[k] = [...(ex[k] ?? []), makeExercise(name, sets, reps, rest)];
    }
    return { ...s, ex };
  });

/** Custom exercises are deleted; book exercises are hidden (and can be restored). */
export const removeExercise = (plan: Plan, week: number, dayIndex: number, exId: string, custom: boolean) =>
  update((s) => {
    const k = exStoreKey(plan.id, week, dayIndex);
    if (custom) return { ...s, ex: { ...s.ex, [k]: (s.ex[k] ?? []).filter((e) => e.id !== exId) } };
    return { ...s, hidden: { ...s.hidden, [k]: [...new Set([...(s.hidden[k] ?? []), exId])] } };
  });

export const restoreExercise = (plan: Plan, week: number, dayIndex: number, exId: string) =>
  update((s) => {
    const k = exStoreKey(plan.id, week, dayIndex);
    return { ...s, hidden: { ...s.hidden, [k]: (s.hidden[k] ?? []).filter((id) => id !== exId) } };
  });

/** Book exercises have the same id in every week, so allWeeks can apply the edit across the programme. */
export const editExercise = (plan: Plan, week: number, dayIndex: number, exId: string, patch: ExEdit, allWeeks: boolean) =>
  update((s) => {
    const edits = { ...s.edits };
    for (const wk of weeksOf(plan, week, allWeeks)) {
      const k = editKey(plan.id, wk, dayIndex, exId);
      edits[k] = { ...edits[k], ...patch };
    }
    return { ...s, edits };
  });

export const resetExercise = (plan: Plan, week: number, dayIndex: number, exId: string) =>
  update((s) => {
    const edits = { ...s.edits };
    delete edits[editKey(plan.id, week, dayIndex, exId)];
    return { ...s, edits };
  });

/** ids = the day's exercise ids as currently shown. */
export const moveExercise = (plan: Plan, week: number, dayIndex: number, ids: string[], exId: string, dir: -1 | 1) =>
  update((s) => ({ ...s, order: { ...s.order, [exStoreKey(plan.id, week, dayIndex)]: moveId(ids, exId, dir) } }));
