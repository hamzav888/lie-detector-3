/* ============================================================================
   face.js — the cartoon Truth-o-meter face from the website, in plain SVG.
   One geometry, one paint function, used on the home meter, the live
   readout and the result sheet. Only visible under the "pop" skin.
   Geometry and expression curves are ported 1:1 from the site's Meter.tsx
   (recentred onto a 160×160 box) so the two always pull the same faces.
   ========================================================================== */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const INK = '#1A1030';

function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lerpColor(a, b, t) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}

export function faceMarkup(cls = '') {
  return `<svg class="mood-face ${cls}" viewBox="0 0 160 160" aria-hidden="true">
  <circle class="mf-head" cx="80" cy="80" r="70" fill="#FFD84D" stroke="${INK}" stroke-width="7"/>
  <ellipse class="mf-blush" cx="38" cy="92" rx="13" ry="8" fill="#FF3B7A" opacity="0"/>
  <ellipse class="mf-blush" cx="122" cy="92" rx="13" ry="8" fill="#FF3B7A" opacity="0"/>
  <g class="mf-brows" stroke="${INK}" stroke-width="6" stroke-linecap="round">
    <line class="mf-bl" x1="38" y1="58" x2="66" y2="58"/>
    <line class="mf-br" x1="94" y1="58" x2="122" y2="58"/>
  </g>
  <ellipse class="mf-el" cx="52" cy="76" rx="10" ry="9" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
  <ellipse class="mf-er" cx="108" cy="76" rx="10" ry="9" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
  <circle class="mf-pl" cx="52" cy="78" r="5.5" fill="${INK}"/>
  <circle class="mf-pr" cx="108" cy="78" r="5.5" fill="${INK}"/>
  <g stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none">
    <path class="mf-smile" d="M52 108 Q80 128 108 108"/>
    <path class="mf-flat" d="M54 112 q9 -8 18 0 t18 0 t8 0" opacity="0"/>
  </g>
  <g class="mf-panic" opacity="0">
    <ellipse cx="80" cy="114" rx="16" ry="20" fill="#7A1030" stroke="${INK}" stroke-width="6"/>
    <ellipse cx="80" cy="126" rx="8" ry="10" fill="#FF5C7A"/>
  </g>
  <g class="mf-sweat" opacity="0">
    <path d="M16 66 q-7 12 0 18 q7 -6 0 -18 Z" fill="#4DA6FF" stroke="${INK}" stroke-width="3"/>
    <path d="M146 72 q-7 12 0 18 q7 -6 0 -18 Z" fill="#4DA6FF" stroke="${INK}" stroke-width="3"/>
  </g>
</svg>`;
}

/* v is 0–100. Calm sunny yellow → flushed, sweating panic. */
export function paintFace(svg, v) {
  if (!svg) return;
  const t = clamp(v / 100);
  const q = sel => svg.querySelector(sel);

  q('.mf-head').setAttribute('fill', lerpColor('#FFD84D', '#FF6B5C', Math.min(1, t * 1.15)));

  const ry = lerp(9, 15, t), rx = lerp(10, 13.5, t);
  for (const e of ['.mf-el', '.mf-er']) { q(e).setAttribute('rx', rx); q(e).setAttribute('ry', ry); }
  const pr = lerp(5.5, 3.6, t), py = 76 + lerp(2, -3.5, t);
  for (const e of ['.mf-pl', '.mf-pr']) { q(e).setAttribute('r', pr); q(e).setAttribute('cy', py); }

  const browY = lerp(0, -4, t), tilt = lerp(-6, 16, t);
  q('.mf-brows').setAttribute('transform', `translate(0 ${browY})`);
  q('.mf-bl').setAttribute('transform', `rotate(${tilt} 52 58)`);
  q('.mf-br').setAttribute('transform', `rotate(${-tilt} 108 58)`);

  q('.mf-smile').setAttribute('opacity', clamp(1 - t * 2.4));
  q('.mf-flat').setAttribute('opacity', clamp(1 - Math.abs(t - 0.5) * 3.2));
  q('.mf-panic').setAttribute('opacity', clamp((t - 0.55) * 2.6));
  q('.mf-sweat').setAttribute('opacity', clamp((t - 0.45) * 2.4));
  svg.querySelectorAll('.mf-blush').forEach(b => b.setAttribute('opacity', clamp((t - 0.5) * 2) * 0.7));
}

/* The site's loud verdict words, mapped onto the app's own bands
   (28 / 45 / 62 / 78) so the chip and the descriptive verdict agree. */
export function popVerdict(p) {
  if (p < 15) return { word: 'TOO HONEST', tone: 'lime' };
  if (p < 28) return { word: 'SMOOTH', tone: 'lime' };
  if (p < 45) return { word: 'HMMMM…', tone: 'sun' };
  if (p < 62) return { word: 'KINDA SUS', tone: 'sun' };
  if (p < 78) return { word: 'BUSTED', tone: 'magenta' };
  return { word: 'CAUGHT!!', tone: 'danger' };
}
