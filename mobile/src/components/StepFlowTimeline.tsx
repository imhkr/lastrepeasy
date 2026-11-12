import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FlowPhaseStep } from "../types/workout";
import { AngleGaugeCard } from "./AngleGaugeCard";

interface Props {
  steps: FlowPhaseStep[];
  activeStepIndex: number;
  onSelectStep: (index: number, timestampSec: number) => void;
}

export const StepFlowTimeline: React.FC<Props> = ({
  steps,
  activeStepIndex,
  onSelectStep,
}) => {
  const activeStep = steps[activeStepIndex] || steps[0];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>
        START-TO-END STEP-BY-STEP FLOW ({steps.length} PHASES)
      </Text>

      {/* Horizontal Step Selector Pills */}
      <View style={styles.stepTabs}>
        {steps.map((s, idx) => {
          const isSelected = idx === activeStepIndex;
          return (
            <TouchableOpacity
              key={s.phase_id}
              style={[styles.stepPill, isSelected && styles.stepPillActive]}
              onPress={() => onSelectStep(idx, s.timestamp_sec)}
            >
              <Text style={[styles.stepPillNumber, isSelected && styles.stepPillTextActive]}>
                Step {s.step_number}
              </Text>
              <Text style={[styles.stepPillTime, isSelected && styles.stepPillTextActive]}>
                {s.start_sec.toFixed(1)}s–{s.end_sec.toFixed(1)}s
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Step Detailed Card */}
      {activeStep && (
        <View style={styles.detailCard}>
          <View style={styles.titleRow}>
            <Text style={styles.phaseTitle}>{activeStep.title}</Text>
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>@{activeStep.timestamp_sec.toFixed(1)}s</Text>
            </View>
          </View>

          {activeStep.keyframe_url ? (
            <Image
              source={{ uri: activeStep.keyframe_url }}
              style={styles.keyframeImage}
              resizeMode="cover"
            />
          ) : null}

          <View style={styles.cueBox}>
            <Text style={styles.cueHeader}>JEFF NIPPARD BIOMECHANICS CUE</Text>
            <Text style={styles.cueDescription}>{activeStep.coaching_summary}</Text>
          </View>

          <View style={styles.calloutDualRow}>
            <View style={[styles.calloutBox, { borderLeftColor: "#F59E0B" }]}>
              <Text style={styles.calloutLabelAmber}>HANDLE & WRIST AT STEP {activeStep.step_number}</Text>
              <Text style={styles.calloutText}>{activeStep.handle_and_wrist_note}</Text>
            </View>
            <View style={[styles.calloutBox, { borderLeftColor: "#10B981" }]}>
              <Text style={styles.calloutLabelGreen}>ANKLE & STANCE AT STEP {activeStep.step_number}</Text>
              <Text style={styles.calloutText}>{activeStep.ankle_and_base_note}</Text>
            </View>
          </View>

          <Text style={styles.subHeading}>
            MEASURED JOINT ANGLES AT STEP {activeStep.step_number}
          </Text>
          <AngleGaugeCard metrics={activeStep.joint_metrics} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  sectionTitle: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  stepTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  stepPill: {
    backgroundColor: "#141C2B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22304A",
  },
  stepPillActive: {
    backgroundColor: "#0284C7",
    borderColor: "#38BDF8",
  },
  stepPillNumber: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "800",
  },
  stepPillTime: {
    color: "#94A3B8",
    fontSize: 10,
  },
  stepPillTextActive: {
    color: "#FFFFFF",
  },
  detailCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  phaseTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "800",
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    backgroundColor: "#0EA5E922",
    borderColor: "#0EA5E9",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "700",
  },
  keyframeImage: {
    width: "100%",
    height: 215,
    borderRadius: 12,
    backgroundColor: "#090D16",
    marginBottom: 12,
  },
  cueBox: {
    backgroundColor: "#172136",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cueHeader: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  cueDescription: {
    color: "#F1F5F9",
    fontSize: 13,
    lineHeight: 19,
  },
  calloutDualRow: {
    gap: 8,
    marginBottom: 14,
  },
  calloutBox: {
    backgroundColor: "#141C2B",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
  },
  calloutLabelAmber: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 2,
  },
  calloutLabelGreen: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 2,
  },
  calloutText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 17,
  },
  subHeading: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 4,
  },
});
