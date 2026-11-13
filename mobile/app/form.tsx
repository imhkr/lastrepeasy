import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ExercisePickerModal } from "../src/components/ExercisePickerModal";
import { pickAndUploadClip } from "../src/services/pickAndUploadClip";
import * as Linking from "expo-linking";
import {
  fetchPresets,
  startPresetDemoAnalysis,
  startYoutubeAnalysis,
} from "../src/api/client";
import {
  getSavedWorkouts,
  removeSavedWorkout,
} from "../src/services/localWorkoutStorage";
import { PresetCatalogItem, WorkoutAnalysisResult } from "../src/types/workout";

export default function HomeScreen() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=JEb-dwU3VF4");
  const [exerciseHint, setExerciseHint] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [presets, setPresets] = useState<PresetCatalogItem[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<WorkoutAnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);

  useEffect(() => {
    fetchPresets()
      .then(setPresets)
      .catch(() => {
        // Fallback preset list if server is starting up
      });
  }, []);

  // Reload saved offline workouts every time the user returns to the Home screen
  useFocusEffect(
    useCallback(() => {
      getSavedWorkouts().then(setSavedWorkouts);
    }, [])
  );

  // Listen for shared YouTube URLs via Android Share Intent / Deep Link
  useEffect(() => {
    const sub = Linking.addEventListener("url", (event) => {
      if (event.url && (event.url.includes("youtube.com") || event.url.includes("youtu.be"))) {
        setYoutubeUrl(event.url);
      }
    });
    return () => sub.remove();
  }, []);

  const handleAnalyzeYoutube = async () => {
    if (!youtubeUrl.trim()) {
      Alert.alert("Missing URL", "Please paste a YouTube or YouTube Shorts workout URL.");
      return;
    }
    try {
      setLoading(true);
      setLoadingLabel("Analyzing the video...");
      const job = await startYoutubeAnalysis(youtubeUrl.trim(), exerciseHint.trim() || undefined);
      router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Analysis Error", err.message || "Could not connect to LastRepEasy server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUploadVideo = async (hint: string) => {
    setPickerOpen(false);
    try {
      setLoading(true);
      setLoadingLabel("Uploading your clip...");
      const job = await pickAndUploadClip(hint);
      if (job) router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Could not upload video.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPreset = async (preset: PresetCatalogItem) => {
    try {
      setLoading(true);
      setLoadingLabel("Preparing the exercise guide...");
      const job = await startPresetDemoAnalysis(preset.preset_id);
      router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to run preset.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSaved = async (jobId: string) => {
    const updated = await removeSavedWorkout(jobId);
    setSavedWorkouts(updated);
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredSaved = savedWorkouts.filter((w) => {
    if (!q) return true;
    const hay = `${w.exercise_name} ${(w.target_muscles || []).join(" ")} ${w.handle_and_stance?.grip_type || ""}`.toLowerCase();
    return hay.includes(q);
  });

  const filteredPresets = presets.filter((p) => {
    if (!q) return true;
    const hay = `${p.title} ${p.target_muscles.join(" ")} ${p.default_grip} ${p.highlight_cue}`.toLowerCase();
    return hay.includes(q);
  });

  const shortName = (n: string) => n.replace(/\s*\([^)]*\)/g, "").split("—")[0].trim();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heroTitle}>Check your form</Text>
      <Text style={styles.heroSub}>Upload a short clip of your set and see what to fix.</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setPickerOpen(true)} disabled={loading}>
        <Text style={styles.primaryButtonText}>Upload my set (max 20 sec)</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator color="#38BDF8" size="small" />
          <Text style={styles.loadingText}>{loadingLabel}</Text>
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search exercises"
        placeholderTextColor="#64748B"
        autoCapitalize="none"
      />

      {filteredSaved.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved</Text>
          {filteredSaved.map((item) => (
            <View key={item.job_id} style={styles.row}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/analysis/${item.job_id}`)}>
                <Text style={styles.rowTitle}>{shortName(item.exercise_name)}</Text>
                <Text style={styles.rowSub}>{(item.target_muscles || []).slice(0, 2).map(shortName).join(" · ")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteSaved(item.job_id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise guides</Text>
        {filteredPresets.map((p) => (
          <TouchableOpacity key={p.preset_id} style={styles.row} onPress={() => handleRunPreset(p)} disabled={loading}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{shortName(p.title)}</Text>
              <Text style={styles.rowSub}>{p.target_muscles.slice(0, 2).map(shortName).join(" · ")}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => setShowYoutube((v) => !v)}>
        <Text style={styles.linkText}>{showYoutube ? "Hide YouTube option" : "Analyze a YouTube link instead"}</Text>
      </TouchableOpacity>
      {showYoutube && (
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={exerciseHint}
            onChangeText={setExerciseHint}
            placeholder="Exercise name (optional)"
            placeholderTextColor="#64748B"
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAnalyzeYoutube} disabled={loading}>
            <Text style={styles.secondaryButtonText}>Analyze</Text>
          </TouchableOpacity>
        </View>
      )}

      <ExercisePickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handlePickAndUploadVideo}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  heroTitle: { color: "#F8FAFC", fontSize: 28, fontWeight: "800", marginTop: 8 },
  heroSub: { color: "#94A3B8", fontSize: 15, marginTop: 4, marginBottom: 18 },
  primaryButton: { backgroundColor: "#0284C7", paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  secondaryButton: { backgroundColor: "#1E293B", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  secondaryButtonText: { color: "#38BDF8", fontSize: 14, fontWeight: "800" },
  loadingBanner: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, backgroundColor: "#0F172A", padding: 12, borderRadius: 10 },
  loadingText: { color: "#38BDF8", fontSize: 13, fontWeight: "600", flex: 1 },
  searchInput: { backgroundColor: "#111827", color: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginTop: 20 },
  section: { marginTop: 22, gap: 8 },
  sectionTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "700", letterSpacing: 0.4, marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#111827", borderRadius: 14, borderWidth: 1, borderColor: "#1E293B", padding: 14 },
  rowTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  rowSub: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  chevron: { color: "#64748B", fontSize: 24 },
  removeText: { color: "#F87171", fontSize: 13, fontWeight: "600" },
  linkText: { color: "#38BDF8", fontSize: 14, fontWeight: "600", marginTop: 22 },
  input: { backgroundColor: "#111827", color: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#1E293B", paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
});
