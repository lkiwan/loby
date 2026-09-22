import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { Point, Stroke as StrokeData } from '../types'

interface CanvasProps {
  strokes: StrokeData[]
  activeColor: string | null
  brushSize?: number
  onStrokeComplete: (points: Point[]) => void
  /** Used only as React key in the parent to wipe the canvas on new round */
  drawerId: string
}

/**
 * Shared drawing canvas — unlimited multi-stroke, never cleared between drawers.
 * Parent uses key={`round-N`} to remount (and wipe) on each new round.
 * Initialization runs once on mount; strokes persist until remount.
 */
export function Canvas({
  strokes,
  activeColor,
  brushSize = 5,
  onStrokeComplete,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const livePoints = useRef<Point[]>([])
  const isDrawing = useRef(false)
  const [ready, setReady] = useState(false)

  // ── Initialize ONCE on mount ────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = wrap.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      // Preserve existing drawing during resize
      const prev = canvas.toDataURL()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctxRef.current = ctx
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Restore after resize
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setReady(true)
      }
      img.src = prev
    }

    const dpr = window.devicePixelRatio || 1
    const rect = wrap.getBoundingClientRect()
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    setReady(true)

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, []) // ← empty: only runs on mount (key handles round reset)

  // ── Redraw committed strokes whenever they change ───────────────────────
  useEffect(() => {
    if (!ready) return
    redrawAll(livePoints.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, ready])

  function redrawAll(live: Point[]) {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const wrap = wrapRef.current
    if (!canvas || !ctx || !wrap) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const s of strokes) {
      drawPath(ctx, s.points, s.color, s.width, dpr, wrap)
    }
    if (live.length > 1 && activeColor) {
      drawPath(ctx, live, activeColor, brushSize, dpr, wrap)
    }
  }

  function drawPath(
    ctx: CanvasRenderingContext2D,
    pts: Point[],
    color: string,
    width: number,
    dpr: number,
    wrap: HTMLDivElement,
  ) {
    if (pts.length < 2) return
    const { clientWidth: cw, clientHeight: ch } = wrap
    const canvas = canvasRef.current!
    const scaleX = canvas.width / cw
    const scaleY = canvas.height / ch

    ctx.strokeStyle = color
    ctx.lineWidth = width * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(pts[0].x * scaleX, pts[0].y * scaleY)
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const cur = pts[i]
      ctx.quadraticCurveTo(
        prev.x * scaleX,
        prev.y * scaleY,
        ((prev.x + cur.x) / 2) * scaleX,
        ((prev.y + cur.y) / 2) * scaleY,
      )
    }
    ctx.stroke()
  }

  function cssPoint(e: PointerEvent<HTMLCanvasElement>): Point {
    const wrap = wrapRef.current
    if (!wrap) return { x: 0, y: 0 }
    const rect = wrap.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handleDown(e: PointerEvent<HTMLCanvasElement>) {
    if (!activeColor || isDrawing.current) return
    isDrawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    livePoints.current = [cssPoint(e)]
  }

  function handleMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !activeColor) return
    livePoints.current = [...livePoints.current, cssPoint(e)]
    redrawAll(livePoints.current)
  }

  function handleUp() {
    if (!isDrawing.current) return
    isDrawing.current = false
    const pts = livePoints.current
    livePoints.current = []
    redrawAll([])
    if (pts.length >= 2) onStrokeComplete(pts)
  }

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 18,
        border: '3px solid #2A2118',
        boxShadow: '0 4px 0 #2A2118',
        background: '#FFFDF5',
        cursor: activeColor ? 'crosshair' : 'default',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  )
}

export default Canvas
