/* ============================================================================
   ui.js — app shell: camera, model, phase machine, sheets, native bridge.
   The scoring pipeline lives in engine.js and is not touched from here.
   ========================================================================== */

import { FilesetResolver, FaceLandmarker } from '../vendor/mediapipe/vision_bundle.mjs';
import {
  CFG, KEYS, SIGNAL_LABELS, SIGNAL_COMPACT, ScoringEngine, MotionProbe,
  verdictFor, verdictShort, bandFor, PROFILES, setProfile
} from './engine.js';
import { FaceOverlay, StripChart, Gauge, rampCSS, sparkline } from './viz.js';
import { store } from './store.js';
import { faceMarkup, paintFace, popVerdict } from './face.js';
import { sfx } from './sfx.js';

const APP_VERSION = '1.0.0';

/* ─── dom ────────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const body = document.body;
const video = $('cam');

/* ─── state ──────────────────────────────────────────────────────────────── */
const engine = new ScoringEngine();
const motion = new MotionProbe();
let screen = 'home';          // 'home' | 'read'
let overlay, chart, gauge;
let faceLandmarker = null, stream = null;
let running = false, mode = 'idle', lastVideoTime = -1, lastTs = 0, frameNo = 0;
let phaseRun = null;            // active countdown, if any
let lastResult = null;          // the reading currently shown in the result sheet
let obIndex = 0;

const CALIB_PROMPTS = [
  'Sit relaxed and look at the camera',
  'Say your name out loud',
  'What day is it today?',
  'Count to five out loud',
  'Keep looking here, breathe normally'
];

/* ══════════════════════════════ BOOT ═══════════════════════════════════════ */
(async function boot() {
  await store.load();
  applySettings();

  overlay = new FaceOverlay($('overlay'), video);
  chart = new StripChart($('chart'));
  gauge = new Gauge($('gArcEl'), $('gTip'), $('gaugeTicks'));

  buildSignalRows();
  buildFaces();
  buildInfoSheet();
  buildAboutBlock();
  buildOnboardArt();
  wireEvents();
  setMode('idle');
  renderMeter(0, { idle: true });
  chart.draw();

  $('verLine').textContent = `Tellmeter ${APP_VERSION} · on-device processing · no account, no upload`;

  /* Development hook. Only reachable by adding ?dev=1 to the URL in a browser —
     the native builds load capacitor://localhost with no query string, so this
     never exists in a shipped app. Used to exercise the UI without a camera. */
  if (new URLSearchParams(location.search).has('dev')) {
    window.__tm = {
      engine, chart, overlay, store, sfx,
      setMode, renderMeter, renderSignals, renderQuality, showResult,
      startCalibration, startAsk, openSheet, closeSheet, toast,
      get mode() { return mode; },
      set mode(v) { setMode(v); }
    };
    console.info('Tellmeter dev hook: window.__tm');
  }

  showScreen('home');
  renderHomeRecent();
  if (!store.settings.onboarded) showOnboarding();
  await nativeReady();
})();

/* ══════════════════════════════ ROUTER ═════════════════════════════════════ */
function showScreen(name) {
  screen = name;
  $('screenHome').hidden = name !== 'home';
  $('screenRead').hidden = name !== 'read';
  body.dataset.screen = name;
  if (name === 'home') { renderHomeRecent(); homeMeter.start(); } else homeMeter.stop();
  overlay?.markDirty(); chart?.markDirty();
}

/* ══════════════════════════════ HOME METER ═════════════════════════════════ */
/* The demo needle on the home screen, like the website's hero. It never reads
   anything — the caption under it says so. Spring constants match the site's
   meter (stiffness 90, damping 9) so the needle has the same wobble. */
const DEMO_SEQUENCE = [12, 68, 34, 88, 22, 74, 47];
const homeMeter = (() => {
  let raf = 0, timer = 0, i = 0, pos = 12, vel = 0, target = 12, last = 0;
  function paint(v) {
    const needle = $('hmNeedle');
    if (!needle) return;
    needle.setAttribute('transform', `rotate(${1.8 * Math.max(-2, Math.min(102, v)) - 90} 160 170)`);
    const n = Math.round(Math.max(0, Math.min(100, v)));
    $('hmNum').textContent = n;
    $('hmNum').style.color = rampCSS(n / 100);
    const pv = popVerdict(n);
    const chip = $('hmChip');
    if (chip.textContent !== pv.word) { chip.textContent = pv.word; chip.dataset.tone = pv.tone; }
    paintFace($('hmFace'), v);
  }
  function step(ts) {
    const dt = Math.min(48, last ? ts - last : 16) / 1000;
    last = ts;
    vel += (90 * (target - pos) - 9 * vel) * dt;
    pos += vel * dt;
    paint(pos);
    raf = requestAnimationFrame(step);
  }
  return {
    start() {
      if (raf || timer) return;
      const still = store.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (still) { paint(34); return; }
      last = 0;
      raf = requestAnimationFrame(step);
      timer = setInterval(() => { i = (i + 1) % DEMO_SEQUENCE.length; target = DEMO_SEQUENCE[i]; }, 2200);
    },
    stop() { cancelAnimationFrame(raf); clearInterval(timer); raf = 0; timer = 0; }
  };
})();

