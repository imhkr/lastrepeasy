import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { WorkoutAnalysisResult } from "../types/workout";

interface Props {
  workout: WorkoutAnalysisResult;
}

function buildFallbackEnglishScript(w: WorkoutAnalysisResult): string {
  const grip = w.handle_and_stance?.grip_type || "neutral ergonomic grip";
  const wrist = w.handle_and_stance?.wrist_alignment || "stacked 172 degree neutral wrist";
  const ankle = w.handle_and_stance?.foot_and_ankle_position || "planted stance with 83 degree ankle angle";
  const muscles = (w.target_muscles || []).join(", ");
  return (
    `Coaching guide for ${w.exercise_name}. ` +
    `Target muscles: ${muscles}. ` +
    `Setup and placement: ${ankle}, with a ${w.handle_and_stance?.torso_angle_deg ?? 30} degree torso angle. ` +
    `Handle and wrist placement: use ${grip}, and maintain ${wrist}. ` +
    `Execution focus: control the eccentric, pause half a second in the deep lengthened stretch, and drive smoothly along the scapular plane.`
  );
}

function buildFallbackHinglishScript(w: WorkoutAnalysisResult): string {
  const grip = w.handle_and_stance?.grip_type || "neutral handle grip";
  const torso = w.handle_and_stance?.torso_angle_deg ?? 30;
  const muscles = (w.target_muscles || []).join(", ");
  return (
    `Chaliye dekhte hain ${w.exercise_name} ka proper setup aur muscle focus. ` +
    `Yeh exercise aapke ${muscles} ko direct hit karegi. ` +
    `Sabse pehle placement: pair zameen par firm plant karo, ankle angle lagbhag 83 degree rakho aur torso ko ${torso} degree par lock karo. ` +
    `Handle aur wrist focus: ${grip} use karo aur apni kalai yaani wrist ko 172 degree par bilkul seedha stack rakho. ` +
    `Main focus: niche deep stretch position mein aadha second pause karo aur phir elbows se drive karte hue peak contraction par squeeze karo.`
  );
}

export const VoiceCoachPanel: React.FC<Props> = ({ workout }) => {
  const [selectedLang, setSelectedLang] = useState<"hinglish" | "english">("hinglish");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scriptEn =
    workout.voice_script_english && workout.voice_script_english.trim().length > 10
      ? workout.voice_script_english
      : buildFallbackEnglishScript(workout);

  const scriptHi =
    workout.voice_script_hinglish && workout.voice_script_hinglish.trim().length > 10
      ? workout.voice_script_hinglish
      : buildFallbackHinglishScript(workout);

  const currentScript = selectedLang === "hinglish" ? scriptHi : scriptEn;

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSpeak = (lang: "hinglish" | "english") => {
    Speech.stop();
    setSelectedLang(lang);
    const textToSpeak = lang === "hinglish" ? scriptHi : scriptEn;
    const voiceLocale = lang === "hinglish" ? "en-IN" : "en-US";

    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: voiceLocale,
      rate: 0.94,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStop = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionBadge}>AUDIO FORM & SETUP COACH</Text>
          <Text style={styles.title}>Listen to Setup, Placement & Focus</Text>
        </View>
        {isSpeaking && (
          <View style={styles.liveChip}>
            <Text style={styles.liveChipText}>SPEAKING...</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.langButton,
            selectedLang === "hinglish" && styles.langButtonHinglishActive,
          ]}
          onPress={() => handleSpeak("hinglish")}
        >
          <Text
            style={[
              styles.langButtonText,
              selectedLang === "hinglish" && styles.langButtonTextActive,
            ]}
          >
            🔊 Listen in Hinglish
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.langButton,
            selectedLang === "english" && styles.langButtonEnglishActive,
          ]}
          onPress={() => handleSpeak("english")}
        >
          <Text
            style={[
              styles.langButtonText,
              selectedLang === "english" && styles.langButtonTextActive,
            ]}
          >
            🔊 Listen in English
          </Text>
        </TouchableOpacity>

        {isSpeaking && (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>⏹ Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.transcriptBox}>
        <Text style={styles.transcriptLabel}>
          {selectedLang === "hinglish"
            ? "HINGLISH VOICE SCRIPT (PLACEMENT & FOCUS):"
            : "ENGLISH VOICE SCRIPT (PLACEMENT & FOCUS):"}
        </Text>
        <Text style={styles.transcriptText}>{currentScript}</Text>
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
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  langButton: {
    flex: 1,
    minWidth: 130,
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
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#38BDF8",
  },
  transcriptLabel: {
    color: "#38BDF8",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  transcriptText: {
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 18,
  },
});
