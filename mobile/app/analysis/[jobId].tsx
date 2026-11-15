import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { fetchJobResult } from "../../src/api/client";
import {
  getSavedWorkoutById,
  saveWorkoutToPhoneStorage,
} from "../../src/services/localWorkoutStorage";
import { WorkoutAnalysisResult } from "../../src/types/workout";
import { HandleAndAnklePanel } from "../../src/components/HandleAndAnklePanel";
import { StepFlowTimeline } from "../../src/components/StepFlowTimeline";
import { pickAndUploadClip } from "../../src/services/pickAndUploadClip";
import { ExercisePickerModal } from "../../src/components/ExercisePickerModal";
import { VoiceCoachPanel } from "../../src/components/VoiceCoachPanel";
import { MuscleHitMapAnimation } from "../../src/components/MuscleHitMapAnimation";

function WorkoutVideoPlayer({
  videoUrl,
  seekToSec,
  tall,
}: {
  videoUrl: string;
  seekToSec: number | null;
  tall?: boolean;
}) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.play();
  });

  useEffect(() => {
    if (seekToSec !== null && player) {
      try {
        player.currentTime = seekToSec;
      } catch {
        // Ignore seek errors while loading
      }
    }
  }, [seekToSec, player]);

  return (
    <VideoView
      style={[styles.videoPlayer, tall && { height: 460 }]}
      player={player}
      fullscreenOptions={{ enable: true }}
      allowsPictureInPicture
      contentFit="contain"
      nativeControls
    />
  );
}

const shortName = (n: string) => n.replace(/\s*\([^)]*\)/g, "").split("—")[0].trim();

export default function AnalysisResultScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  const [result, setResult] = useState<WorkoutAnalysisResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [pickedMode, setVideoMode] = useState<"ghost" | "flow" | "full" | null>(null);
  const [seekToSec, setSeekToSec] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (exerciseHint: string) => {
    setPickerOpen(false);
    try {
      setUploading(true);
      const job = await pickAndUploadClip(exerciseHint);
      if (job) router.push(`/analysis/${job.job_id}`);
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Could not upload video.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;

    const loadOrPoll = async () => {
      // Saved on the phone? Open instantly without the backend.
      const cached = await getSavedWorkoutById(jobId);
      if (cached && cached.status === "completed") {
        if (isMounted) setResult(cached);
        return;
      }

      const poll = async () => {
        try {
          const data = await fetchJobResult(jobId);
          if (!isMounted) return;
          setResult(data);
          if (data.status === "completed") {
            if (timer) clearInterval(timer);
            const savedCopy = await saveWorkoutToPhoneStorage(data); // auto-save for offline revisit
            if (isMounted) setResult(savedCopy);
          } else if (data.status === "failed") {
            if (timer) clearInterval(timer);
          }
        } catch (err: any) {
          if (!isMounted) return;
          setError(err.message || "Failed to load job status.");
          if (timer) clearInterval(timer);
        }
      };

      await poll();
      timer = setInterval(poll, 1200);
    };

    loadOrPoll();
    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [jobId]);

  const handleSelectStep = (index: number, timestampSec: number) => {
    setActiveStepIndex(index);
    if ((pickedMode ?? (result?.ghost_video_url ? "ghost" : "flow")) === "full") setSeekToSec(timestampSec);
  };

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorTitle}>Analysis Error</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </View>
    );
  }

  if (!result || (result.status !== "completed" && result.status !== "failed")) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.progressPct}>{result?.progress_pct ?? 10}%</Text>
        <Text style={styles.progressMsg}>{result?.progress_message || "Analyzing your form..."}</Text>
      </View>
    );
  }

  if (result.status === "failed") {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorTitle}>Analysis failed</Text>
        <Text style={styles.errorSub}>{result.error || "Unknown error"}</Text>
      </View>
    );
  }

  const modes = (result.ghost_video_url ? ["ghost", "flow", "full"] : ["flow", "full"]) as ("ghost" | "flow" | "full")[];
  const videoMode = pickedMode && modes.includes(pickedMode) ? pickedMode : modes[0];
  const activeVideoUrl =
    videoMode === "ghost"
      ? result.local_ghost_video_uri || result.ghost_video_url
      : videoMode === "flow"
      ? result.local_flow_video_uri || result.step_by_step_flow_video_url
      : result.local_full_video_uri || result.annotated_full_video_url;

  const fixes = result.my_form_fixes ?? [];
  const isUpload = fixes.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.exerciseTitle}>{shortName(result.exercise_name)}</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreNumber}>{result.overall_form_score}</Text>
          <Text style={styles.scoreLabel}>SCORE</Text>
        </View>
      </View>

      <View style={styles.videoCard}>
        <View style={styles.videoToggleRow}>
          {modes.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeTab, videoMode === m && styles.modeTabActive]}
              onPress={() => setVideoMode(m)}
            >
              <Text style={[styles.modeTabText, videoMode === m && styles.modeTabTextActive]}>
                {m === "ghost" ? "Target arm" : m === "flow" ? "Steps" : "Live angles"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeVideoUrl ? (
          <WorkoutVideoPlayer key={activeVideoUrl} videoUrl={activeVideoUrl} seekToSec={seekToSec} tall={videoMode === "ghost"} />
        ) : null}
      </View>

      <TouchableOpacity style={styles.uploadBtn} disabled={uploading} onPress={() => setPickerOpen(true)}>
        <Text style={styles.uploadBtnText}>{uploading ? "Uploading..." : "Check my form (upload up to 20 sec)"}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isUpload ? "Fix this" : "Key points"}</Text>
        {(isUpload ? fixes : result.key_takeaways.slice(0, 3)).map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <MuscleHitMapAnimation exerciseName={result.exercise_name} targetMuscles={result.target_muscles} />

      <VoiceCoachPanel workout={result} />

      <TouchableOpacity style={styles.detailsBtn} onPress={() => setShowDetails((v) => !v)}>
        <Text style={styles.detailsBtnText}>{showDetails ? "Hide full breakdown" : "Full angle breakdown"}</Text>
      </TouchableOpacity>
      {showDetails && (
        <>
          {result.handle_and_stance && <HandleAndAnklePanel info={result.handle_and_stance} />}
          {result.steps.length > 0 && (
            <StepFlowTimeline steps={result.steps} activeStepIndex={activeStepIndex} onSelectStep={handleSelectStep} />
          )}
        </>
      )}

      <ExercisePickerModal
        visible={pickerOpen}
        initial={result.exercise_name}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleUpload}
      />
    </ScrollView>
  );
}

