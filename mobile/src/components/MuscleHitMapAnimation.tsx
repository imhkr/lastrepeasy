import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";

interface Props {
  exerciseName: string;
  targetMuscles: string[];
}

type MuscleGroupKey =
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
  | "erectors";

interface MuscleActivation {
  primary: Set<MuscleGroupKey>;
  secondary: Set<MuscleGroupKey>;
}

function classifyMuscleActivation(
  exerciseName: string,
  targetMuscles: string[]
): MuscleActivation {
  const combined = `${exerciseName} ${targetMuscles.join(" ")}`.toLowerCase();
  const primary = new Set<MuscleGroupKey>();
  const secondary = new Set<MuscleGroupKey>();

  if (combined.includes("lat") || combined.includes("pullover") || combined.includes("pulldown") || combined.includes("teres")) {
    primary.add("lats");
    secondary.add("triceps");
    secondary.add("traps");
    secondary.add("abs");
  }
  if (combined.includes("chest") || combined.includes("pec") || combined.includes("clavicular") || combined.includes("incline") || combined.includes("press")) {
    primary.add("chest");
    primary.add("shoulders");
    secondary.add("triceps");
  }
  if (combined.includes("bicep") || combined.includes("curl") || combined.includes("brachialis")) {
    primary.add("biceps");
    secondary.add("forearms");
    secondary.add("shoulders");
  }
  if (combined.includes("hamstring") || combined.includes("rdl") || combined.includes("deadlift") || combined.includes("hinge")) {
    primary.add("hamstrings");
    primary.add("glutes");
    secondary.add("erectors");
    secondary.add("lats");
    secondary.add("forearms");
  }
  if (combined.includes("squat") || combined.includes("quad")) {
    primary.add("quads");
    primary.add("glutes");
    secondary.add("hamstrings");
    secondary.add("abs");
  }

  // Fallback if custom exercise name had no match
  if (primary.size === 0) {
    primary.add("lats");
    primary.add("chest");
    secondary.add("shoulders");
    secondary.add("biceps");
  }

  return { primary, secondary };
}

