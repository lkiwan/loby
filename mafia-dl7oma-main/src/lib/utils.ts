import { useEffect, useState } from 'react'

export const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

const clampNum = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** returns seconds remaining between deadline and now, or null */
export function useCountdown(deadline: number | null): number | null {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [])
  if (!deadline) return null
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const pct = (v: number, min = 0, max = 100) => `${clampNum(v, min, max).toFixed(2)}%`

/** positions for an ellipse of n items, starting at top (-90 deg) */
export function ellipsePos(
  n: number,
  i: number,
  opts: { cx?: number; cy?: number; rx?: number; ry?: number; start?: number } = {},
) {
  const { cx = 50, cy = 50, rx = 41, ry = 44, start = -90 } = opts
  const a = ((start + (360 / n) * i) * Math.PI) / 180
  return {
    left: pct(cx + rx * Math.cos(a)),
    top: pct(cy + ry * Math.sin(a)),
    rotate: clampNum((a * 180) / Math.PI + 90, -40, 40),
  }
}