/* ============================================================================
   viz.js — everything that draws. No scoring happens in here.
   ‣ FaceOverlay  : mesh / contours / region heat / tracking reticle / scan line
   ‣ StripChart   : six-lane rolling polygraph trace
   ‣ Gauge        : the 270° arc readout
   ========================================================================== */

import { KEYS, SIGNAL_SHORT } from './engine.js';

const DPR = () => Math.min(2.5, window.devicePixelRatio || 1);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

/* the pop skin (?skin=pop) draws on white panels with the website's palette */
export const isPop = () => document.documentElement.dataset.skin === 'pop';

const RAMP_DARK = [
  [0.00, [46, 211, 183]],
  [0.42, [140, 205, 120]],
  [0.62, [247, 183, 80]],
  [1.00, [255, 77, 94]]
];
/* lime-deep → sun-deep → danger: every stop stays legible on white */
const RAMP_POP = [
  [0.00, [126, 208, 0]],
  [0.50, [230, 167, 0]],
  [1.00, [255, 59, 48]]
];

/* level → colour ramp shared by every visual in the app */
export function rampRGB(v) {
  v = clamp01(v);
  const stops = isPop() ? RAMP_POP : RAMP_DARK;
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const t = (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      const a = stops[i - 1][1], b = stops[i][1];
      return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];
    }
  }
  return stops[stops.length - 1][1];
}
export const rampCSS = (v, a = 1) => { const c = rampRGB(v); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

/* ─────────────────────────── FACE OVERLAY ─────────────────────────────── */
export class FaceOverlay {
  /** @param {HTMLCanvasElement} canvas @param {HTMLVideoElement} video */
  constructor(canvas, video) {
    this.cv = canvas; this.video = video;
    this.ctx = canvas.getContext('2d');
    this.sets = null;            // connector sets, injected once the model loads
    this.mirror = true;
    this.mode = 'contours';      // 'off' | 'contours' | 'full'
    this.calm = false;
    this.box = null;             // eased tracking box in canvas px
    this.levels = { blink: 0, gaze: 0, brow: 0, mouth: 0, head: 0, body: 0 };
    this.scanT = 0;
    this.phase = 'idle';
    this._w = 0; this._h = 0;
    this._dirty = true;
  }

  markDirty() { this._dirty = true; }

  /* connectorSets comes straight off FaceLandmarker's static tables */
  setConnectors(sets) {
    this.sets = {
      tess:   flatten(sets.tesselation),
      oval:   flatten(sets.faceOval),
      lips:   flatten(sets.lips),
      eyeL:   flatten(sets.leftEye),
      eyeR:   flatten(sets.rightEye),
      browL:  flatten(sets.leftEyebrow),
      browR:  flatten(sets.rightEyebrow),
      irisL:  flatten(sets.leftIris),
      irisR:  flatten(sets.rightIris)
    };
  }

  resize() {
    if (!this._dirty && this._w) return;          // measuring forces layout — do it only when it changed
    this._dirty = false;
    const r = this.cv.getBoundingClientRect();
    const d = DPR();
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (w !== this.cv.width || h !== this.cv.height) { this.cv.width = w; this.cv.height = h; }
    this._w = w; this._h = h;
  }

  /* map normalized landmark space → canvas px, honouring object-fit:cover */
  _fit() {
    const vw = this.video.videoWidth || 960, vh = this.video.videoHeight || 720;
    const s = Math.max(this._w / vw, this._h / vh);
    const dw = vw * s, dh = vh * s;
    return { s, dw, dh, ox: (this._w - dw) / 2, oy: (this._h - dh) / 2 };
  }
  _pt(p, f) {
    const x = this.mirror ? 1 - p.x : p.x;
    return [f.ox + x * f.dw, f.oy + p.y * f.dh];
  }

  clear() { if (this._w) this.ctx.clearRect(0, 0, this._w, this._h); }

  draw(lm, dt) {
    this.resize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this._w, this._h);
    if (!lm || !this.sets) { this.box = null; return; }

    const f = this._fit();
    const d = DPR();
    const L = this.levels;

    /* ── region heat glows, drawn under the wireframe ── */
    if (!this.calm) {
      const eyeHeat = Math.max(L.blink, L.gaze);
      this._glow(lm, [159, 386], f, eyeHeat, 0.16);          // outer eye corners
      this._glow(lm, [105, 334], f, L.brow, 0.13);           // brow centres
      this._glow(lm, [13, 14], f, L.mouth, 0.14);            // lip centre
    }

    /* ── full tessellation (optional, low alpha) ── */
    if (this.mode === 'full') {
      ctx.strokeStyle = 'rgba(120,225,220,.115)';
      ctx.lineWidth = 0.7 * d;
      this._strokeSet(lm, this.sets.tess, f);
    }

    if (this.mode !== 'off') {
      /* ── contours ── */
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';

      const pop = isPop();
      ctx.save();
      ctx.shadowColor = pop ? 'rgba(26,16,48,.6)' : 'rgba(43,212,196,.55)';
      ctx.shadowBlur = this.calm ? 0 : (pop ? 3 : 7) * d;

      ctx.strokeStyle = pop ? 'rgba(255,255,255,.7)' : 'rgba(160,240,232,.34)';
      ctx.lineWidth = (pop ? 2.2 : 1.5) * d;
      this._strokeSet(lm, this.sets.oval, f);

      ctx.strokeStyle = rampCSS(Math.max(L.blink, L.gaze), pop ? 1 : .82);
      ctx.lineWidth = (pop ? 2.6 : 1.8) * d;
      this._strokeSet(lm, this.sets.eyeL, f);
      this._strokeSet(lm, this.sets.eyeR, f);

      ctx.strokeStyle = rampCSS(L.brow, .78);
      this._strokeSet(lm, this.sets.browL, f);
      this._strokeSet(lm, this.sets.browR, f);

      ctx.strokeStyle = rampCSS(L.mouth, .78);
      this._strokeSet(lm, this.sets.lips, f);

      ctx.strokeStyle = pop ? '#FFD200' : 'rgba(210,255,250,.7)';
      ctx.lineWidth = (pop ? 2 : 1.4) * d;
      this._strokeSet(lm, this.sets.irisL, f);
      this._strokeSet(lm, this.sets.irisR, f);
      ctx.restore();

      /* ── sparse point cloud for texture ── */
      ctx.fillStyle = pop ? 'rgba(255,255,255,.45)' : 'rgba(140,235,225,.30)';
      const step = this.mode === 'full' ? 9 : 6;
      for (let i = 0; i < lm.length; i += step) {
        const [x, y] = this._pt(lm[i], f);
        ctx.fillRect(x - .6 * d, y - .6 * d, 1.2 * d, 1.2 * d);
      }
    }

    /* ── tracking reticle ── */
    this._reticle(lm, f, d, dt);

    /* ── calibration scan sweep ── */
    if (this.phase === 'calibrating' && !this.calm) this._scan(f, d, dt);
  }

  _strokeSet(lm, pairs, f) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < pairs.length; i += 2) {
      const a = lm[pairs[i]], b = lm[pairs[i + 1]];
      if (!a || !b) continue;
      const p = this._pt(a, f), q = this._pt(b, f);
      ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
    }
    ctx.stroke();
  }

  _glow(lm, idxs, f, level, radiusFrac) {
    if (level < 0.12) return;
    const ctx = this.ctx;
    const c = rampRGB(level);
    for (const i of idxs) {
      const p = lm[i]; if (!p) continue;
      const [x, y] = this._pt(p, f);
      const r = radiusFrac * f.dh;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.30 * level})`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    }
  }

  _reticle(lm, f, d, dt) {
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (let i = 0; i < lm.length; i += 6) {
      const p = lm[i];
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
    const a = this._pt({ x: minX, y: minY }, f), b = this._pt({ x: maxX, y: maxY }, f);
    const pad = 16 * d;
    const target = {
      x: Math.min(a[0], b[0]) - pad, y: Math.min(a[1], b[1]) - pad,
      w: Math.abs(b[0] - a[0]) + pad * 2, h: Math.abs(b[1] - a[1]) + pad * 2
    };
    if (!this.box) this.box = { ...target };
    const k = Math.min(1, (dt || 16) / 120);
    for (const key of ['x', 'y', 'w', 'h']) this.box[key] = lerp(this.box[key], target[key], k);

    const { x, y, w, h } = this.box;
    const ctx = this.ctx;
    const arm = Math.min(w, h) * 0.20;
    const hot = this.phase === 'reading';
    const pop = isPop();
    ctx.strokeStyle = pop ? (hot ? '#FF2D95' : '#B6FF2E') : (hot ? 'rgba(255,120,145,.85)' : 'rgba(160,245,235,.62)');
    ctx.lineWidth = (pop ? 4 : 2) * d; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + arm); ctx.lineTo(x, y); ctx.lineTo(x + arm, y);
    ctx.moveTo(x + w - arm, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + arm);
    ctx.moveTo(x + w, y + h - arm); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - arm, y + h);
    ctx.moveTo(x + arm, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - arm);
    ctx.stroke();
  }

  _scan(f, d, dt) {
    this.scanT = (this.scanT + (dt || 16) / 2600) % 1;
    const ease = this.scanT < .5 ? this.scanT * 2 : (1 - this.scanT) * 2;
    const y = f.oy + ease * f.dh;
    const ctx = this.ctx;
    const pop = isPop();
    const g = ctx.createLinearGradient(0, y - 40 * d, 0, y + 6 * d);
    g.addColorStop(0, pop ? 'rgba(182,255,46,0)' : 'rgba(79,232,216,0)');
    g.addColorStop(1, pop ? 'rgba(182,255,46,.28)' : 'rgba(79,232,216,.20)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 40 * d, this._w, 46 * d);
    ctx.strokeStyle = pop ? '#B6FF2E' : 'rgba(160,250,240,.65)';
    ctx.lineWidth = 1.2 * d;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this._w, y); ctx.stroke();
  }
}

function flatten(set) {
  const out = [];
  if (!set) return out;
  for (const c of set) { out.push(c.start, c.end); }
  return out;
}

/* ─────────────────────────── STRIP CHART ──────────────────────────────── */
/* Six lanes, newest sample on the right, pen tip riding the edge.          */
export class StripChart {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.N = 320;
    this.buf = {}; KEYS.forEach(k => this.buf[k] = new Float32Array(this.N));
    this.marks = new Uint8Array(this.N);     // 1 while a question window is running
    this.head = 0; this.filled = 0;
    this.calm = false;
    this._w = 0; this._h = 0;
    this._dirty = true;
  }

  markDirty() { this._dirty = true; }
  clearData() {
    KEYS.forEach(k => this.buf[k].fill(0));
    this.marks.fill(0); this.head = 0; this.filled = 0;
  }
  push(d, reading) {
    const i = this.head;
    KEYS.forEach(k => { this.buf[k][i] = d ? clamp01(d[k]) : 0; });
    this.marks[i] = reading ? 1 : 0;
    this.head = (i + 1) % this.N;
    if (this.filled < this.N) this.filled++;
  }
  resize() {
    if (!this._dirty && this._w) return;
    this._dirty = false;
    const r = this.cv.getBoundingClientRect(); const d = DPR();
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (w !== this.cv.width || h !== this.cv.height) { this.cv.width = w; this.cv.height = h; }
    this._w = w; this._h = h;
  }
  draw() {
    if (this.cv.offsetParent === null) return;   // collapsed — nothing to paint
    this.resize();
    const ctx = this.ctx, W = this._w, H = this._h, d = DPR();
    ctx.clearRect(0, 0, W, H);

    const laneH = H / KEYS.length;
    const padL = 38 * d;
    const plotW = W - padL - 4 * d;

    const pop = isPop();
    /* lane rules only — no graph paper, no vertical grid */
    ctx.strokeStyle = pop ? 'rgba(26,16,48,.1)' : 'rgba(255,255,255,.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < KEYS.length; i++) { const y = Math.round(i * laneH) + .5; ctx.moveTo(padL, y); ctx.lineTo(W, y); }
    ctx.stroke();

    /* shade the spans that were inside a question window */
    if (this.filled > 1) {
      ctx.fillStyle = 'rgba(255,77,94,.07)';
      for (let j = 0; j < this.filled; j++) {
        const i = (this.head - this.filled + j + this.N * 2) % this.N;
        if (!this.marks[i]) continue;
        const x = padL + (j / (this.N - 1)) * plotW;
        ctx.fillRect(x, 0, Math.max(1, plotW / (this.N - 1) + 1), H);
      }
    }

    /* lanes */
    KEYS.forEach((k, li) => {
      const top = li * laneH, base = top + laneH - 3 * d, amp = laneH * 0.74;
      const buf = this.buf[k];
      const cur = this.filled ? buf[(this.head - 1 + this.N) % this.N] : 0;
      const col = rampRGB(cur);

      /* lane label — neutral until the signal has something to say */
      const lum = Math.min(1, cur * 2.2);
      ctx.fillStyle = pop
        ? 'rgba(26,16,48,.75)'
        : cur < 0.06 ? 'rgba(255,255,255,.26)' : `rgba(${col[0]},${col[1]},${col[2]},${0.34 + 0.5 * lum})`;
      ctx.font = pop
        ? `800 ${Math.round(10 * d)}px "Baloo 2",ui-rounded,system-ui,sans-serif`
        : `500 ${Math.round(9 * d)}px -apple-system,BlinkMacSystemFont,system-ui,sans-serif`;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(SIGNAL_SHORT[k], 3 * d, top + laneH / 2);

      if (this.filled < 2) return;

      /* area fill */
      ctx.beginPath();
      ctx.moveTo(padL, base);
      for (let j = 0; j < this.filled; j++) {
        const i = (this.head - this.filled + j + this.N * 2) % this.N;
        const x = padL + (j / (this.N - 1)) * plotW;
        ctx.lineTo(x, base - buf[i] * amp);
      }
      const lastX = padL + ((this.filled - 1) / (this.N - 1)) * plotW;
      ctx.lineTo(lastX, base); ctx.closePath();
      const g = ctx.createLinearGradient(0, top, 0, base);
      g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${pop ? .28 : .16})`);
      g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.fillStyle = g; ctx.fill();

      /* trace */
      ctx.beginPath();
      for (let j = 0; j < this.filled; j++) {
        const i = (this.head - this.filled + j + this.N * 2) % this.N;
        const x = padL + (j / (this.N - 1)) * plotW;
        const y = base - buf[i] * amp;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},.92)`;
      ctx.lineWidth = (pop ? 2 : 1.25) * d; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();

      /* pen tip */
      const py = base - cur * amp;
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.beginPath(); ctx.arc(lastX, py, 1.7 * d, 0, 6.2832); ctx.fill();
    });

    /* dead-band reference line across every lane */
    ctx.strokeStyle = pop ? 'rgba(26,16,48,.16)' : 'rgba(255,255,255,.06)';
    ctx.setLineDash([1.5 * d, 3.5 * d]);
    ctx.beginPath();
    KEYS.forEach((k, li) => {
      const y = Math.round(li * laneH + laneH - 3 * d - 0.18 * (laneH * 0.74)) + .5;
      ctx.moveTo(padL, y); ctx.lineTo(W, y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  }
}

/* ─────────────────────────── GAUGE ────────────────────────────────────── */
/* 270° arc. r=82 → circumference 515.22; the visible sweep is 3/4 of that. */
const CIRC = 2 * Math.PI * 82;
const SWEEP = CIRC * 0.75;

export class Gauge {
  constructor(arcEl, tipEl, ticksEl) {
    this.arc = arcEl; this.tip = tipEl;
    this.arc.style.strokeDasharray = `0 ${CIRC}`;
    if (ticksEl && !ticksEl.childElementCount) this._ticks(ticksEl);
  }
  _ticks(g) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i <= 40; i++) {
      const major = i % 10 === 0;
      const ang = (135 + (i / 40) * 270) * Math.PI / 180;
      const r1 = major ? 70 : 73, r2 = 77;
      const ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', 100 + Math.cos(ang) * r1); ln.setAttribute('y1', 100 + Math.sin(ang) * r1);
      ln.setAttribute('x2', 100 + Math.cos(ang) * r2); ln.setAttribute('y2', 100 + Math.sin(ang) * r2);
      ln.setAttribute('stroke-width', major ? '1.6' : '1');
      ln.setAttribute('stroke-linecap', 'round');
      ln.setAttribute('opacity', major ? '.9' : '.4');
      g.appendChild(ln);
    }
  }
  set(pct) {
    const v = clamp01(pct / 100);
    this.arc.style.stroke = rampCSS(v);
    this.arc.style.strokeDasharray = `${SWEEP * v} ${CIRC}`;
    // tip sits on the arc; the <svg> itself is rotated 135°, so 0% is at angle 0
    const ang = v * 270 * Math.PI / 180;
    this.tip.setAttribute('cx', 100 + Math.cos(ang) * 82);
    this.tip.setAttribute('cy', 100 + Math.sin(ang) * 82);
  }
}

/* tiny inline sparkline for history rows */
export function sparkline(per) {
  const pts = KEYS.map((k, i) => {
    const x = (i / (KEYS.length - 1)) * 52 + 1;
    const y = 15 - clamp01(per[k] || 0) * 13;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="hs-spark" viewBox="0 0 54 16" aria-hidden="true">
    <polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
