import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Body, { ExtendedBodyPart, Slug } from "react-native-body-highlighter";
import { classifyMuscleActivation, MuscleGroupKey } from "../services/muscleMap";

export { classifyMuscleActivation };

interface Props {
  exerciseName: string;
  targetMuscles: string[];
}

const SLUGS: Record<MuscleGroupKey, Slug[]> = {
  chest: ["chest"],
  shoulders: ["deltoids"],
  biceps: ["biceps"],
  forearms: ["forearm"],
  abs: ["abs", "obliques"],
  quads: ["quadriceps"],
  lats: ["upper-back"],
  traps: ["trapezius"],
  triceps: ["triceps"],
  glutes: ["gluteal"],
  hamstrings: ["hamstring"],
  erectors: ["lower-back"],
  calves: ["calves"],
  adductors: ["adductors"],
  neck: ["neck"],
};

// intensity 1 = helper (amber), 2 = main (red)
const COLORS = ["#D97706", "#DC2626"];

export const MuscleHitMapAnimation: React.FC<Props> = ({ exerciseName, targetMuscles }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const { primary, secondary } = classifyMuscleActivation(exerciseName, targetMuscles);
  const data: ExtendedBodyPart[] = [];
  secondary.forEach((k) => !primary.has(k) && SLUGS[k].forEach((slug) => data.push({ slug, intensity: 1 })));
  primary.forEach((k) => SLUGS[k].forEach((slug) => data.push({ slug, intensity: 2 })));

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const bodyProps = {
    data,
    colors: COLORS,
    gender: "male" as const,
    scale: 0.85,
    border: "#0B1220",
    defaultFill: "#2A3445",
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.badge}>MUSCLES WORKED</Text>
        <Text style={styles.title}>Where you'll feel it</Text>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS[1] }]} />
          <Text style={styles.legendText}>Main</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS[0] }]} />
          <Text style={styles.legendText}>Helper</Text>
        </View>
      </View>

      <View style={styles.svgContainer}>
        <Animated.View style={[styles.bodies, { opacity }]}>
          <View style={styles.bodyCol}>
            <Text style={styles.sideLabel}>FRONT</Text>
            <Body {...bodyProps} side="front" />
          </View>
          <View style={styles.bodyCol}>
            <Text style={styles.sideLabel}>BACK</Text>
            <Body {...bodyProps} side="back" />
          </View>
        </Animated.View>
      </View>

      <View style={styles.muscleTagsWrap}>
        {targetMuscles.map((m, idx) => (
          <View key={m} style={[styles.targetBadge, idx === 0 ? styles.targetBadgePrimary : styles.targetBadgeSecondary]}>
            <Text style={[styles.targetBadgeText, { color: idx === 0 ? "#FCA5A5" : "#FDE68A" }]}>{m.replace(/\s*\([^)]*\)/g, "")}</Text>
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
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    gap: 16,
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
  bodies: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  bodyCol: { alignItems: "center" },
  sideLabel: { color: "#94A3B8", fontSize: 10, fontWeight: "700", marginBottom: 4 },
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
