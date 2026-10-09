/* Web Audio API sound synthesizer — no audio files needed.
   All sounds are generated programmatically so they play instantly. */

let _ctx: AudioContext | null = null;
let _gestureSeen = false;

/* Browsers refuse to start an AudioContext created before any user gesture and
   log "The AudioContext was not allowed to start". Construction is therefore
   gated on a real gesture; everything else waits for the first
   pointerdown/click/keydown (see the gesture wiring below). */
function hasGesture(): boolean {
  if (_gestureSeen) return true;
  try {
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive?: boolean } })
      .userActivation;
    return ua?.hasBeenActive === true;
  } catch {
    return false;
  }
}

function createCtx(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    _ctx = new Ctor();
    /* If the browser suspends again (tab switch / OS policy) and later resumes,
       release anything still waiting for audible playback. */
    _ctx.onstatechange = () => { if (_ctx && _ctx.state === 'running') fireReady(); };
    return _ctx;
  } catch {
    _ctx = null;
    return null;
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const ctx = _ctx ?? (hasGesture() ? createCtx() : null);
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/* ── Autoplay unlock manager ──
   Browsers block audible playback until a user gesture (and on iOS until the
   page has been interacted with). Strategy:
      1. Construct the AudioContext lazily — only once a gesture has happened —
         so no console warning and nothing to unlock on load.
      2. Stay subscribed to every gesture so the very first tap/keypress
         anywhere creates + resumes the context (and re-resumes it if the
         browser suspends it again).
      3. Retry on tab focus / visibility, since some browsers only lift the
         suspension then.                                                              */

const _readyCbs = new Set<() => void>();

function fireReady() {
  if (!_ctx || _ctx.state !== 'running' || _readyCbs.size === 0) return;
  const cbs = Array.from(_readyCbs);
  _readyCbs.clear();
  cbs.forEach((cb) => { try { cb(); } catch {} });
}

/** True when the shared AudioContext is actually producing sound. */
export function isAudioRunning() {
  return !!_ctx && _ctx.state === 'running';
}

/** Kick the context out of suspension. Safe to call at any time — it only
    constructs the AudioContext once a user gesture has already happened. */
export function unlockAudio() {
  getCtx();
  if (!_ctx) return;
  if (_ctx.state === 'suspended') _ctx.resume().then(fireReady).catch(() => {});
  else fireReady();
}

/** Re-resume an existing context from non-gesture events (focus/visibility);
    never constructs one, so those events can't trigger the autoplay warning. */
function resumeExisting() {
  if (!_ctx) return;
  if (_ctx.state === 'suspended') _ctx.resume().then(fireReady).catch(() => {});
  else fireReady();
}

/** Run cb as soon as audio is running (now, or after the next unlock). */
export function onAudioReady(cb: () => void): () => void {
  _readyCbs.add(cb);
  if (isAudioRunning()) fireReady();
  return () => { _readyCbs.delete(cb); };
}

if (typeof window !== 'undefined') {
  const gestures: (keyof WindowEventMap)[] = [
    'pointerdown', 'pointerup', 'touchstart', 'touchend',
    'click', 'keydown', 'keyup', 'wheel', 'scroll',
  ];
  const onGesture = () => {
    _gestureSeen = true;
    unlockAudio();
  };
  gestures.forEach((evt) =>
    window.addEventListener(evt, onGesture, { capture: true, passive: true }),
  );
  window.addEventListener('focus', resumeExisting);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resumeExisting();
  });
}

/* ── Mute state (persisted in localStorage) ── */
let _muted = false;
if (typeof window !== 'undefined') {
  try { _muted = localStorage.getItem('sfx_muted') === '1'; } catch {}
}

export function isMuted() { return _muted; }
export function setMuted(v: boolean) {
  _muted = v;
  try { localStorage.setItem('sfx_muted', v ? '1' : '0'); } catch {}
}

