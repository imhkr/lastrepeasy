import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import {
  fetchPresets,
  startPresetDemoAnalysis,
  startYoutubeAnalysis,
  uploadWorkoutVideo,
} from "../src/api/client";
import { PresetCatalogItem } from "../src/types/workout";

export default function HomeScreen() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/watch?v=JEb-dwU3VF4");
  const [exerciseHint, setExerciseHint] = useState("");
  const [presets, setPresets] = useState<PresetCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");

  useEffect(() => {
    fetchPresets()
      .then(setPresets)
      .catch(() => {
        // Fallback preset list if server is starting up
      });
  }, []);

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
      setLoadingLabel("Submitting YouTube URL for Biomechanics & Flow Video Analysis...");
      const job = await startYoutubeAnalysis(youtubeUrl.trim(), exerciseHint.trim() || undefined);
      router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Analysis Error", err.message || "Could not connect to FormFlow backend.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUploadVideo = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please allow video library access to upload workout clips.");
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 1,
      });

      if (picked.canceled || !picked.assets || picked.assets.length === 0) {
        return;
      }

      const asset = picked.assets[0];
      setLoading(true);
      setLoadingLabel("Uploading workout video & extracting 33 body landmarks...");
      const job = await uploadWorkoutVideo(
        asset.uri,
        asset.fileName || "workout_clip.mp4",
        asset.mimeType || "video/mp4",
        exerciseHint.trim() || undefined
      );
      router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Could not upload video.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPreset = async (preset: PresetCatalogItem) => {
    try {
      setLoading(true);
      setLoadingLabel(`Generating ${preset.title} Step-by-Step Flow Video...`);
      const job = await startPresetDemoAnalysis(preset.preset_id);
      router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to run preset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.heroBadge}>JEFF NIPPARD BIOMECHANICS ENGINE</Text>
        </View>
        <Text style={styles.heroTitle}>
          Point Out Every Joint Angle, Handle Grip & Start-to-End Flow
        </Text>
        <Text style={styles.heroSub}>
          Share any Jeff Nippard YouTube workout URL or upload your own gym video. FormFlow AI detects
          elbow, shoulder, torso, knee & ankle angles, evaluates handle/wrist stack, and builds a
          5-step start-to-end flow video.
        </Text>
      </View>

      {/* Option 1: Share / Paste YouTube Workout URL */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. SHARE YOUTUBE WORKOUT URL</Text>
        <Text style={styles.inputLabel}>YouTube Video or Shorts URL</Text>
        <TextInput
          style={styles.textInput}
          value={youtubeUrl}
          onChangeText={setYoutubeUrl}
          placeholder="https://www.youtube.com/watch?v=..."
          placeholderTextColor="#64748B"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Exercise Name / Focus Hint (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={exerciseHint}
          onChangeText={setExerciseHint}
          placeholder="e.g., Jeff Nippard Cable Lat Pullover or 30° Incline Press"
          placeholderTextColor="#64748B"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAnalyzeYoutube}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Analyze YouTube URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePickAndUploadVideo}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Upload Video File</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator color="#38BDF8" size="small" />
            <Text style={styles.loadingText}>{loadingLabel}</Text>
          </View>
        )}
      </View>

      {/* Option 2: Instant Jeff Nippard Science-Applied Presets */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          2. JEFF NIPPARD WORKOUT LIBRARY (INSTANT FLOW + ANGLES)
        </Text>
        <Text style={styles.sectionSub}>
          Tap any movement below to run full pose angle tracking and generate its annotated
          Step-by-Step Start-to-End Flow Video:
        </Text>

        {presets.map((p) => (
          <TouchableOpacity
            key={p.preset_id}
            style={styles.presetCard}
            onPress={() => handleRunPreset(p)}
            disabled={loading}
          >
            <View style={styles.presetHeader}>
              <Text style={styles.presetTitle}>{p.title}</Text>
              <View style={styles.goChip}>
                <Text style={styles.goChipText}>GENERATE FLOW →</Text>
              </View>
            </View>
            <Text style={styles.presetGrip}>Handle / Grip: {p.default_grip}</Text>
            <Text style={styles.presetCue}>{p.highlight_cue}</Text>
            <View style={styles.muscleRow}>
              {p.target_muscles.map((m) => (
                <View key={m} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{m}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F17",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: "#131C2E",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: "#0284C733",
    color: "#38BDF8",
    borderColor: "#38BDF8",
    borderWidth: 1,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
  },
  sectionCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionSub: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  inputLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#090D16",
    color: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26334D",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0284C7",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#38BDF8",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "800",
  },
  loadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 10,
  },
  loadingText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  presetCard: {
    backgroundColor: "#162033",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#253552",
    marginBottom: 12,
  },
  presetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  presetTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "800",
    flex: 1,
  },
  goChip: {
    backgroundColor: "#10B98122",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goChipText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
  },
  presetGrip: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  presetCue: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  muscleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleTag: {
    backgroundColor: "#0B0F17",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleTagText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },
});
