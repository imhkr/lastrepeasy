import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { WorkoutAnalysisResult } from "../types/workout";

interface Props {
  workout: WorkoutAnalysisResult;
}

function buildFallbackEnglishScript(w: WorkoutAnalysisResult): string {
  const muscles = (w.target_muscles || []).slice(0, 2).join(" and ");
  return (
    `Okay, ${w.exercise_name}. Plant your feet and keep your wrists straight. ` +
    `Lower slowly, pause in the stretch, then drive up smoothly. ` +
    `You should feel it in your ${muscles}.`
  );
}

function buildFallbackHinglishScript(w: WorkoutAnalysisResult): string {
  const muscles = (w.target_muscles || []).slice(0, 2).join(" aur ");
  return (
    `Chalo, ${w.exercise_name}. Pair zameen par jamao aur wrist seedhi rakho. ` +
    `Niche slowly jao, stretch mein ek second ruko, phir smoothly upar aao. ` +
    `Tension ${muscles} mein feel hona chahiye.`
  );
}

// Split into sentences so the engine pauses naturally instead of reading one flat block.
function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]*/g)?.map((t) => t.trim()).filter(Boolean) ?? [text];
}

// Prefer the best installed voice (Enhanced/Premium) for the locale; the default one sounds robotic.
async function pickVoice(locale: string): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Known male voices first (iOS names), then quality, then exact locale.
    const male = /rishi|daniel|aaron|arthur|alex|fred|oliver|gordon|reed|eddy|ene|ive|iod/i;
    const rank = (v: Speech.Voice) =>
      (male.test(v.name + v.identifier) ? 4 : 0) + (v.quality === Speech.VoiceQuality.Enhanced ? 2 : 0) + (v.language === locale ? 1 : 0);
    return voices
      .filter((v) => v.language.replace("_", "-").startsWith(locale.slice(0, 2)))
      .sort((x, y) => rank(y) - rank(x))[0]?.identifier;
  } catch {
    return undefined;
  }
}

// Short lead-ins like "Listen up." join the next sentence so every step has real content.
function toSteps(text: string): string[] {
  const out: string[] = [];
  let carry = "";
  for (const sent of splitSentences(text)) {
    const joined = carry ? `${carry} ${sent}` : sent;
    if (joined.length < 30) carry = joined;
    else {
      out.push(joined);
      carry = "";
    }
  }
  if (carry) out.push(carry);
  return out;
}

export const VoiceCoachPanel: React.FC<Props> = ({ workout }) => {
  const [selectedLang, setSelectedLang] = useState<"hinglish" | "english">("hinglish");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const runId = useRef(0);

  const scriptEn =
    workout.voice_script_english && workout.voice_script_english.trim().length > 10
      ? workout.voice_script_english
      : buildFallbackEnglishScript(workout);
  const scriptHi =
    workout.voice_script_hinglish && workout.voice_script_hinglish.trim().length > 10
      ? workout.voice_script_hinglish
      : buildFallbackHinglishScript(workout);

  const steps = toSteps(selectedLang === "hinglish" ? scriptHi : scriptEn);
  const isSpeaking = activeIdx !== null;

  useEffect(
    () => () => {
      runId.current++;
      Speech.stop();
    },
    []
  );

  // Speak steps from `from` onward; the active step is highlighted as each one starts.
  const play = async (lang: "hinglish" | "english", from = 0) => {
    Speech.stop();
    const id = ++runId.current;
    setSelectedLang(lang);
    const list = toSteps(lang === "hinglish" ? scriptHi : scriptEn);
    const locale = lang === "hinglish" ? "en-IN" : "en-US";
    const voice = await pickVoice(locale);
    if (id !== runId.current) return;

    list.slice(from).forEach((text, i) => {
      const idx = from + i;
      const last = idx === list.length - 1;
      Speech.speak(text, {
        language: locale,
        voice,
        rate: 0.9,
        pitch: 0.75,
        onStart: () => { if (id === runId.current) setActiveIdx(idx); },
        onDone: last ? () => { if (id === runId.current) setActiveIdx(null); } : undefined,
        onError: () => setActiveIdx(null),
      });
    });
  };

  const stop = () => {
    runId.current++;
    Speech.stop();
    setActiveIdx(null);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How to do it</Text>
        <TouchableOpacity style={styles.listenBtn} onPress={isSpeaking ? stop : () => play(selectedLang)}>
          <Text style={styles.listenText}>{isSpeaking ? "Stop" : "Listen"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        {(["hinglish", "english"] as const).map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langButton, selectedLang === lang && styles.langButtonActive]}
            onPress={() => {
              stop();
              setSelectedLang(lang);
            }}
          >
            <Text style={[styles.langButtonText, selectedLang === lang && styles.langButtonTextActive]}>
              {lang === "hinglish" ? "Hinglish" : "English"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.transcriptBox}>
        {steps.map((text, i) => (
          <View key={`${selectedLang}-${i}`} style={[styles.stepRow, activeIdx === i && styles.stepRowActive]}>
            <View style={styles.stepNumBox}>
              <Text style={[styles.stepNum, activeIdx === i && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.transcriptText, activeIdx === i && styles.transcriptTextActive]}>{text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionBadge: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },
  liveChip: {
    backgroundColor: "#10B98122",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveChipText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  langButton: {
    flex: 1,
    backgroundColor: "#182235",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#283754",
    alignItems: "center",
  },
  langButtonHinglishActive: {
    backgroundColor: "#D97706",
    borderColor: "#F59E0B",
  },
  langButtonEnglishActive: {
    backgroundColor: "#0284C7",
    borderColor: "#38BDF8",
  },
  langButtonText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "800",
  },
  langButtonTextActive: {
    color: "#FFFFFF",
  },
  stopButton: {
    backgroundColor: "#EF444422",
    borderColor: "#EF4444",
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButtonText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
  },
  transcriptBox: {
    backgroundColor: "#090D16",
    borderRadius: 10,
    padding: 6,
  },
  listenBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: "#1E293B" },
  listenText: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  langButtonActive: { backgroundColor: "#0284C7", borderColor: "#38BDF8" },
  toggleText: { color: "#38BDF8", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  stepRow: { flexDirection: "row", gap: 10, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8 },
  stepRowActive: { backgroundColor: "#1E293B" },
  stepNumBox: { width: 18, flexShrink: 0 },
  stepNum: { color: "#64748B", fontSize: 13, fontWeight: "800" },
  stepNumActive: { color: "#F59E0B" },
  transcriptTextActive: { color: "#FFFFFF" },
  transcriptLabel: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  transcriptText: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 21,
  },
});
