/* ============================================================================
   engine.js — scoring pipeline
   ----------------------------------------------------------------------------
   PRESERVED VERBATIM from lie-detector-demo-v2.html.
   Every constant, threshold, smoothing rate and order of operations below is
   byte-identical to the original demo. This file was extracted, not rewritten.
   If you want the meter to behave differently, change CFG — nothing else.
   ========================================================================== */

export const KEYS = ['blink', 'gaze', 'brow', 'mouth', 'head', 'body'];

export const SIGNAL_LABELS = {
  blink: 'Blink rate',
  gaze:  'Gaze aversion',
  brow:  'Brow tension',
  mouth: 'Mouth/jaw tension',
  head:  'Head motion',
  body:  'Body motion'
};

/* compact labels for the narrow live panel */
export const SIGNAL_COMPACT = {
  blink: 'Blink rate',
  gaze:  'Gaze aversion',
  brow:  'Brow tension',
  mouth: 'Mouth/jaw',
  head:  'Head motion',
  body:  'Body motion'
};

export const SIGNAL_SHORT = {
  blink: 'Blink', gaze: 'Gaze', brow: 'Brow',
  mouth: 'Mouth', head: 'Head', body: 'Body'
};

/* ─── RESPONSE PROFILES ─────────────────────────────────────────
   Only the response curve differs between these. The dead zone, the
   corroboration rule and the robust baseline statistics are the same in all
   three — what changes is how hard a real, corroborated reaction pushes the
   needle. Derived with scripts/tune.mjs against explicit scenario targets;
   run `node scripts/tune.mjs` to see the table.

   'steady' reproduces lie-detector-demo-v2.html exactly. scripts/verify-math.mjs
   asserts that, so the original behaviour stays one setting away, forever.      */
export const PROFILES = {
  steady: {
    label: 'Steady',
    blurb: 'The original response. Extremely hard to move — most answers read clean.',
    deadZone: 1.2, softK: 0.55, fuseP: 1.0, gain: 74, floor: 6, corrobAt: 0.18, qGain: 1.00
  },
  balanced: {
    label: 'Balanced',
    blurb: 'Default. Same dead zone, but a genuine reaction uses the whole scale.',
    deadZone: 1.2, softK: 0.70, fuseP: 1.9, gain: 98, floor: 4, corrobAt: 0.12, qGain: 1.10
  },
  keen: {
    label: 'Keen',
    blurb: 'Quicker to call tension. Lone signals are still discounted hard.',
    deadZone: 1.05, softK: 0.60, fuseP: 2.4, gain: 108, floor: 4, corrobAt: 0.12, qGain: 1.18
  }
};

export const DEFAULT_PROFILE = 'balanced';

/* ─── TUNING (the "feel" knobs) ─────────────────────────────── */
export const CFG = {
  calibSecs: 20,         // longer baseline = far more stable stats
  askSecs: 8,            // read a whole answer, not one frame
  attack: 0.055,         // how fast the needle rises  (slow = calm)
  decay: 0.030,          // how fast it falls back
  corrobMin: 2,          // need >=2 signals agreeing before it really moves
  driftRate: 0.0009,     // slow baseline re-centering during calm live periods
  weights: { blink: .19, gaze: .20, brow: .17, mouth: .14, head: .15, body: .15 },
  // per-signal reliability: how much we trust each one (dampens noisy ones)
  trust: { blink: 1.0, gaze: .95, brow: .9, mouth: .85, head: .8, body: .7 },

  /* ── filled in from the active profile ── */
  deadZone: 0,           // robust-z below this is ignored entirely (kills twitchiness)
  softK: 0,              // soft saturation: gentle rise, no instant pegging
  fuseP: 1,              // aggregation exponent: 1 = plain mean, 2 = RMS
  gain: 0,               // final scale to 0-100
  floor: 0,              // resting reading never sits at hard 0
  corrobAt: 0,           // a signal counts as "agreeing" above this
  qGain: 1               // how fast camera quality earns full confidence
};

export let activeProfile = DEFAULT_PROFILE;

export function setProfile(name) {
  const key = PROFILES[name] ? name : DEFAULT_PROFILE;
  const p = PROFILES[key];
  activeProfile = key;
  CFG.deadZone = p.deadZone; CFG.softK = p.softK; CFG.fuseP = p.fuseP;
  CFG.gain = p.gain; CFG.floor = p.floor; CFG.corrobAt = p.corrobAt; CFG.qGain = p.qGain;
  return key;
}
setProfile(DEFAULT_PROFILE);

/* The two duration knobs are the only ones the Settings screen may touch.
   Everything else stays fixed so the reading means the same thing every time. */
export const DEFAULT_DURATIONS = { calibSecs: CFG.calibSecs, askSecs: CFG.askSecs };

