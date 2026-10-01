/* ============================================================================
   store.js — settings + session history.
   Uses Capacitor Preferences (UserDefaults / SharedPreferences) when running
   natively so the data survives WebView storage eviction; falls back to
   localStorage in a plain browser. Everything stays on the device.
   ========================================================================== */

import { DEFAULT_DURATIONS, DEFAULT_PROFILE } from './engine.js';

const K_SET = 'tellmeter.settings.v1';
const K_HIST = 'tellmeter.sessions.v1';
const MAX_SESSIONS = 40;
const MAX_READINGS = 60;

const Prefs = () => (window.Capacitor?.Plugins?.Preferences) || null;

export const DEFAULT_SETTINGS = {
  onboarded: false,
  profile: DEFAULT_PROFILE,
  haptics: true,
  sound: true,
  calm: false,
  mesh: 'contours',
  mirror: true,
  calibSecs: DEFAULT_DURATIONS.calibSecs,
  askSecs: DEFAULT_DURATIONS.askSecs
};

class Store {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.sessions = [];
    this.session = null;           // the session currently being recorded
  }

  async load() {
    const s = await this._get(K_SET);
    if (s) this.settings = { ...DEFAULT_SETTINGS, ...s };
    const h = await this._get(K_HIST);
    if (Array.isArray(h)) this.sessions = h;
    return this;
  }

  async _get(key) {
    try {
      const p = Prefs();
      const raw = p ? (await p.get({ key })).value : localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  async _set(key, val) {
    const raw = JSON.stringify(val);
    try {
      const p = Prefs();
      if (p) await p.set({ key, value: raw });
      else localStorage.setItem(key, raw);
    } catch (e) { /* storage full or blocked — the app still works, just forgets */ }
  }
  async _del(key) {
    try {
      const p = Prefs();
      if (p) await p.remove({ key }); else localStorage.removeItem(key);
    } catch (e) {}
  }

  set(patch) { Object.assign(this.settings, patch); this._set(K_SET, this.settings); }

  /* ── sessions ─────────────────────────────────────────────────────────── */
  startSession(baselineMeta) {
    this.session = {
      id: 'S' + Date.now().toString(36),
      startedAt: Date.now(),
      baseline: baselineMeta || null,
      readings: []
    };
    return this.session;
  }

  addReading(r) {
    if (!this.session) this.startSession(null);
    this.session.readings.push(r);
    if (this.session.readings.length > MAX_READINGS) this.session.readings.shift();
    this._commit();
    return r;
  }

  updateReading(id, patch) {
    const r = this.session?.readings.find(x => x.id === id);
    if (r) { Object.assign(r, patch); this._commit(); }
  }

  dropReading(id) {
    if (!this.session) return;
    this.session.readings = this.session.readings.filter(x => x.id !== id);
    this._commit();
  }

  endSession() {
    if (this.session && !this.session.readings.length) {
      this.sessions = this.sessions.filter(s => s.id !== this.session.id);
      this._set(K_HIST, this.sessions);
    }
    this.session = null;
  }

  _commit() {
    if (!this.session) return;
    this.session.endedAt = Date.now();
    const i = this.sessions.findIndex(s => s.id === this.session.id);
    if (i >= 0) this.sessions[i] = this.session; else this.sessions.unshift(this.session);
    if (this.sessions.length > MAX_SESSIONS) this.sessions.length = MAX_SESSIONS;
    this._set(K_HIST, this.sessions);
  }

  clearHistory() { this.sessions = []; this.session = null; this._del(K_HIST); }

  get questionCount() { return this.session ? this.session.readings.length : 0; }

  summaryText() {
    if (!this.sessions.length) return 'No Tellmeter readings saved yet.';
    const lines = ['Tellmeter — saved readings', ''];
    for (const s of this.sessions.slice(0, 8)) {
      const when = new Date(s.startedAt).toLocaleString();
      const avg = s.readings.length
        ? Math.round(s.readings.reduce((a, r) => a + r.pct, 0) / s.readings.length) : 0;
      lines.push(`${when} — ${s.readings.length} question${s.readings.length === 1 ? '' : 's'}, avg ${avg}%`);
      for (const r of s.readings) lines.push(`   • ${r.label || 'Untitled'} — ${Math.round(r.pct)}% (${r.corrob}/6 agreed)`);
      lines.push('');
    }
    lines.push('Tension index measures visible stress against your own baseline. For entertainment — not a lie detector.');
    return lines.join('\n');
  }
}

export const store = new Store();
