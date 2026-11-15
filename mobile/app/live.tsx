import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { liveHtml } from "../src/live/liveHtml";
import { sayCoach } from "../src/services/coachVoice";
import { Lang, useLang } from "../src/services/lang";

// The camera opens straight away. The page itself shows how to place the phone until you hold the weights up.
export default function LiveCoach() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [lang, setLang] = useLang();
  const [status, setStatus] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const webRef = useRef<any>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const voiceRef = useRef(true);
  const langRef = useRef<Lang>(lang);
  voiceRef.current = voiceOn;
  langRef.current = lang;
  const html = useMemo(() => liveHtml(), []);
  const first = useRef(true);

  useKeepAwake(); // the screen must stay on during a set

  useEffect(() => {
    if (Platform.OS !== "web" && permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  const run = (js: string) => {
    if (Platform.OS === "web") (frameRef.current?.contentWindow as any)?.eval?.(js);
    else webRef.current?.injectJavaScript(`${js};true;`);
  };

  // Changing the language switches the page text and the voice at once; no reload.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    run(`window.__setLang && window.__setLang("${lang}")`);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      if (m.type === "status") setStatus(m.text);
      if (m.type === "speak" && voiceRef.current) sayCoach(langRef.current === "hi" ? m.hi : m.en, langRef.current === "hi");
      if (m.type === "done") router.back();
    } catch {
      // ignore malformed messages
    }
  };

  if (Platform.OS !== "web" && !permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{lang === "hi" ? "Camera chahiye" : "Camera needed"}</Text>
        <Text style={styles.sub}>
          {lang === "hi"
            ? "Live coach aapka set camera se dekhta hai. Video phone par hi rehta hai, upload nahi hota."
            : "The live coach watches your set through the camera. The video stays on your phone and is not uploaded."}
        </Text>
        {permission && !permission.canAskAgain ? (
          <Text style={styles.warn}>
            {lang === "hi" ? "Phone settings mein is app ke liye camera on karo." : "Turn the camera on for this app in your phone settings."}
          </Text>
        ) : (
          <TouchableOpacity style={styles.go} onPress={requestPermission}>
            <Text style={styles.goText}>{lang === "hi" ? "Camera allow karo" : "Allow camera"}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        React.createElement("iframe", {
          ref: frameRef,
          srcDoc: html,
          allow: "camera",
          style: { flex: 1, border: 0, width: "100%", height: "100%" },
        })
      ) : (
        <WebView
          ref={webRef}
          style={styles.web}
          originWhitelist={["*"]}
          source={{ html, baseUrl: "https://lastrepeasy.app" }}
          injectedJavaScriptBeforeContentLoaded={`window.__CONFIG={facing:"user",lang:"${lang}"};true;`}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          allowsFullscreenVideo={false}
          androidLayerType="hardware"
          onMessage={onMessage}
          onError={() => setStatus("The coach page could not load. Check your internet and try again.")}
        />
      )}
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => { Speech.stop(); setVoiceOn((v) => !v); }}>
          <Text style={styles.barBtn}>{voiceOn ? "Voice on" : "Voice off"}</Text>
        </TouchableOpacity>
        <View style={styles.langRow}>
          {(["hi", "en"] as Lang[]).map((l) => (
            <TouchableOpacity key={l} style={[styles.langChip, lang === l && styles.langOn]} onPress={() => setLang(l)}>
              <Text style={[styles.langText, lang === l && styles.langTextOn]}>{l === "hi" ? "Hinglish" : "English"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {status && /Loading|Starting|load ho|shuru ho|faster|tez kar/i.test(status) ? <ActivityIndicator color="#38BDF8" /> : null}
        <TouchableOpacity onPress={() => { Speech.stop(); run("window.__finish && window.__finish()"); }}>
          <Text style={styles.barBtn}>{lang === "hi" ? "Set khatam" : "Finish set"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  center: { flex: 1, backgroundColor: "#0B0F17", padding: 24, justifyContent: "center" },
  web: { flex: 1, backgroundColor: "#0B0F17" },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  sub: { color: "#94A3B8", fontSize: 15, lineHeight: 21, marginTop: 8 },
  warn: { color: "#FCD34D", fontSize: 14, marginTop: 14 },
  go: { backgroundColor: "#0284C7", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  goText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#0B0F17" },
  barBtn: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
  langRow: { flexDirection: "row", gap: 6 },
  langChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#182235" },
  langOn: { backgroundColor: "#0C2A3F", borderWidth: 1, borderColor: "#38BDF8" },
  langText: { color: "#94A3B8", fontWeight: "700", fontSize: 12 },
  langTextOn: { color: "#FFFFFF" },
});
