import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { useKeepAwake } from "expo-keep-awake";
import * as Speech from "expo-speech";
import { liveHtml } from "../src/live/liveHtml";
import { listExercises, getRubric } from "../src/live/engine";
import { adjudicateRep } from "../src/api/client";
import { sayCoach } from "../src/services/coachVoice";
import { Lang, useLang } from "../src/services/lang";
import { LiveIssue, getLiveIssues, addLiveIssues, deleteLiveIssue } from "../src/services/liveIssueLog";

// Two steps, on purpose. The coach judges against one exercise's rubric, and the old screen only
// had one exercise's thresholds baked in, so a squat was graded as a press. Choosing first makes
// that impossible: the picker offers exactly the exercises that have a rubric.
export default function LiveCoach() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exercise?: string; q?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [lang, setLang] = useLang();
  const [status, setStatus] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [exercise, setExercise] = useState<string | null>(params.exercise ?? null);
  const [query, setQuery] = useState(params.q ?? "");
  const [issues, setIssues] = useState<LiveIssue[]>([]);
  const [showIssues, setShowIssues] = useState(false);
  const webRef = useRef<any>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const voiceRef = useRef(true);
  const langRef = useRef<Lang>(lang);
  // Read inside the rep handler, which is created once and outlives any single render.
  const exerciseRef = useRef<string | null>(exercise);
  const viewRef = useRef<string>("");
  voiceRef.current = voiceOn;
  langRef.current = lang;
  exerciseRef.current = exercise;
  const first = useRef(true);

  const exercises = useMemo(() => {
    return listExercises().sort((a, b) => {
      const ra = getRubric(a) as any;
      const rb = getRubric(b) as any;
      return String(ra.name || a).localeCompare(String(rb.name || b));
    });
  }, []);
  const filteredExercises = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return exercises;
    return exercises.filter((id) => {
      const r = getRubric(id) as any;
      const hay = `${r.name || ""} ${id} ${r.family || ""}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [exercises, query]);
  const html = useMemo(
    () => (exercise ? liveHtml({ exerciseId: exercise, lang, facing: "environment" }) : ""),
    [exercise], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useKeepAwake(); // the screen must stay on during a set

  useEffect(() => {
    if (Platform.OS !== "web" && permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    getLiveIssues().then(setIssues);
  }, [exercise]);

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
      if (m.type === "ready" && m.view) viewRef.current = m.view;
      if (m.type === "rep") {
        const exId = exerciseRef.current;
        if (exId) {
          const exName = String((getRubric(exId) as any)?.name || exId);
          const repIndex = Number(m.index ?? 1);
          const now = new Date().toISOString();
          const newItems: LiveIssue[] = (m.checks ?? [])
            .filter((c: any) => (c.status === "fix" || c.status === "almost") && c.cue)
            .map((c: any) => ({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              exerciseId: exId,
              exerciseName: exName,
              repIndex,
              checkId: String(c.id || "form"),
              severity: c.status === "fix" ? "error" : "warning",
              textEn: String(c.cue.en || ""),
              textHi: String(c.cue.hi || c.cue.en || ""),
              source: "local" as const,
              createdAt: now,
            }));
          if (newItems.length) addLiveIssues(newItems).then(setIssues);
        }
        secondOpinion(m);
      }
    } catch {
      // ignore malformed messages
    }
  };

  // The phone has already judged this rep and already said it out loud, so a second opinion is
  // deliberately off the critical path: it is asked for, never waited on, and a failure is
  // swallowed. What it is FOR is catching the faults a single 2D angle cannot see -- a shrug, a
  // flared elbow -- so when it disagrees with the on-device verdict it says so once, quietly.
  //
  // ONE at a time. A vision call takes several seconds, which is longer than a rep, so firing one
  // per rep would stack requests, and the answers would arrive after the set ended and get spoken
  // over the next one. A rep that arrives while a call is in flight is dropped: the on-device
  // verdict for it already stood, and the next rep will be checked instead.
  //
  // The phone holds no API key. This endpoint is the only thing that talks to the model.
  const inFlight = useRef(false);
  const secondOpinion = (m: any) => {
    const keyframes: string[] = Array.isArray(m.keyframes) ? m.keyframes.filter(Boolean) : [];
    if (!keyframes.length || !exerciseRef.current || inFlight.current) return;
    inFlight.current = true;
    adjudicateRep({
      exerciseId: exerciseRef.current,
      repIndex: m.index ?? 1,
      view: viewRef.current || undefined,
      checks: (m.checks ?? []).map((c: any) => ({ id: c.id, status: c.status })),
      keyframes,
      landmarks: Array.isArray(m.nrm) ? m.nrm : [],
    })
      .then((r) => {
        if (!r || r.agrees_with_local || !r.checks?.length) return;
        const worse = r.checks.find((c) => {
          const local = (m.checks ?? []).find((x: any) => x.id === c.id);
          return local && local.status === "good" && c.status === "fix" && c.cue;
        });
        if (worse?.cue) {
          if (voiceRef.current) sayCoach(langRef.current === "hi" ? worse.cue.hi : worse.cue.en, langRef.current === "hi");
          run(`window.__showCue && window.__showCue(${JSON.stringify(worse.cue.en)}, ${JSON.stringify(worse.cue.hi)}, "fix", ${Number(m.index ?? 1)})`);
          const exId = exerciseRef.current;
          if (exId) {
            const exName = String((getRubric(exId) as any)?.name || exId);
            addLiveIssues([{
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              exerciseId: exId,
              exerciseName: exName,
              repIndex: Number(m.index ?? 1),
              checkId: String(worse.id || "ai"),
              severity: "error",
              textEn: String(worse.cue.en || ""),
              textHi: String(worse.cue.hi || worse.cue.en || ""),
              source: "ai",
              createdAt: new Date().toISOString(),
            }]).then(setIssues);
          }
        }
      })
      .catch(() => {
        // A missing second opinion is not a failed rep. The verdict already spoken stands.
      })
      .finally(() => {
        inFlight.current = false;
      });
  };

  if (!exercise) {
    return (
      <View style={styles.pickerWrap}>
        <Text style={styles.title}>{lang === "hi" ? "Kaunsi exercise?" : "Which exercise?"}</Text>
        <Text style={styles.sub}>
          {lang === "hi"
            ? "Live coach har exercise ke apne rules se judge karta hai. Pehle exercise chuno."
            : "The live coach judges each exercise by its own rules. Pick one to start."}
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={lang === "hi" ? "Exercise dhundo (squat, curl, press)..." : "Search exercise (squat, curl, press)..."}
            placeholderTextColor="#64748B"
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.searchInput}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn} accessibilityLabel="Clear search">
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.countText}>
          {filteredExercises.length} / {exercises.length} {lang === "hi" ? "exercises" : "exercises"}
        </Text>
        <ScrollView style={styles.list} contentContainerStyle={{ gap: 10, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {filteredExercises.map((id) => {
            const r = getRubric(id) as any;
            return (
              <TouchableOpacity key={id} style={styles.card} onPress={() => { setQuery(""); setExercise(id); }}>
                <Text style={styles.cardTitle}>{r.name || id}</Text>
                <Text style={styles.cardSub}>
                  {"Camera: " + viewLabel(r.view, lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
          {exercises.length > 0 && !filteredExercises.length ? (
            <Text style={styles.warn}>
              {lang === "hi" ? `"${query.trim()}" ke liye koi exercise nahi mili.` : `No exercises match "${query.trim()}".`}
            </Text>
          ) : null}
          {issues.length > 0 ? (
            <View style={styles.issuesSection}>
              <Text style={styles.issuesHeading}>
                {lang === "hi" ? `Saved warnings & errors (${issues.length})` : `Saved warnings & errors (${issues.length})`}
              </Text>
              {issues.slice(0, 15).map((item) => (
                <View key={item.id} style={styles.issueRow}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={styles.issueMetaRow}>
                      <Text style={[styles.sevBadge, item.severity === "error" ? styles.sevError : styles.sevWarn]}>
                        {item.severity === "error" ? "ERROR" : "WARN"}
                      </Text>
                      <Text style={styles.issueEx}>{item.exerciseName} · Rep {item.repIndex}</Text>
                    </View>
                    <Text style={styles.issueText}>{lang === "hi" ? item.textHi : item.textEn}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.issueDelBtn}
                    onPress={() => deleteLiveIssue(item.id).then(setIssues)}
                    accessibilityLabel="Delete issue"
                  >
                    <Text style={styles.issueDelText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
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
      {(() => {
        const currentIssues = issues.filter((i) => i.exerciseId === exercise);
        return (
          <>
            {showIssues && (
              <View style={styles.issueDrawer}>
                <View style={styles.issueDrawerHeader}>
                  <Text style={styles.issuesHeading}>
                    {lang === "hi" ? `Warnings & errors (${currentIssues.length})` : `Warnings & errors (${currentIssues.length})`}
                  </Text>
                  <TouchableOpacity onPress={() => setShowIssues(false)}>
                    <Text style={styles.barBtn}>{lang === "hi" ? "Band karo" : "Close"}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: 220 }} contentContainerStyle={{ gap: 8 }}>
                  {currentIssues.length === 0 ? (
                    <Text style={styles.issueEmpty}>
                      {lang === "hi" ? "Abhi tak koi warning ya error nahi hai." : "No warnings or errors recorded yet."}
                    </Text>
                  ) : (
                    currentIssues.map((item) => (
                      <View key={item.id} style={styles.issueRow}>
                        <View style={{ flex: 1, gap: 3 }}>
                          <View style={styles.issueMetaRow}>
                            <Text style={[styles.sevBadge, item.severity === "error" ? styles.sevError : styles.sevWarn]}>
                              {item.severity === "error" ? "ERROR" : "WARN"}
                            </Text>
                            <Text style={styles.issueEx}>Rep {item.repIndex}</Text>
                          </View>
                          <Text style={styles.issueText}>{lang === "hi" ? item.textHi : item.textEn}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.issueDelBtn}
                          onPress={() => deleteLiveIssue(item.id).then(setIssues)}
                          accessibilityLabel="Delete issue"
                        >
                          <Text style={styles.issueDelText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            <View style={styles.bar}>
              <TouchableOpacity onPress={() => { Speech.stop(); setShowIssues(false); setExercise(null); }}>
                <Text style={styles.barBtn}>{lang === "hi" ? "Badlo" : "Change"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowIssues((v) => !v)}>
                <Text style={[styles.barBtn, showIssues && { color: "#38BDF8" }]}>
                  {`Issues (${currentIssues.length})`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { Speech.stop(); setVoiceOn((v) => !v); }}>
                <Text style={styles.barBtn}>{voiceOn ? (lang === "hi" ? "Awaaz on" : "Voice on") : (lang === "hi" ? "Awaaz off" : "Voice off")}</Text>
              </TouchableOpacity>
              <View style={styles.langRow}>
                {(["hi", "en"] as Lang[]).map((l) => (
                  <TouchableOpacity key={l} style={[styles.langChip, lang === l && styles.langOn]} onPress={() => setLang(l)}>
                    <Text style={[styles.langText, lang === l && styles.langTextOn]}>{l === "hi" ? "HI" : "EN"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {status && /Loading|Starting|load ho|shuru ho|faster|tez kar/i.test(status) ? <ActivityIndicator color="#38BDF8" /> : null}
              <TouchableOpacity onPress={() => { Speech.stop(); run("window.__finish && window.__finish()"); }}>
                <Text style={styles.barBtn}>{lang === "hi" ? "Khatam" : "Finish"}</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      })()}
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
  pickerWrap: { flex: 1, backgroundColor: "#0B0F17", paddingHorizontal: 20, paddingTop: 54 },
  web: { flex: 1, backgroundColor: "#0B0F17" },
  title: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  sub: { color: "#94A3B8", fontSize: 15, lineHeight: 21, marginTop: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141B28",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    marginTop: 16,
  },
  searchInput: { flex: 1, color: "#F8FAFC", fontSize: 16, paddingVertical: 12 },
  clearBtn: { paddingLeft: 10, paddingVertical: 6 },
  clearText: { color: "#94A3B8", fontSize: 22, fontWeight: "700", lineHeight: 22 },
  countText: { color: "#64748B", fontSize: 12, fontWeight: "700", marginTop: 10 },
  warn: { color: "#FCD34D", fontSize: 14, marginTop: 14 },
  list: { flex: 1, marginTop: 10 },
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
  issuesSection: { marginTop: 18, gap: 8 },
  issuesHeading: { color: "#F8FAFC", fontSize: 14, fontWeight: "800" },
  issueDrawer: { backgroundColor: "#111827", borderTopWidth: 1, borderColor: "#1E293B", padding: 12, gap: 8 },
  issueDrawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  issueEmpty: { color: "#94A3B8", fontSize: 13 },
  issueRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#141B28", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#1E293B" },
  issueMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sevBadge: { fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: "hidden" },
  sevError: { backgroundColor: "#450A0A", color: "#FCA5A5" },
  sevWarn: { backgroundColor: "#451A03", color: "#FCD34D" },
  issueEx: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  issueText: { color: "#E2E8F0", fontSize: 13, lineHeight: 18 },
  issueDelBtn: { backgroundColor: "#2B1215", borderWidth: 1, borderColor: "#7F1D1D", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  issueDelText: { color: "#FCA5A5", fontSize: 12, fontWeight: "800" },
});
