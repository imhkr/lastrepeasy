import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getAllLifts } from "../src/services/weightLog";
import { LiftEntry, compareLifts, e1rm, formatKgDelta, topSet } from "../src/services/weightMath";

interface Group {
  id: string;
  name: string;
  entries: LiftEntry[]; // newest first
}

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export default function Lifts() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getAllLifts().then((all) => {
        const m = new Map<string, Group>();
        [...all].sort((a, b) => b.date.localeCompare(a.date)).forEach((e) => {
          const g = m.get(e.exerciseId) ?? { id: e.exerciseId, name: e.exerciseName, entries: [] };
          g.entries.push(e);
          m.set(e.exerciseId, g);
        });
        setGroups([...m.values()]);
      });
    }, [])
  );

  if (!groups.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No lifts saved yet</Text>
        <Text style={styles.emptySub}>Open a workout, tap an exercise and save your sets. They show up here with your progress.</Text>
        <TouchableOpacity style={styles.cta} onPress={() => router.push("/plans" as any)}>
          <Text style={styles.ctaText}>Open training plans</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {groups.map((g) => {
        const latest = g.entries[0];
        const cmp = compareLifts(g.entries[1] ?? null, latest.sets);
        const t = topSet(latest.sets);
        const best = Math.max(...g.entries.map((e) => (topSet(e.sets) ? e1rm(topSet(e.sets)!) : 0)));
        const color = cmp.verdict === "up" ? "#10B981" : cmp.verdict === "down" ? "#F87171" : "#94A3B8";
        return (
          <TouchableOpacity key={g.id} style={styles.card} onPress={() => setOpen(open === g.id ? null : g.id)} activeOpacity={0.85}>
            <View style={styles.row}>
              <Text style={styles.name}>{g.name}</Text>
              <Text style={styles.top}>{t ? `${t.kg} kg × ${t.reps}` : ""}</Text>
            </View>
            <Text style={[styles.delta, { color }]}>
              {cmp.verdict === "first" ? "First entry" : `${formatKgDelta(cmp.deltaKg)} vs previous`}
              <Text style={styles.sub}>{`   ·   best est. max ${best} kg`}</Text>
            </Text>
            {open === g.id && g.entries.length > 1 && (() => {
              const vals = [...g.entries].reverse().map((e) => (topSet(e.sets) ? e1rm(topSet(e.sets)!) : 0));
              const lo = Math.min(...vals), hi = Math.max(...vals);
              return (
                <View>
                  <Text style={styles.chartTitle}>Estimated max over time</Text>
                  <View style={styles.chart}>
                    {vals.map((v, i) => (
                      <View key={i} style={styles.barCol}>
                        <Text style={styles.barVal}>{v}</Text>
                        <View style={[styles.bar, { height: 12 + (hi === lo ? 24 : ((v - lo) / (hi - lo)) * 40) }]} />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}
            {open === g.id &&
              g.entries.map((e) => (
                <View key={e.id} style={styles.hist}>
                  <Text style={styles.histDate}>{dateLabel(e.date)}</Text>
                  <Text style={styles.histSets}>{e.sets.map((s) => `${s.kg}×${s.reps}`).join("   ")}</Text>
                </View>
              ))}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48, gap: 10 },
  empty: { flex: 1, backgroundColor: "#0B0F17", alignItems: "center", justifyContent: "center", padding: 28, gap: 10 },
  emptyTitle: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  emptySub: { color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 20 },
  cta: { backgroundColor: "#0284C7", borderRadius: 12, paddingVertical: 13, paddingHorizontal: 22, marginTop: 8 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1E293B", gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { flex: 1, color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  top: { color: "#F59E0B", fontSize: 15, fontWeight: "800" },
  delta: { fontSize: 14, fontWeight: "700" },
  sub: { color: "#94A3B8", fontWeight: "500", fontSize: 12 },
  chartTitle: { color: "#94A3B8", fontSize: 12, fontWeight: "700", marginTop: 6 },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 10, height: 84, marginTop: 6 },
  barCol: { width: 34, alignItems: "center", justifyContent: "flex-end" },
  barVal: { color: "#CBD5E1", fontSize: 10, marginBottom: 3 },
  bar: { width: 22, backgroundColor: "#F59E0B", borderRadius: 4 },
  hist: { flexDirection: "row", gap: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#1E293B", marginTop: 4 },
  histDate: { color: "#94A3B8", width: 56, fontSize: 13 },
  histSets: { flex: 1, color: "#E2E8F0", fontSize: 13 },
});