/* ─── ROBUST STATS ──────────────────────────────────────────── */
export function median(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function mad(a, med) {
  if (!a.length) return 0;
  return median(a.map(v => Math.abs(v - med)));
}

/* robust z-score: median/MAD resists the odd twitch far better than mean/std */
export function rz(x, st) {
  const scale = 1.4826 * st.mad;
  return (x - st.med) / (scale + st.eps);
}

/* dead zone + soft saturation: ignore normal variation, then rise gently */
export function shape(z) {
  const over = z - CFG.deadZone;
  if (over <= 0) return 0;
  return 1 - Math.exp(-CFG.softK * over);   // asymptotic → never slams to 1
}

/* ─── FUSION: weights × trust × corroboration ───────────────── */
export function fuse(d, quality) {
  const p = CFG.fuseP;
  let sum = 0, wsum = 0, corrob = 0;
  KEYS.forEach(k => {
    const w = CFG.weights[k] * CFG.trust[k];
    // p === 1 is the plain weighted mean the original used. Above 1 this is a
    // weighted power mean: four quiet signals no longer dilute two loud ones,
    // which is what made every real reaction read as "clean".
    sum += w * (p === 1 ? d[k] : Math.pow(d[k], p)); wsum += w;
    if (d[k] > CFG.corrobAt) corrob++;
  });
  let s = sum / wsum;
  if (p !== 1) s = Math.pow(s, 1 / p);
  // corroboration: one lone signal shouldn't convict. Scale down isolated spikes.
  const cf = corrob <= 0 ? 0 : corrob < CFG.corrobMin ? 0.45 : Math.min(1, 0.75 + 0.09 * (corrob - CFG.corrobMin));
  s *= cf;
  // confidence pulls extreme readings toward the middle when the signal is poor
  const q = Math.max(0.35, Math.min(1, quality * CFG.qGain));
  let pct = CFG.floor + s * CFG.gain;
  pct = 50 + (pct - 50) * q;              // low quality → less confident → closer to neutral
  return { pct: Math.max(0, Math.min(100, pct)), corrob };
}

export function verdictFor(p) {
  return p < 28 ? 'Reads clean — nothing meaningful moved'
       : p < 45 ? 'Mostly steady — minor tension'
       : p < 62 ? 'Noticeable tension'
       : p < 78 ? 'Several tells lining up'
       : 'Strong, corroborated reaction';
}

export function verdictShort(p) {
  return p < 28 ? 'Clean'
       : p < 45 ? 'Steady'
       : p < 62 ? 'Tense'
       : p < 78 ? 'Tells lining up'
       : 'Strong reaction';
}

export function bandFor(p) { return p < 40 ? 'calm' : p < 68 ? 'warm' : 'hot'; }

/* ─── BODY MOTION PROBE ─────────────────────────────────────── */
/* 64×48 downscale, every 16th byte, scaled ×7 — identical to the original. */
export class MotionProbe {
  constructor() {
    this.c = document.createElement('canvas');
    this.c.width = 64; this.c.height = 48;
    this.ctx = this.c.getContext('2d', { willReadFrequently: true });
    this.prevFrame = null;
  }
  reset() { this.prevFrame = null; }
  sample(video) {
    try {
      this.ctx.drawImage(video, 0, 0, this.c.width, this.c.height);
      const cur = this.ctx.getImageData(0, 0, this.c.width, this.c.height).data;
      let diff = 0;
      if (this.prevFrame) {
        for (let i = 0; i < cur.length; i += 16) diff += Math.abs(cur[i] - this.prevFrame[i]);
        diff = diff / (cur.length / 16) / 255;
      }
      this.prevFrame = cur;
      return diff * 7;
    } catch (e) { return 0; }
  }
}

/* ─── ENGINE ────────────────────────────────────────────────── */
/* Holds exactly the state the original script kept in module-level globals:
   baseline, calibSamples, askSamples, quality, scoreEMA, lastNose, lastBlink,
   blinkTimes, ema{}, dSmooth{}. */
export class ScoringEngine {
  constructor() { this.hardReset(); }

  hardReset() {
    this.baseline = null;
    this.calibSamples = [];
    this.askSamples = [];
    this.quality = 0;
    this.scoreEMA = 0;
    this.lastNose = null;
    this.lastBlink = 0;
    this.blinkTimes = [];
    this.ema = { gaze: 0, brow: 0, mouth: 0, head: 0, body: 0 };
    this.dSmooth = { blink: 0, gaze: 0, brow: 0, mouth: 0, head: 0, body: 0 };
  }

  /* matches the original Reset button: drops the baseline and the meter,
     leaves the per-frame smoothers alone. */
  softReset() {
    this.baseline = null;
    this.scoreEMA = 0;
  }

  beginCalibration() {
    this.baseline = null;
    this.calibSamples = [];
    this.scoreEMA = 0;
    this.blinkTimes = [];
  }

  /* returns true if the baseline locked, false if there weren't enough samples */
  finishCalibration() {
    // drop the first 15% of samples (settling-in) for a cleaner baseline
    const usable = this.calibSamples.slice(Math.floor(this.calibSamples.length * 0.15));
    if (usable.length < 40) return false;
    const baseline = {};
    KEYS.forEach(k => {
      const arr = usable.map(s => s[k]);
      const med = median(arr); const m = mad(arr, med);
      // eps floor prevents divide-by-zero AND stops ultra-still people from being hyper-sensitive
      const eps = Math.max(0.02, Math.abs(med) * 0.10);
      baseline[k] = { med, mad: m, eps };
    });
    this.baseline = baseline;
    return true;
  }

  beginAsk() { this.askSamples = []; }

  /* returns null if the window was too short to trust */
  finishAsk() {
    if (this.askSamples.length < 15) return null;
    // per-signal: blend sustained (median) with peak (90th pct) — a real tell is sustained, not a blip
    const per = {};
    KEYS.forEach(k => {
      const arr = this.askSamples.map(s => s[k]).sort((a, b) => a - b);
      const sustained = median(arr);
      const peak = arr[Math.min(arr.length - 1, Math.floor(arr.length * 0.90))];
      per[k] = Math.min(1, sustained * 0.65 + peak * 0.35);
    });
    const { pct, corrob } = fuse(per, this.quality);
    const ranked = KEYS.map(k => ({ k, v: per[k] })).sort((a, b) => b.v - a.v);
    this.scoreEMA = pct;
    return { pct, corrob, per, ranked, quality: this.quality, samples: this.askSamples.length };
  }

  /* No face this frame. */
  ingestMiss() { this.quality *= 0.92; return null; }

  /* One frame with a face. `mode` is 'ready' | 'calibrating' | 'live' | 'reading'. */
  ingest(lm, blendMap, bodyMotion, now, mode) {
    const bs = n => blendMap[n] || 0;

    // quality: face size + centering + landmark presence
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (let i = 0; i < lm.length; i += 8) {
      const p = lm[i];
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
    const faceW = maxX - minX, cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const sizeQ = Math.min(1, faceW / 0.30);
    const centerQ = 1 - Math.min(1, (Math.abs(cx - 0.5) + Math.abs(cy - 0.5)) * 1.6);
    this.quality = this.quality * 0.9 + 0.1 * Math.max(0, Math.min(1, sizeQ * 0.65 + centerQ * 0.35));

    /* raw signals */
    const blink = (bs('eyeBlinkLeft') + bs('eyeBlinkRight')) / 2;
    if (blink > 0.5 && this.lastBlink <= 0.5) this.blinkTimes.push(now);
    this.lastBlink = blink;
    this.blinkTimes = this.blinkTimes.filter(t => now - t < 20000);
    const blinkRate = this.blinkTimes.length * 3;   // per 20s → per min

    const gaze = bs('eyeLookInLeft') + bs('eyeLookOutLeft') + bs('eyeLookUpLeft') + bs('eyeLookDownLeft')
               + bs('eyeLookInRight') + bs('eyeLookOutRight') + bs('eyeLookUpRight') + bs('eyeLookDownRight');
    const brow = bs('browInnerUp') + bs('browDownLeft') + bs('browDownRight') + bs('browOuterUpLeft') + bs('browOuterUpRight');
    const mouth = bs('mouthPucker') + bs('mouthPressLeft') + bs('mouthPressRight') + bs('mouthFrownLeft')
                + bs('mouthFrownRight') + bs('mouthStretchLeft') + bs('mouthStretchRight');
    let head = 0; const nose = lm[1];
    if (this.lastNose) head = Math.hypot(nose.x - this.lastNose.x, nose.y - this.lastNose.y) * 90;
    this.lastNose = { x: nose.x, y: nose.y };

    // gentler smoothing than v1 → far less twitchy
    const A = 0.12;
    const ema = this.ema;
    ema.gaze += A * (gaze - ema.gaze); ema.brow += A * (brow - ema.brow); ema.mouth += A * (mouth - ema.mouth);
    ema.head += A * (head - ema.head); ema.body += A * (bodyMotion - ema.body);

    const sample = { blink: blinkRate, gaze: ema.gaze, brow: ema.brow, mouth: ema.mouth, head: ema.head, body: ema.body };
    if (mode === 'calibrating') this.calibSamples.push(sample);

    let d = null, pct = null, corrob = 0;

    if (this.baseline && (mode === 'live' || mode === 'reading')) {
      d = {};
      KEYS.forEach(k => {
        const raw = shape(rz(sample[k], this.baseline[k]));
        // smooth each signal's deviation too — stops single-frame flickers
        this.dSmooth[k] += (raw > this.dSmooth[k] ? 0.10 : 0.05) * (raw - this.dSmooth[k]);
        d[k] = this.dSmooth[k];
      });
      if (mode === 'reading') this.askSamples.push({ ...d });

      const f = fuse(d, this.quality);
      pct = f.pct; corrob = f.corrob;
      const rate = pct > this.scoreEMA ? CFG.attack : CFG.decay;   // rises faster than it falls
      this.scoreEMA += rate * (pct - this.scoreEMA);

      // baseline drift: when genuinely calm, slowly re-center to absorb lighting/posture change
      if (mode === 'live' && this.scoreEMA < 25) {
        KEYS.forEach(k => { this.baseline[k].med += CFG.driftRate * (sample[k] - this.baseline[k].med); });
      }
    }

    return {
      sample, d, pct, corrob,
      scoreEMA: this.scoreEMA,
      quality: this.quality,
      blinkRate,
      box: { minX, maxX, minY, maxY }
    };
  }
}
