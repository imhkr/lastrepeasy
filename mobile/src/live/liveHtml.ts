import { RUNTIME_JS } from "./runtime.generated.ts";

// The page that runs inside the app's WebView.
//
// MediaPipe pose runs on the phone (WASM/GPU) and the camera never leaves the device. The judging
// comes from RUNTIME_JS, which is generated from the same TypeScript the node tests run and from
// the same rubric JSON the backend uses -- so there is no second copy of the thresholds to drift.
// What lives here is only the DOM: video, canvas, HUD, and the message plumbing to the app.
//
// It talks to the app with postMessage:
//   {type:"status", text}        loading / errors
//   {type:"ready", view, reason} the camera is positioned correctly (or why not)
//   {type:"speak", en, hi}       a cue to read aloud
//   {type:"rep", index, checks}  a rep finished
//   {type:"done"}                set over
//
// For desktop testing it can read a video file instead of the camera:
//   page?src=clip.mp4&exercise=low_incline_db_press
const VISION = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3";
const MODELS: Record<string, string> = {
  lite: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
  full: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
  heavy: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
};

export type LiveHtmlOpts = {
  exerciseId: string; // which rubric to judge with; no default, because guessing was the old bug
  facing?: "user" | "environment";
  lang?: "hi" | "en";
  src?: string | null; // a local clip instead of the camera, for testing
};

