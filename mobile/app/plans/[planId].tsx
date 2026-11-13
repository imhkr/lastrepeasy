import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useMergedPlan } from "../../src/services/useMergedPlan";
import { addDay, removeDay } from "../../src/services/customPlan";
import { AddSheet } from "../../src/components/AddSheet";
import { dayKey, getDoneDays } from "../../src/services/weightLog";

export default function PlanDetail() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const { plan, base, reload } = useMergedPlan(planId);
  const [adding, setAdding] = useState(false);
  const [week, setWeek] = useState(1);
  const [showWeak, setShowWeak] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  useFocusEffect(
    useCallback(() => {
      getDoneDays().then(setDone);
    }, [])
  );

  if (!plan || !base) return <View style={styles.container}><Text style={styles.title}>Plan not found</Text></View>;
  const w = plan.weeks.find((x) => x.week === week) ?? plan.weeks[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: plan.name.split(":")[0].replace(/\s*\(.*\)/, "") }} />
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.summary}>{plan.summary}</Text>

      <Text style={styles.label}>{(plan.unit ?? "Week").toUpperCase()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weeks}>
        {plan.weeks.map((x) => (
          <TouchableOpacity key={x.week} style={[styles.weekChip, x.week === w.week && styles.weekOn]} onPress={() => setWeek(x.week)}>
            <Text style={[styles.weekText, x.week === w.week && styles.weekTextOn]}>{x.week}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.weekNote}>
        Block {w.block}
        {w.label ? `  ·  ${w.label}` : ""}
      </Text>

      {w.days.map((d, i) => (
        <TouchableOpacity key={d.day} style={styles.dayCard} onPress={() => router.push(`/workout/${plan.id}/${w.week}/${i}` as any)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayName}>{d.day}</Text>
            <Text style={styles.daySub}>{d.exercises.length} exercises{d.custom ? "  ·  Custom" : ""}</Text>
          </View>
          {d.custom && (
            <TouchableOpacity hitSlop={8} style={styles.del} accessibilityLabel={`Remove ${d.day}`} onPress={async () => { await removeDay(base, w.week, i, base.weeks.find((x) => x.week === w.week)!.days.length); reload(); }}>
              <Text style={styles.delText}>✕</Text>
            </TouchableOpacity>
          )}
          {done.includes(dayKey(plan.id, w.week, i)) && <Text style={styles.doneChip}>Done</Text>}
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addDay} onPress={() => setAdding(true)}>
        <Text style={styles.addDayText}>+ Add day (Abs, Arms, ...)</Text>
      </TouchableOpacity>
      <AddSheet
        visible={adding}
        mode="day"
        unit={plan.unit ?? "Week"}
        onClose={() => setAdding(false)}
        onAdd={async (v) => { await addDay(base, w.week, v.name, v.allWeeks); setAdding(false); reload(); }}
      />

      {plan.weakPoints && (
        <View style={{ marginTop: 18 }}>
          <TouchableOpacity onPress={() => setShowWeak((v) => !v)}>
            <Text style={styles.link}>{showWeak ? "Hide weak-point options" : "Weak-point exercise options"}</Text>
          </TouchableOpacity>
          {showWeak &&
            plan.weakPoints.map((wp) => (
              <View key={wp.area} style={styles.wpCard}>
                <Text style={styles.wpArea}>{wp.area}</Text>
                <Text style={styles.wpLine}>Exercise 1: {wp.ex1.join("  /  ")}</Text>
                <Text style={styles.wpLine}>Exercise 2: {wp.ex2.join("  /  ")}</Text>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  title: { color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  summary: { color: "#94A3B8", fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  label: { color: "#94A3B8", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  weeks: { gap: 8, paddingBottom: 4 },
  weekChip: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#182235", alignItems: "center", justifyContent: "center" },
  weekOn: { backgroundColor: "#0284C7" },
  weekText: { color: "#CBD5E1", fontSize: 16, fontWeight: "800" },
  weekTextOn: { color: "#FFFFFF" },
  weekNote: { color: "#F59E0B", fontSize: 13, fontWeight: "700", marginVertical: 12 },
  dayCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E293B", marginBottom: 10 },
  dayName: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  daySub: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  doneChip: { color: "#34D399", backgroundColor: "#052E1B", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, fontSize: 12, fontWeight: "800", marginRight: 8, overflow: "hidden" },
  del: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center", marginRight: 8 },
  delText: { color: "#F87171", fontSize: 13, fontWeight: "800" },
  addDay: { borderWidth: 1, borderColor: "#334155", borderStyle: "dashed", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  addDayText: { color: "#7DD3FC", fontSize: 15, fontWeight: "700" },
  chevron: { color: "#64748B", fontSize: 26 },
  link: { color: "#38BDF8", fontSize: 14, fontWeight: "700", marginBottom: 10 },
  wpCard: { backgroundColor: "#111827", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#1E293B", marginBottom: 8, gap: 4 },
  wpArea: { color: "#F8FAFC", fontSize: 15, fontWeight: "800" },
  wpLine: { color: "#CBD5E1", fontSize: 13, lineHeight: 19 },
});