const CARD = { backgroundColor: "#111827", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E293B", marginVertical: 8 } as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  content: { padding: 16, paddingBottom: 48 },
  centerBox: { flex: 1, backgroundColor: "#0B0F17", justifyContent: "center", alignItems: "center", padding: 24 },
  progressPct: { color: "#F8FAFC", fontSize: 28, fontWeight: "800", marginTop: 16 },
  progressMsg: { color: "#94A3B8", fontSize: 14, textAlign: "center", marginTop: 8 },
  errorTitle: { color: "#F87171", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  errorSub: { color: "#CBD5E1", fontSize: 14, textAlign: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  exerciseTitle: { flex: 1, color: "#F8FAFC", fontSize: 22, fontWeight: "800" },
  scorePill: { alignItems: "center", backgroundColor: "#10B98122", borderColor: "#10B981", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  scoreNumber: { color: "#10B981", fontSize: 22, fontWeight: "800" },
  scoreLabel: { color: "#10B981", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  videoCard: { ...CARD, padding: 10 },
  videoToggleRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  modeTab: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: "#182235", alignItems: "center" },
  modeTabActive: { backgroundColor: "#0284C7" },
  modeTabText: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },
  modeTabTextActive: { color: "#FFFFFF" },
  videoPlayer: { width: "100%", height: 220, borderRadius: 10, backgroundColor: "#000" },
  uploadBtn: { backgroundColor: "#0284C7", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginVertical: 8 },
  uploadBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  card: CARD,
  cardTitle: { color: "#F8FAFC", fontSize: 16, fontWeight: "800", marginBottom: 8 },
  bulletRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  bullet: { color: "#F59E0B", fontSize: 16, lineHeight: 21 },
  bulletText: { flex: 1, color: "#E2E8F0", fontSize: 14, lineHeight: 21 },
  detailsBtn: { paddingVertical: 14, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#26334D", marginVertical: 8 },
  detailsBtnText: { color: "#38BDF8", fontSize: 14, fontWeight: "700" },
});
