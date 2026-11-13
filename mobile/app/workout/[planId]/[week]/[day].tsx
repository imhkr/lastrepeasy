import React, { useEffect, useState } from "react";
import type { PlanExercise } from "../../../../src/types/plans";
import type { ExEdit } from "../../../../src/services/customMerge";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMergedPlan } from "../../../../src/services/useMergedPlan";
import { addExercise, editExercise, moveExercise, removeExercise, renameDay, resetExercise, restoreExercise } from "../../../../src/services/customPlan";
import { AddSheet } from "../../../../src/components/AddSheet";
import { saveJson } from "../../../../src/services/kv";
import { dayKey, getDoneDays, setDayDone } from "../../../../src/services/weightLog";
import { ExerciseCard } from "../../../../src/components/ExerciseCard";

export default function Workout() {
  const { planId, week, day } = useLocalSearchParams<{ planId: string; week: string; day: string }>();
  const { plan, base, reload } = useMergedPlan(planId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PlanExercise | null>(null);
  const [renaming, setRenaming] = useState(false);
  const w = plan?.weeks.find((x) => x.week === Number(week));
  const d = w?.days[Number(day)];
  const key = dayKey(planId, week, day);
  const [done, setDone] = useState(false);
  useEffect(() => {
    getDoneDays().then((l) => setDone(l.includes(key)));
  }, [key]);

  useEffect(() => {
    if (plan && w && d) saveJson("last_workout", { planId: plan.id, week: w.week, day: Number(day) });
  }, [plan, w, d, day]);

  if (!plan || !base || !w || !d) return <View style={styles.container}><Text style={styles.title}>Workout not found</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: d.day.replace(/\s*\(.*\)/, "") }} />
      <View style={styles.titleRow}>
        <Text style={[styles.title, { flex: 1 }]}>{d.day}</Text>
        <TouchableOpacity onPress={() => setRenaming(true)} hitSlop={8}>
          <Text style={styles.rename}>Rename</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>
        {plan.unit ?? "Week"} {w.week}
        {w.label ? ` · ${w.label}` : ""} · {d.exercises.length} exercises
      </Text>
      <Text style={styles.tip}>Tap an exercise for substitutes and to log your weights.</Text>
      {d.exercises.map((ex, i) => (
        <ExerciseCard
          key={`${ex.id}-${ex.name}`}
          ex={ex}
          weakPoints={plan.weakPoints}
          canUp={i > 0}
          canDown={i < d.exercises.length - 1}
          onMove={async (dir) => { await moveExercise(base, w.week, Number(day), d.exercises.map((e) => e.id), ex.id, dir); reload(); }}
          onEdit={() => setEditing(ex)}
          onReset={ex.edited && !ex.custom ? async () => { await resetExercise(base, w.week, Number(day), ex.id); reload(); } : undefined}
          onRemove={async () => { await removeExercise(base, w.week, Number(day), ex.id, !!ex.custom); reload(); }}
        />
      ))}
      {!!d.hidden?.length && (
        <View style={styles.hiddenBox}>
          <Text style={styles.hiddenTitle}>Removed from this day</Text>
          {d.hidden.map((h) => (
            <TouchableOpacity key={h.id} onPress={async () => { await restoreExercise(base, w.week, Number(day), h.id); reload(); }}>
              <Text style={styles.hiddenItem}>+ Restore {h.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.addEx} onPress={() => setAdding(true)}>
        <Text style={styles.addExText}>+ Add exercise</Text>
      </TouchableOpacity>
      <AddSheet
        visible={renaming}
        mode="renameDay"
        unit={plan.unit ?? "Week"}
        initial={{ name: d.day }}
        onClose={() => setRenaming(false)}
        onAdd={async (v) => { await renameDay(base, w.week, Number(day), base.weeks.find((x) => x.week === w.week)!.days.length, v.name, v.allWeeks); setRenaming(false); reload(); }}
      />
      <AddSheet
        visible={!!editing}
        mode="editExercise"
        unit={plan.unit ?? "Week"}
        showAllWeeks={!editing?.custom}
        initial={editing ? { name: editing.name, sets: editing.groups.reduce((n, g) => n + g.sets, 0), reps: editing.groups[0]?.reps, rest: editing.rest } : undefined}
        onClose={() => setEditing(null)}
        onAdd={async (v) => {
          if (editing) {
            // Send only what changed, so saving untouched fields never flattens a multi-group book prescription.
            const total = editing.groups.reduce((n, g) => n + g.sets, 0);
            const patch: ExEdit = {};
            if (v.name.trim() !== editing.name) patch.name = v.name.trim();
            if (v.sets !== total) patch.sets = v.sets;
            if (v.reps.trim() && v.reps.trim() !== editing.groups[0]?.reps) patch.reps = v.reps.trim();
            if (v.rest.trim() !== editing.rest) patch.rest = v.rest.trim();
            if (Object.keys(patch).length) await editExercise(base, w.week, Number(day), editing.id, patch, v.allWeeks);
          }
          setEditing(null);
          reload();
        }}
      />
      <AddSheet
        visible={adding}
        mode="exercise"
        unit={plan.unit ?? "Week"}
        onClose={() => setAdding(false)}
        onAdd={async (v) => { await addExercise(base, w.week, Number(day), v.name, v.sets, v.reps, v.rest, v.allWeeks); setAdding(false); reload(); }}
      />
      <TouchableOpacity
        style={[styles.doneBtn, done && styles.doneOn]}
        onPress={() => {
          setDone(!done);
          setDayDone(key, !done);
        }}
      >
        <Text style={styles.doneText}>{done ? "Day complete  ·  tap to undo" : "Mark day complete"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  title: { color: "#F8FAFC", fontSize: 24, fontWeight: "800" },
  sub: { color: "#F59E0B", fontSize: 13, fontWeight: "700", marginTop: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rename: { color: "#38BDF8", fontSize: 14, fontWeight: "700" },
  hiddenBox: { gap: 8, marginBottom: 12 },
  hiddenTitle: { color: "#94A3B8", fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  hiddenItem: { color: "#7DD3FC", fontSize: 14, fontWeight: "600" },
  addEx: { borderWidth: 1, borderColor: "#334155", borderStyle: "dashed", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 6 },
  addExText: { color: "#7DD3FC", fontSize: 15, fontWeight: "700" },
  doneBtn: { backgroundColor: "#0284C7", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  doneOn: { backgroundColor: "#065F46" },
  doneText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  tip: { color: "#94A3B8", fontSize: 13, marginTop: 6, marginBottom: 14 },
});
