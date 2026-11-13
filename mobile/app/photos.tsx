import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { PhotoLabel, ProgressPhoto, addPhoto, daysBetween, getPhotos, removePhoto } from "../src/services/photoStore";
import { PhotoCompare } from "../src/components/PhotoCompare";

const LABELS: PhotoLabel[] = ["Front", "Side", "Back"];
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const delta = (a?: number, b?: number, unit = "") =>
  a == null || b == null ? null : `${a} → ${b} ${unit} (${b - a >= 0 ? "+" : ""}${Math.round((b - a) * 10) / 10})`;

export default function Photos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [mode, setMode] = useState<"slider" | "side">("slider");
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState<PhotoLabel>("Front");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  const refresh = useCallback(() => getPhotos().then(setPhotos), []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo library access to add progress photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
    if (res.canceled || !res.assets?.length) return;
    const w = parseFloat(weight.replace(",", "."));
    const c = parseFloat(waist.replace(",", "."));
    await addPhoto(res.assets[0].uri, label, Number.isFinite(w) ? w : undefined, Number.isFinite(c) ? c : undefined);
    setAdding(false);
    setWeight("");
    setWaist("");
    refresh();
  };

  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-2)));

  const chosen = sel.map((id) => photos.find((p) => p.id === id)).filter(Boolean) as ProgressPhoto[];
  const ordered = [...chosen].sort((a, b) => a.date.localeCompare(b.date));
  const [before, after] = ordered;

  const remove = async () => {
    for (const p of chosen) await removePhoto(p.id);
    setSel([]);
    refresh();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.add} onPress={() => setAdding(true)}>
        <Text style={styles.addText}>Add progress photo</Text>
      </TouchableOpacity>

      {photos.length === 0 ? (
        <Text style={styles.empty}>Add a photo now and another in a few weeks. Pick any two to compare them.</Text>
      ) : (
        <>
          <Text style={styles.hint}>Tap two photos to compare.</Text>
          <View style={styles.grid}>
            {photos.map((p) => {
              const idx = sel.indexOf(p.id);
              return (
                <TouchableOpacity key={p.id} style={[styles.thumbWrap, idx >= 0 && styles.thumbOn]} onPress={() => toggle(p.id)} activeOpacity={0.85}>
                  <Image source={{ uri: p.uri }} style={styles.thumb} />
                  <Text style={styles.thumbLabel}>{p.label} · {new Date(p.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {before && after && (
        <View style={styles.compare}>
          <View style={styles.modeRow}>
            {(["slider", "side"] as const).map((m) => (
              <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeOn]} onPress={() => setMode(m)}>
                <Text style={[styles.modeText, mode === m && styles.modeTextOn]}>{m === "slider" ? "Slider" : "Side by side"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <PhotoCompare before={before} after={after} mode={mode} />

          <View style={styles.stats}>
            <Text style={styles.statTitle}>{daysBetween(before.date, after.date)} days apart</Text>
            <Text style={styles.statLine}>{fmt(before.date)}  →  {fmt(after.date)}</Text>
            {delta(before.weightKg, after.weightKg, "kg") && <Text style={styles.statLine}>Body weight: {delta(before.weightKg, after.weightKg, "kg")}</Text>}
            {delta(before.waistCm, after.waistCm, "cm") && <Text style={styles.statLine}>Waist: {delta(before.waistCm, after.waistCm, "cm")}</Text>}
            {before.label !== after.label && <Text style={styles.warn}>These are different angles ({before.label} vs {after.label}). Compare the same angle for a fair look.</Text>}
            <Text style={styles.note}>Use the same pose, light and distance each time.</Text>
          </View>

          <TouchableOpacity onPress={remove}>
            <Text style={styles.remove}>Delete these two photos</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>New photo</Text>
            <Text style={styles.sheetLabel}>ANGLE</Text>
            <View style={styles.chips}>
              {LABELS.map((l) => (
                <TouchableOpacity key={l} style={[styles.chip, label === l && styles.chipOn]} onPress={() => setLabel(l)}>
                  <Text style={[styles.chipText, label === l && styles.chipTextOn]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.fields}>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Body weight kg (optional)" placeholderTextColor="#64748B" keyboardType="decimal-pad" />
              <TextInput style={styles.input} value={waist} onChangeText={setWaist} placeholder="Waist cm (optional)" placeholderTextColor="#64748B" keyboardType="decimal-pad" />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={() => setAdding(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.go} onPress={pick}>
                <Text style={styles.goText}>Choose photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 56 },
  add: { backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  addText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  empty: { color: "#94A3B8", fontSize: 14, lineHeight: 20, marginTop: 18, textAlign: "center" },
  hint: { color: "#94A3B8", fontSize: 13, marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { width: "31%", borderRadius: 12, borderWidth: 2, borderColor: "transparent", overflow: "hidden", backgroundColor: "#111827" },
  thumbOn: { borderColor: "#A78BFA" },
  thumb: { width: "100%", aspectRatio: 0.8 },
  thumbLabel: { color: "#CBD5E1", fontSize: 11, fontWeight: "600", padding: 6 },
  compare: { marginTop: 22, gap: 12 },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: "#182235", alignItems: "center" },
  modeOn: { backgroundColor: "#7C3AED" },
  modeText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  modeTextOn: { color: "#FFFFFF" },
  stats: { backgroundColor: "#111827", borderRadius: 14, padding: 14, gap: 4, borderWidth: 1, borderColor: "#1E293B" },
  statTitle: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  statLine: { color: "#CBD5E1", fontSize: 14 },
  warn: { color: "#FCD34D", fontSize: 13, marginTop: 4 },
  note: { color: "#64748B", fontSize: 12, marginTop: 4 },
  remove: { color: "#F87171", fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#111827", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, gap: 10 },
  sheetTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  sheetLabel: { color: "#94A3B8", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 6 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: "#182235", alignItems: "center", borderWidth: 1, borderColor: "#182235" },
  chipOn: { backgroundColor: "#2E1065", borderColor: "#A78BFA" },
  chipText: { color: "#CBD5E1", fontWeight: "700" },
  chipTextOn: { color: "#FFFFFF" },
  fields: { gap: 8 },
  input: { backgroundColor: "#090D16", color: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: "#334155", padding: 12, fontSize: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancel: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#1E293B" },
  cancelText: { color: "#CBD5E1", fontWeight: "700" },
  go: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#7C3AED", alignItems: "center" },
  goText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
