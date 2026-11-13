import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export interface AddValues {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  allWeeks: boolean;
}

interface Props {
  visible: boolean;
  mode: "day" | "exercise" | "editExercise" | "renameDay";
  unit: string; // "Week" or "Cycle"
  initial?: Partial<AddValues>; // prefilled values for the edit and rename modes
  showAllWeeks?: boolean; // false hides the every-week checkbox
  onClose: () => void;
  onAdd: (v: AddValues) => void;
}

const DAY_IDEAS = ["Abs", "Arms", "Shoulders", "Cardio", "Mobility"];
const REST = ["30-60 sec", "1-2 min", "2-3 min"];

export function AddSheet({ visible, mode, unit, initial, showAllWeeks = true, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [rest, setRest] = useState("1-2 min");
  const [allWeeks, setAllWeeks] = useState(true);

  const isEdit = mode === "editExercise" || mode === "renameDay";
  // Each open starts from the item being edited, or from clean defaults for a new one.
  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? "");
    setSets(String(initial?.sets ?? 3));
    setReps(initial?.reps ?? "10");
    setRest(initial?.rest ?? (isEdit ? "" : "1-2 min"));
    setAllWeeks(isEdit ? mode === "renameDay" : true);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const ok = name.trim().length > 0;
  const submit = () => {
    if (!ok) return;
    onAdd({ name, sets: parseInt(sets, 10) || 3, reps, rest, allWeeks: showAllWeeks && allWeeks });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{{ day: "Add a day", exercise: "Add an exercise", editExercise: "Edit exercise", renameDay: "Rename day" }[mode]}</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={mode === "day" || mode === "renameDay" ? "Day name, e.g. Abs" : "Exercise name, e.g. Cable Crunch"}
            placeholderTextColor="#64748B"
            autoFocus
          />

          {mode === "renameDay" ? null : mode === "day" ? (
            <View style={styles.chips}>
              {DAY_IDEAS.map((d) => (
                <TouchableOpacity key={d} style={styles.chip} onPress={() => setName(d)}>
                  <Text style={styles.chipText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.label}>SETS</Text>
                  <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="number-pad" />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>REPS</Text>
                  <TextInput style={styles.input} value={reps} onChangeText={setReps} placeholder="8-12" placeholderTextColor="#64748B" />
                </View>
              </View>
              <Text style={styles.label}>REST</Text>
              <TextInput style={styles.input} value={rest} onChangeText={setRest} placeholder="e.g. 2-3 min" placeholderTextColor="#64748B" />
              <View style={styles.chips}>
                {REST.map((r) => (
                  <TouchableOpacity key={r} style={[styles.chip, rest === r && styles.chipOn]} onPress={() => setRest(rest === r ? "" : r)}>
                    <Text style={[styles.chipText, rest === r && styles.chipTextOn]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {showAllWeeks && (
            <TouchableOpacity style={styles.toggle} onPress={() => setAllWeeks((v) => !v)}>
              <View style={[styles.box, allWeeks && styles.boxOn]}>{allWeeks && <Text style={styles.tick}>✓</Text>}</View>
              <Text style={styles.toggleText}>{isEdit ? "Apply to" : "Add to"} every {unit.toLowerCase()}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.go, !ok && { opacity: 0.4 }]} disabled={!ok} onPress={submit}>
              <Text style={styles.goText}>{isEdit ? "Save" : "Add"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#111827", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, gap: 12 },
  title: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  input: { backgroundColor: "#090D16", color: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: "#334155", padding: 12, fontSize: 15 },
  row: { flexDirection: "row", gap: 10 },
  field: { flex: 1, gap: 6 },
  label: { color: "#94A3B8", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#182235", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#182235" },
  chipOn: { backgroundColor: "#0C2A3F", borderColor: "#38BDF8" },
  chipText: { color: "#CBD5E1", fontSize: 13, fontWeight: "600" },
  chipTextOn: { color: "#FFFFFF" },
  toggle: { flexDirection: "row", alignItems: "center", gap: 10 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: "#475569", alignItems: "center", justifyContent: "center" },
  boxOn: { backgroundColor: "#0284C7", borderColor: "#0284C7" },
  tick: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  toggleText: { color: "#E2E8F0", fontSize: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancel: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#1E293B" },
  cancelText: { color: "#CBD5E1", fontWeight: "700" },
  go: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0284C7", alignItems: "center" },
  goText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