export const MuscleHitMapAnimation: React.FC<Props> = ({
  exerciseName,
  targetMuscles,
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 20);
    }, 90);
    return () => clearInterval(interval);
  }, []);

  // Smooth sine wave between 0.45 and 1.0 for glowing muscle animation
  const wave = 0.5 * (1 + Math.sin((pulsePhase / 20) * Math.PI * 2));
  const primaryOpacity = 0.55 + 0.45 * wave;
  const secondaryOpacity = 0.35 + 0.3 * wave;
  const glowRadiusBoost = 2.5 * wave;

  const { primary, secondary } = classifyMuscleActivation(exerciseName, targetMuscles);

  const colorFor = (key: MuscleGroupKey) => {
    if (primary.has(key)) return "#EF4444"; // Intense Red-Orange Primary Hit
    if (secondary.has(key)) return "#F59E0B"; // Amber Stabilizer / Secondary Hit
    return "#1E293B"; // Inactive base muscle color
  };

  const opacityFor = (key: MuscleGroupKey) => {
    if (primary.has(key)) return primaryOpacity;
    if (secondary.has(key)) return secondaryOpacity;
    return 0.75;
  };

  const strokeFor = (key: MuscleGroupKey) => {
    if (primary.has(key)) return "#FCA5A5";
    if (secondary.has(key)) return "#FDE68A";
    return "#334155";
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>LIVE MUSCLE ACTIVATION ANATOMY</Text>
          <Text style={styles.title}>Where This Exercise Hits Your Body</Text>
        </View>
        <View style={styles.legendCol}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>Primary Target</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Secondary / Stabilizer</Text>
          </View>
        </View>
      </View>

      <View style={styles.svgContainer}>
        <Svg width="100%" height={270} viewBox="0 0 320 260">
          {/* ================= ANTERIOR (FRONT VIEW) — Left X=85 ================= */}
          <SvgText
            x="85"
            y="18"
            fill="#94A3B8"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            FRONT (ANTERIOR)
          </SvgText>

          <G transform="translate(85, 25)">
            {/* Head & Neck */}
            <Circle cx="0" cy="18" r="13" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <Rect x="-5" y="31" width="10" height="8" rx="3" fill="#1E293B" />

            {/* Anterior Deltoids (Shoulders) */}
            <Ellipse
              cx="-26"
              cy="48"
              rx={9 + (primary.has("shoulders") ? glowRadiusBoost * 0.5 : 0)}
              ry="11"
              fill={colorFor("shoulders")}
              fillOpacity={opacityFor("shoulders")}
              stroke={strokeFor("shoulders")}
              strokeWidth="1.2"
            />
            <Ellipse
              cx="26"
              cy="48"
              rx={9 + (primary.has("shoulders") ? glowRadiusBoost * 0.5 : 0)}
              ry="11"
              fill={colorFor("shoulders")}
              fillOpacity={opacityFor("shoulders")}
              stroke={strokeFor("shoulders")}
              strokeWidth="1.2"
            />

            {/* Pectoralis Major (Upper & Mid Chest) */}
            <Path
              d="M -20 40 Q 0 42 0 58 Q -12 62 -21 54 Z"
              fill={colorFor("chest")}
              fillOpacity={opacityFor("chest")}
              stroke={strokeFor("chest")}
              strokeWidth="1.5"
            />
            <Path
              d="M 20 40 Q 0 42 0 58 Q 12 62 21 54 Z"
              fill={colorFor("chest")}
              fillOpacity={opacityFor("chest")}
              stroke={strokeFor("chest")}
              strokeWidth="1.5"
            />

            {/* Core / Rectus Abdominis */}
            <Rect
              x="-14"
              y="60"
              width="28"
              height="42"
              rx="6"
              fill={colorFor("abs")}
              fillOpacity={opacityFor("abs")}
              stroke={strokeFor("abs")}
              strokeWidth="1.2"
            />
            <Line x1="0" y1="62" x2="0" y2="100" stroke="#0F172A" strokeWidth="1.2" />

            {/* Biceps Brachii */}
            <Ellipse
              cx="-31"
              cy="70"
              rx={7 + (primary.has("biceps") ? glowRadiusBoost * 0.6 : 0)}
              ry="14"
              fill={colorFor("biceps")}
              fillOpacity={opacityFor("biceps")}
              stroke={strokeFor("biceps")}
              strokeWidth="1.4"
            />
            <Ellipse
              cx="31"
              cy="70"
              rx={7 + (primary.has("biceps") ? glowRadiusBoost * 0.6 : 0)}
              ry="14"
              fill={colorFor("biceps")}
              fillOpacity={opacityFor("biceps")}
              stroke={strokeFor("biceps")}
              strokeWidth="1.4"
            />

            {/* Forearms / Wrist Stabilizers */}
            <Ellipse
              cx="-35"
              cy="97"
              rx="5.5"
              ry="13"
              fill={colorFor("forearms")}
              fillOpacity={opacityFor("forearms")}
              stroke={strokeFor("forearms")}
              strokeWidth="1.2"
            />
            <Ellipse
              cx="35"
              cy="97"
              rx="5.5"
              ry="13"
              fill={colorFor("forearms")}
              fillOpacity={opacityFor("forearms")}
              stroke={strokeFor("forearms")}
              strokeWidth="1.2"
            />

            {/* Quadriceps */}
            <Ellipse
              cx="-11"
              cy="132"
              rx={9 + (primary.has("quads") ? glowRadiusBoost * 0.5 : 0)}
              ry="26"
              fill={colorFor("quads")}
              fillOpacity={opacityFor("quads")}
              stroke={strokeFor("quads")}
              strokeWidth="1.3"
            />
            <Ellipse
              cx="11"
              cy="132"
              rx={9 + (primary.has("quads") ? glowRadiusBoost * 0.5 : 0)}
              ry="26"
              fill={colorFor("quads")}
              fillOpacity={opacityFor("quads")}
              stroke={strokeFor("quads")}
              strokeWidth="1.3"
            />

            {/* Lower Shins / Calves & Ankle Base */}
            <Rect x="-16" y="162" width="10" height="36" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <Rect x="6" y="162" width="10" height="36" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            {/* Ankle Base Stability Pulse Ring */}
            <Circle cx="-11" cy="200" r={4 + wave * 2} fill="none" stroke="#10B981" strokeWidth="1.5" />
            <Circle cx="11" cy="200" r={4 + wave * 2} fill="none" stroke="#10B981" strokeWidth="1.5" />
          </G>

          {/* ================= POSTERIOR (BACK VIEW) — Right X=235 ================= */}
          <SvgText
            x="235"
            y="18"
            fill="#94A3B8"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            BACK (POSTERIOR)
          </SvgText>

          <G transform="translate(235, 25)">
            {/* Head & Neck */}
            <Circle cx="0" cy="18" r="13" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <Rect x="-5" y="31" width="10" height="8" rx="3" fill="#1E293B" />

            {/* Traps & Upper Back */}
            <Path
              d="M -18 38 L 0 34 L 18 38 L 0 58 Z"
              fill={colorFor("traps")}
              fillOpacity={opacityFor("traps")}
              stroke={strokeFor("traps")}
              strokeWidth="1.2"
            />

            {/* Posterior Deltoids */}
            <Ellipse
              cx="-26"
              cy="48"
              rx="8.5"
              ry="10"
              fill={colorFor("shoulders")}
              fillOpacity={opacityFor("shoulders")}
              stroke={strokeFor("shoulders")}
              strokeWidth="1.2"
            />
            <Ellipse
              cx="26"
              cy="48"
              rx="8.5"
              ry="10"
              fill={colorFor("shoulders")}
              fillOpacity={opacityFor("shoulders")}
              stroke={strokeFor("shoulders")}
              strokeWidth="1.2"
            />

            {/* Latissimus Dorsi (Lats & Teres Major V-Taper) */}
            <Path
              d="M -22 48 L -3 55 L -5 92 Q -19 78 -22 48 Z"
              fill={colorFor("lats")}
              fillOpacity={opacityFor("lats")}
              stroke={strokeFor("lats")}
              strokeWidth={primary.has("lats") ? "2" : "1.2"}
            />
            <Path
              d="M 22 48 L 3 55 L 5 92 Q 19 78 22 48 Z"
              fill={colorFor("lats")}
              fillOpacity={opacityFor("lats")}
              stroke={strokeFor("lats")}
              strokeWidth={primary.has("lats") ? "2" : "1.2"}
            />

            {/* Erector Spinae (Lower Back) */}
            <Rect
              x="-7"
              y="72"
              width="14"
              height="26"
              rx="4"
              fill={colorFor("erectors")}
              fillOpacity={opacityFor("erectors")}
              stroke={strokeFor("erectors")}
              strokeWidth="1.2"
            />

            {/* Triceps Brachii */}
            <Ellipse
              cx="-31"
              cy="70"
              rx={7 + (primary.has("triceps") ? glowRadiusBoost * 0.5 : 0)}
              ry="14"
              fill={colorFor("triceps")}
              fillOpacity={opacityFor("triceps")}
              stroke={strokeFor("triceps")}
              strokeWidth="1.3"
            />
            <Ellipse
              cx="31"
              cy="70"
              rx={7 + (primary.has("triceps") ? glowRadiusBoost * 0.5 : 0)}
              ry="14"
              fill={colorFor("triceps")}
              fillOpacity={opacityFor("triceps")}
              stroke={strokeFor("triceps")}
              strokeWidth="1.3"
            />

            {/* Forearms */}
            <Ellipse
              cx="-35"
              cy="97"
              rx="5.5"
              ry="13"
              fill={colorFor("forearms")}
              fillOpacity={opacityFor("forearms")}
              stroke={strokeFor("forearms")}
              strokeWidth="1.2"
            />
            <Ellipse
              cx="35"
              cy="97"
              rx="5.5"
              ry="13"
              fill={colorFor("forearms")}
              fillOpacity={opacityFor("forearms")}
              stroke={strokeFor("forearms")}
              strokeWidth="1.2"
            />

            {/* Gluteus Maximus */}
            <Ellipse
              cx="-9"
              cy="106"
              rx="9"
              ry="10"
              fill={colorFor("glutes")}
              fillOpacity={opacityFor("glutes")}
              stroke={strokeFor("glutes")}
              strokeWidth="1.3"
            />
            <Ellipse
              cx="9"
              cy="106"
              rx="9"
              ry="10"
              fill={colorFor("glutes")}
              fillOpacity={opacityFor("glutes")}
              stroke={strokeFor("glutes")}
              strokeWidth="1.3"
            />

            {/* Hamstrings (Biceps Femoris & Semitendinosus) */}
            <Ellipse
              cx="-11"
              cy="136"
              rx={8.5 + (primary.has("hamstrings") ? glowRadiusBoost * 0.6 : 0)}
              ry="24"
              fill={colorFor("hamstrings")}
              fillOpacity={opacityFor("hamstrings")}
              stroke={strokeFor("hamstrings")}
              strokeWidth="1.4"
            />
            <Ellipse
              cx="11"
              cy="136"
              rx={8.5 + (primary.has("hamstrings") ? glowRadiusBoost * 0.6 : 0)}
              ry="24"
              fill={colorFor("hamstrings")}
              fillOpacity={opacityFor("hamstrings")}
              stroke={strokeFor("hamstrings")}
              strokeWidth="1.4"
            />

            {/* Calves & Heel Anchor */}
            <Rect x="-16" y="162" width="10" height="36" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <Rect x="6" y="162" width="10" height="36" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <Circle cx="-11" cy="200" r={4 + wave * 2} fill="none" stroke="#10B981" strokeWidth="1.5" />
            <Circle cx="11" cy="200" r={4 + wave * 2} fill="none" stroke="#10B981" strokeWidth="1.5" />
          </G>
        </Svg>
      </View>

      <View style={styles.muscleTagsWrap}>
        {targetMuscles.map((m, idx) => (
          <View
            key={m}
            style={[
              styles.targetBadge,
              idx === 0 ? styles.targetBadgePrimary : styles.targetBadgeSecondary,
            ]}
          >
            <Text
              style={[
                styles.targetBadgeText,
                idx === 0 ? { color: "#FCA5A5" } : { color: "#FDE68A" },
              ]}
            >
              {idx === 0 ? `🔥 Primary Hit: ${m}` : `⚡ Synergist: ${m}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badge: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  legendCol: {
    gap: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },
  svgContainer: {
    backgroundColor: "#090D16",
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  muscleTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  targetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  targetBadgePrimary: {
    backgroundColor: "#EF444422",
    borderColor: "#EF4444",
  },
  targetBadgeSecondary: {
    backgroundColor: "#F59E0B22",
    borderColor: "#F59E0B",
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
