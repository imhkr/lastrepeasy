import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { PLANS } from "../../src/data";

export default function PlansList() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose a plan</Text>
      {PLANS.map((p) => (
        <TouchableOpacity key={p.id} style={styles.card} onPress={() => router.push(`/plans/${p.id}` as any)}>
          <Text style={styles.author}>{p.author.toUpperCase()}</Text>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.summary}>{p.summary}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>{p.weeks.length} {(p.unit ?? "Week").toLowerCase()}s</Text>
            <Text style={styles.stat}>{p.weeks[0].days.length} sessions per {(p.unit ?? "Week").toLowerCase()}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  card: { backgroundColor: "#111827", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#1E293B", gap: 6 },
  author: { color: "#38BDF8", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  name: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  summary: { color: "#94A3B8", fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 6 },
  stat: { color: "#F59E0B", fontSize: 13, fontWeight: "700" },
});
