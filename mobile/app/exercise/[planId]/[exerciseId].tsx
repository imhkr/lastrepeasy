import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useMergedPlan } from "../../../src/services/useMergedPlan";
import { MuscleHitMapAnimation } from "../../../src/components/MuscleHitMapAnimation";
import { getRubric, listExercises } from "../../../src/live/engine";
import { LiveIssue, deleteLiveIssue, getLiveIssues } from "../../../src/services/liveIssueLog";
import { useLang } from "../../../src/services/lang";
import { PlanExercise } from "../../../src/types/plans";

export default function ExerciseGuide() {
  const { planId, exerciseId, name } = useLocalSearchParams<{ planId: string; exerciseId: string; name?: string }>();
  const router = useRouter();
  const [lang] = useLang();
  const { plan } = useMergedPlan(planId);
  const [issues, setIssues] = useState<LiveIssue[]>([]);

  const ex: PlanExercise | null = useMemo(() => {
    if (!plan) return null;
    for (const w of plan.weeks) {
      for (const d of w.days) {
        const hit = d.exercises.find((e) => e.id === exerciseId);
        if (hit) return hit;
      }
    }
    return {
      id: exerciseId,
      name: name ? decodeURIComponent(name) : exerciseId,
      warmup: "",
      rest: "",
      subs: [],
      groups: [],
    };
  }, [plan, exerciseId, name]);

  const available = useMemo(() => new Set(listExercises()), []);
  const hasRubric = available.has(exerciseId);
  const rubric = hasRubric ? (getRubric(exerciseId) as any) : null;

  useFocusEffect(
    useCallback(() => {
      getLiveIssues(exerciseId).then(setIssues);
    }, [exerciseId])
  );

  if (!ex) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: ex.name }} />
      <Text style={styles.title}>{ex.name}</Text>

      <View style={styles.metaRow}>
        {ex.warmup ? <Text style={styles.pill}>Warm-up: {ex.warmup}</Text> : null}
        {ex.rest ? <Text style={styles.pill}>Rest: {ex.rest}</Text> : null}
        {ex.technique ? <Text style={styles.techPill}>Last set: {ex.technique}</Text> : null}
      </View>

      <MuscleHitMapAnimation
        exerciseName={ex.name}
        targetMuscles={rubric?.family ? [String(rubric.family)] : []}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What to take care of</Text>
        {ex.note ? (
          <View style={styles.coachBox}>
            <Text style={styles.coachLabel}>Coach note</Text>
            <Text style={styles.coachText}>{ex.note}</Text>
          </View>
        ) : null}
        {rubric?.checks?.length ? (
          <View style={styles.checkList}>
            {rubric.checks.map((c: any) => (
              <View key={c.id} style={styles.checkRow}>
                <Text style={styles.checkLabel}>{c.label || c.id}</Text>
                {c.cue ? (
                  <Text style={styles.checkCue}>{lang === "hi" ? c.cue.hi : c.cue.en}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No automatic live-coach checkpoints for this exercise yet.</Text>
        )}
      </View>

      {ex.subs?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Substitutes</Text>
          <View style={styles.chips}>
            {ex.subs.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recorded Live Coach Warnings & Errors ({issues.length})</Text>
        {issues.length === 0 ? (
          <Text style={styles.muted}>No warnings or errors saved for this exercise yet.</Text>
        ) : (
          issues.map((item) => (
            <View key={item.id} style={styles.issueRow}>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={styles.issueMeta}>
                  <Text style={[styles.sevBadge, item.severity === "error" ? styles.sevError : styles.sevWarn]}>
                    {item.severity === "error" ? "ERROR" : "WARN"}
                  </Text>
                  <Text style={styles.issueRep}>Rep {item.repIndex}</Text>
                </View>
                <Text style={styles.issueText}>{lang === "hi" ? item.textHi : item.textEn}</Text>
              </View>
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteLiveIssue(item.id).then(() => getLiveIssues(exerciseId).then(setIssues))}
                accessibilityLabel="Delete issue"
              >
                <Text style={styles.delText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.liveBtn}
        onPress={() =>
          router.push(
            (hasRubric
              ? `/live?exercise=${encodeURIComponent(exerciseId)}`
              : `/live?q=${encodeURIComponent(ex.name)}`) as any
          )
        }
      >
        <Text style={styles.liveBtnText}>Start Live Coach</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  title: { color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { color: "#CBD5E1", backgroundColor: "#182235", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: "700", overflow: "hidden" },
  techPill: { color: "#FCD34D", backgroundColor: "#3B2A0A", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: "700", overflow: "hidden" },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 10 },
  cardTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  coachBox: { backgroundColor: "#0B1220", borderLeftWidth: 3, borderLeftColor: "#38BDF8", borderRadius: 10, padding: 10, gap: 4 },
  coachLabel: { color: "#7DD3FC", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  coachText: { color: "#E2E8F0", fontSize: 13, lineHeight: 19 },
  checkList: { gap: 8 },
  checkRow: { backgroundColor: "#0B1220", borderRadius: 10, padding: 10, gap: 2 },
  checkLabel: { color: "#7DD3FC", fontSize: 13, fontWeight: "800" },
  checkCue: { color: "#CBD5E1", fontSize: 13, lineHeight: 18 },
  muted: { color: "#94A3B8", fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#182235", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: "#CBD5E1", fontSize: 13, fontWeight: "600" },
  issueRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0B1220", borderRadius: 12, padding: 10 },
  issueMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  sevBadge: { fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: "hidden" },
  sevError: { backgroundColor: "#450A0A", color: "#FCA5A5" },
  sevWarn: { backgroundColor: "#451A03", color: "#FCD34D" },
  issueRep: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  issueText: { color: "#E2E8F0", fontSize: 13, lineHeight: 18 },
  delBtn: { backgroundColor: "#2B1215", borderWidth: 1, borderColor: "#7F1D1D", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  delText: { color: "#FCA5A5", fontSize: 12, fontWeight: "800" },
  liveBtn: { backgroundColor: "#0284C7", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  liveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
