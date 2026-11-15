import { CORE_JS } from "./liveCore.ts";

// The page that runs inside the app's WebView. MediaPipe pose runs on the phone (WASM/GPU), the camera never leaves
// the device, and the coach core (liveCore.ts) judges every rep. It talks to the app with postMessage:
//   {type:"status", text}  loading / errors      {type:"speak", text}  a cue to read aloud      {type:"rep", ...}  rep done
// For desktop testing it can read a video file instead: page?src=clip.mp4
const VISION = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3";
const MODELS: Record<string, string> = {
  lite: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
  full: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
  heavy: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
};

export function liveHtml(): string {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{box-sizing:border-box} html,body{margin:0;height:100%;background:#0B0F17;color:#F8FAFC;font-family:-apple-system,Roboto,Helvetica,Arial,sans-serif;overflow:hidden}
  #stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  #stage.mirror video,#stage.mirror canvas{transform:scaleX(-1)}
  #wrap{position:relative;max-width:100%;max-height:100%}
  video,canvas{display:block;max-width:100vw;max-height:100vh}
  canvas{position:absolute;left:0;top:0;width:100%;height:100%}
  #hud{position:absolute;left:8px;top:8px;background:rgba(22,18,16,.78);border-radius:12px;padding:8px 12px 6px;min-width:150px}
  #hud .t{font-weight:800;font-size:14px;margin-bottom:4px}
  .row{display:flex;align-items:center;gap:8px;margin:5px 0;font-weight:700;font-size:15px}
  .ic{width:22px;height:22px;border-radius:11px;border:2px solid #969696;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#141414}
  .good{background:#3CEB6E;border-color:#3CEB6E} .almost{background:#FFAF00;border-color:#FFAF00} .fix{background:#F54646;border-color:#F54646;color:#fff} .unsure{background:#969696;border-color:#969696}
  #banner{position:absolute;left:0;right:0;bottom:0;padding:14px 16px 18px;text-align:center;font-weight:800;font-size:20px;line-height:1.25;background:rgba(22,18,16,.86);border-top:4px solid #969696}
  #banner.good{border-color:#3CEB6E} #banner.almost{border-color:#FFAF00} #banner.fix{border-color:#F54646}
  #msg{position:absolute;left:0;right:0;top:40%;text-align:center;padding:0 24px;font-size:16px;color:#CBD5E1}
  #sum{position:absolute;inset:0;background:rgba(11,15,23,.96);display:none;align-items:center;justify-content:center;overflow:auto}
  #sum .card{width:100%;max-width:420px;padding:22px}
  #sum .big{font-size:26px;font-weight:800;margin-bottom:6px} #sum .nx{margin-top:18px;color:#6EEB3C;font-size:20px}
  #sum .sub{color:#94A3B8;margin-bottom:14px} #sum .srow{display:flex;align-items:center;gap:10px;margin:8px 0} #sum .srow b{width:64px}
  #sum p{font-size:17px;line-height:1.4;margin:8px 0} #done{margin-top:18px;width:100%;padding:14px;border-radius:12px;background:#0284C7;border:0;color:#fff;font-size:17px;font-weight:800}
  #btns{position:absolute;right:8px;top:8px;display:flex;flex-direction:column;gap:8px}
  button{background:rgba(22,18,16,.78);color:#F8FAFC;border:1px solid #334155;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700}
</style></head>
<body>
<div id="stage"><div id="wrap"><video id="v" playsinline muted></video><canvas id="c"></canvas></div></div>
<div id="hud"><div class="t" id="rep">GET READY</div>
  <div class="row"><div class="ic" id="i_depth"></div>Depth</div>
  <div class="row"><div class="ic" id="i_hands"></div>Hands</div>
  <div class="row"><div class="ic" id="i_lockout"></div>Lockout</div>
  <div class="row"><div class="ic" id="i_speed"></div>Speed</div></div>
<div id="btns"><button id="flip">Flip camera</button><button id="reset">New set</button></div>
<div id="msg">Loading the coach…</div>
<div id="sum"></div>
<div id="banner">Place your phone about 2 m away, beside you, so your arms are in view. Hold the weights up for a second to start.</div>
<script>${CORE_JS}</script>
<script type="module">
  import { PoseLandmarker, FilesetResolver } from "${VISION}/vision_bundle.mjs";
  var q = new URLSearchParams(location.search);
  var cfg = window.__CONFIG || {};
  var src = q.get("src") || cfg.src || null;
  var facing = q.get("facing") || cfg.facing || "user";
  var lang = q.get("lang") || cfg.lang || "hi";  // "hi" = Hinglish, "en" = English
  function T(en, hi) { return lang === "hi" ? hi : en; }
  var v = document.getElementById("v"), c = document.getElementById("c"), ctx = c.getContext("2d");
  var msg = document.getElementById("msg"), banner = document.getElementById("banner");
  function post(o) { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch (e) {} }
  function status(t) { msg.textContent = t; msg.style.display = t ? "block" : "none"; post({ type: "status", text: t }); }
  window.__live = { reps: [], view: null, done: false, frames: 0, error: null, log: [] };
  var logUrl = q.get("log");  // test hook: ship every landmark frame to a collector so a run can be replayed offline

  var coach = CORE.createCoach();
  var IDX = { shoulder: [11, 12], elbow: [13, 14], wrist: [15, 16], hip: [23, 24] };
  function toFrame(res, t) {
    var lm = res.landmarks && res.landmarks[0], wl = res.worldLandmarks && res.worldLandmarks[0];
    if (!lm || !wl) return null;
    var kp = {};
    ["left", "right"].forEach(function (side, si) {
      Object.keys(IDX).forEach(function (part) {
        var i = IDX[part][si], a = lm[i], b = wl[i];
        kp[side + "_" + part] = [a.x, a.y, a.visibility == null ? 0.9 : a.visibility, b.x, b.y, b.z];
      });
    });
    return { t: t, w: v.videoWidth, h: v.videoHeight, kp: kp };
  }

  function icon(id, st) {
    var el = document.getElementById("i_" + id);
    el.className = "ic" + (st ? " " + st : "");
    el.textContent = st === "good" ? "\\u2713" : st === "almost" ? "!" : st === "fix" ? "\\u2715" : st === "unsure" ? "?" : "";
  }
  function line(a, b, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(a[0] * c.width, a[1] * c.height); ctx.lineTo(b[0] * c.width, b[1] * c.height); ctx.stroke(); }
  function dot(p, col, r) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0] * c.width, p[1] * c.height, r, 0, 7); ctx.fill(); }

  function render(view) {
    ctx.clearRect(0, 0, c.width, c.height);
    var k = c.width / 540, thick = Math.max(8, c.width * 0.03);
    view.arms.forEach(function (a) {
      if (a.gel) {
        ctx.globalAlpha = 0.5;
        line(a.sh, a.gel, "#6EEB3C", thick); line(a.gel, a.gwr, "#6EEB3C", thick); dot(a.gel, "#6EEB3C", thick * 0.8); dot(a.gwr, "#6EEB3C", thick * 0.8);
        ctx.globalAlpha = 1;
        line(a.wr, a.gwr, "#FFC300", Math.max(3, thick / 4));
      }
      var fore = view.checks.hands === "fix" ? "#F54646" : view.checks.hands === "almost" ? "#FFAF00" : "#FAFAFA";
      line(a.sh, a.el, "#FAFAFA", Math.max(3, thick / 4)); line(a.el, a.wr, fore, Math.max(3, thick / 4));
      dot(a.sh, "#FAFAFA", thick / 3); dot(a.el, "#FAFAFA", thick / 3); dot(a.wr, "#FAFAFA", thick / 3);
    });
    ["depth", "hands", "lockout", "speed"].forEach(function (key) { icon(key, view.checks[key] || null); });
    document.getElementById("rep").textContent = view.repIndex ? "REP " + view.repIndex : "GET READY";
    banner.textContent = lang === "hi" ? view.messageHi : view.message;
    banner.className = view.tone === "good" || view.tone === "almost" || view.tone === "fix" ? view.tone : "";
  }

  var modelName = q.get("model") || cfg.model || "heavy";  // most accurate; drops to a lighter one by itself if the phone is slow
  var ORDER = ["heavy", "full", "lite"];
  var MODELS = ${JSON.stringify(MODELS)};
  var files, landmarker, stream = null, running = false, lastTs = -1, lastMedia = -1, summaryShown = false;
  var shown = { text: "", tone: "", checks: "", rep: "" };

  async function makeLandmarker(name) {
    var make = function (delegate) { return PoseLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: MODELS[name], delegate: delegate }, runningMode: "VIDEO", numPoses: 1 }); };
    try { return await make("GPU"); } catch (e) { return await make("CPU"); }
  }

  async function startSource() {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    if (src) { v.src = src; v.muted = true; v.playsInline = true; await v.play(); document.getElementById("stage").classList.remove("mirror"); return; }
    // A small picture is plenty for pose and keeps every frame cheap to analyse.
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 30 } }, audio: false });
    v.srcObject = stream; await v.play();
    document.getElementById("stage").classList.toggle("mirror", facing === "user");
  }

  // Analyse each NEW camera frame exactly once. If we are behind, frames are skipped, never queued, so the picture stays live.
  function next() {
    if (!running) return;
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(onFrame);
    else setTimeout(function () { onFrame(performance.now(), null); }, 30);
  }
  function onFrame(now, meta) {
    if (!running) return;
    var pause = false;
    try { pause = process(now, meta); } catch (e) { window.__live.error = String(e && e.stack || e); status("Problem: " + (e && e.message || e)); return; }
    if (src && v.ended) { window.__live.done = true; if (logUrl) fetch(logUrl, { method: "POST", body: JSON.stringify({ width: v.videoWidth, height: v.videoHeight, frames: window.__live.log }) }); return; }
    if (!pause) next();
  }

  function setView(view) {
    var txt = lang === "hi" ? view.messageHi : view.message;
    var tone = view.tone === "good" || view.tone === "almost" || view.tone === "fix" ? view.tone : "";
    if (txt !== shown.text) { banner.textContent = txt; shown.text = txt; }
    if (tone !== shown.tone) { banner.className = tone; shown.tone = tone; }
    var ck = JSON.stringify(view.checks);
    if (ck !== shown.checks) { shown.checks = ck; ["depth", "hands", "lockout", "speed"].forEach(function (key) { icon(key, view.checks[key] || null); }); }
    var rep = view.repIndex ? "REP " + view.repIndex : "GET READY";
    if (rep !== shown.rep) { document.getElementById("rep").textContent = rep; shown.rep = rep; }
  }

  function process(now, meta) {
    if (!(v.readyState >= 2 && v.videoWidth)) return false;
    var mt = meta && meta.mediaTime != null ? meta.mediaTime : v.currentTime;
    if (mt === lastMedia) return false;  // this frame was already analysed
    lastMedia = mt;
    if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
    var ts = src ? Math.round(mt * 1000) : Math.round(now);
    if (ts <= lastTs) ts = lastTs + 1;
    lastTs = ts;
    var L = window.__live, t0 = performance.now();
    var res = landmarker.detectForVideo(v, ts);
    var ms = performance.now() - t0;
    L.ms = L.ms ? L.ms * 0.9 + ms * 0.1 : ms; L.msMax = Math.max(L.msMax || 0, ms);
    L.frames++;
    var f = toFrame(res, src ? mt : now / 1000);
    if (f && logUrl) L.log.push(f);
    if (f) {
      var out = coach.update(f);
      render(out.view);
      setView(out.view);
      L.view = out.view; L.reps = coach.reps();
      out.events.forEach(function (e) {
        if (e.type === "rep_done") { post({ type: "speak", en: e.speak.en, hi: e.speak.hi }); post({ type: "rep", index: e.index, checks: e.checks }); }
      });
    } else {
      ctx.clearRect(0, 0, c.width, c.height);
      var txt = T("I cannot see you. Step back so your arms are in view.", "Main aapko dekh nahi pa raha. Peeche hato, haath dikhne chahiye.");
      if (txt !== shown.text) { banner.textContent = txt; banner.className = ""; shown.text = txt; shown.tone = ""; }
    }
    // Slow phone? After a short warm-up, step down to a lighter model once, instead of letting the picture lag.
    if (!src && L.frames === 30 && L.ms > 85 && ORDER.indexOf(modelName) < ORDER.length - 1) { downgrade(); return true; }
    return false;
  }

  async function downgrade() {
    running = false;
    modelName = ORDER[ORDER.indexOf(modelName) + 1];
    status(T("Making it faster for your phone…", "Aapke phone ke liye tez kar raha hoon…"));
    try { landmarker.close(); } catch (e) {}
    landmarker = await makeLandmarker(modelName);
    window.__live.model = modelName; window.__live.frames = 0; window.__live.ms = 0; lastTs = -1;
    status(""); running = true; next();
  }

  // ---------- end-of-set summary
  function showSummary() {
    summaryShown = true; running = false;
    document.getElementById("banner").style.display = "none"; document.getElementById("hud").style.display = "none"; document.getElementById("btns").style.display = "none";
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    var sm = CORE.summarize(coach.reps());
    var el = document.getElementById("sum");
    var h = '<div class="card"><div class="big">' + T("Your set", "Aapka set") + '</div><div class="sub">' + sm.count + ' ' + T(sm.count === 1 ? "rep" : "reps", "rep") + '</div>';
    sm.rows.forEach(function (r) {
      h += '<div class="srow"><b>Rep ' + r.index + '</b>';
      r.checks.forEach(function (c) { h += '<span class="ic ' + c.status + '">' + (c.status === "good" ? "\u2713" : c.status === "almost" ? "!" : c.status === "fix" ? "\u2715" : "?") + '</span>'; });
      h += '</div>';
    });
    h += '<div class="big nx">' + T("Next set", "Agla set") + '</div>';
    if (!sm.count) h += '<p>' + T("I did not see a full rep. Hold the weights up, lower them, and push back up.", "Mujhe poora rep nahi dikha. Weight upar pakdo, neeche lao, phir upar dhakelo.") + '</p>';
    else if (!sm.focus.length) h += '<p>' + T("Clean set. Keep it up!", "Badhiya set. Aise hi chalte raho!") + '</p>';
    sm.focus.forEach(function (f) { h += '<p>' + (lang === "hi" ? f.hi : f.en) + '</p>'; });
    h += '<button id="done">' + T("Done", "Theek hai") + '</button></div>';
    el.innerHTML = h; el.style.display = "flex";
    document.getElementById("done").onclick = function () { post({ type: "done" }); };
    var spoken = sm.count ? (sm.focus.length ? (lang === "hi" ? sm.focus[0].hi : sm.focus[0].en) : T("Clean set.", "Badhiya set.")) : "";
    if (spoken) post({ type: "speak", en: sm.count + " reps. " + (sm.focus[0] ? sm.focus[0].en : "Clean set."), hi: sm.count + " rep. " + (sm.focus[0] ? sm.focus[0].hi : "Badhiya set.") });
  }
  window.__finish = showSummary;
  window.__setLang = function (l) {
    lang = l; shown.text = "";
    document.getElementById("flip").textContent = T("Flip camera", "Camera badlo"); document.getElementById("reset").textContent = T("New set", "Naya set");
    if (window.__live.view) setView(window.__live.view);
  };

  async function boot() {
    try {
      status(T("Loading the coach… (first time takes a moment)", "Coach load ho raha hai… (pehli baar time lagta hai)"));
      files = await FilesetResolver.forVisionTasks("${VISION}/wasm");
      landmarker = await makeLandmarker(modelName);
      window.__live.model = modelName;
      status(T("Starting the camera…", "Camera shuru ho raha hai…"));
      await startSource();
      status("");
      running = true; next();
    } catch (e) {
      window.__live.error = String(e && e.message || e);
      status(T("Could not start: ", "Shuru nahi hua: ") + window.__live.error);
    }
  }
  banner.textContent = T("Place your phone about 2 m away, beside you, so your arms are in view. Hold the weights up for a second to start.", "Phone ko 2 meter door, apni side mein rakho, haath dikhne chahiye. Shuru karne ke liye weight ek second upar pakdo.");
  document.getElementById("flip").textContent = T("Flip camera", "Camera badlo"); document.getElementById("reset").textContent = T("New set", "Naya set");
  document.getElementById("flip").onclick = function () { facing = facing === "user" ? "environment" : "user"; lastMedia = -1; startSource(); };
  document.getElementById("reset").onclick = function () { coach = CORE.createCoach(); window.__live.reps = []; shown = { text: "", tone: "", checks: "", rep: "" }; ["depth", "hands", "lockout", "speed"].forEach(function (k) { icon(k, null); }); banner.textContent = T("New set. Hold the weights up for a second.", "Naya set. Weight ek second upar pakdo."); banner.className = ""; };
  if (src) document.getElementById("btns").style.display = "none";
  boot();
</script>
</body></html>`;
}
