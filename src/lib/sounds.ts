/* Web Audio API sound synthesizer — no audio files needed.
   All sounds are generated programmatically so they play instantly. */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return _ctx;
  } catch {
    return null;
  }
}

/* Unlock AudioContext on first user interaction so sounds work in effects too */
if (typeof window !== 'undefined') {
  const unlock = () => { getCtx(); };
  window.addEventListener('click',      unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
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