/* One face geometry, three homes: the home meter, the live readout and the
   result sheet. Only the pop skin shows them. */
function buildFaces() {
  [['hmFaceSlot', 'hmFace', 'mf-home'], ['moodSlot', 'moodFace', 'mf-live'], ['rFaceSlot', 'rFace', 'mf-result']]
    .forEach(([slot, id, cls]) => {
      const el = $(slot);
      if (!el) return;
      el.innerHTML = faceMarkup(cls);
      el.firstElementChild.id = id;
    });
}

function setPopChip(el, p) {
  if (!el) return;
  const pv = popVerdict(p);
  el.textContent = pv.word;
  el.dataset.tone = pv.tone;
}

async function enterRead() {
  showScreen('read');
  if (!stream) { $('coverStart').hidden = false; body.dataset.phase = 'boot'; }
  else { body.dataset.phase = 'running'; }
  overlay?.markDirty();
}

/* ══════════════════════════════ NATIVE ═════════════════════════════════════ */
const cap = () => window.Capacitor?.Plugins || {};
const isNative = () => !!window.Capacitor?.isNativePlatform?.();

async function nativeReady() {
  try {
    const { StatusBar, SplashScreen, App } = cap();
    if (StatusBar) { await StatusBar.setStyle({ style: 'DARK' }); await StatusBar.setOverlaysWebView({ overlay: true }); }
    if (SplashScreen) await SplashScreen.hide();
    if (App) {
      App.addListener('appStateChange', ({ isActive }) => { isActive ? onResume() : onSuspend(); });
      App.addListener('backButton', () => { if (!closeTopSheet()) cap().App?.exitApp?.(); });
    }
  } catch (e) { /* running in a plain browser */ }
}

function onSuspend() {
  if (phaseRun) abortPhase('Paused — the app went to the background.');
  running = false;
  try { video.pause(); } catch (e) {}
}
function onResume() {
  if (!stream) return;
  try { video.play(); } catch (e) {}
  motion.reset();
  if (!running) { running = true; lastTs = 0; requestAnimationFrame(loop); }
}
document.addEventListener('visibilitychange', () => document.hidden ? onSuspend() : onResume());

/* ══════════════════════════════ SETTINGS ═══════════════════════════════════ */
function applySettings() {
  const s = store.settings;
  setProfile(s.profile);
  body.dataset.mirror = s.mirror ? '1' : '0';
  body.dataset.calm = s.calm ? '1' : '0';
  sfx.configure({ sound: s.sound, haptics: s.haptics });
  if (overlay) { overlay.mirror = s.mirror; overlay.mode = s.mesh; overlay.calm = s.calm; }
  if (chart) chart.calm = s.calm;

  $('setCalib').value = s.calibSecs; $('outCalib').textContent = s.calibSecs + 's';
  $('setAsk').value = s.askSecs;     $('outAsk').textContent = s.askSecs + 's';
  $('setHaptics').checked = s.haptics;
  $('setSound').checked = s.sound;
  $('setCalm').checked = s.calm;
  $('setMirror').checked = s.mirror;
  [...$('setMesh').children].forEach(b => b.classList.toggle('on', b.dataset.v === s.mesh));
  [...$('setProfile').children].forEach(b => {
    const on = b.dataset.v === s.profile;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', String(on));
  });
  $('profBlurb').textContent = (PROFILES[s.profile] || PROFILES.balanced).blurb;
}

/* ══════════════════════════════ CAMERA + MODEL ═════════════════════════════ */
const WASM_DIR = new URL('../vendor/mediapipe/wasm', import.meta.url).href;
const MODEL_URL = new URL('../models/face_landmarker.task', import.meta.url).href;

/* Mirrors, used only in a browser. A native build must stay self-contained
   (App Store §2.5.2), so it never falls back off-device. */
const CDN_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';
const CDN_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/* Download the model with real progress — it is ~3.6 MB and on a cold web load
   a silent spinner reads as a hang. */
async function fetchModel(url, onProgress) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`model ${res.status} from ${url}`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !total) return new Uint8Array(await res.arrayBuffer());

  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress(got / total);
  }
  const out = new Uint8Array(got);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

/* Try bundled first, then the public mirror (browser only). */
async function withFallback(label, local, remote, run) {
  try { return await run(local); }
  catch (e) {
    if (isNative() || !remote) throw e;
    console.warn(`${label}: bundled copy failed (${e.message}) — retrying from the CDN`);
    $('loadNote').textContent = 'Bundled copy unavailable, fetching from the CDN…';
    return await run(remote);
  }
}

