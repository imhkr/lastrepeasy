import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
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
  const [search, setSearch] = useState("");
  const [showWeak, setShowWeak] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  useFocusEffect(
    useCallback(() => {
      getDoneDays().then(setDone);
    }, [])
  );

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !plan) return [];
    const seen = new Map<string, { id: string; name: string; where: string; note?: string }>();
    for (const wk of plan.weeks) {
      for (const d of wk.days) {
        for (const e of d.exercises) {
          if (seen.has(e.id)) continue;
          const hay = `${e.name} ${(e.subs || []).join(" ")} ${e.note || ""}`.toLowerCase();
          if (hay.includes(q)) {
            seen.set(e.id, { id: e.id, name: e.name, where: `${plan.unit ?? "Week"} ${wk.week} · ${d.day}`, note: e.note });
          }
        }
      }
    }
    return Array.from(seen.values());
  }, [plan, search]);

  if (!plan || !base) return <View style={styles.container}><Text style={styles.title}>Plan not found</Text></View>;
  const w = plan.weeks.find((x) => x.week === week) ?? plan.weeks[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: plan.name.split(":")[0].replace(/\s*\(.*\)/, "") }} />
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.summary}>{plan.summary}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises in this plan..."
          placeholderTextColor="#64748B"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn} accessibilityLabel="Clear search">
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {search.trim().length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.label}>MATCHING EXERCISES ({searchHits.length})</Text>
          {searchHits.length === 0 ? (
            <Text style={styles.daySub}>No exercises match "{search.trim()}".</Text>
          ) : (
            searchHits.map((hit) => (
              <TouchableOpacity
                key={hit.id}
                style={styles.dayCard}
                onPress={() => router.push(`/exercise/${plan.id}/${hit.id}?name=${encodeURIComponent(hit.name)}` as any)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayName}>{hit.name}</Text>
                  <Text style={styles.daySub}>{hit.where}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

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
        <React.Fragment key={d.day}>
          <TouchableOpacity style={styles.dayCard} onPress={() => router.push(`/workout/${plan.id}/${w.week}/${i}` as any)}>
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
          {d.restAfter ? (
            <View style={[styles.restBadge, d.restAfter === "mandatory" ? styles.restMandatory : styles.restOptional]}>
              <Text style={[styles.restText, d.restAfter === "mandatory" ? styles.restMandatoryText : styles.restOptionalText]}>
                {d.restAfter === "mandatory" ? "Mandatory Rest Day" : "Optional Rest Day"}
              </Text>
            </View>
          ) : null}
        </React.Fragment>
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

      {(plan.warmupProtocol || plan.programNotes) && (
        <View style={{ marginTop: 18 }}>
          <TouchableOpacity onPress={() => setShowGuide((v) => !v)}>
            <Text style={styles.link}>{showGuide ? "Hide warm-up & program guide" : "Warm-up & program guide"}</Text>
          </TouchableOpacity>
          {showGuide && (
            <View style={{ gap: 8 }}>
              {plan.warmupProtocol && (
                <View style={styles.wpCard}>
                  <Text style={styles.wpArea}>General Warm-Up</Text>
                  {plan.warmupProtocol.general.map((line) => (
                    <Text key={line} style={styles.wpLine}>• {line}</Text>
                  ))}
                  <Text style={[styles.wpArea, { marginTop: 6 }]}>Exercise-Specific Warm-Up Pyramid</Text>
                  {plan.warmupProtocol.pyramid.map((p) => (
                    <Text key={p.sets} style={styles.wpLine}>{p.sets} {p.sets === "1" ? "set" : "sets"}: {p.detail}</Text>
                  ))}
                </View>
              )}
              {plan.programNotes && (
                <View style={styles.wpCard}>
                  <Text style={styles.wpArea}>Program Notes</Text>
                  {plan.programNotes.map((line) => (
                    <Text key={line} style={styles.wpLine}>• {line}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {plan.weakPoints && (
        <View style={{ marginTop: 18 }}>
          <TouchableOpacity onPress={() => setShowWeak((v) => !v)}>
            <Text style={styles.link}>{showWeak ? "Hide weak-point options" : "Weak-point exercise options"}</Text>
          </TouchableOpacity>
          {showWeak && (
            <>
              {plan.weakPoints.map((wp) => (
                <View key={wp.area} style={styles.wpCard}>
                  <Text style={styles.wpArea}>{wp.area}</Text>
                  <Text style={styles.wpLine}>Exercise 1: {wp.ex1.join("  /  ")}</Text>
                  <Text style={styles.wpLine}>Exercise 2: {wp.ex2.join("  /  ")}</Text>
                </View>
              ))}
              {plan.weakPointNotes?.map((wn) => (
                <View key={wn.area} style={styles.wpCard}>
                  <Text style={styles.wpArea}>{wn.area}</Text>
                  <Text style={styles.wpLine}>{wn.note}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  title: { color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  summary: { color: "#94A3B8", fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 14 },
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#141B28", borderRadius: 12, borderWidth: 1, borderColor: "#334155", paddingHorizontal: 14, marginBottom: 16 },
  searchInput: { flex: 1, color: "#F8FAFC", fontSize: 15, paddingVertical: 11 },
  clearBtn: { paddingLeft: 10, paddingVertical: 4 },
  clearText: { color: "#94A3B8", fontSize: 20, fontWeight: "700", lineHeight: 20 },
  searchResults: { marginBottom: 16 },
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
  restBadge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: -4, marginBottom: 10, borderWidth: 1 },
  restOptional: { backgroundColor: "#0F172A", borderColor: "#334155" },
  restMandatory: { backgroundColor: "#2D1E07", borderColor: "#D97706" },
  restText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  restOptionalText: { color: "#94A3B8" },
  restMandatoryText: { color: "#FCD34D" },
});
