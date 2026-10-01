/* ============================================================================
   sfx.js — audio cues + haptics. Both are opt-out in Settings.
   Audio is synthesised with WebAudio so the bundle ships no media files.
   ========================================================================== */

const Haptics = () => (window.Capacitor?.Plugins?.Haptics) || null;

class Sfx {
  constructor() { this.ctx = null; this.on = true; this.hapticsOn = true; }

  configure({ sound, haptics }) { this.on = !!sound; this.hapticsOn = !!haptics; }

  /* must be called from inside a user gesture the first time */
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) { this.ctx = null; }
  }

  _tone({ freq = 440, dur = .12, type = 'sine', gain = .07, slideTo = null, delay = 0 }) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + .02);
  }

  tick()      { this._tone({ freq: 1180, dur: .045, type: 'square', gain: .022 }); this.tap('light'); }
  tickLast()  { this._tone({ freq: 1560, dur: .07, type: 'square', gain: .035 }); this.tap('medium'); }
  armed()     { this._tone({ freq: 520, dur: .1, type: 'triangle', gain: .05 });
                this._tone({ freq: 784, dur: .16, type: 'triangle', gain: .045, delay: .09 }); this.tap('medium'); }
  start()     { this._tone({ freq: 300, slideTo: 620, dur: .17, type: 'sawtooth', gain: .035 }); this.tap('medium'); }
  fail()      { this._tone({ freq: 300, slideTo: 170, dur: .26, type: 'triangle', gain: .05 }); this.tap('heavy'); }

  reveal(pct) {
    this.tap(pct >= 68 ? 'heavy' : pct >= 40 ? 'medium' : 'light');
    if (pct >= 68) {
      this._tone({ freq: 420, dur: .2, type: 'sawtooth', gain: .05 });
      this._tone({ freq: 330, dur: .3, type: 'sawtooth', gain: .045, delay: .13 });
    } else if (pct >= 40) {
      this._tone({ freq: 560, dur: .16, type: 'triangle', gain: .05 });
      this._tone({ freq: 700, dur: .2, type: 'triangle', gain: .04, delay: .11 });
    } else {
      this._tone({ freq: 660, dur: .14, type: 'sine', gain: .05 });
      this._tone({ freq: 990, dur: .24, type: 'sine', gain: .04, delay: .1 });
    }
  }

  tap(style = 'light') {
    if (!this.hapticsOn) return;
    const h = Haptics();
    if (h) { try { h.impact({ style: style.toUpperCase() }); return; } catch (e) {} }
    if (navigator.vibrate) navigator.vibrate(style === 'heavy' ? 26 : style === 'medium' ? 14 : 7);
  }
}

export const sfx = new Sfx();