/* ── Primitive: schedule a single tone ── */
function tone(
  ac: AudioContext,
  freq: number,
  type: OscillatorType,
  start: number,
  duration: number,
  peak: number,
) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.001, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/* ── Sound library ── */
export const Sounds = {
  /* Coin spend — quick ascending arpeggio (C5 → E5 → G5) */
  coin() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    tone(ac, 523, 'sine', t,        0.10, 0.22);
    tone(ac, 659, 'sine', t + 0.07, 0.11, 0.20);
    tone(ac, 784, 'sine', t + 0.13, 0.15, 0.17);
  },

  /* Game launch — rising synth sweep */
  launch() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.35);
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.40);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  },

  /* Mission claim — triumphant 4-note chime */
  claim() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    ([659, 784, 1047, 1319] as const).forEach((freq, i) => {
      tone(ac, freq, 'sine', t + i * 0.09, 0.40 - i * 0.05, 0.22);
    });
  },

  /* Daily check-in — warm ascending scale */
  checkin() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    ([523, 659, 784, 1047] as const).forEach((freq, i) => {
      tone(ac, freq, 'triangle', t + i * 0.11, 0.28, 0.20);
    });
  },

  /* Level up — short fanfare */
  levelup() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    ([523, 659, 784, 1047, 1319] as const).forEach((freq, i) => {
      tone(ac, freq, 'triangle', t + i * 0.10, 0.35, 0.24 - i * 0.02);
    });
  },

  /* Success toast — two-note chime (G5 → B5) */
  ok() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    tone(ac, 784, 'sine', t,        0.12, 0.14);
    tone(ac, 988, 'sine', t + 0.09, 0.18, 0.11);
  },

  /* Error — two low sawtooth bumps */
  error() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    tone(ac, 220, 'sawtooth', t,        0.12, 0.16);
    tone(ac, 196, 'sawtooth', t + 0.10, 0.14, 0.11);
  },

  /* UI click — soft high tick */
  click() {
    const ac = getCtx(); if (!ac || _muted) return;
    const t = ac.currentTime;
    tone(ac, 900, 'sine', t, 0.03, 0.04);
  },
};

/* ── Music mute state (persisted separately from SFX) ── */
let _musicMuted = false;
if (typeof window !== 'undefined') {
  try { _musicMuted = localStorage.getItem('music_muted') === '1'; } catch {}
}

export function isMusicMuted() { return _musicMuted; }
export function setMusicMuted(v: boolean) {
  _musicMuted = v;
  try { localStorage.setItem('music_muted', v ? '1' : '0'); } catch {}
}

/* ── Background music sequencer (D Bayati maqam, 110 BPM) ──────────────────
   Style: Gaming × Darbouka × Kamanja
   D Bayati scale: D · Eb · F · G · A · Bb · C · D
     doum    — deep darbouka boom       (sine sweep + sub-bass)
     tek     — bright darbouka click    (noise burst + tone)
     ka      — dry darbouka snap        (highpass noise)
     sagat   — metallic finger cymbal   (inharmonic sine cluster)
     oud     — plucked string bass      (sawtooth + triangle)
     kamanja — bowed string melody      (sawtooth + LFO vibrato)
     pad     — Dm7 drone               (sine/triangle blend)
──────────────────────────────────────────────────────────────────────────── */
const _MBPM  = 110;
const _MSTEP = 60 / _MBPM / 4;  // 16th-note ≈ 0.136 s

// D Bayati: D      Eb     F      G      A      Bb     C      D(oct)
const _BASS_FREQS = [146.83, 155.56, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66]; // D3–D4
const _KAM_FREQS  = [293.66, 311.13, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33]; // D4–D5

// 32-step darbouka "karachi" pattern (2 bars, 16th-note grid)
const _MDOUM  = [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0];
const _MTEK   = [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,1,1,0, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,1,1];
const _MKA    = [0,1,0,0, 1,0,0,0, 0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,0, 0,1,0,0, 0,0,0,1];
const _MSAGAT = [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1];
// Oud bass root motion in D Bayati
const _MBASS  = [0,-1,-1,-1, -1,2,-1,-1, 3,-1,-1,-1, 2,-1,-1,-1, 4,-1,-1,-1, -1,3,-1,-1, 2,-1,-1,-1, 0,-1,-1,-1];
// Kamanja: D4→F4→A4→G4 | F4→Eb4→D4→rest  (classic Bayati descending arc)
const _MKAM   = [0,-1,-1,-1, 2,-1,-1,-1, 4,-1,-1,-1, 3,-1,-1,-1, 2,-1,-1,-1, 1,-1,-1,-1, 0,-1,-1,-1, -1,-1,-1,-1];

