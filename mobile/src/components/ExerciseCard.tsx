import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Vibration } from "react-native";
import { useRouter } from "expo-router";
import { PlanExercise, WeakPoint } from "../types/plans";
import { bestE1rmBeforeToday, lastLiftBeforeToday, logLift, todaysLift } from "../services/weightLog";
import { clock, restSeconds } from "../services/rest";
import { LiftEntry, SetLog, compareLifts, e1rm } from "../services/weightMath";
import { listExercises } from "../live/engine";

interface Props {
  ex: PlanExercise;
  planId?: string;
  weakPoints?: WeakPoint[];
  onRemove?: () => void; // custom exercises are deleted, book ones are hidden from the day
  onEdit?: () => void;
  onReset?: () => void; // only for edited book exercises
  onMove?: (dir: -1 | 1) => void;
  canUp?: boolean;
  canDown?: boolean;
}

type Row = { kg: string; reps: string };

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const dateLabel = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const warmupPyramid = (warmup: string): string | null => {
  const nums = (warmup || "").match(/\d+/g)?.map(Number) ?? [];
  const max = nums.length ? Math.max(...nums) : 0;
  if (max <= 0) return null;
  if (max === 1) return "~60% × 6-10 reps";
  if (max === 2) return "~50% × 6-10  →  ~70% × 4-6";
  return "~45% × 6-10  →  ~65% × 4-6  →  ~85% × 3-4";
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const ExerciseCard: React.FC<Props> = ({ ex, planId, weakPoints, onRemove, onEdit, onReset, onMove, canUp, canDown }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState(ex.name);
  const [area, setArea] = useState<string | null>(null);
  const [prev, setPrev] = useState<LiftEntry | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [saved, setSaved] = useState(false);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(0); // rest timer seconds remaining

  // One row per working set; each row carries its target reps from the plan.
  const targets = useMemo(() => ex.groups.flatMap((g) => Array.from({ length: g.sets }, () => g.reps)), [JSON.stringify(ex.groups)]); // keyed on content so a reload of the plan does not wipe typed sets
  const summary = ex.groups.map((g) => `${g.sets} × ${g.reps}`).join(" + ");
  const effort = ex.groups.map((g) => g.effort).filter(Boolean)[0];

  const options = useMemo(() => {
    if (!ex.weakPoint || !weakPoints) return [];
    const wp = weakPoints.find((w) => w.area === area);
    return wp ? (ex.name.endsWith("1") ? wp.ex1 : wp.ex2) : [];
  }, [ex, weakPoints, area]);

  const loggedName = ex.weakPoint ? (variant !== ex.name ? variant : "") : variant;

  useEffect(() => {
    let alive = true;
    setRows(targets.map(() => ({ kg: "", reps: "" })));
    setSaved(false);
    if (!loggedName) {
      setPrev(null);
      return;
    }
    Promise.all([lastLiftBeforeToday(loggedName), todaysLift(loggedName), bestE1rmBeforeToday(loggedName)]).then(([p, t, b]) => {
      if (!alive) return;
      setPrev(p);
      setBest(b);
      if (t) {
        // Saved sets win over the plan's count, so sets you added earlier come back.
        setRows(Array.from({ length: Math.max(targets.length, t.sets.length) }, (_, i) => (t.sets[i] ? { kg: String(t.sets[i].kg), reps: String(t.sets[i].reps) } : { kg: "", reps: "" })));
        setSaved(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [loggedName, targets]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => {
      setLeft((v) => v - 1);
      if (left === 1) Vibration.vibrate(500);
    }, 1000);
    return () => clearTimeout(id);
  }, [left]);

  const nowSets: SetLog[] = rows.map((r) => ({ kg: num(r.kg), reps: num(r.reps) })).filter((s) => s.kg > 0 && s.reps > 0);
  const cmp = compareLifts(prev, nowSets);
  const anyInput = nowSets.length > 0;

  const isPb = anyInput && best > 0 && cmp.nowTop != null && e1rm(cmp.nowTop) > best;

  const message = (() => {
    if (!anyInput) return null;
    if (cmp.verdict === "first") return { text: "First time logged. This is your baseline.", color: "#94A3B8" };
    if (cmp.verdict === "up")
      return {
        text: cmp.deltaKg > 0 ? `+${cmp.deltaKg} kg heavier than last time` : cmp.deltaKg === 0 ? "Same weight, more reps than last time" : "Stronger overall than last time",
        color: "#10B981",
      };
    if (cmp.verdict === "down")
      return { text: cmp.deltaKg < 0 ? `${cmp.deltaKg} kg lighter than last time` : "Fewer reps than last time", color: "#F87171" };
    return { text: "Matches last time", color: "#F59E0B" };
  })();

  const save = async () => {
    await logLift(loggedName, nowSets);
    setSaved(true);
  };

  const addSet = () => {
    setSaved(false);
    setRows((r) => [...r, { kg: "", reps: "" }]);
  };
  const removeSet = (i: number) => {
    setSaved(false);
    setRows((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : r));
  };

  const setRow = (i: number, patch: Partial<Row>) => {
    setSaved(false);
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} activeOpacity={0.8}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{ex.weakPoint ? ex.name.replace(" (optional)", "") : ex.name}</Text>
          {ex.superset ? <Text style={styles.badge}>{ex.superset}</Text> : null}
          {ex.edited ? <Text style={styles.badge}>Edited</Text> : null}
        </View>
        <Text style={styles.summary}>
          {summary}
          {effort ? `  ·  ${effort}` : ""}
        </Text>
        {ex.technique ? (
          <View style={styles.techChip}>
            <Text style={styles.techText}>Last set: {ex.technique}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {open && (
        <View style={styles.body}>
          <View style={styles.metaBlock}>
            <Text style={styles.meta}>
              Warm-up sets: {ex.warmup || "none"}
              {ex.rest ? `   ·   Rest ${ex.rest}` : ""}
            </Text>
            {warmupPyramid(ex.warmup) ? (
              <Text style={styles.pyramid}>Pyramid: {warmupPyramid(ex.warmup)}</Text>
            ) : null}
          </View>

          {ex.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Coach note</Text>
              <Text style={styles.noteText}>{ex.note}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            {restSeconds(ex.rest) > 0 && (
              <TouchableOpacity style={[styles.timer, { flex: 1 }, left > 0 && styles.timerOn]} onPress={() => setLeft(left > 0 ? 0 : restSeconds(ex.rest))}>
                <Text style={styles.timerText}>{left > 0 ? `Resting ${clock(left)} · stop` : `Rest ${clock(restSeconds(ex.rest))}`}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.coachBtn}
              onPress={() => {
                const activeName = loggedName || ex.name;
                const available = new Set(listExercises());
                const candidate = variant === ex.name && available.has(ex.id) ? ex.id : slugify(activeName);
                if (available.has(candidate)) {
                  router.push(`/live?exercise=${encodeURIComponent(candidate)}` as any);
                } else {
                  router.push(`/live?q=${encodeURIComponent(activeName)}` as any);
                }
              }}
            >
              <Text style={styles.coachBtnText}>Live Coach</Text>
            </TouchableOpacity>
            {planId ? (
              <TouchableOpacity
                style={styles.guideBtn}
                onPress={() => router.push(`/exercise/${planId}/${ex.id}?name=${encodeURIComponent(ex.name)}` as any)}
              >
                <Text style={styles.guideBtnText}>Guide</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {ex.weakPoint ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Pick your weak point</Text>
              <View style={styles.chips}>
                {(weakPoints ?? []).map((w) => (
                  <TouchableOpacity key={w.area} style={[styles.chip, area === w.area && styles.chipOn]} onPress={() => { setArea(w.area); setVariant(ex.name); }}>
                    <Text style={[styles.chipText, area === w.area && styles.chipTextOn]}>{w.area}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {options.length > 0 && (
                <View style={styles.chips}>
                  {options.map((o) => (
                    <TouchableOpacity key={o} style={[styles.chip, variant === o && styles.chipOn]} onPress={() => setVariant(o)}>
                      <Text style={[styles.chipText, variant === o && styles.chipTextOn]}>{o}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : ex.subs.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Doing</Text>
              <View style={styles.chips}>
                {[ex.name, ...ex.subs].map((o, i) => (
                  <TouchableOpacity key={o} style={[styles.chip, variant === o && styles.chipOn]} onPress={() => setVariant(o)}>
                    <Text style={[styles.chipText, variant === o && styles.chipTextOn]}>{i === 0 ? `${o} (main)` : o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {variant !== ex.name && <Text style={styles.hint}>Substitute selected. Your lifts are tracked separately for it.</Text>}
            </View>
          ) : null}

          {loggedName ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Log your sets</Text>
              {prev ? (
                <Text style={styles.last}>
                  Last time ({dateLabel(prev.date)}): {prev.sets.map((s) => `${s.kg} kg × ${s.reps}`).join("  ·  ")}
                </Text>
              ) : (
                <Text style={styles.last}>No earlier lift saved for this exercise yet.</Text>
              )}

              {rows.map((r, i) => (
                <View key={i} style={styles.setRow}>
                  <Text style={styles.setNum} numberOfLines={1}>Set {i + 1}</Text>
                  <TextInput
                    style={styles.input}
                    value={r.kg}
                    onChangeText={(v) => setRow(i, { kg: v })}
                    placeholder={prev?.sets[i] ? String(prev.sets[i].kg) : "kg"}
                    placeholderTextColor="#475569"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.x}>×</Text>
                  <TextInput
                    style={styles.input}
                    value={r.reps}
                    onChangeText={(v) => setRow(i, { reps: v })}
                    placeholder={targets[i] ?? targets[targets.length - 1]}
                    placeholderTextColor="#475569"
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity onPress={() => removeSet(i)} disabled={rows.length <= 1} hitSlop={8} style={[styles.del, rows.length <= 1 && { opacity: 0.3 }]} accessibilityLabel={`Remove set ${i + 1}`}>
                    <Text style={styles.delText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addSet} onPress={addSet}>
                <Text style={styles.addSetText}>+ Add set</Text>
              </TouchableOpacity>

              {isPb && (
                <View style={styles.pb}>
                  <Text style={styles.pbText}>New personal best</Text>
                </View>
              )}

              {message && (
                <View style={styles.cmp}>
                  <Text style={[styles.cmpText, { color: message.color }]}>{message.text}</Text>
                  {cmp.nowTop && <Text style={styles.cmpSub}>Est. max {e1rm(cmp.nowTop)} kg{cmp.verdict !== "first" ? ` (${cmp.deltaE1rm >= 0 ? "+" : ""}${cmp.deltaE1rm})` : ""}</Text>}
                </View>
              )}

              <TouchableOpacity style={[styles.save, (!anyInput || saved) && styles.saveOff]} disabled={!anyInput || saved} onPress={save}>
                <Text style={styles.saveText}>{saved ? "Saved" : "Save sets"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {(onEdit || onMove || onRemove) && (
            <View style={styles.tools}>
              {onMove && (
                <>
                  <TouchableOpacity style={[styles.tool, !canUp && styles.toolOff]} disabled={!canUp} onPress={() => onMove(-1)} accessibilityLabel="Move up">
                    <Text style={styles.toolText}>▲ Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tool, !canDown && styles.toolOff]} disabled={!canDown} onPress={() => onMove(1)} accessibilityLabel="Move down">
                    <Text style={styles.toolText}>▼ Down</Text>
                  </TouchableOpacity>
                </>
              )}
              {onEdit && (
                <TouchableOpacity style={styles.tool} onPress={onEdit} accessibilityLabel="Edit exercise">
                  <Text style={styles.toolText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {onReset && (
            <TouchableOpacity onPress={onReset}>
              <Text style={styles.resetEx}>Reset to plan</Text>
            </TouchableOpacity>
          )}
          {onRemove && (
            <TouchableOpacity onPress={onRemove}>
              <Text style={styles.removeEx}>{ex.custom ? "Remove this exercise" : "Remove from this day"}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1E293B", marginBottom: 10 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, color: "#F8FAFC", fontSize: 16, fontWeight: "800" },
  badge: { color: "#7DD3FC", backgroundColor: "#0C2A3F", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, fontSize: 11, fontWeight: "800", overflow: "hidden" },
  summary: { color: "#CBD5E1", fontSize: 14, marginTop: 4 },
  techChip: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "#3B2A0A", borderColor: "#F59E0B", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  techText: { color: "#FCD34D", fontSize: 12, fontWeight: "700" },
  body: { marginTop: 12, gap: 12 },
  metaBlock: { gap: 3 },
  meta: { color: "#94A3B8", fontSize: 13 },
  pyramid: { color: "#7DD3FC", fontSize: 12, fontWeight: "600" },
  noteBox: { backgroundColor: "#0B1220", borderLeftWidth: 3, borderLeftColor: "#38BDF8", borderRadius: 10, padding: 10, gap: 4 },
  noteTitle: { color: "#7DD3FC", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  noteText: { color: "#E2E8F0", fontSize: 13, lineHeight: 19 },
  actionRow: { flexDirection: "row", gap: 8 },
  coachBtn: { backgroundColor: "#0C2A3F", borderWidth: 1, borderColor: "#0284C7", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  coachBtnText: { color: "#7DD3FC", fontSize: 14, fontWeight: "800" },
  guideBtn: { backgroundColor: "#182235", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  guideBtnText: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
  block: { gap: 8 },
  blockTitle: { color: "#94A3B8", fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#182235", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "#182235" },
  chipOn: { backgroundColor: "#0C2A3F", borderColor: "#38BDF8" },
  chipText: { color: "#CBD5E1", fontSize: 13, fontWeight: "600" },
  chipTextOn: { color: "#FFFFFF" },
  hint: { color: "#94A3B8", fontSize: 12 },
  last: { color: "#E2E8F0", fontSize: 13, lineHeight: 19 },
  setRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  setNum: { color: "#94A3B8", width: 50, fontSize: 13, fontWeight: "700" },
  input: { flex: 1, minWidth: 0, backgroundColor: "#090D16", color: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: "#26334D", paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, textAlign: "center" },
  tools: { flexDirection: "row", gap: 8 },
  tool: { flex: 1, backgroundColor: "#182235", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  toolOff: { opacity: 0.35 },
  toolText: { color: "#E2E8F0", fontSize: 13, fontWeight: "700" },
  resetEx: { color: "#FCD34D", fontSize: 13, fontWeight: "600", textAlign: "center" },
  removeEx: { color: "#F87171", fontSize: 13, fontWeight: "600", textAlign: "center" },
  x: { color: "#64748B", fontSize: 16 },
  del: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  delText: { color: "#F87171", fontSize: 13, fontWeight: "800" },
  addSet: { borderWidth: 1, borderColor: "#334155", borderStyle: "dashed", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  addSetText: { color: "#7DD3FC", fontSize: 14, fontWeight: "700" },
  timer: { backgroundColor: "#182235", borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  timerOn: { backgroundColor: "#0C2A3F", borderWidth: 1, borderColor: "#38BDF8" },
  timerText: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
  pb: { backgroundColor: "#052E1B", borderColor: "#10B981", borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  pbText: { color: "#34D399", fontSize: 15, fontWeight: "800" },
  cmp: { backgroundColor: "#0B1220", borderRadius: 10, padding: 12, gap: 2 },
  cmpText: { fontSize: 15, fontWeight: "800" },
  cmpSub: { color: "#94A3B8", fontSize: 12 },
  save: { backgroundColor: "#0284C7", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  saveOff: { backgroundColor: "#1E293B" },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
