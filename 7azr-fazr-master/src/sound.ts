let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function buzz(times: number[]): void {
  const a = ac()
  if (!a) return
  times.forEach((ms, i) => {
    const osc = a.createOscillator()
    const gain = a.createGain()
    osc.type = 'square'
    osc.frequency.value = 440
    const t = a.currentTime + i * 0.18
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
    osc.connect(gain)
    gain.connect(a.destination)
    osc.start(t)
    osc.stop(t + ms / 1000 + 0.02)
  })
}

export function timeUp(): void {
  buzz([180, 180, 180, 240])
}

export function tick(): void {
  buzz([30])
}