class MusicPlayer {
  private _ctx: AudioContext | null = null;
  private _master: GainNode | null = null;
  private _pads: OscillatorNode[] = [];
  private _playing = false;
  private _timer: ReturnType<typeof setInterval> | null = null;
  private _step = 0;
  private _next = 0;

  private _ac(): AudioContext | null {
    const ac = getCtx();
    if (!ac) return null;
    if (!this._ctx) {
      this._ctx = ac;
      this._master = ac.createGain();
      this._master.gain.value = 0;
      this._master.connect(ac.destination);
    }
    return ac;
  }

  // Doum — deep darbouka boom + sub-bass gaming punch
  private _doum(t: number) {
    const ac = this._ctx!;
    // Main doum body
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.frequency.setValueAtTime(195, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    g.gain.setValueAtTime(1.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.connect(g); g.connect(this._master!);
    osc.start(t); osc.stop(t + 0.26);
    // Sub-bass gaming punch
    const sub = ac.createOscillator(), sg = ac.createGain();
    sub.frequency.setValueAtTime(55, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.18);
    sg.gain.setValueAtTime(0.85, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
    sub.connect(sg); sg.connect(this._master!);
    sub.start(t); sub.stop(t + 0.22);
  }

  // Tek — bright darbouka click (noise + tone)
  private _tek(t: number) {
    const ac = this._ctx!;
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * 0.045), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; flt.type = 'bandpass'; flt.frequency.value = 4800; flt.Q.value = 1.8;
    g.gain.setValueAtTime(0.88, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.042);
    src.connect(flt); flt.connect(g); g.connect(this._master!);
    src.start(t); src.stop(t + 0.05);
    // Tone component for the "tik" pitch
    const osc = ac.createOscillator(), og = ac.createGain();
    osc.frequency.value = 900;
    og.gain.setValueAtTime(0.30, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
    osc.connect(og); og.connect(this._master!);
    osc.start(t); osc.stop(t + 0.025);
  }

  // Ka — dry darbouka snap
  private _ka(t: number) {
    const ac = this._ctx!;
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * 0.028), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; flt.type = 'highpass'; flt.frequency.value = 3500;
    g.gain.setValueAtTime(0.42, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    src.connect(flt); flt.connect(g); g.connect(this._master!);
    src.start(t); src.stop(t + 0.03);
  }

  // Sagat — metallic finger-cymbal ring
  private _sagat(t: number) {
    const ac = this._ctx!;
    [1760, 2640, 3520].forEach((freq, i) => {
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * (1 + i * 0.008);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.060 - i * 0.016, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + i * 0.015);
      osc.connect(g); g.connect(this._master!);
      osc.start(t); osc.stop(t + 0.09);
    });
  }

  // Oud bass — plucked string (sawtooth + triangle, filter sweep)
  private _bass(freq: number, t: number) {
    const ac = this._ctx!;
    (['sawtooth', 'triangle'] as OscillatorType[]).forEach((type, i) => {
      const osc = ac.createOscillator(), flt = ac.createBiquadFilter(), g = ac.createGain();
      osc.type = type; osc.frequency.value = freq;
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(1400, t);
      flt.frequency.exponentialRampToValueAtTime(220, t + _MSTEP * 2.8);
      const pk = i === 0 ? 0.26 : 0.38;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(pk, t + 0.009);
      g.gain.exponentialRampToValueAtTime(0.001, t + _MSTEP * 3.6);
      osc.connect(flt); flt.connect(g); g.connect(this._master!);
      osc.start(t); osc.stop(t + _MSTEP * 4);
    });
  }

  // Kamanja — bowed string with LFO vibrato (sawtooth + lowpass + vibrato)
  private _kamanja(freq: number, t: number) {
    const ac = this._ctx!;
    const dur = _MSTEP * 3.6;
    const osc = ac.createOscillator();
    const flt = ac.createBiquadFilter();
    const g   = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    // LFO vibrato at 5.5 Hz, depth ~1.2% of fundamental
    const lfo = ac.createOscillator(), lfoG = ac.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    lfoG.gain.value = freq * 0.012;
    lfo.connect(lfoG); lfoG.connect(osc.frequency);
    // Warm lowpass
    flt.type = 'lowpass'; flt.frequency.value = freq * 3.5; flt.Q.value = 1.2;
    // Bow envelope: slow attack → sustain → release
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.21, t + 0.11);
    g.gain.setValueAtTime(0.21, t + dur - 0.09);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(flt); flt.connect(g); g.connect(this._master!);
    lfo.start(t); osc.start(t);
    lfo.stop(t + dur + 0.05); osc.stop(t + dur + 0.05);
  }

  // Dm7 atmospheric pad: D3 F3 A3 C4
  private _startPad() {
    const ac = this._ctx!;
    [146.83, 174.61, 220.00, 261.63].forEach((freq, i) => {
      const osc = ac.createOscillator(), flt = ac.createBiquadFilter(), g = ac.createGain();
      osc.type = i < 2 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      flt.type = 'lowpass'; flt.frequency.value = 420; flt.Q.value = 0.5;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.044 - i * 0.008, ac.currentTime + 5);
      osc.connect(flt); flt.connect(g); g.connect(this._master!);
      osc.start();
      this._pads.push(osc);
    });
  }

