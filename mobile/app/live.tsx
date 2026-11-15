import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { liveHtml } from "../src/live/liveHtml";
import { sayCoach } from "../src/services/coachVoice";

const STEPS = [
  "Lean your phone on something about 2 metres away, beside you, at chest height.",
  "Your whole upper body and both arms must be in the picture.",
  "Hold the dumbbells straight up for one second. Then do your reps.",
];

export default function LiveCoach() {
  const [started, setStarted] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceRef = useRef(true);
  voiceRef.current = voiceOn;
  const html = useMemo(() => liveHtml(), []);

  useKeepAwake(); // the screen must stay on during a set

  const start = async () => {
    const p = permission?.granted || Platform.OS === "web" ? permission : await requestPermission();
    if (Platform.OS === "web" || p?.granted) setStarted(true);
  };

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      if (m.type === "status") setStatus(m.text);
      if (m.type === "speak" && voiceRef.current) sayCoach(m.text);
    } catch {
      // ignore malformed messages
    }
  };

  if (!started) {
    return (
      <View style={styles.pad}>
        <Text style={styles.title}>Live coach</Text>
        <Text style={styles.sub}>Incline dumbbell press. I watch your set and tell you what to fix after every rep. More exercises are coming.</Text>
        <View style={styles.card}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.step}>
              <Text style={styles.num}>{i + 1}</Text>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>The camera is analysed on your phone. No video is uploaded. The first start downloads the coach model (about 30 MB) once.</Text>
        {permission && !permission.granted && !permission.canAskAgain ? (
          <Text style={styles.warn}>Camera access is off. Turn it on in your phone settings for this app.</Text>
        ) : null}
        <TouchableOpacity style={styles.go} onPress={start}>
          <Text style={styles.goText}>Start live coach</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        React.createElement("iframe", { srcDoc: html, allow: "camera", style: { flex: 1, border: 0, width: "100%", height: "100%" } })
      ) : (
      <WebView
        style={styles.web}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://lastrepeasy.app" }}
        injectedJavaScriptBeforeContentLoaded={'window.__CONFIG={facing:"user"};true;'}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        allowsFullscreenVideo={false}
        onMessage={onMessage}
        onError={() => setStatus("The coach page could not load. Check your internet and try again.")}
      />
      )}
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => { Speech.stop(); setVoiceOn((v) => !v); }}>
          <Text style={styles.barBtn}>{voiceOn ? "Voice on" : "Voice off"}</Text>
        </TouchableOpacity>
        {status && /Loading|Starting/.test(status) ? <ActivityIndicator color="#38BDF8" /> : null}
        <TouchableOpacity onPress={() => { Speech.stop(); setStarted(false); }}>
          <Text style={styles.barBtn}>Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  pad: { flex: 1, backgroundColor: "#0B0F17", padding: 16 },
  web: { flex: 1, backgroundColor: "#0B0F17" },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800", marginTop: 8 },
  sub: { color: "#94A3B8", fontSize: 15, lineHeight: 21, marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: "#111827", borderRadius: 16, padding: 16, gap: 14, borderWidth: 1, borderColor: "#1E293B" },
  step: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  num: { color: "#0B0F17", backgroundColor: "#38BDF8", width: 26, height: 26, borderRadius: 13, textAlign: "center", lineHeight: 26, fontWeight: "800", overflow: "hidden" },
  stepText: { color: "#E2E8F0", fontSize: 15, lineHeight: 21, flex: 1 },
  note: { color: "#64748B", fontSize: 12, lineHeight: 17, marginTop: 14 },
  warn: { color: "#FCD34D", fontSize: 13, marginTop: 10 },
  go: { backgroundColor: "#0284C7", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  goText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#0B0F17" },
  barBtn: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
});
