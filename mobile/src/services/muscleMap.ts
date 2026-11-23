export type MuscleGroupKey =
  | "chest"
  | "shoulders"
  | "biceps"
  | "forearms"
  | "abs"
  | "quads"
  | "lats"
  | "traps"
  | "triceps"
  | "glutes"
  | "hamstrings"
  | "erectors"
  | "calves"
  | "adductors"
  | "neck";

export interface MuscleActivation {
  primary: Set<MuscleGroupKey>;
  secondary: Set<MuscleGroupKey>;
}

export function classifyMuscleActivation(
  exerciseName: string,
  targetMuscles: string[] = []
): MuscleActivation {
  const combined = `${exerciseName} ${targetMuscles.join(" ")}`.toLowerCase();
  const primary = new Set<MuscleGroupKey>();
  const secondary = new Set<MuscleGroupKey>();

  // Specific/narrow rules first so "Leg Press", "Shoulder Press", "JM Press", "Calf Press"
  // do not fall into generic "press" -> chest.
  if (/(calf|ankle)/.test(combined)) {
    primary.add("calves");
  } else if (/neck/.test(combined)) {
    primary.add("neck");
  } else if (/adduction/.test(combined)) {
    primary.add("adductors");
    secondary.add("quads");
  } else if (/(abduction|glute|hip thrust)/.test(combined)) {
    primary.add("glutes");
    secondary.add("hamstrings");
  } else if (/(crunch|ab wheel|rollout|leg raise|vacuum|russian twist|plank|oblique|\bcore\b)/.test(combined)) {
    primary.add("abs");
  } else if (/(leg curl|hamstring|rdl|deadlift|hinge|nordic)/.test(combined)) {
    primary.add("hamstrings");
    primary.add("glutes");
    secondary.add("erectors");
  } else if (/(hyperextension|back extension)/.test(combined)) {
    primary.add("erectors");
    primary.add("glutes");
    secondary.add("hamstrings");
  } else if (/(leg press|leg extension|squat|lunge|sissy|quad)/.test(combined)) {
    primary.add("quads");
    secondary.add("glutes");
    secondary.add("hamstrings");
  } else if (/(triceps|jm press|skull|french|pressdown|kickback|katana|pushdown)/.test(combined)) {
    primary.add("triceps");
    secondary.add("shoulders");
  } else if (/\bdip\b/.test(combined)) {
    primary.add("chest");
    primary.add("triceps");
    secondary.add("shoulders");
  } else if (/(lateral raise|y-raise|shoulder press|arnold|upright row|face pull|rear delt|reverse pec|reverse flye|delt|shoulder)/.test(combined)) {
    primary.add("shoulders");
    secondary.add("traps");
  } else if (/(shrug|trap)/.test(combined)) {
    primary.add("traps");
    secondary.add("lats");
  } else if (/(bicep|curl|brachialis)/.test(combined)) {
    primary.add("biceps");
    secondary.add("forearms");
  } else if (/(lat|pullover|pulldown|pull-up|pullup|pull-around|pull-in|row|teres)/.test(combined)) {
    primary.add("lats");
    secondary.add("traps");
    secondary.add("biceps");
  } else if (/(chest|pec|flye|bench|pushup|incline|decline)/.test(combined)) {
    primary.add("chest");
    secondary.add("shoulders");
    secondary.add("triceps");
  }

  if (primary.size === 0 && /press/.test(combined)) {
    primary.add("chest");
    secondary.add("shoulders");
    secondary.add("triceps");
  }

  if (primary.size === 0) {
    primary.add("lats");
    primary.add("chest");
    secondary.add("shoulders");
    secondary.add("biceps");
  }

  return { primary, secondary };
}