export function liveHtml(opts: LiveHtmlOpts): string {
  const cfg = {
    exercise: opts.exerciseId,
    facing: opts.facing ?? "user",
    lang: opts.lang ?? "hi",
    src: opts.src ?? null,
  };
  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:#0B0F17;color:#F8FAFC;font-family:-apple-system,Roboto,Helvetica,Arial,sans-serif;overflow:hidden}
  #stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  #stage.mirror video,#stage.mirror canvas{transform:scaleX(-1)}
  #wrap{position:relative;max-width:100%;max-height:100%}
  video,canvas{display:block;max-width:100vw;max-height:100vh}
  canvas{position:absolute;left:0;top:0;width:100%;height:100%}
  #hud{position:absolute;left:10px;top:10px;background:rgba(12,16,24,.72);border-radius:14px;padding:10px 14px;min-width:176px;
       backdrop-filter:blur(8px);border:1px solid rgba(148,163,184,.16)}
  #hud .t{font-weight:800;font-size:12px;letter-spacing:.07em;color:#94A3B8;margin-bottom:8px}
  .row{display:flex;align-items:center;gap:9px;margin:6px 0;font-weight:700;font-size:14px;color:#E2E8F0}
  .row .v{margin-left:auto;font-variant-numeric:tabular-nums;color:#94A3B8;font-weight:700;font-size:12px}
  .ic{width:18px;height:18px;border-radius:9px;border:2px solid #475569;display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:900;color:#0B0F17;flex:none;transition:background .15s,border-color .15s}
  .good{background:#3CEB6E;border-color:#3CEB6E}
  .almost{background:#FFAF00;border-color:#FFAF00}
  .fix{background:#F54646;border-color:#F54646;color:#fff}
  .unsure{background:#475569;border-color:#475569;color:#CBD5E1}
  #banner{position:absolute;left:0;right:0;bottom:0;padding:18px 20px 24px;min-height:72px;text-align:center;font-weight:800;font-size:20px;
          line-height:1.35;background:linear-gradient(to top,rgba(9,12,19,.96),rgba(9,12,19,.78) 72%,transparent);
          border-bottom:5px solid transparent}
  #banner.good{border-color:#3CEB6E} #banner.almost{border-color:#FFAF00} #banner.fix{border-color:#F54646}
  #msg{position:absolute;left:0;right:0;top:44%;text-align:center;padding:0 26px;font-size:15px;line-height:1.5;color:#CBD5E1}
  #sum{position:absolute;inset:0;background:rgba(11,15,23,.98);display:none;align-items:center;justify-content:center;overflow:auto;z-index:6}
  #sum .card{width:100%;max-width:430px;padding:24px}
  #sum .big{font-size:25px;font-weight:800;margin-bottom:4px}
  #sum .nx{margin-top:22px;color:#6EEB3C;font-size:18px;font-weight:800}
  #sum .sub{color:#94A3B8;margin-bottom:16px}
  #sum .srow{display:flex;align-items:center;gap:8px;margin:9px 0;font-weight:700}
  #sum .srow b{width:62px;color:#94A3B8;font-size:13px}
  #sum p{font-size:16px;line-height:1.45;margin:9px 0}
  #done{margin-top:20px;width:100%;padding:15px;border-radius:13px;background:#0284C7;border:0;color:#fff;font-size:17px;font-weight:800}
  #btns{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:8px}
  button.side{background:rgba(12,16,24,.78);color:#F8FAFC;border:1px solid #334155;border-radius:11px;
              padding:9px 13px;font-size:13px;font-weight:700;backdrop-filter:blur(8px)}
</style></head>
<body>
<div id="stage"><div id="wrap"><video id="v" playsinline muted></video><canvas id="c"></canvas></div></div>
<div id="hud"><div class="t" id="rep">GET READY</div><div id="rows"></div></div>
<div id="btns"><button class="side" id="flip">Flip camera</button><button class="side" id="reset">New set</button></div>
<div id="msg"></div>
<div id="sum"></div>
<div id="banner"></div>
<script>${RUNTIME_JS}</script>
<script type="module">
  import { PoseLandmarker, FilesetResolver } from "${VISION}/vision_bundle.mjs";

  var q = new URLSearchParams(location.search);
  var cfg = Object.assign(${JSON.stringify(cfg)}, window.__CONFIG || {});
  var src = q.get("src") || cfg.src || null;
  var facing = q.get("facing") || cfg.facing || "user";
  var lang = q.get("lang") || cfg.lang || "hi";   // "hi" = Hinglish, "en" = English
  var exerciseId = q.get("exercise") || cfg.exercise || "";

  function T(en, hi) { return lang === "hi" ? hi : en; }
  var v = document.getElementById("v"), c = document.getElementById("c"), ctx = c.getContext("2d");
  var msg = document.getElementById("msg"), banner = document.getElementById("banner");
  var sumEl = document.getElementById("sum");
  var rowsEl = document.getElementById("rows");

  function post(o) { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch (e) {} }
  function status(t) { msg.textContent = t || ""; msg.style.display = t ? "block" : "none"; if (t) post({ type: "status", text: t }); }

  window.__live = { reps: [], frames: 0, error: null, exercise: exerciseId, calibrated: false };

  // ---- the rubric decides which rows the HUD shows. Nothing here hardcodes check names, so
  // adding an exercise is a JSON edit, not a page edit.
  var rubric = null, RUBRIC_ERR = null;
  try { rubric = LIVE.engine.getRubric(exerciseId); }
  catch (e) { RUBRIC_ERR = String(e && e.message || e); }
  var CHECKS = rubric ? rubric.checks : [];
  var REQUIRED_VIEW = rubric ? rubric.view : undefined;
  // Which geometry counts a rep for THIS exercise. A press is wrist-off-shoulder; a squat is
  // hip-above-foot. The rubric declares it, so adding a family is still a JSON edit.
  var TRACK = rubric && rubric.track ? rubric.track : undefined;
  // What "ready to start" looks like depends on the movement: a press starts with the weight held
  // up, a squat starts standing. Telling a squatting user to "hold the weights up" was leftover
  // press wording that only made sense for one family.
  var START = rubric && rubric.start_cue ? rubric.start_cue : {
    en: "Hold the weights up, then lower them slowly.",
    hi: "Weight upar pakdo, phir dheere neeche lao."
  };

  rowsEl.innerHTML = "";
  CHECKS.forEach(function (ch) {
    var row = document.createElement("div");
    row.className = "row";
    row.innerHTML = '<span class="ic" id="ic_' + ch.id + '"></span><span>' + ch.label + '</span><span class="v" id="val_' + ch.id + '"></span>';
    rowsEl.appendChild(row);
  });
  function iconEl(id) { return document.getElementById("ic_" + id); }
  function valEl(id) { return document.getElementById("val_" + id); }
  var GLYPH = { good: "\\u2713", almost: "!", fix: "\\u2715", unsure: "?" };
  function showCheck(ch, st, value, unit) {
    var el = iconEl(ch.id); if (!el) return;
    el.className = "ic" + (st ? " " + st : "");
    el.textContent = st ? GLYPH[st] : "";
    var vv = valEl(ch.id);
    if (vv) {
      if (!Number.isFinite(value)) vv.textContent = "";
      else if (ch && ch.measure === "eccentric_seconds") vv.textContent = value.toFixed(1) + "s";
      else vv.textContent = Math.round(value) + (unit || "");
    }
  }

  // ---- which joints to highlight: the check tells us the joint, the segmenter tells us the side
  var JOINT_PART = { elbow: "elbow", knee: "knee", wrist: "wrist", ankle: "ankle", shoulder: "shoulder", hip: "hip" };

  // ---- landmarks: MediaPipe index -> "<side>_<part>", carrying world coords for the 3D measures
  var IDX = { shoulder: [11, 12], elbow: [13, 14], wrist: [15, 16], hip: [23, 24], knee: [25, 26], ankle: [27, 28], heel: [29, 30], foot_index: [31, 32] };
  function toLandmarks(res) {
    var lm = res.landmarks && res.landmarks[0], wl = res.worldLandmarks && res.worldLandmarks[0];
    if (!lm) return null;
    var out = {};
    ["left", "right"].forEach(function (side, si) {
      Object.keys(IDX).forEach(function (part) {
        var i = IDX[part][si], a = lm[i];
        if (!a) return;
        var b = (wl && wl[i]) || null;
        out[side + "_" + part] = {
          x: a.x, y: a.y, vis: a.visibility == null ? 0 : a.visibility,
          wx: b ? b.x : undefined, wy: b ? b.y : undefined, wz: b ? b.z : undefined
        };
      });
    });
    return out;
  }

  // ---- overlay: the lifter's REAL skeleton, thin and grey, with only the judged joint coloured.
  // A bone is drawn only when both of its landmarks were actually tracked, so a lost limb leaves a
  // gap instead of inventing an arm -- which is what made the old ghost look like a cartoon.
  function paint(lm, verdicts) {
    ctx.clearRect(0, 0, c.width, c.height);
    if (!lm) return;
    var W = c.width, H = c.height;
    var worst = LIVE.engine.worstCue(verdicts);
    var highlight = null;
    if (worst) {
      var spec = null;
      for (var i = 0; i < CHECKS.length; i++) if (CHECKS[i].id === worst.id) spec = CHECKS[i];
      var part = spec && JOINT_PART[spec.joint || ""] || null;
      var side = seg ? seg.side() : null;
      if (part && side) highlight = side + "_" + part;
    }
    var hlColor = worst ? (worst.status === "fix" ? "#F54646" : worst.status === "almost" ? "#FFAF00" : "#3CEB6E") : "#3CEB6E";
    var items = LIVE.overlay.buildSkeleton(lm, {
      width: 2,
      color: "rgba(226,232,240,0.40)",
      highlight: highlight,
      highlightColor: hlColor,
      vis: 0.5
    });
    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      if (it.kind === "bone") {
        ctx.strokeStyle = it.color; ctx.lineWidth = it.width; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(it.a.x * W, it.a.y * H); ctx.lineTo(it.b.x * W, it.b.y * H); ctx.stroke();
      } else if (it.kind === "joint") {
        ctx.fillStyle = it.color;
        ctx.beginPath(); ctx.arc(it.at.x * W, it.at.y * H, it.r * 1.6, 0, 7); ctx.fill();
      }
    }
  }

  // ---- session state
  var modelName = q.get("model") || cfg.model || "heavy";
  var ORDER = ["heavy", "full", "lite"];
  var MODELS = ${JSON.stringify(MODELS)};
  var files, landmarker, stream = null, running = false;
  var lastTs = -1, lastMedia = -1, summaryShown = false, speakAt = 0;
  var seg = null, frameWindow = [], repsDone = [], lastCueKey = "";
  var viewOk = false, gateReason = "";
  var lastVerdicts = [], lastBanner = null, lostPoseFrames = 0, badViewFrames = 0;

  async function makeLandmarker(name) {
    var make = function (delegate) {
      return PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODELS[name], delegate: delegate },
        runningMode: "VIDEO", numPoses: 1
      });
    };
    try { return await make("GPU"); } catch (e) { return await make("CPU"); }
  }

  async function startSource() {
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    if (src) { v.src = src; v.muted = true; v.playsInline = true; await v.play(); document.getElementById("stage").classList.remove("mirror"); return; }
    // 480x360 is plenty for pose and keeps every frame cheap; the picture is still sharp on screen.
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 30 } },
      audio: false
    });
    v.srcObject = stream; await v.play();
    document.getElementById("stage").classList.toggle("mirror", facing === "user");
  }

  function next() {
    if (!running) return;
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(onFrame);
    else setTimeout(function () { onFrame(performance.now()); }, 30);
  }

  function onFrame(now) {
    if (!running) return;
    var pause = false;
    try { pause = process(now); }
    catch (e) { window.__live.error = String(e && e.stack || e); status("Problem: " + (e && e.message || e)); return; }
    if (src && v.ended) { window.__live.done = true; showSummary(); return; }
    if (!pause) next();
  }

  function setBanner(text, tone) {
    if (banner.textContent !== text) banner.textContent = text;
    var cls = tone === "good" || tone === "almost" || tone === "fix" ? tone : "";
    if (banner.className !== cls) banner.className = cls;
  }

  function showStickyBanner() {
    if (!lastBanner) return false;
    var prefix = lastBanner.repIndex ? "Rep " + lastBanner.repIndex + " · " : "";
    setBanner(prefix + T(lastBanner.en, lastBanner.hi), lastBanner.tone);
    return true;
  }

  // Speak completed-rep verdicts immediately (deduplicated by rep+cue key); throttle non-rep cues.
  function say(key, en, hi, immediate) {
    if (key === lastCueKey) return;
    var t = performance.now();
    if (!immediate && t - speakAt < 1800) return;
    lastCueKey = key; speakAt = t;
    post({ type: "speak", en: en, hi: hi });
  }

  function process(now) {
    if (!(v.readyState >= 2 && v.videoWidth)) return false;
    var mt = src ? v.currentTime : 0;
    if (src && mt === lastMedia) return false;
    lastMedia = mt;
    if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
    var ts = src ? Math.round(mt * 1000) : Math.round(now);
    if (ts <= lastTs) ts = lastTs + 1;
    lastTs = ts;

    var t0 = performance.now();
    var res = landmarker.detectForVideo(v, ts);
    var ms = performance.now() - t0;
    var L = window.__live;
    L.ms = L.ms ? L.ms * 0.9 + ms * 0.1 : ms; L.msMax = Math.max(L.msMax || 0, ms);
    L.frames++;

    var lm = toLandmarks(res);
    if (!lm) {
      lostPoseFrames++;
      paint(null, []);
      if (lostPoseFrames >= 15 && !showStickyBanner()) {
        setBanner(T("I cannot see you. Step back so your whole body is in view.",
                    "Main aapko dekh nahi pa raha. Peeche hato, poora shareer dikhna chahiye."), "");
      } else if (lostPoseFrames >= 15 && lastBanner) {
        showStickyBanner();
      }
      return false;
    }
    lostPoseFrames = 0;

    var aspect = c.width / c.height;
    // Frames are kept with their timestamps so a finished rep can be judged on exactly the
    // frames that spanned it, and so each check can be sliced to its own phase.
    frameWindow.push({ t: src ? mt : now / 1000, lm: lm });
    if (frameWindow.length > 600) frameWindow.shift();

    // ---- view gate, before any judging. A wrong camera distorts every number the same way, so
    // this says "move" instead of producing a confident verdict from a bad angle.
    if (L.frames % 5 === 0) {
      var reading = LIVE.engine.detectView(frameWindow.slice(-30).map(function (fr) { return fr.lm; }), c.width / c.height);
      var gate = LIVE.engine.gateView(reading.view, REQUIRED_VIEW);
      if (gate.ok !== viewOk || (gate.ok === false && gate.reason !== gateReason)) {
        viewOk = gate.ok; gateReason = gate.reason;
        post({ type: "ready", view: reading.view, reason: gate.reason });
        if (!viewOk) lastCueKey = "";
      }
    }
    if (viewOk) badViewFrames = 0;
    else badViewFrames++;
    if (REQUIRED_VIEW && REQUIRED_VIEW !== "any" && !viewOk && (!(seg && seg.pending()) || badViewFrames >= 15)) {
      paint(lm, lastVerdicts);
      if (!showStickyBanner()) setBanner(gateText(), "");
      return false;
    }

    if (!seg) seg = LIVE.segment.createSegmenter({ track: TRACK });
    var nowT = src ? mt : now / 1000;
    var rep = seg.update(lm, nowT);

    // Snapshot the bottom as it happens. A live camera cannot be rewound, so the only way to send
    // the backend the frame where the lifter was lowest is to notice the moment it is happening:
    // the segmenter moves its own bottomT when a new low is reached, and that is the trigger.
    if (seg.pending()) {
      var pend = seg.pending();
      if (pend && pend.bottomT >= nowT - 1e-3 && pend.bottomT !== kfBottomT) {
        if (!kfBottomT || nowT - kfBottomT >= 0.25) {
          kfBottomT = pend.bottomT;
          kfBottom = snap();
        }
      }
    }

    // Keep the last completed rep's verdicts/banner visible between reps so the lifter can read
    // the mistake without it flashing away mid-rest or during the next rep's setup.
    if (!rep) {
      paint(lm, lastVerdicts);
      if (!showStickyBanner()) setBanner(T(START.en, START.hi), "");
    } else {
      finishRep(rep, lm, aspect);
    }

    // Slow phone? After a short warm-up, step down one model once instead of letting the picture lag.
    if (!src && L.frames === 40 && L.ms > 90 && ORDER.indexOf(modelName) < ORDER.length - 1) { downgrade(); return true; }
    return false;
  }

  function specFor(id) {
    for (var i = 0; i < CHECKS.length; i++) if (CHECKS[i].id === id) return CHECKS[i];
    return { id: id, label: id, good: [0, 0] };
  }

  // Judge a rep against the rubric, on exactly the frames that span it. Two-pointer timestamp
  // matching keeps frames and progress aligned even if a frame was dropped mid-rep.
  function judge(r, aspect) {
    var side = seg.side() || "right";
    var times = r.times && r.times.length ? r.times : [];
    var frames = [], progress = [];
    if (times.length && r.progress && r.progress.length === times.length) {
      var wi = 0;
      for (var i = 0; i < times.length; i++) {
        var targetT = times[i];
        while (wi < frameWindow.length && frameWindow[wi].t < targetT - 1e-4) wi++;
        if (wi < frameWindow.length && Math.abs(frameWindow[wi].t - targetT) <= 1e-4) {
          frames.push(frameWindow[wi].lm);
          progress.push(r.progress[i]);
          wi++;
        }
      }
    }
    if (frames.length < 3) {
      var t0 = times.length ? times[0] : r.startT;
      var t1 = times.length ? times[times.length - 1] : r.endT;
      var win = frameWindow.filter(function (fr) { return fr.t >= t0 - 1e-3 && fr.t <= t1 + 1e-3; });
      frames = (win.length >= 3 ? win : frameWindow.slice(-Math.max(3, r.progress.length))).map(function (fr) { return fr.lm; });
      progress = undefined;
    }
    return LIVE.engine.evaluateAll({
      exerciseId: exerciseId,
      side: side,
      frames: frames,
      aspect: aspect,
      progress: progress,
      secondsAvailable: r.eccentricSeconds == null ? undefined : r.eccentricSeconds,
      pressAxis: seg.axis() || undefined
    });
  }

  // ---- keyframes for the second opinion
  //
  // The on-device judge is the authority during the set, but a 2D angle cannot see a shoulder
  // shrug or a flared elbow, so the backend gets a look at two stills: the bottom of the rep and
  // the top. Only two, because each one is a round trip and the model charges per image.
  //
  // Capture happens AS the rep happens, not afterwards, because a live camera cannot be rewound.
  // The deepest point is detected from the segmenter's own bottom timestamp, so the frame captured
  // really is the bottom rather than whichever frame happened to be current at the end.
  var kfBottom = null, kfBottomT = null;
  var kfWant = true;
  // One JPEG, small enough to send: 640 px on the long side is plenty for a model to see a
  // posture, and keeps the upload under a few tens of KB.
  function snap() {
    try {
      if (!kfWant || !v || !v.videoWidth) return null;
      var maxSide = 640;
      var s = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
      var w = Math.max(1, Math.round(v.videoWidth * s)), h = Math.max(1, Math.round(v.videoHeight * s));
      var sc = document.createElement("canvas");
      sc.width = w; sc.height = h;
      sc.getContext("2d").drawImage(v, 0, 0, w, h);
      // The backend wants raw base64 with no data: prefix, and a JPEG is far smaller than a PNG
      // for a photo of a person.
      return sc.toDataURL("image/jpeg", 0.6).split(",")[1] || null;
    } catch (e) { return null; }
  }

  function grabKeyframes(r) {
    if (!kfWant) return [];
    var out = [];
    var top = snap();
    if (kfBottom) out.push(kfBottom);
    if (top) out.push(top);
    kfBottom = null; kfBottomT = null;
    return out;
  }

  // Numbers the model can check instead of only guessing from pixels. The phone already measured
  // every check, so sending the values lets the backend see a disagreement it can name.
  function landmarkSummary(verdicts) {
    var out = [];
    try {
      var side = seg.side() || "right";
      verdicts.forEach(function (vd) {
        if (!isFinite(vd.value)) return;
        out.push({ check: vd.id, side: side, value: Math.round(vd.value * 10) / 10, status: vd.status });
      });
    } catch (e) {}
    return out;
  }

  function finishRep(r, lm, aspect) {
    var verdicts = judge(r, aspect);
    lastVerdicts = verdicts;
    verdicts.forEach(function (vd) { showCheck(specFor(vd.id), vd.status, vd.value, ""); });
    paint(lm, verdicts);

    var index = repsDone.length + 1;
    document.getElementById("rep").textContent = "REP " + index;
    var entry = { index: index, checks: verdicts.map(function (x) { return { id: x.id, label: x.label, status: x.status, value: x.value, cue: x.cue }; }) };
    repsDone.push(entry);
    window.__live.reps = repsDone;
    // Keyframes ride along so the app can ask the backend for a second opinion. They are captured
    // at the bottom of the rep, which is the frame that shows depth and joint alignment, plus the
    // current frame as the top. Sending them costs nothing locally; whether to actually ask the
    // backend is the app's decision, and it throttles that to one call at a time.
    post({ type: "rep", index: index, checks: entry.checks, keyframes: grabKeyframes(r), nrm: landmarkSummary(verdicts) });

    var w = LIVE.engine.worstCue(verdicts);
    var allUnsure = verdicts.length > 0 && verdicts.every(function (x) { return x.status === "unsure"; });
    if (w) {
      lastBanner = { en: w.cue.en, hi: w.cue.hi, tone: w.status, repIndex: index };
      showStickyBanner();
      say("rep" + index + ":" + w.id, "Rep " + index + ". " + w.cue.en, "Rep " + index + ". " + w.cue.hi, true);
    } else if (allUnsure) {
      lastBanner = { en: "Can't see clearly — adjust camera.", hi: "Camera theek se set karo.", tone: "almost", repIndex: index };
      showStickyBanner();
      say("rep" + index + ":unsure", "Rep " + index + ". Adjust camera angle.", "Rep " + index + ". Camera theek se set karo.", true);
    } else {
      lastBanner = { en: "Good rep!", hi: "Badhiya rep!", tone: "good", repIndex: index };
      showStickyBanner();
      say("rep" + index + ":good", "Rep " + index + ". Good rep.", "Rep " + index + ". Badhiya rep.", true);
    }
  }

  function gateText() {
    if (gateReason === "view_unknown") {
      return T("Step back so I can see your shoulders.", "Peeche hato taaki kandhe dikhein.");
    }
    // REQUIRED_VIEW may be a set of acceptable views, so pick the instruction from whichever one
    // the rubric would have judged: a rubric that accepts a profile wants "turn sideways", one
    // that accepts the front wants "face the phone".
    var want = Array.isArray(REQUIRED_VIEW) ? REQUIRED_VIEW : [REQUIRED_VIEW];
    if (want.indexOf("side") >= 0) {
      return T("Turn sideways to the phone, about 2 m away.", "Phone ki taraf side se khade ho, 2 meter door.");
    }
    if (want.indexOf("front") >= 0) {
      return T("Face the phone, about 2 m away.", "Phone ki taraf muh karo, 2 meter door.");
    }
    return T("Stand at a slight angle to the phone, about 2 m away.", "Phone se thoda angle par khade ho, 2 meter door.");
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

  // ---- end-of-set summary: one row per rep, then the single most important thing to fix
  function showSummary() {
    if (summaryShown) return;
    summaryShown = true; running = false;
    banner.style.display = "none"; document.getElementById("hud").style.display = "none";
    document.getElementById("btns").style.display = "none";
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });

    var h = '<div class="card"><div class="big">' + T("Your set", "Aapka set") + '</div>';
    h += '<div class="sub">' + repsDone.length + ' ' + T(repsDone.length === 1 ? "rep" : "reps", "rep") + '</div>';
    repsDone.forEach(function (r) {
      h += '<div class="srow"><b>Rep ' + r.index + '</b>';
      r.checks.forEach(function (ck) {
        h += '<span class="ic ' + ck.status + '">' + (GLYPH[ck.status] || "") + '</span>';
      });
      h += '</div>';
    });

    // The focus list: the worst failure per check across the set, one sentence each.
    var worstBy = {};
    repsDone.forEach(function (r) {
      r.checks.forEach(function (ck) {
        if (ck.status !== "fix" && ck.status !== "almost") return;
        var cur = worstBy[ck.id];
        if (!cur || (cur.status !== "fix" && ck.status === "fix")) worstBy[ck.id] = ck;
      });
    });
    var focus = Object.keys(worstBy).map(function (k) { return worstBy[k]; });
    h += '<div class="big nx">' + T("Next set", "Agla set") + '</div>';
    var allRepsUnsure = repsDone.length > 0 && repsDone.every(function (rep) {
      return (rep.checks || []).every(function (c) { return c.status === "unsure"; });
    });
    if (!repsDone.length) {
      h += '<p>' + T("I did not see a full rep. " + START.en,
                     "Mujhe poora rep nahi dikha. " + START.hi) + '</p>';
    } else if (allRepsUnsure) {
      h += '<p>' + T("Could not read your form clearly. Try a clearer camera angle.",
                     "Form saaf nahi dikha. Camera angle thoda better rakho.") + '</p>';
    } else if (!focus.length) {
      h += '<p>' + T("Clean set. Keep it up!", "Badhiya set. Aise hi chalte raho!") + '</p>';
    }
    focus.forEach(function (f) { h += '<p>' + (lang === "hi" ? f.cue.hi : f.cue.en) + '</p>'; });
    h += '<button id="done">' + T("Done", "Theek hai") + '</button></div>';

    sumEl.innerHTML = h; sumEl.style.display = "flex";
    document.getElementById("done").onclick = function () { post({ type: "done" }); };

    if (repsDone.length) {
      var lead = focus[0];
      post({
        type: "speak",
        en: repsDone.length + " reps. " + (lead ? lead.cue.en : "Clean set."),
        hi: repsDone.length + " rep. " + (lead ? lead.cue.hi : "Badhiya set.")
      });
    }
  }
  window.__finish = showSummary;
  window.__showCue = function (en, hi, tone, repIndex) {
    if (!en && !hi) return;
    lastBanner = { en: en || hi, hi: hi || en, tone: tone || "fix", repIndex: repIndex || repsDone.length || 0 };
    showStickyBanner();
  };
  window.__setLang = function (l) {
    lang = l; lastCueKey = "";
    document.getElementById("flip").textContent = T("Flip camera", "Camera badlo");
    document.getElementById("reset").textContent = T("New set", "Naya set");
    if (!repsDone.length) document.getElementById("rep").textContent = T("GET READY", "TAIYAAR HO JAO");
    showStickyBanner();
  };

  async function boot() {
    if (!rubric) {
      status(T("This exercise is not supported in the live coach yet.",
               "Yeh exercise live coach mein abhi supported nahi hai."));
      banner.textContent = RUBRIC_ERR || "";
      return;
    }
    try {
      status(T("Loading the coach… (first time takes a moment)", "Coach load ho raha hai… (pehli baar time lagta hai)"));
      files = await FilesetResolver.forVisionTasks("${VISION}/wasm");
      landmarker = await makeLandmarker(modelName);
      window.__live.model = modelName;
      status(T("Starting the camera…", "Camera shuru ho raha hai…"));
      await startSource();
      status("");
      banner.textContent = T("Place your phone about 2 m away beside you, so your whole body is in view.",
                             "Phone ko 2 meter door apni side mein rakho, poora shareer dikhna chahiye.");
      running = true; next();
    } catch (e) {
      window.__live.error = String(e && e.message || e);
      status(T("Could not start: ", "Shuru nahi hua: ") + window.__live.error);
    }
  }

  document.getElementById("flip").textContent = T("Flip camera", "Camera badlo");
  document.getElementById("reset").textContent = T("New set", "Naya set");
  document.getElementById("flip").onclick = function () {
    facing = facing === "user" ? "environment" : "user";
    seg = LIVE.segment.createSegmenter({ track: TRACK });
    frameWindow = []; kfBottom = null; kfBottomT = null; badViewFrames = 0; viewOk = false;
    lastMedia = -1; startSource();
  };
  document.getElementById("reset").onclick = function () {
    seg = LIVE.segment.createSegmenter({ track: TRACK });
    frameWindow = []; repsDone = []; lastCueKey = ""; kfBottom = null; kfBottomT = null;
    lastVerdicts = []; lastBanner = null; lostPoseFrames = 0; badViewFrames = 0;
    window.__live.reps = [];
    document.getElementById("rep").textContent = T("GET READY", "TAIYAAR HO JAO");
    CHECKS.forEach(function (ch) { showCheck(ch, null, NaN, ""); });
    banner.textContent = T("New set. ", "Naya set. ") + T(START.en, START.hi);
    banner.className = "";
  };
  if (src) document.getElementById("btns").style.display = "none";
  boot();
</script>
</body></html>`;
}
