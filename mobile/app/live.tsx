import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { liveHtml } from "../src/live/liveHtml";
import { listExercises, getRubric } from "../src/live/engine";
import { sayCoach } from "../src/services/coachVoice";
import { Lang, useLang } from "../src/services/lang";

// Two steps, on purpose. The coach judges against one exercise's rubric, and the old screen only
// had one exercise's thresholds baked in, so a squat was graded as a press. Choosing first makes
// that impossible: the picker offers exactly the exercises that have a rubric.
export default function LiveCoach() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exercise?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [lang, setLang] = useLang();
  const [status, setStatus] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [exercise, setExercise] = useState<string | null>(params.exercise ?? null);
  const webRef = useRef<any>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const voiceRef = useRef(true);
  const langRef = useRef<Lang>(lang);
  voiceRef.current = voiceOn;
  langRef.current = lang;
  const first = useRef(true);

  const exercises = useMemo(() => listExercises(), []);
  const html = useMemo(
    () => (exercise ? liveHtml({ exerciseId: exercise, lang, facing: "environment" }) : ""),
    [exercise], // eslint-disable-line react-hooks/exhaustive-deps
  );

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

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{lang === "hi" ? "Kaunsi exercise?" : "Which exercise?"}</Text>
        <Text style={styles.sub}>
          {lang === "hi"
            ? "Live coach har exercise ke apne rules se judge karta hai. Pehle exercise chuno."
            : "The live coach judges each exercise by its own rules. Pick one to start."}
        </Text>
        <ScrollView style={styles.list} contentContainerStyle={{ gap: 10 }}>
          {exercises.map((id) => {
            const r = getRubric(id) as any;
            return (
              <TouchableOpacity key={id} style={styles.card} onPress={() => setExercise(id)}>
                <Text style={styles.cardTitle}>{r.name || id}</Text>
                <Text style={styles.cardSub}>
                  {(lang === "hi" ? "Camera: " : "Camera: ") + viewLabel(r.view, lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {!exercises.length ? (
          <Text style={styles.warn}>
            {lang === "hi" ? "Abhi koi exercise ready nahi hai." : "No exercise is ready yet."}
          </Text>
        ) : null}
      </View>
    );
  }

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
          injectedJavaScriptBeforeContentLoaded={`window.__CONFIG={facing:"environment",lang:"${lang}",exercise:"${exercise}"};true;`}
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
        <TouchableOpacity onPress={() => { Speech.stop(); setExercise(null); }}>
          <Text style={styles.barBtn}>{lang === "hi" ? "Badlo" : "Change"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { Speech.stop(); setVoiceOn((v) => !v); }}>
          <Text style={styles.barBtn}>{voiceOn ? (lang === "hi" ? "Awaaz on" : "Voice on") : (lang === "hi" ? "Awaaz off" : "Voice off")}</Text>
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

// A rubric may accept several camera positions (a press reads equally well face-on and at 45),
// so this takes the first one that is not "any" and describes that.
function viewLabel(view: string | string[] | undefined, lang: Lang): string {
  const map: Record<string, [string, string]> = {
    side: ["side on", "side se"],
    front: ["face on", "saamne se"],
    "45": ["slight angle", "thode angle se"],
    any: ["any", "koi bhi"],
  };
  const list = Array.isArray(view) ? view : view ? [view] : ["any"];
  const pick = list.find((v) => v !== "any") ?? "any";
  const pair = map[pick] ?? map.any;
  return lang === "hi" ? pair[1] : pair[0];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F17" },
  center: { flex: 1, backgroundColor: "#0B0F17", padding: 24, justifyContent: "center" },
  web: { flex: 1, backgroundColor: "#0B0F17" },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  sub: { color: "#94A3B8", fontSize: 15, lineHeight: 21, marginTop: 8 },
  warn: { color: "#FCD34D", fontSize: 14, marginTop: 14 },
  list: { marginTop: 20, maxHeight: 420 },
  card: { backgroundColor: "#141B28", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#1F2937" },
  cardTitle: { color: "#F8FAFC", fontSize: 17, fontWeight: "800" },
  cardSub: { color: "#94A3B8", fontSize: 13, marginTop: 4 },
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
