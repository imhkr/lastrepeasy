// Live set coach for the incline dumbbell press. Pure JavaScript kept in a string so the SAME code runs inside the
// camera WebView (src/live/liveHtml.ts) and in the node tests (src/live/__tests__). No imports, no DOM.
//
// Input per camera frame: { t: seconds, w, h: pixel size, kp: { "right_elbow": [x, y, visibility, wx, wy, wz], ... } }
// where x,y are 0-1 image coordinates and wx,wy,wz are MediaPipe world landmarks in metres. Joints used:
// shoulder, elbow, wrist, hip for each of left/right.
//
// Thresholds and wording mirror backend/app/services/press_coach.py. tests/fixtures/press_clip_landmarks.json is fed
// to both and they must agree.
export const CORE_JS = `
var CORE = (function () {
  var T = {
    DEPTH_GOOD: 105, DEPTH_ALMOST: 120, LOCK_GOOD: 155, LOCK_ALMOST: 140,
    HANDS_GOOD: 30, HANDS_ALMOST: 50, DOWN_GOOD: 0.9, DOWN_FAST: 0.45,
    TOP_P: 0.8, BOTTOM_P: 0.35, ARMS_EVEN: 25, ARMS_VIS: 0.7, MIN_VIS: 0.6, LOST_VIS: 0.4, CAL_ELBOW: 120,
    SEEN: { depth: 0.25, lockout: 0.5, hands: 0.6 }, TARGET_BOTTOM: 90, TARGET_TOP: 170
  };
  var LABELS = { depth: 'Depth', hands: 'Hands', lockout: 'Lockout', speed: 'Speed', arms: 'Arms' };
  var PRIORITY = ['depth', 'hands', 'lockout', 'speed', 'arms'];
  var MSG = {
    depth: { good: 'Great depth. Elbows went low.', almost: 'Go a little lower.', fix: 'Go lower. Bring the weights near your chest.' },
    lockout: { good: 'Full lockout at the top.', almost: 'Press a bit higher at the top.', fix: 'Press all the way up until your arms are straight.' },
    hands: {
      good: 'Hands stayed over your elbows.',
      almost_head: 'Hands drift toward your head. Keep them over your elbows.',
      almost_feet: 'Hands drift toward your feet. Keep them over your elbows.',
      fix_head: 'Hands are far toward your head. Stack them straight over your elbows.',
      fix_feet: 'Hands are far toward your feet. Stack them straight over your elbows.'
    },
    speed: { good: 'Good, slow and controlled.', almost: 'A bit fast. Take 2 seconds going down.', fix: 'Too fast. Lower in 2 seconds, do not drop it.' },
    arms: { good: 'Both arms moved together.', fix: 'One arm is lower. Keep both arms even.' },
    unsure: {
      depth: 'I could not see your elbows clearly. Film from the side.',
      lockout: 'I could not see your arms clearly at the top. Film from the side.',
      hands: 'I could not see your hands clearly. Film from the side.'
    }
  };

  // ---- small vector helpers (arrays of any length)
  function sub(a, b) { var o = []; for (var i = 0; i < a.length; i++) o.push(a[i] - b[i]); return o; }
  function add(a, b) { var o = []; for (var i = 0; i < a.length; i++) o.push(a[i] + b[i]); return o; }
  function mul(a, k) { var o = []; for (var i = 0; i < a.length; i++) o.push(a[i] * k); return o; }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  function norm(a) { return Math.sqrt(dot(a, a)); }
  function unit(a) { var n = norm(a) + 1e-9; return mul(a, 1 / n); }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function angle(a, b, c) { return Math.acos(clamp(dot(unit(sub(a, b)), unit(sub(c, b))), -1, 1)) * 180 / Math.PI; }
  function median(arr) {
    if (!arr.length) return 0;
    var s = arr.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function pct(arr, q) {
    if (!arr.length) return 0;
    var s = arr.slice().sort(function (x, y) { return x - y; });
    return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1) + 0.5))];
  }
  function status(v, good, almost, smallerBetter) {
    if (smallerBetter) return v <= good ? 'good' : v <= almost ? 'almost' : 'fix';
    return v >= good ? 'good' : v >= almost ? 'almost' : 'fix';
  }
  function judge(key, seen, st) { return seen < T.SEEN[key] ? 'unsure' : st; }

  function createCoach() {
    var PARTS = ['shoulder', 'elbow', 'wrist', 'hip'];
    var arms = { left: newArm(), right: newArm() };
    var rs = { state: 'wait', rep: null, pending: null, prev: null };
    var hist = [];
    var done = [];
    var view = { message: 'Hold the weights up so I can see your arms.', tone: 'info', checks: {}, repIndex: 0 };
    var showUntil = -1;
    var targetKeys = null;

    function newArm() {
      return { buf: { shoulder: [], elbow: [], wrist: [], hip: [] }, vis: 0, up: null, upSum: null, upN: 0,
               hi: null, lo: null, visBuf: [], l1: [], l2: [], scale: null, active: false, cur: null };
    }

    function smoothed(arm, part, raw) {
      var b = arm.buf[part];
      b.push(raw);
      if (b.length > 5) b.shift();
      var out = [];
      for (var i = 0; i < raw.length; i++) out.push(median(b.map(function (r) { return r[i]; })));
      return out;
    }

    function updateArm(side, f) {
      var arm = arms[side];
      var raw = {};
      for (var i = 0; i < PARTS.length; i++) {
        var r = f.kp[side + '_' + PARTS[i]];
        if (!r) { arm.active = false; arm.cur = null; return null; }
        raw[PARTS[i]] = r;
      }
      var v = Math.min(raw.shoulder[2], raw.elbow[2], raw.wrist[2]);
      // The dumbbell often hides the wrist, so an arm joins on shoulder + elbow; only the hands check cares about the wrist.
      var vGate = Math.min(raw.shoulder[2], raw.elbow[2]);
      arm.vis = arm.vis ? arm.vis * 0.8 + vGate * 0.2 : vGate;  // steady, for deciding whether the arm is usable at all
      arm.visBuf.push(v); if (arm.visBuf.length > 5) arm.visBuf.shift();
      var vNow = median(arm.visBuf);  // what the tracker saw around now, for judging a check
      var P = {};
      for (var j = 0; j < PARTS.length; j++) P[PARTS[j]] = smoothed(arm, PARTS[j], raw[PARTS[j]]);
      // An arm joins once it has been seen clearly; after that we keep following it through the dips at the bottom,
      // and the checks say 'unsure' instead of guessing.
      arm.active = arm.vis >= T.LOST_VIS && (!!arm.up || arm.vis >= T.MIN_VIS);
      var S = P.shoulder.slice(3), E = P.elbow.slice(3), W = P.wrist.slice(3), H = P.hip.slice(3);
      var px = function (p) { return [p[0] * f.w, p[1] * f.h]; };
      var Si = px(P.shoulder), Ei = px(P.elbow), Wi = px(P.wrist);
      var elbow2d = angle(Si, Ei, Wi);
      var fdir = unit(sub(W, E));
      arm.l1.push(norm(sub(E, S))); arm.l2.push(norm(sub(W, E)));
      if (arm.l1.length > 60) { arm.l1.shift(); arm.l2.shift(); }

      if (arm.active && !arm.up && elbow2d >= T.CAL_ELBOW && vGate >= T.MIN_VIS) {  // set starts with the weights held up
        arm.upSum = arm.upSum ? add(arm.upSum, fdir) : fdir.slice();
        arm.upN++;
        if (arm.upN >= 6) arm.up = unit(arm.upSum);
      }
      if (!arm.active || !arm.up) { arm.cur = { elbow2d: elbow2d, vis: vNow, Si: Si, Ei: Ei, Wi: Wi, ready: false }; return arm.cur; }

      var rise = dot(sub(W, S), arm.up);
      var L = median(arm.l1) + median(arm.l2);
      if (arm.hi === null) { arm.hi = rise; arm.lo = rise - 0.25 * L; }  // assume a short range until we see a deeper rep
      if (elbow2d >= 160) arm.hi = arm.hi * 0.95 + rise * 0.05;
      if (rise < arm.lo) arm.lo = Math.max(rise, arm.hi - 2 * L);
      var p = clamp((rise - arm.lo) / Math.max(arm.hi - arm.lo, 0.05), 0, 1);

      var off = Math.acos(clamp(dot(fdir, arm.up), -1, 1)) * 180 / Math.PI;
      var head = unit(sub(S, H));
      var headPerp = sub(head, mul(arm.up, dot(head, arm.up)));
      var fPerp = sub(fdir, mul(arm.up, dot(fdir, arm.up)));
      var lean = off * (dot(fPerp, headPerp) >= 0 ? 1 : -1);

      // pixels per metre, from the bones we can see
      var num = 0, den = 0, pairs = [[Si, Ei, S, E], [Ei, Wi, E, W], [Si, px(P.hip), S, H]];
      for (var q = 0; q < pairs.length; q++) {
        var bi = sub(pairs[q][1], pairs[q][0]), bw = sub(pairs[q][3], pairs[q][2]).slice(0, 2);
        num += dot(bi, bw); den += dot(bw, bw);
      }
      var sc = num / Math.max(den, 1e-9);
      if (sc > 0) arm.scale = arm.scale ? arm.scale * 0.8 + sc * 0.2 : sc;

      arm.cur = { elbow2d: elbow2d, vis: vNow, p: p, lean: lean, rise: rise, Si: Si, Ei: Ei, Wi: Wi, S: S, E: E, W: W, ready: true, f: f };
      return arm.cur;
    }

    function ghostFor(arm, p) {
      var c = arm.cur;
      if (!c || !c.ready || !arm.scale) return null;
      var l1 = pct(arm.l1, 0.7), l2 = pct(arm.l2, 0.7);
      var th = (T.TARGET_BOTTOM + (T.TARGET_TOP - T.TARGET_BOTTOM) * p) * Math.PI / 180;
      var upper = sub(c.S, c.E);
      var perp = unit(sub(upper, mul(arm.up, dot(upper, arm.up))));
      var gdir = add(mul(arm.up, Math.cos(th)), mul(perp, Math.sin(th)));
      var gel = sub(c.S, mul(gdir, l1));
      var gwr = add(gel, mul(arm.up, l2));
      var toImg = function (g) {
        var d = sub(g, c.S);
        return [(c.Si[0] + arm.scale * d[0]) / c.f.w, (c.Si[1] + arm.scale * d[1]) / c.f.h];
      };
      return { gel: toImg(gel), gwr: toImg(gwr) };
    }

    function mean(list) { var s = 0; for (var i = 0; i < list.length; i++) s += list[i]; return list.length ? s / list.length : 0; }

    function makeCheck(key, st, msg, t, value) { return { key: key, label: LABELS[key], status: st, message: msg, t: t, value: value }; }

    function resolveBottom(rep, tEnd) {
      var s = rep.samples;
      var checks = [];
      var elbows = s.map(function (x) { return x.elbow; }).sort(function (a, b) { return a - b; }).slice(0, 3);
      var depthSt = judge('depth', median(s.map(function (x) { return x.vis; })), status(median(elbows), T.DEPTH_GOOD, T.DEPTH_ALMOST, true));
      checks.push(makeCheck('depth', depthSt, depthSt === 'unsure' ? MSG.unsure.depth : MSG.depth[depthSt], rep.minT, median(elbows)));
      var lower = s.filter(function (x) { return x.p < 0.6; });
      var leanMed = lower.length ? median(lower.map(function (x) { return x.lean; })) : 0;
      var hSt = judge('hands', lower.length ? median(lower.map(function (x) { return x.vis; })) : 0, status(Math.abs(leanMed), T.HANDS_GOOD, T.HANDS_ALMOST, true));
      var side = leanMed >= 0 ? 'head' : 'feet';
      checks.push(makeCheck('hands', hSt, hSt === 'unsure' ? MSG.unsure.hands : hSt === 'good' ? MSG.hands.good : MSG.hands[hSt + '_' + side], rep.minT, leanMed));
      var secs = ownRangeSeconds(rep, tEnd);
      if (secs !== null) {
        var spSt = status(secs, T.DOWN_GOOD, T.DOWN_FAST, false);
        checks.push(makeCheck('speed', spSt, MSG.speed[spSt], rep.minT, secs));
      }
      var bothSeen = rep.armGap !== null && s.length && median(s.map(function (x) { return x.visMin === null ? 0 : x.visMin; })) >= T.ARMS_VIS;
      if (bothSeen) {  // a hidden arm is guessed by the tracker, so only compare arms we can really see
        var aSt = rep.armGap <= T.ARMS_EVEN ? 'good' : 'fix';
        checks.push(makeCheck('arms', aSt, MSG.arms[aSt], rep.minT, rep.armGap));
      }
      return checks;
    }

    // Seconds to lower from 80% to 20% of THIS rep's own height range (so the first rep is judged fairly too).
    function ownRangeSeconds(rep, tEnd) {
      var seg = hist.filter(function (h) { return h.t >= rep.start - 1.5 && h.t <= tEnd + 0.0001; });
      if (seg.length < 3) return null;
      var hi = seg[0].hi, lo = Infinity;
      seg.forEach(function (h) { if (h.rise < lo) lo = h.rise; });
      if (hi - lo < 0.05) return null;
      var norm = function (h) { return (h.rise - lo) / (hi - lo); };
      var iMin = 0;
      for (var m = 0; m < seg.length; m++) if (seg[m].rise < seg[iMin].rise) iMin = m;
      var iTop = -1;
      for (var i = 0; i < iMin; i++) if (norm(seg[i]) >= T.TOP_P) iTop = i;  // last frame still at the top before the lowest point
      if (iTop < 0) return null;
      var cross = function (level) {
        for (var j = Math.max(iTop, 1); j <= iMin; j++) {
          var a = norm(seg[j - 1]), b = norm(seg[j]);
          if (b <= level && a > level) return seg[j - 1].t + (seg[j].t - seg[j - 1].t) * (a - level) / (a - b);
        }
        return null;
      };
      var t80 = cross(T.TOP_P), t20 = cross(0.2);
      return t80 !== null && t20 !== null ? t20 - t80 : null;
    }

    function worst(checks) {
      var bad = checks.filter(function (c) { return c.status === 'almost' || c.status === 'fix'; });
      bad.sort(function (a, b) {
        if ((a.status === 'fix') !== (b.status === 'fix')) return a.status === 'fix' ? -1 : 1;
        return PRIORITY.indexOf(a.key) - PRIORITY.indexOf(b.key);
      });
      return bad.length ? bad[0] : null;
    }

    function update(f) {
      var events = [];
      var cur = {};
      var act = [];
      ['left', 'right'].forEach(function (s) { var c = updateArm(s, f); if (c) cur[s] = c; });
      ['left', 'right'].forEach(function (s) { if (cur[s] && arms[s].active) act.push(s); });

      if (!act.length) {
        view.message = 'Step back so I can see your arms.'; view.tone = 'info';
        return { events: events, view: snapshot(f, act, null) };
      }
      var ready = act.filter(function (s) { return cur[s].ready; });
      if (ready.length < act.length || !ready.length) {
        view.message = 'Hold the weights straight up for a second.'; view.tone = 'info';
        return { events: events, view: snapshot(f, act, null) };
      }
      var p = mean(ready.map(function (s) { return cur[s].p; }));
      var elbow = mean(ready.map(function (s) { return cur[s].elbow2d; }));
      var lean = mean(ready.map(function (s) { return cur[s].lean; }));
      var vis = mean(ready.map(function (s) { return cur[s].vis; }));
      var riseNow = mean(ready.map(function (s) { return cur[s].rise; }));
      var hiNow = mean(ready.map(function (s) { return arms[s].hi; }));
      var Lnow = mean(ready.map(function (s) { return median(arms[s].l1) + median(arms[s].l2); }));
      hist.push({ t: f.t, rise: riseNow, hi: hiNow, elbow: elbow, L: Lnow }); if (hist.length > 90) hist.shift();
      var gap = ready.length === 2 ? Math.abs(cur.left.elbow2d - cur.right.elbow2d) : null;
      var visMin = ready.length === 2 ? Math.min(cur.left.vis, cur.right.vis) : null;
      var t = f.t;

      if (rs.state === 'wait') { if (p >= T.TOP_P) rs.state = 'top'; }
      else if (rs.state === 'top') {
        if (p < T.TOP_P) {
          rs.state = 'down';
          rs.rep = { start: rs.prev ? rs.prev.t : t, topElbow: rs.prev ? rs.prev.elbow : elbow, tHi: null, tLo: null, minP: p, minT: t, samples: [], resolved: null, armGap: null, index: done.length + 1 };
          var pr = rs.prev;
          if (pr && pr.p > p) rs.rep.tHi = pr.t + (t - pr.t) * (pr.p - T.TOP_P) / (pr.p - p);
          rs.pending = null;
        }
      }
      if (rs.state === 'down') {
        var rep = rs.rep;
        rep.samples.push({ t: t, p: p, elbow: elbow, lean: lean, vis: vis, visMin: visMin });
        if (p < rep.minP) { rep.minP = p; rep.minT = t; if (gap !== null) rep.armGap = gap; }
        var pv = rs.prev;
        if (rep.tHi === null && pv && pv.p >= T.TOP_P && p < T.TOP_P) rep.tHi = pv.t + (t - pv.t) * (pv.p - T.TOP_P) / (pv.p - p);
        if (rep.tLo === null && pv && pv.p > 0.2 && p <= 0.2) rep.tLo = pv.t + (t - pv.t) * (pv.p - 0.2) / (pv.p - p);
        if (!rep.resolved && rep.minP < T.BOTTOM_P && p > rep.minP + 0.3 && t - rep.minT >= 0.2) {
          rep.resolved = resolveBottom(rep, t);  // provisional: for the on-screen icons only
          var w1 = worst(rep.resolved);
          events.push({ type: 'bottom', index: rep.index, checks: rep.resolved });
          view.checks = {}; rep.resolved.forEach(function (c) { view.checks[c.key] = c.status; });
          if (w1) { view.message = w1.message; view.tone = w1.status === 'fix' ? 'fix' : 'almost'; }
          else { view.message = 'Good so far. Keep going.'; view.tone = 'good'; }
          var tk = w1 && (w1.key === 'hands' || w1.key === 'depth');
          showUntil = tk ? Infinity : -1;
        }
        if (p >= T.TOP_P) {
          // back at the top: wait a few frames for the lockout reading, unless the next rep starts first
          rs.state = 'finish';
          rep.endT = t; rep.tail = [elbow]; rep.tailVis = [vis];
        }
      } else if (rs.state === 'finish') {
        var r2 = rs.rep;
        if (p < T.TOP_P) { finalize(r2, events); rs.state = 'down'; rs.rep = { start: rs.prev ? rs.prev.t : t, topElbow: rs.prev ? rs.prev.elbow : elbow, tHi: null, tLo: null, minP: p, minT: t, samples: [], resolved: null, armGap: null, index: done.length + 1 };
          var pr2 = rs.prev; if (pr2 && pr2.p > p) rs.rep.tHi = pr2.t + (t - pr2.t) * (pr2.p - T.TOP_P) / (pr2.p - p); }
        else {
          r2.tail.push(elbow); r2.tailVis.push(vis);
          if (r2.tail.length >= 5) { finalize(r2, events); rs.state = 'top'; rs.rep = null; }
        }
      }
      rs.prev = { t: t, p: p, elbow: elbow };

      var show = rs.rep && showUntil === Infinity && (rs.state === 'down' || rs.state === 'finish');
      if (rs.state === 'top' || rs.state === 'wait') { if (!(done.length && view.tone !== 'info' && view.message)) { view.message = 'Ready. Start your reps.'; view.tone = 'info'; } showUntil = -1; }
      var ghost = {};
      if (show) ready.forEach(function (s) { ghost[s] = ghostFor(arms[s], p); });
      view.repIndex = rs.rep ? rs.rep.index : done.length;
      return { events: events, view: snapshot(f, act, show ? ghost : null) };
    }

    function finalize(rep, events) {
      var eMax = rep.topElbow, eMin = 999;
      hist.forEach(function (h) { if (h.t >= rep.start - 1.5 && h.t <= rep.start && h.elbow > eMax) eMax = h.elbow; });  // how straight the arm was just before lowering
      rep.samples.forEach(function (x) { if (x.elbow > eMax) eMax = x.elbow; if (x.elbow < eMin) eMin = x.elbow; });
      var seg = hist.filter(function (h) { return h.t >= rep.start - 0.5 && h.t <= rep.endT; });
      var minRise = Infinity, Lm = 0;
      seg.forEach(function (h) { if (h.rise < minRise) minRise = h.rise; Lm = h.L; });
      var dropped = seg.length ? (seg[0].hi - minRise) / Math.max(Lm, 1e-6) : 0;
      // jitter, not a rep: the elbow barely bent AND the hands barely dropped
      if (rep.minP >= T.BOTTOM_P || (eMax - eMin < 25 && dropped < 0.4)) { rs.rep = null; return; }
      var checks = resolveBottom(rep, rep.endT);  // final verdict from the whole rep, like the recorded-clip coach
      var top = Math.max.apply(null, rep.tail.concat([rep.samples.length ? rep.samples[rep.samples.length - 1].elbow : 0]));
      var lockSt = judge('lockout', median(rep.tailVis), status(top, T.LOCK_GOOD, T.LOCK_ALMOST, false));
      checks.push(makeCheck('lockout', lockSt, lockSt === 'unsure' ? MSG.unsure.lockout : MSG.lockout[lockSt], rep.endT, top));
      var order = {}; PRIORITY.forEach(function (k, i) { order[k] = i; });
      checks.sort(function (a, b) { return order[a.key] - order[b.key]; });
      var w = worst(checks);
      var speak = 'Rep ' + rep.index + '. ' + (w ? w.message : checks.some(function (c) { return c.status === 'unsure'; }) ? 'Good so far.' : 'Good rep.');
      done.push({ index: rep.index, checks: checks, startT: rep.start, bottomT: rep.minT, endT: rep.endT });
      view.checks = {}; checks.forEach(function (c) { view.checks[c.key] = c.status; });
      view.message = w ? w.message : 'Good rep!'; view.tone = w ? (w.status === 'fix' ? 'fix' : 'almost') : 'good';
      events.push({ type: 'rep_done', index: rep.index, checks: checks, speak: speak, worst: w });
    }

    function snapshot(f, act, ghost) {
      var out = [];
      act.forEach(function (s) {
        var c = arms[s].cur; if (!c) return;
        var item = { side: s, sh: [c.Si[0] / f.w, c.Si[1] / f.h], el: [c.Ei[0] / f.w, c.Ei[1] / f.h], wr: [c.Wi[0] / f.w, c.Wi[1] / f.h] };
        if (ghost && ghost[s]) { item.gel = ghost[s].gel; item.gwr = ghost[s].gwr; }
        out.push(item);
      });
      return { arms: out, message: view.message, tone: view.tone, checks: view.checks, repIndex: view.repIndex, repsDone: done.length, calibrated: act.length > 0 && act.every(function (s) { return !!arms[s].up; }) };
    }

    return { update: update, reps: function () { return done; } };
  }

  return { createCoach: createCoach, T: T, MSG: MSG, LABELS: LABELS };
})();
`;