async function startCamera() {
  sfx.unlock();
  $('coverStart').hidden = true;
  $('coverError').hidden = true;
  $('coverLoad').hidden = false;
  body.dataset.phase = 'loading';

  try {
    $('loadTitle').textContent = 'Starting up';
    $('loadTxt').textContent = 'Preparing the vision runtime…';
    $('loadBarWrap').hidden = false;
    $('loadBar').style.width = '4%';

    const fileset = await withFallback('wasm', WASM_DIR, CDN_WASM, dir => FilesetResolver.forVisionTasks(dir));
    $('loadBar').style.width = '12%';

    $('loadTxt').textContent = 'Loading the face model…';
    const modelBuffer = await withFallback('model', MODEL_URL, CDN_MODEL,
      url => fetchModel(url, f => { $('loadBar').style.width = (12 + f * 76) + '%'; }));
    $('loadBar').style.width = '90%';

    $('loadTxt').textContent = 'Starting the detector…';
    const opts = delegate => ({
      baseOptions: { modelAssetBuffer: modelBuffer, delegate },
      runningMode: 'VIDEO', numFaces: 1,
      outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true
    });
    try { faceLandmarker = await FaceLandmarker.createFromOptions(fileset, opts('GPU')); }
    catch (e) {
      console.warn('GPU delegate unavailable, using CPU:', e.message);
      faceLandmarker = await FaceLandmarker.createFromOptions(fileset, opts('CPU'));
    }
    $('loadBar').style.width = '100%';

    overlay.setConnectors({
      tesselation: FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      faceOval: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      lips: FaceLandmarker.FACE_LANDMARKS_LIPS,
      leftEye: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      rightEye: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      leftEyebrow: FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      rightEyebrow: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      leftIris: FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      rightIris: FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS
    });

    $('loadTitle').textContent = 'Camera';
    $('loadTxt').textContent = 'Waiting for permission…';
    if (!navigator.mediaDevices?.getUserMedia) {
      throw Object.assign(
        new Error('Browsers only expose the camera over HTTPS (or on localhost). Open this page on its https:// address.'),
        { name: 'InsecureContext' });
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
    // Wait for metadata rather than for play() — Safari can reject a play()
    // issued after an await because the user gesture has already expired.
    // The element is muted + autoplay + playsinline, so it starts regardless.
    await new Promise(res => {
      if (video.readyState >= 1) return res();
      video.addEventListener('loadedmetadata', res, { once: true });
      setTimeout(res, 4000);
    });
    try { await video.play(); } catch (e) { console.warn('play() deferred to autoplay:', e.message); }

    $('coverLoad').hidden = true;
    $('loadBarWrap').hidden = true;
    $('qualPill').hidden = false;
    body.dataset.phase = 'running';
    setMode('ready');
    setStatus('Position your face', 'ok');
    $('primaryBtn').disabled = false;
    running = true; lastTs = 0;
    requestAnimationFrame(loop);
  } catch (e) {
    $('coverLoad').hidden = true;
    $('loadBarWrap').hidden = true;
    $('loadBar').style.width = '0%';
    $('coverError').hidden = false;
    body.dataset.phase = 'error';
    const insecure = e?.name === 'InsecureContext';
    const denied = !insecure && /NotAllowed|Permission|denied/i.test(e?.name + ' ' + e?.message);
    $('errTitle').textContent = insecure ? 'Needs a secure connection'
      : denied ? 'Camera permission needed' : 'Couldn’t start the camera';
    $('errTxt').textContent = insecure ? e.message : denied
      ? (isNative()
          ? 'Open Settings › Tellmeter and switch Camera on, then come back and try again.'
          : 'Your browser blocked camera access. Allow it for this page and try again.')
      : (e?.message || 'Something went wrong while starting the camera.') +
        ' Make sure no other app is using the camera.';
    setStatus('Camera blocked');
  }
}

/* ══════════════════════════════ MAIN LOOP ══════════════════════════════════ */
function loop(ts) {
  if (!running) return;
  const dt = lastTs ? ts - lastTs : 16;
  lastTs = ts;

  const src = video;
  if (src && src.readyState >= 2 && faceLandmarker && src.currentTime !== lastVideoTime) {
    lastVideoTime = src.currentTime;
    const now = performance.now();

    let res = null;
    try { res = faceLandmarker.detectForVideo(src, now); } catch (e) {}
    const bodyMotion = motion.sample(src);
    const onRead = screen === 'read';

    if (res && res.faceLandmarks && res.faceLandmarks.length) {
      const lm = res.faceLandmarks[0];
      const cats = (res.faceBlendshapes || [])[0];
      const m = {};
      if (cats && cats.categories) cats.categories.forEach(c => m[c.categoryName] = c.score);

      const out = engine.ingest(lm, m, bodyMotion, now, mode);

      renderQuality(out.quality);
      if (out.d) {
        overlay.levels = out.d;
        renderSignals(out.d);
        chart.push(out.d, mode === 'reading');
        if (mode === 'live') renderMeter(out.scoreEMA, { corrob: out.corrob });
      } else {
        chart.push(null, false);
      }
      overlay.phase = mode;
      overlay.draw(lm, dt);
      if ((frameNo++ & 1) === 0) chart.draw();   // the trace does not need 60fps

      if (mode === 'live') setStatus('Live', 'live');
      else if (mode === 'ready') setStatus('Ready to calibrate', 'ok');
    } else {
      engine.ingestMiss();
      if (onRead) {
        renderQuality(engine.quality);
        overlay.draw(null, dt);
        chart.push(null, mode === 'reading');
        if ((frameNo++ & 1) === 0) chart.draw();
        if (mode === 'live' || mode === 'reading') setStatus('Face lost — reposition', 'warn');
        else if (mode === 'calibrating') setStatus('Face lost — reposition', 'warn');
        else setStatus('Looking for a face', 'warn');
      }
    }
  }
  requestAnimationFrame(loop);
}

/* ══════════════════════════════ PHASE MACHINE ══════════════════════════════ */
function setMode(m) {
  mode = m;
  body.dataset.mode = m;
  overlay && (overlay.phase = m);
  const p = $('primaryBtn');
  if (m === 'ready')      { p.textContent = 'Calibrate baseline'; p.disabled = !stream; }
  else if (m === 'live')  { p.textContent = 'Ask a question'; p.disabled = false; }
  else                    { p.disabled = true; }
  $('btnRecal').disabled = !(engine.baseline && (m === 'live'));
  $('btnEndSession').disabled = !(store.questionCount > 0 && m === 'live');
  body.dataset.armed = engine.baseline ? '1' : '0';
}

function setStatus(text, cls) {
  $('statusTxt').textContent = text;
  $('dot').className = 'dot' + (cls ? ' ' + cls : '');
}

/* generic rAF countdown; returns a handle with .cancel() */
function runPhase({ secs, title, sub, onSecond, onDone }) {
  const ph = $('phase');
  ph.hidden = false;
  $('phaseTitle').textContent = title;
  $('phaseSub').textContent = sub;
  const C = 2 * Math.PI * 59;
  const fg = $('rtFg');
  fg.style.strokeDasharray = `${C} ${C}`;
  fg.style.strokeDashoffset = '0';
  $('phaseCount').textContent = secs;

  const t0 = performance.now();
  let shown = -1, cancelled = false;

  function frame(ts) {
    if (cancelled) return;
    const el = (ts - t0) / 1000;
    const left = Math.max(0, secs - el);
    fg.style.strokeDashoffset = String(C * Math.min(1, el / secs));
    const disp = Math.ceil(left - 0.0001);
    if (disp !== shown) {
      shown = disp;
      $('phaseCount').textContent = Math.max(0, disp);
      if (disp > 0) { onSecond && onSecond(secs - disp, disp); disp <= 3 ? sfx.tickLast() : sfx.tick(); }
    }
    if (el >= secs) { phaseRun = null; ph.hidden = true; onDone(); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  phaseRun = { cancel() { cancelled = true; phaseRun = null; ph.hidden = true; } };
  return phaseRun;
}

function abortPhase(msg) {
  if (!phaseRun) return;
  phaseRun.cancel();
  setMode(engine.baseline ? 'live' : 'ready');
  if (msg) toast(msg);
}

/* ── calibration ─────────────────────────────────────────────────────────── */
function startCalibration() {
  sfx.unlock();
  engine.beginCalibration();
  chart.clearData();
  renderMeter(0, { idle: true });
  KEYS.forEach(k => { $('f_' + k).style.width = '0%'; $('v_' + k).textContent = '–'; });
  setMode('calibrating');
  setStatus('Calibrating…', 'ok');
  sfx.start();

  runPhase({
    secs: store.settings.calibSecs,
    title: CALIB_PROMPTS[0],
    sub: 'Learning your honest baseline…',
    onSecond: elapsed => {
      const idx = Math.min(CALIB_PROMPTS.length - 1, Math.floor(elapsed / 4));
      $('phaseTitle').textContent = CALIB_PROMPTS[idx];
    },
    onDone: finishCalibration
  });
}

function finishCalibration() {
  const ok = engine.finishCalibration();
  if (!ok) {
    sfx.fail();
    setMode('ready');
    setStatus('Baseline failed', 'warn');
    toast('Couldn’t read your face for long enough. Find better light and try again.');
    return;
  }
  store.startSession({
    at: Date.now(),
    secs: store.settings.calibSecs,
    quality: Math.round(engine.quality * 100)
  });
  sfx.armed();
  setMode('live');
  setStatus('Live', 'live');
  $('confTxt').textContent = 'Baseline locked';
  toast('Baseline locked. Ask your first question.');
}

/* ── question window ─────────────────────────────────────────────────────── */
function startAsk() {
  if (!engine.baseline) return;
  sfx.unlock();
  engine.beginAsk();
  setMode('reading');
  setStatus('Reading answer', 'live');
  sfx.start();

  runPhase({
    secs: store.settings.askSecs,
    title: 'Ask your question now',
    sub: 'Reading the whole answer, not one moment…',
    onDone: finishAsk
  });
}

function finishAsk() {
  const r = engine.finishAsk();
  setMode('live');
  if (!r) {
    sfx.fail();
    toast('Didn’t get a clean read — keep your face in frame for the whole window.');
    return;
  }
  const reading = {
    id: 'R' + Date.now().toString(36),
    ts: Date.now(),
    label: '',
    pct: r.pct, corrob: r.corrob, per: r.per,
    quality: Math.round(r.quality * 100),
    profile: store.settings.profile
  };
  store.addReading(reading);
  lastResult = reading;
  renderMeter(r.pct, { corrob: r.corrob });
  showResult(r, reading);
  setMode('live');
}

/* ══════════════════════════════ RENDERING ══════════════════════════════════ */
function buildSignalRows() {
  $('sigRows').innerHTML = KEYS.map(k => `
    <div class="sig">
      <div class="sig-name">${SIGNAL_COMPACT[k]}</div>
      <div class="track"><div class="fill" id="f_${k}"></div><div class="dz"></div></div>
      <div class="sig-val" id="v_${k}">–</div>
    </div>`).join('');
}

function renderSignals(d) {
  KEYS.forEach(k => {
    const v = Math.round(d[k] * 100);
    const el = $('f_' + k);
    el.style.width = v + '%';
    el.style.background = v < 4 ? 'var(--ink-4)' : rampCSS(d[k]);
    $('v_' + k).textContent = v;
  });
}

function renderMeter(p, opt = {}) {
  const v = Math.round(p);
  gauge.set(v);
  const col = rampCSS(v / 100);
  body.style.setProperty('--reading', opt.idle ? 'var(--ink-3)' : col);

  $('pct').textContent = opt.idle ? '–' : v;
  $('popNum').textContent = opt.idle ? '–' : v;
  paintFace($('moodFace'), opt.idle ? 0 : v);
  if (opt.idle) { $('popChip').textContent = engine.baseline ? 'READY' : 'NOT YET'; $('popChip').dataset.tone = 'none'; }
  else setPopChip($('popChip'), v);
  $('pct').style.color = opt.idle ? 'var(--ink-3)' : col;
  $('verdict').textContent = opt.idle
    ? (engine.baseline ? 'Ready' : 'Awaiting baseline')
    : verdictFor(v);
  body.dataset.band = opt.idle ? 'calm' : bandFor(v);

  if (opt.idle) {
    $('confTxt').textContent = engine.baseline ? 'Baseline locked' : 'Calibrate to begin';
  } else {
    const n = opt.corrob ?? 0;
    $('confTxt').innerHTML = `<b>${n}</b> of 6 signals agree`;
  }
}

function renderQuality(q) {
  const pctq = Math.round(q * 100);
  $('qualTxt').textContent = pctq + '%';
  const bars = $('qBars');
  const n = Math.max(0, Math.min(4, Math.round(q * 4)));
  bars.className = 'qbars' + (q > 0.7 ? '' : q > 0.45 ? ' mid' : ' low');
  [...bars.children].forEach((b, i) => b.classList.toggle('on', i < n));
}

/* ── result sheet ────────────────────────────────────────────────────────── */
function showResult(r, reading) {
  const pct = Math.round(r.pct);
  const band = bandFor(pct);
  const col = rampCSS(pct / 100);

  $('sheetResult').style.setProperty('--reading', col);
  setPopChip($('rChip'), pct);
  $('rBand').textContent = band === 'calm' ? 'Low tension' : band === 'warm' ? 'Elevated' : 'High tension';
  $('rVerdict').textContent = verdictFor(pct);
  const profLabel = (PROFILES[store.settings.profile] || PROFILES.balanced).label;
  $('rMeta').textContent =
    `${r.corrob}/6 agreed · ${store.settings.askSecs}s window · signal ${Math.round(r.quality * 100)}% · ${profLabel}`;

  $('rTitle').value = reading.label || '';
  $('rTitle').placeholder = `Question ${store.questionCount}`;

  $('rBars').innerHTML = r.ranked.map(({ k, v }) => `
    <div class="rbar">
      <div class="rbar-name">${SIGNAL_LABELS[k]}</div>
      <div class="rbar-track"><div class="rbar-fill" data-v="${v}" style="background:${rampCSS(v)}"></div></div>
      <div class="rbar-val">${Math.round(v * 100)}</div>
    </div>`).join('');

  const notes = [];
  r.ranked.slice(0, 3).forEach(x => {
    const lvl = x.v > 0.55 ? 'strongly elevated'
              : x.v > 0.28 ? 'moderately elevated'
              : x.v > 0.10 ? 'slightly elevated' : 'steady, near baseline';
    notes.push({ t: `${SIGNAL_LABELS[x.k]} — ${lvl}`, warn: x.v > 0.28 });
  });
  notes.push({
    t: `${r.corrob} of 6 signals moved together` +
       (r.corrob >= CFG.corrobMin ? ' (corroborated)' : ' (isolated — discounted)'),
    warn: r.corrob >= CFG.corrobMin
  });
  if (r.quality < 0.6) notes.push({ t: 'Signal quality was low — treat this reading loosely', warn: true });
  $('rList').innerHTML = notes.map(n => `<li>${escapeHtml(n.t)}</li>`).join('');

  openSheet('sheetResult');
  sfx.reveal(pct);

  /* count-up + bar grow once the sheet is on screen */
  const el = $('rPct');
  el.textContent = '0';
  const t0 = performance.now(), dur = 820;
  (function tickUp(ts) {
    const t = Math.min(1, (ts - t0) / dur);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(pct * e);
    paintFace($('rFace'), pct * e);
    if (t < 1) requestAnimationFrame(tickUp);
  })(t0);
  requestAnimationFrame(() => {
    $('rBars').querySelectorAll('.rbar-fill').forEach(f => {
      f.style.width = Math.round(parseFloat(f.dataset.v) * 100) + '%';
    });
  });
}

/* ── history sheet ───────────────────────────────────────────────────────── */
function renderHistory() {
  const wrap = $('histBody');
  const withReadings = store.sessions.filter(s => s.readings && s.readings.length);
  if (!withReadings.length) {
    wrap.innerHTML = `<div class="hist-empty">No saved readings yet.<br>Calibrate, ask a question, and it lands here.</div>`;
    return;
  }
  wrap.innerHTML = withReadings.map(s => {
    const avg = Math.round(s.readings.reduce((a, r) => a + r.pct, 0) / s.readings.length);
    const when = new Date(s.startedAt).toLocaleString(undefined,
      { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const rows = s.readings.map((r, i) => `
      <div class="hs-row">
        <span style="color:${rampCSS(r.pct / 100)}">${sparkline(r.per || {})}</span>
        <div class="hs-q">${escapeHtml(r.label || 'Question ' + (i + 1))}</div>
        <div class="hs-pct" style="color:${rampCSS(r.pct / 100)}">${Math.round(r.pct)}</div>
      </div>`).join('');
    return `<div class="hist-session">
        <div class="hs-head"><span class="hs-when">${when}</span>
        <span class="hs-stat">${s.readings.length} asked · avg ${avg}%</span></div>
        <div class="hist-rows">${rows}</div></div>`;
  }).join('');
}

function renderHomeRecent() {
  const all = store.sessions.filter(s => s.readings && s.readings.length);
  const rows = all.flatMap(s => s.readings.map((r, i) => ({ ...r, n: i + 1 }))).slice(0, 4);
  $('homeRecent').hidden = rows.length === 0;
  if (!rows.length) return;
  $('homeRecentRows').innerHTML = rows.map(r => `
    <div class="hs-row">
      <span style="color:${rampCSS(r.pct / 100)}">${sparkline(r.per || {})}</span>
      <div class="hs-q">${escapeHtml(r.label || 'Question ' + r.n)}</div>
      <div class="hs-pct" style="color:${rampCSS(r.pct / 100)}">${Math.round(r.pct)}</div>
    </div>`).join('');
}

/* ── static copy ─────────────────────────────────────────────────────────── */
function buildInfoSheet() {
  const copy = {
    blink: 'Blink openings per minute, counted over a rolling 20-second window. Rate usually climbs under cognitive load.',
    gaze:  'How far the eyes are pointed away from the lens, summed across all eight look directions.',
    brow:  'Inner-brow raise plus brow lowering — the classic tension knot between the eyebrows.',
    mouth: 'Lip press, pucker, frown and stretch. Suppressed speech and jaw clenching show up here.',
    head:  'Frame-to-frame movement of the nose tip: fidget, nodding, drawing back from the camera.',
    body:  'Whole-frame pixel change at low resolution. Catches shoulder and hand movement the face mesh misses.'
  };
  $('infoBody').innerHTML =
    `<p style="margin-bottom:14px">Each signal is scored as a <b>robust z-score</b> against your own calibrated median —
     not an absolute threshold. Variation inside the dead band is thrown away, and what's left rises through a soft
     curve so nothing ever pegs instantly.</p>` +
    KEYS.map(k => `<div class="info-sig"><div class="k">${SIGNAL_LABELS[k]}</div><div class="v">${copy[k]}</div></div>`).join('') +
    `<p style="margin-top:16px;color:var(--muted)">The index only moves meaningfully when at least
     ${CFG.corrobMin} signals rise together, and it's pulled back toward neutral whenever the camera read is poor.
     How hard a corroborated reaction pushes the needle is set by <b>Sensitivity</b> in Settings.</p>`;
}

function buildAboutBlock() {
  $('aboutBody').innerHTML = `
    <p>Tellmeter measures <b>visible stress</b>: six facial and motion signals, compared against a baseline it
    learns from you at the start of every session.</p>
    <p><b>It is not a lie detector.</b> Stress is not proof of deception — calm liars and nervous honest people
    both exist. Treat every reading as a party trick, never as evidence about a person.</p>
    <p>All processing happens on this device. There is no account, no server and no upload.</p>`;
}

function buildOnboardArt() {
  const vals = [0.22, 0.71, 0.18, 0.64, 0.30, 0.58];
  $('obBars').innerHTML = vals.map((v, i) => {
    const x = 16 + i * 32, h = 14 + v * 104, y = 140 - h;
    return `<rect x="${x}" y="${y}" width="17" height="${h}" rx="7" fill="${rampCSS(v, .85)}">
      <animate attributeName="height" values="14;${h};${h}" dur="1.6s" begin="${i * 0.09}s" fill="freeze"/>
      <animate attributeName="y" values="126;${y};${y}" dur="1.6s" begin="${i * 0.09}s" fill="freeze"/>
    </rect>`;
  }).join('');
}

/* ══════════════════════════════ SHEETS ═════════════════════════════════════ */
const sheetStack = [];
function openSheet(id) {
  const el = $(id);
  el.hidden = false; el.setAttribute('aria-hidden', 'false');
  sheetStack.push(id);
}
function closeSheet(id) {
  const el = $(id);
  if (!el || el.hidden) return;
  el.classList.add('closing');
  setTimeout(() => { el.classList.remove('closing'); el.hidden = true; el.setAttribute('aria-hidden', 'true'); }, 260);
  const i = sheetStack.lastIndexOf(id); if (i >= 0) sheetStack.splice(i, 1);
}
function closeTopSheet() {
  if (!sheetStack.length) return false;
  closeSheet(sheetStack[sheetStack.length - 1]);
  return true;
}

/* ══════════════════════════════ ONBOARDING ═════════════════════════════════ */
function showOnboarding() {
  obIndex = 0;
  $('onboard').hidden = false;
  $('obTrack').scrollLeft = 0;
  syncOb();
}
function syncOb() {
  const pages = $('obTrack').children.length;
  [...$('obDots').children].forEach((d, i) => d.classList.toggle('on', i === obIndex));
  $('obNext').textContent = obIndex >= pages - 1 ? 'Get started' : 'Continue';
  $('obSkip').hidden = obIndex >= pages - 1;
}
function obGo(i) {
  const track = $('obTrack');
  obIndex = Math.max(0, Math.min(track.children.length - 1, i));
  /* assign scrollLeft directly — scrollTo({behavior:'smooth'}) is a no-op in some
     embedded WebViews. The easing comes from CSS scroll-behavior instead. */
  track.scrollLeft = obIndex * track.clientWidth;
  const page = track.children[obIndex];
  page.classList.remove('enter'); void page.offsetWidth; page.classList.add('enter');
  syncOb();
}
function finishOnboarding() {
  store.set({ onboarded: true });
  $('onboard').hidden = true;
  sfx.unlock();
}

/* ══════════════════════════════ EVENTS ═════════════════════════════════════ */
function wireEvents() {
  $('homeStart').onclick = () => { sfx.unlock(); sfx.tap('light'); enterRead(); };
  $('homeSettings').onclick = () => openSheet('sheetSettings');
  $('homePrivacy').onclick = () => openPrivacy();
  $('homeAllSessions').onclick = () => { renderHistory(); openSheet('sheetHistory'); };
  $('btnHome').onclick = () => { showScreen('home'); };

  $('startBtn').onclick = startCamera;
  $('btnRetry').onclick = startCamera;
  $('btnAboutFromStart').onclick = showOnboarding;

  $('primaryBtn').onclick = () => {
    if (mode === 'ready') startCalibration();
    else if (mode === 'live') startAsk();
  };
  $('btnRecal').onclick = startCalibration;
  $('btnAbort').onclick = () => abortPhase('Cancelled.');
  $('btnEndSession').onclick = () => {
    store.endSession();
    engine.softReset();
    chart.clearData();
    setMode('ready');
    renderMeter(0, { idle: true });
    KEYS.forEach(k => { $('f_' + k).style.width = '0%'; $('v_' + k).textContent = '–'; });
    toast('Session ended. Calibrate again to start a new one.');
  };

  $('btnHistory').onclick = () => { renderHistory(); openSheet('sheetHistory'); };
  $('btnSettings').onclick = () => openSheet('sheetSettings');
  $('btnSigInfo').onclick = () => openSheet('sheetInfo');

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => closeSheet(el.dataset.close));
  });

  /* result sheet */
  $('rTitle').addEventListener('input', e => {
    if (lastResult) store.updateReading(lastResult.id, { label: e.target.value.trim() });
  });
  $('rAgain').onclick = () => { closeSheet('sheetResult'); setTimeout(() => { if (mode === 'live') startAsk(); }, 300); };
  $('rDiscard').onclick = () => {
    if (lastResult) store.dropReading(lastResult.id);
    lastResult = null;
    closeSheet('sheetResult');
    setMode('live');
    toast('Reading discarded.');
  };

  /* history sheet */
  $('histClear').onclick = () => {
    store.clearHistory(); renderHistory(); setMode(mode);
    toast('All saved readings deleted from this device.');
  };
  $('histShare').onclick = () => shareText(store.summaryText());

  /* settings */
  $('setCalib').oninput = e => { const v = +e.target.value; $('outCalib').textContent = v + 's'; store.set({ calibSecs: v }); };
  $('setAsk').oninput   = e => { const v = +e.target.value; $('outAsk').textContent = v + 's'; store.set({ askSecs: v }); };
  $('setHaptics').onchange = e => { store.set({ haptics: e.target.checked }); applySettings(); sfx.tap('light'); };
  $('setSound').onchange   = e => { store.set({ sound: e.target.checked }); applySettings(); sfx.tick(); };
  $('setCalm').onchange    = e => { store.set({ calm: e.target.checked }); applySettings(); };
  $('setMirror').onchange  = e => { store.set({ mirror: e.target.checked }); applySettings(); };
  $('setProfile').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]');
    if (!b || b.dataset.v === store.settings.profile) return;
    store.set({ profile: b.dataset.v });
    applySettings();
    sfx.tap('medium');
    if (store.questionCount > 0) {
      toast('Sensitivity changed — earlier answers this session used the old setting.');
    }
  });
  $('setMesh').addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    store.set({ mesh: b.dataset.v }); applySettings();
  });
  $('btnShowIntro').onclick = () => { closeSheet('sheetSettings'); showOnboarding(); };
  $('btnPrivacy').onclick = () => openPrivacy();

  /* onboarding */
  $('obNext').onclick = () => {
    const pages = $('obTrack').children.length;
    if (obIndex >= pages - 1) finishOnboarding(); else obGo(obIndex + 1);
  };
  $('obSkip').onclick = finishOnboarding;
  $('obTrack').addEventListener('scroll', () => {
    const t = $('obTrack');
    const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
    if (i !== obIndex) { obIndex = i; syncOb(); }
  }, { passive: true });

  /* dock expand on small screens */
  $('dockGrip').onclick = () => {
    const open = body.classList.toggle('dock-open');
    $('dockGrip').setAttribute('aria-expanded', String(open));
    $('gripLabel').textContent = open ? 'Hide details' : 'Live trace & signals';
    if (open) requestAnimationFrame(() => { chart.markDirty(); chart.draw(); });
    sfx.tap('light');
  };

  /* keyboard (desktop) */
  window.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea')) return;
    if (e.key === 'Escape') { if (!closeTopSheet() && phaseRun) abortPhase('Cancelled.'); }
    if (e.code === 'Space') {
      e.preventDefault();
      if (!$('onboard').hidden) { $('obNext').click(); return; }
      if (!$('primaryBtn').disabled) $('primaryBtn').click();
    }
  });

  const remeasure = () => { overlay?.markDirty(); chart?.markDirty(); chart?.draw(); };
  window.addEventListener('resize', remeasure);
  window.addEventListener('orientationchange', () => setTimeout(remeasure, 220));
  window.addEventListener('beforeunload', () => { if (stream) stream.getTracks().forEach(t => t.stop()); });
}

/* ══════════════════════════════ HELPERS ════════════════════════════════════ */
let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3400);
}

async function shareText(text) {
  const { Share } = cap();
  try {
    if (Share) { await Share.share({ title: 'Tellmeter readings', text }); return; }
    if (navigator.share) { await navigator.share({ title: 'Tellmeter readings', text }); return; }
    await navigator.clipboard.writeText(text);
    toast('Summary copied to the clipboard.');
  } catch (e) { /* user cancelled the share sheet */ }
}

function openPrivacy() {
  const url = new URL('privacy.html', document.baseURI).href;
  const { Browser } = cap();
  if (Browser) Browser.open({ url }); else window.open(url, '_blank');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
