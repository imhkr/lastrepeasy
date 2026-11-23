export interface SetGroup {
  sets: number;
  reps: string;
  effort: string; // "RIR 1, 2" or "RPE early ~9, last 10"
}

export interface PlanExercise {
  id: string;
  name: string;
  superset?: string;
  weakPoint?: boolean;
  warmup: string;
  rest: string;
  subs: string[];
  technique?: string; // last-set intensity technique
  note?: string;
  groups: SetGroup[];
  custom?: boolean; // added by the user, not part of the book plan
  edited?: boolean; // sets, reps, rest or name changed by the user
}

export interface PlanDay {
  day: string;
  restAfter?: "optional" | "mandatory";
  custom?: boolean;
  hidden?: { id: string; name: string }[]; // book exercises the user removed from this day
  exercises: PlanExercise[];
}

export interface PlanWeek {
  week: number;
  block: number;
  label: string;
  days: PlanDay[];
}

export interface WeakPoint {
  area: string;
  ex1: string[];
  ex2: string[];
}

export interface Plan {
  id: string;
  name: string;
  author: string;
  summary: string;
  unit?: string; // what one block of training is called: Week or Cycle
  programNotes?: string[];
  warmupProtocol?: {
    general: string[];
    pyramid: { sets: string; detail: string }[];
  };
  weakPointNotes?: { area: string; note: string }[];
  weeks: PlanWeek[];
  weakPoints?: WeakPoint[];
}
