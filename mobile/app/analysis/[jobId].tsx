import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { fetchJobResult } from "../../src/api/client";
import { WorkoutAnalysisResult } from "../../src/types/workout";
import { HandleAndAnklePanel } from "../../src/components/HandleAndAnklePanel";
import { StepFlowTimeline } from "../../src/components/StepFlowTimeline";

export default function AnalysisResultScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const videoRef = useRef<Video>(null);

  const [result, setResult] = useState<WorkoutAnalysisResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [videoMode, setVideoMode] = useState<"flow" | "full">("flow");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const data = await fetchJobResult(jobId);
        setResult(data);
        if (data.status === "completed" || data.status === "failed") {
          if (timer) clearInterval(timer);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load job status.");
        if (timer) clearInterval(timer);
      }
    };

    poll();
    timer = setInterval(poll, 1200);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [jobId]);

  const handleSelectStep = async (index: number, timestampSec: number) => {
    setActiveStepIndex(index);
    if (videoRef.current && videoMode === "full") {
      try {
        await videoRef.current.setPositionAsync(Math.round(timestampSec * 1000));
      } catch {
        // Ignore seek errors if video is still buffering
      }
    }
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
        <Text style={styles.progressMsg}>
          {result?.progress_message || "Analyzing joint angles & rendering step-by-step flow video..."}
        </Text>
      </View>
    );
  }

  if (result.status === "failed") {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorTitle}>Pipeline Failed</Text>
        <Text style={styles.errorSub}>{result.error || "Unknown error"}</Text>
      </View>
    );
  }

  const activeVideoUrl =
    videoMode === "flow" ? result.step_by_step_flow_video_url : result.annotated_full_video_url;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Exercise Title & Form Score Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.coachTag}>{result.coach_style.toUpperCase()}</Text>
            <Text style={styles.exerciseTitle}>{result.exercise_name}</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{result.overall_form_score}</Text>
            <Text style={styles.scoreLabel}>FORM SCORE</Text>
          </View>
        </View>

        <View style={styles.muscleRow}>
          {result.target_muscles.map((m) => (
            <View key={m} style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Step-by-Step Start-to-End Flow Video Player */}
      <View style={styles.videoCard}>
        <View style={styles.videoToggleRow}>
          <TouchableOpacity
            style={[styles.modeTab, videoMode === "flow" && styles.modeTabActive]}
            onPress={() => setVideoMode("flow")}
          >
            <Text style={[styles.modeTabText, videoMode === "flow" && styles.modeTabTextActive]}>
              Step-by-Step Flow Video (Start → End)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, videoMode === "full" && styles.modeTabActive]}
            onPress={() => setVideoMode("full")}
          >
            <Text style={[styles.modeTabText, videoMode === "full" && styles.modeTabTextActive]}>
              Continuous Angle HUD
            </Text>
          </TouchableOpacity>
        </View>

        {activeVideoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: activeVideoUrl }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
          />
        ) : null}

        <Text style={styles.videoCaption}>
          {videoMode === "flow"
            ? "Includes 5 Phase Checkpoint Hold Cards + Live Joint Angle HUD (Elbow, Handle/Wrist, Torso Lean, Knee & Ankle Base)"
            : "Continuous real-time skeletal tracking with live joint angle telemetry"}
        </Text>
      </View>

      {/* Handle Position, Wrist Stack & Foot/Ankle Stance Breakdown */}
      {result.handle_and_stance && <HandleAndAnklePanel info={result.handle_and_stance} />}

      {/* Interactive 5-Phase Start-to-End Step Timeline */}
      {result.steps.length > 0 && (
        <StepFlowTimeline
          steps={result.steps}
          activeStepIndex={activeStepIndex}
          onSelectStep={handleSelectStep}
        />
      )}

      {/* Key Jeff Nippard Biomechanical Takeaways */}
      <View style={styles.takeawaysCard}>
        <Text style={styles.takeawaysHeader}>KEY BIOMECHANICAL TAKEAWAYS</Text>
        {result.key_takeaways.map((item, idx) => (
          <View key={idx} style={styles.takeawayRow}>
            <Text style={styles.takeawayBullet}>•</Text>
            <Text style={styles.takeawayText}>{item}</Text>
          </View>
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
  centerBox: {
    flex: 1,
    backgroundColor: "#0B0F17",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  progressPct: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
  },
  progressMsg: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  errorTitle: {
    color: "#EF4444",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorSub: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
  },
  headerCard: {
    backgroundColor: "#131C2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  coachTag: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  exerciseTitle: {
    color: "#F8FAFC",
    fontSize: 19,
    fontWeight: "800",
  },
  scoreCircle: {
    backgroundColor: "#10B98122",
    borderColor: "#10B981",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  scoreNumber: {
    color: "#10B981",
    fontSize: 22,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "#10B981",
    fontSize: 8,
    fontWeight: "800",
  },
  muscleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleChip: {
    backgroundColor: "#0B0F17",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleChipText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
  },
  videoCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 6,
  },
  videoToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  modeTab: {
    flex: 1,
    backgroundColor: "#182235",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: {
    backgroundColor: "#0284C7",
  },
  modeTabText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  videoPlayer: {
    width: "100%",
    height: 230,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  videoCaption: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  takeawaysCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 8,
  },
  takeawaysHeader: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  takeawayRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  takeawayBullet: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "900",
  },
  takeawayText: {
    color: "#E2E8F0",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});
