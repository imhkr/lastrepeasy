import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

// Hints contain the keywords the backend uses to choose which ideal angles to judge against.
const OPTIONS = [
  { label: "Incline Chest Press", hint: "Incline Chest Press" },
  { label: "Bayesian Cable Curl", hint: "Bayesian Cable Curl" },
  { label: "Romanian Deadlift", hint: "Romanian Deadlift" },
  { label: "Lat Pulldown / Pullover", hint: "Lat Pulldown" },
];

function optionFor(name?: string): number | null {
  if (!name) return null; // nothing known yet: make the user choose
  const t = (name || "").toLowerCase();
  if (/incline|press|chest|bench/.test(t)) return 0;
  if (/curl|bicep/.test(t)) return 1;
  if (/rdl|deadlift|hinge|hamstring/.test(t)) return 2;
  return 3;
}

interface Props {
  visible: boolean;
  /** Exercise already known (e.g. from the analysis screen) — pre-selected. */
  initial?: string;
  onClose: () => void;
  onConfirm: (exerciseHint: string) => void;
}

export const ExercisePickerModal: React.FC<Props> = ({ visible, initial, onClose, onConfirm }) => {
  const [selected, setSelected] = useState<number | null>(optionFor(initial));
  const [other, setOther] = useState("");
  const isOther = selected === -1;

  useEffect(() => {
    if (visible) setSelected(optionFor(initial));
  }, [visible, initial]);

  const canContinue = selected !== null && (!isOther || other.trim().length > 2);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Which exercise did you do?</Text>
          <Text style={styles.sub}>We check your clip against this exercise's ideal form.</Text>

          {OPTIONS.map((o, i) => (
            <TouchableOpacity
              key={o.label}
              style={[styles.row, selected === i && styles.rowActive]}
              onPress={() => setSelected(i)}
            >
              <View style={[styles.radio, selected === i && styles.radioOn]} />
              <Text style={styles.rowText}>{o.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.row, isOther && styles.rowActive]} onPress={() => setSelected(-1)}>
            <View style={[styles.radio, isOther && styles.radioOn]} />
            <Text style={styles.rowText}>Something else</Text>
          </TouchableOpacity>
          {isOther && (
            <>
              <TextInput
                style={styles.input}
                value={other}
                onChangeText={setOther}
                placeholder="Exercise name"
                placeholderTextColor="#64748B"
              />
              <Text style={styles.note}>Not in the list? It's judged against the closest match, so results are rougher.</Text>
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.go, !canContinue && { opacity: 0.4 }]}
              disabled={!canContinue}
              onPress={() => selected !== null && onConfirm(isOther ? other.trim() : OPTIONS[selected].hint)}
            >
              <Text style={styles.goText}>Choose video (max 20 sec)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000000AA", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    gap: 8,
  },
  title: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  sub: { color: "#94A3B8", fontSize: 13, marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#182235",
    borderWidth: 1,
    borderColor: "#182235",
  },
  rowActive: { borderColor: "#38BDF8", backgroundColor: "#0C2A3F" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: "#64748B" },
  radioOn: { borderColor: "#38BDF8", backgroundColor: "#38BDF8" },
  rowText: { color: "#F8FAFC", fontSize: 15, fontWeight: "600" },
  input: {
    backgroundColor: "#090D16",
    color: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 12,
    fontSize: 14,
  },
  note: { color: "#94A3B8", fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  cancel: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "#1E293B" },
  cancelText: { color: "#CBD5E1", fontWeight: "700" },
  go: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0284C7", alignItems: "center" },
  goText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