  private _stopPad() {
    if (!this._ctx) return;
    const t = this._ctx.currentTime + 1.2;
    this._pads.forEach((o) => { try { o.stop(t); } catch {} });
    this._pads = [];
  }

  private _scheduleStep(s: number, t: number) {
    if (_MDOUM[s])  this._doum(t);
    if (_MTEK[s])   this._tek(t);
    if (_MKA[s])    this._ka(t);
    if (_MSAGAT[s]) this._sagat(t);
    const bi = _MBASS[s]; if (bi >= 0) this._bass(_BASS_FREQS[bi], t);
    const ki = _MKAM[s];  if (ki >= 0) this._kamanja(_KAM_FREQS[ki], t);
  }

  private _tick() {
    const ac = this._ctx!;
    while (this._next < ac.currentTime + 0.15) {
      this._scheduleStep(this._step, this._next);
      this._next += _MSTEP;
      this._step = (this._step + 1) % 32;
    }
  }

  private _doStart() {
    const ac = this._ac();
    if (!ac || ac.state !== 'running') {
      this._pending = true;
      this._subscribe();
      return;
    }
    this._pending = false;
    this._playing = true;
    this._step = 0;
    this._next = ac.currentTime + 0.05;
    this._master!.gain.setValueAtTime(0, ac.currentTime);
    if (!_musicMuted) {
      this._master!.gain.linearRampToValueAtTime(0.40, ac.currentTime + 2.8);
    }
    this._startPad();
    this._timer = setInterval(() => this._tick(), 30);
  }

  private _pending = false;
  private _unsubscribe: (() => void) | null = null;

  private _subscribe() {
    if (this._unsubscribe) return;
    let firedSync = false;
    const unsub = onAudioReady(() => {
      firedSync = true;
      this._unsubscribe = null;
      if (this._pending) this._doStart();
    });
    if (!firedSync) this._unsubscribe = unsub;
  }

  start() {
    if (this._playing) return;
    this._pending = true;
    this._subscribe();
    unlockAudio();
  }

  stop() {
    this._pending = false;
    this._unsubscribe?.();
    this._unsubscribe = null;
    if (!this._playing) return;
    this._playing = false;
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._stopPad();
    if (this._master && this._ctx) {
      this._master.gain.setTargetAtTime(0, this._ctx.currentTime, 0.4);
    }
  }

  setVolume(muted: boolean) {
    setMusicMuted(muted);
    if (this._master && this._ctx) {
      this._master.gain.setTargetAtTime(muted ? 0 : 0.40, this._ctx.currentTime, 0.15);
    }
  }

  get isPlaying() { return this._playing; }
}

export const musicPlayer = new MusicPlayer();

/* Dev-only hook so automated checks can assert the context really resumed
   after a gesture (ctx.state === 'running'). Stripped from production builds. */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as {
    __audioDebug?: { contextState: () => string; musicPlaying: () => boolean };
  }).__audioDebug = {
    contextState: () => _ctx?.state ?? 'none',
    musicPlaying: () => musicPlayer.isPlaying,
  };
}
