import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getAllLifts } from "../src/services/weightLog";
import { loadJson } from "../src/services/kv";
import { LiftEntry, topSet } from "../src/services/weightMath";
import { getPlan } from "../src/data";
import { loadCustom } from "../src/services/customPlan";
import { mergeCustom } from "../src/services/customMerge";
import type { Plan } from "../src/types/plans";

interface LastOpened {
  planId: string;
  week: number;
  day: number;
}

const TILES = [
  { title: "Training plans", sub: "Min-Max and PPL, week by week", path: "/plans", color: "#0EA5E9" },
  { title: "Live coach", sub: "Camera tells you what to fix, rep by rep", path: "/live", color: "#F43F5E" },
  { title: "Form check", sub: "Upload a set, see what to fix", path: "/form", color: "#10B981" },
  { title: "My lifts", sub: "Beat your last numbers", path: "/lifts", color: "#F59E0B" },
  { title: "Progress photos", sub: "Compare before and after", path: "/photos", color: "#A78BFA" },
] as const;

export default function HomeHub() {
  const router = useRouter();
  const [last, setLast] = useState<LastOpened | null>(null);
  const [plan, setPlan] = useState<Plan | undefined>();
  const [recent, setRecent] = useState<LiftEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadJson<LastOpened | null>("last_workout", null).then(async (l) => {
        setLast(l);
        const b = l ? getPlan(l.planId) : undefined;
        setPlan(b ? mergeCustom(b, await loadCustom()) : undefined);
      });
      getAllLifts().then((l) => {
        const seen = new Set<string>();
        const latest = [...l].sort((a, b) => b.date.localeCompare(a.date)).filter((e) => !seen.has(e.exerciseId) && !!seen.add(e.exerciseId));
        setRecent(latest.slice(0, 3));
      });
    }, [])
  );

  const day = plan?.weeks.find((w) => w.week === last!.week)?.days[last!.day];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.hello}>Let's train</Text>
      <Text style={styles.sub}>Pick up where you left off, or start something new.</Text>

      {plan && day && (
        <TouchableOpacity
          style={styles.continueCard}
          onPress={() => router.push(`/workout/${plan.id}/${last!.week}/${last!.day}` as any)}
        >
          <Text style={styles.continueLabel}>CONTINUE</Text>
          <Text style={styles.continueTitle}>{day.day}</Text>
          <Text style={styles.continueSub}>
            {plan.name.split(":")[0].replace(/\s*\(.*\)/, "")} · {plan.unit ?? "Week"} {last!.week}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.grid}>
        {TILES.map((t) => (
          <TouchableOpacity key={t.path} style={[styles.tile, { borderColor: t.color }]} onPress={() => router.push(t.path as any)}>
            <View style={[styles.dot, { backgroundColor: t.color }]} />
            <Text style={styles.tileTitle}>{t.title}</Text>
            <Text style={styles.tileSub}>{t.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {recent.length > 0 && (
        <View style={styles.recent}>
          <Text style={styles.recentTitle}>Latest lifts</Text>
          {recent.map((e) => {
            const t = topSet(e.sets);
            return (
              <View key={e.id} style={styles.recentRow}>
                <Text style={styles.recentName}>{e.exerciseName}</Text>
                <Text style={styles.recentVal}>{t ? `${t.kg} kg × ${t.reps}` : ""}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  hello: { color: "#F8FAFC", fontSize: 30, fontWeight: "800", marginTop: 8 },
  sub: { color: "#94A3B8", fontSize: 15, marginTop: 4, marginBottom: 18 },
  continueCard: { backgroundColor: "#12304A", borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#1D4E75" },
  continueLabel: { color: "#7DD3FC", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  continueTitle: { color: "#F8FAFC", fontSize: 22, fontWeight: "800", marginTop: 4 },
  continueSub: { color: "#BAE6FD", fontSize: 14, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "48%", flexGrow: 1, height: 150, backgroundColor: "#111827", borderRadius: 18, padding: 16, borderWidth: 1, justifyContent: "flex-end" },
  dot: { width: 14, height: 14, borderRadius: 7, marginBottom: 14 },
  tileTitle: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  tileSub: { color: "#94A3B8", fontSize: 12, marginTop: 4, lineHeight: 17 },
  recent: { marginTop: 24, gap: 8 },
  recentTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },
  recentRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#111827", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#1E293B" },
  recentName: { color: "#F8FAFC", fontSize: 14, fontWeight: "600", flex: 1 },
  recentVal: { color: "#F59E0B", fontSize: 14, fontWeight: "700" },
});
