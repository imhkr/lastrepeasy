import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { JointAngleMetric } from "../types/workout";

interface Props {
  metrics: JointAngleMetric[];
}

export const AngleGaugeCard: React.FC<Props> = ({ metrics }) => {
  return (
    <View style={styles.grid}>
      {metrics.map((m) => {
        const [minIdeal, maxIdeal] = m.ideal_range_deg;
        const isOptimal = m.status === "optimal";
        const badgeColor = isOptimal ? "#10B981" : m.status === "adjust" ? "#F59E0B" : "#EF4444";

        return (
          <View key={m.joint_key} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.jointTitle}>{m.joint_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: badgeColor + "22", borderColor: badgeColor }]}>
                <Text style={[styles.statusText, { color: badgeColor }]}>
                  {isOptimal ? "OPTIMAL" : "CHECK ANGLE"}
                </Text>
              </View>
            </View>

            <View style={styles.angleRow}>
              <Text style={styles.measuredValue}>{m.measured_deg.toFixed(0)}°</Text>
              <Text style={styles.idealRange}>
                Target: {minIdeal.toFixed(0)}°–{maxIdeal.toFixed(0)}°
              </Text>
            </View>

            <Text style={styles.cueText}>{m.cue}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  card: {
    width: "48%",
    backgroundColor: "#141C2B",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#22304A",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  jointTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  angleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 6,
  },
  measuredValue: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
  },
  idealRange: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "600",
  },
  cueText: {
    color: "#CBD5E1",
    fontSize: 11,
    lineHeight: 15,
  },
});
