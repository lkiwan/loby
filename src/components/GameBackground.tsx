'use client';

/* Fixed positions — no Math.random() so no hydration mismatch */
const EMOJIS = [
  { e: '🎮', l: 4,  s: 1.7, d: 13, dl: 0    },
  { e: '🃏', l: 11, s: 1.3, d: 17, dl: -5   },
  { e: '💀', l: 18, s: 2.0, d: 11, dl: -9   },
  { e: '🔥', l: 25, s: 1.5, d: 15, dl: -2   },
  { e: '⚡', l: 32, s: 1.4, d: 10, dl: -13  },
  { e: '🎲', l: 39, s: 1.8, d: 14, dl: -6   },
  { e: '🏆', l: 47, s: 1.6, d: 18, dl: -3   },
  { e: '💎', l: 54, s: 1.3, d: 12, dl: -11  },
  { e: '🌟', l: 61, s: 2.1, d: 16, dl: -8   },
  { e: '🎯', l: 68, s: 1.5, d: 11, dl: -1   },
  { e: '👑', l: 75, s: 1.7, d: 19, dl: -14  },
  { e: '💥', l: 82, s: 1.4, d: 13, dl: -7   },
  { e: '🎪', l: 89, s: 1.6, d: 15, dl: -10  },
  { e: '🤣', l: 95, s: 1.3, d: 12, dl: -4   },
  { e: '🎰', l: 7,  s: 1.9, d: 20, dl: -16  },
  { e: '🃏', l: 57, s: 1.2, d: 10, dl: -12  },
];

const SHAPES = [
  { t: 'diamond', l: 6,  c: '#f2b23d', sz: 14, d: 20, dl: 0   },
  { t: 'circle',  l: 20, c: '#00d9ff', sz: 10, d: 15, dl: -6  },
  { t: 'diamond', l: 34, c: '#a855f7', sz: 18, d: 24, dl: -11 },
  { t: 'circle',  l: 48, c: '#ff2d55', sz: 12, d: 17, dl: -3  },
  { t: 'diamond', l: 62, c: '#00ff88', sz: 16, d: 22, dl: -8  },
  { t: 'circle',  l: 76, c: '#f2b23d', sz: 9,  d: 14, dl: -14 },
  { t: 'diamond', l: 86, c: '#00d9ff', sz: 20, d: 26, dl: -5  },
  { t: 'circle',  l: 94, c: '#a855f7', sz: 11, d: 16, dl: -9  },
];

const STARS = [
  { t: '8%',  dl: '0s',    dr: '3.5s' },
  { t: '22%', dl: '4.2s',  dr: '5s'   },
  { t: '38%', dl: '8.8s',  dr: '4s'   },
  { t: '54%', dl: '2.1s',  dr: '6s'   },
  { t: '70%', dl: '13.5s', dr: '3.8s' },
];

export default function GameBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* ── Animated ambient blobs ── */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />
      <div className="ambient-blob blob-4" />
      <div className="ambient-blob blob-5" />

      {/* ── Perspective floor grid ── */}
      <div className="perspective-floor" />

      {/* ── Shooting stars ── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="shooting-star"
          style={{ top: s.t, animationDelay: s.dl, animationDuration: s.dr }}
        />
      ))}

      {/* ── Floating game emojis ── */}
      {EMOJIS.map((item, i) => (
        <span
          key={i}
          className="float-emoji"
          style={{
            left: `${item.l}%`,
            fontSize: `${item.s}rem`,
            animationDuration: `${item.d}s`,
            animationDelay: `${item.dl}s`,
          }}
        >
          {item.e}
        </span>
      ))}

      {/* ── Floating neon shapes ── */}
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className={`float-shape float-shape-${s.t}`}
          style={{
            left: `${s.l}%`,
            width: s.sz,
            height: s.t === 'diamond' ? s.sz : s.sz,
            borderColor: s.c,
            boxShadow: `0 0 10px ${s.c}70, 0 0 20px ${s.c}30`,
            animationDuration: `${s.d}s`,
            animationDelay: `${s.dl}s`,
          }}
        />
      ))}
    </div>
  );
}
