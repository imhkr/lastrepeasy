import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from "react-native";
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
import { RepReport } from "../../src/types/workout";
import { Lang, useLang } from "../../src/services/lang";
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

const STATUS_ICON: Record<string, { sym: string; bg: string; fg: string }> = {
  good: { sym: "\u2713", bg: "#34D399", fg: "#0B0F17" },
  almost: { sym: "!", bg: "#FBBF24", fg: "#0B0F17" },
  fix: { sym: "\u2715", bg: "#F87171", fg: "#FFFFFF" },
  unsure: { sym: "?", bg: "#94A3B8", fg: "#0B0F17" },
};
const LABEL_HI: Record<string, string> = { depth: "Depth (kitna neeche)", lockout: "Lockout (upar seedha)", hands: "Hands (haath)", speed: "Speed (kitna tez)", arms: "Arms (dono haath)" };

// A picture that keeps its own shape (the pictures are wider or taller depending on the fix).
function FixPicture({ uri }: { uri: string }) {
  const [ratio, setRatio] = useState(1.3);
  useEffect(() => {
    Image.getSize(uri, (w, h) => h && setRatio(w / h), () => {});
  }, [uri]);
  return <Image source={{ uri }} style={{ width: "100%", aspectRatio: ratio, borderRadius: 10, backgroundColor: "#000" }} resizeMode="contain" />;
}

// One card per rep, one block per check: tick / ! / x / ?, a short sentence, and for every fix a picture of
// "what you did vs how it should look". English or Hinglish.
function RepChecklist({ reps, lang, onLang }: { reps: RepReport[]; lang: Lang; onLang: (l: Lang) => void }) {
  if (!reps.length) return null;
  return (
    <View>
      <View style={rcStyles.langRow}>
        {(["hi", "en"] as Lang[]).map((l) => (
          <TouchableOpacity key={l} style={[rcStyles.langChip, lang === l && rcStyles.langOn]} onPress={() => onLang(l)}>
            <Text style={[rcStyles.langText, lang === l && rcStyles.langTextOn]}>{l === "hi" ? "Hinglish" : "English"}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {reps.map((r) => (
        <View key={r.index} style={rcStyles.card}>
          <Text style={rcStyles.title}>Rep {r.index}</Text>
          {r.checks.map((c) => {
            const ic = STATUS_ICON[c.status] ?? STATUS_ICON.unsure;
            return (
              <View key={c.key} style={rcStyles.block}>
                <View style={rcStyles.row}>
                  <View style={[rcStyles.icon, { backgroundColor: ic.bg }]}>
                    <Text style={[rcStyles.iconText, { color: ic.fg }]}>{ic.sym}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={rcStyles.label}>{lang === "hi" ? LABEL_HI[c.key] ?? c.label : c.label}</Text>
                    <Text style={rcStyles.msg}>{lang === "hi" && c.message_hi ? c.message_hi : c.message}</Text>
                  </View>
                </View>
                {c.image_url ? <FixPicture uri={c.image_url} /> : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const rcStyles = StyleSheet.create({
  langRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  langChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "#182235" },
  langOn: { backgroundColor: "#0C2A3F", borderWidth: 1, borderColor: "#38BDF8" },
  langText: { color: "#94A3B8", fontWeight: "700", fontSize: 13 },
  langTextOn: { color: "#FFFFFF" },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1E293B", marginBottom: 12, gap: 14 },
  title: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  block: { gap: 10 },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  icon: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginTop: 1 },
  iconText: { fontSize: 14, fontWeight: "900" },
  label: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  msg: { color: "#CBD5E1", fontSize: 15, lineHeight: 21, marginTop: 1 },
});

const shortName = (n: string) => n.replace(/\s*\([^)]*\)/g, "").split("—")[0].trim();

export default function AnalysisResultScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  const [result, setResult] = useState<WorkoutAnalysisResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [lang, setLang] = useLang();
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

  const fixes = (lang === "hi" && result.my_form_fixes_hi?.length ? result.my_form_fixes_hi : result.my_form_fixes) ?? [];
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

      <RepChecklist reps={result.rep_reports ?? []} lang={lang} onLang={setLang} />
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
