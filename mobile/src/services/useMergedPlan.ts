import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getPlan } from "../data";
import { loadCustom } from "./customPlan";
import { mergeCustom } from "./customMerge";
import type { Plan } from "../types/plans";

/** The book plan with the user's own days and exercises merged in; reloads whenever the screen regains focus. */
export function useMergedPlan(planId: string): { plan: Plan | undefined; base: Plan | undefined; reload: () => Promise<void> } {
  const base = getPlan(planId);
  const [plan, setPlan] = useState<Plan | undefined>(base);
  const reload = useCallback(async () => {
    const b = getPlan(planId);
    setPlan(b ? mergeCustom(b, await loadCustom()) : undefined);
  }, [planId]);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  return { plan, base, reload };
}
