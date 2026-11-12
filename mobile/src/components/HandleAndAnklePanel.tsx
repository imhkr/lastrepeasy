import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { HandleAndStanceInfo } from "../types/workout";

interface Props {
  info: HandleAndStanceInfo;
}

export const HandleAndAnklePanel: React.FC<Props> = ({ info }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>
        HANDLE POSITION, WRIST STACK & ANKLE BASE
      </Text>

      <View style={styles.rowCard}>
        <View style={[styles.iconPill, { backgroundColor: "#F59E0B22", borderColor: "#F59E0B" }]}>
          <Text style={[styles.iconPillText, { color: "#F59E0B" }]}>GRIP & HANDLE</Text>
        </View>
        <Text style={styles.primaryValue}>{info.grip_type}</Text>
        <Text style={styles.subValue}>{info.handle_height_and_path}</Text>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.halfCard}>
          <Text style={styles.labelCyan}>HAND / WRIST ANGLE</Text>
          <Text style={styles.bodyText}>{info.wrist_alignment}</Text>
        </View>

        <View style={styles.halfCard}>
          <Text style={styles.labelGreen}>FOOT & ANKLE POSITION</Text>
          <Text style={styles.bodyText}>{info.foot_and_ankle_position}</Text>
        </View>
      </View>

      <View style={styles.torsoBar}>
        <Text style={styles.torsoLabel}>Recommended Torso Inclination Angle:</Text>
        <Text style={styles.torsoValue}>{info.torso_angle_deg.toFixed(0)}° lean</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginVertical: 10,
  },
  sectionHeader: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  rowCard: {
    backgroundColor: "#182235",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  iconPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  iconPillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  primaryValue: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  subValue: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 18,
  },
  splitRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  halfCard: {
    flex: 1,
    backgroundColor: "#182235",
    borderRadius: 12,
    padding: 12,
  },
  labelCyan: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  labelGreen: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  bodyText: {
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 17,
  },
  torsoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  torsoLabel: {
    color: "#94A3B8",
    fontSize: 12,
  },
  torsoValue: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
});
