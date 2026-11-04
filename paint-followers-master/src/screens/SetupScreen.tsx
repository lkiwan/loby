import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useGame } from '../context/GameContext'
import {
  CATEGORIES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  pickRandomCategory,
} from '../data/words'
import type { Category } from '../types'

/**
 * Setup phase: add/remove players, pick a category, then start.
 * Also exposes the "random" picker so a category can be chosen one-tap.
 */
export default function SetupScreen() {
  const { state, dispatch } = useGame()

  // Fast start: prefill the default player roster so a game can begin in one tap.
  useEffect(() => {
    if (state.phase !== 'setup' || state.players.length > 0) return
    for (let i = 1; i <= MIN_PLAYERS; i++) {
      dispatch({ type: 'ADD_PLAYER', name: `لاعب ${i}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // One-tap player count: fill/trim the roster with default-named players.
  function setQuickCount(n: number) {
    const target = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.round(n)))
    const current = state.players.length
    if (target > current) {
      let toAdd = target - current
      let i = current + 1
      for (let guard = 0; guard < MAX_PLAYERS * 2 && toAdd > 0; guard++) {
        const nm = `لاعب ${i}`
        if (!state.players.some((p) => p.name === nm)) {
          dispatch({ type: 'ADD_PLAYER', name: nm })
          toAdd--
        }
        i++
      }
    } else if (target < current) {
      const ids = state.players.slice(target).map((p) => p.id)
      for (const id of ids) dispatch({ type: 'REMOVE_PLAYER', id })
    }
  }

  function handleCategory(cat: Category) {
    dispatch({ type: 'SELECT_CATEGORY', category: cat })
  }

  function handleRandomCategory() {
    dispatch({ type: 'SELECT_CATEGORY', category: pickRandomCategory() })
  }

  const selected = state.category

  /* ── Category carousel: GPU transform track ────────────────────
     Slides are image cards (icon + title baked into the art, so no
     duplicated HTML category name). The track moves ONLY via
     translateX and the centered slide is the selection; player-list
     re-renders never touch the track mid-glide, so swiping stays
     smooth even with 15 players. */
  const SLIDE_GAP = 12
  const SLIDE_RATIO = 0.72
  const slides = [
    { key: '__random', img: 'random', title: 'عشوائية', count: 'جرب حظك', n: null as number | null, cat: null as Category | null },
    ...CATEGORIES.map((c, i) => ({
      key: c.id,
      img: c.img,
      title: c.title,
      count: `${c.words.length} كلمات`,
      n: i + 1,
      cat: c as Category | null,
    })),
  ]
  const [pos, setPos] = useState(0)
  const [viewW, setViewW] = useState(0)
  const viewRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ down: false, moved: false, startX: 0, base: 0, id: null as number | null })
  const suppressClickRef = useRef(false)

  const txFor = (p: number) => {
    const sw = viewW * SLIDE_RATIO
    return viewW ? (viewW - sw) / 2 - p * (sw + SLIDE_GAP) : 0
  }

  // Measure the viewport once + on resize (never during a glide).
  useEffect(() => {
    const measure = () => { if (viewRef.current) setViewW(viewRef.current.clientWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Preload every card up front: a swipe never waits on an image decode.
  useEffect(() => {
    for (const s of slides) {
      const im = new Image()
      im.src = `${import.meta.env.BASE_URL}cats/cat-${s.img}.webp`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the picked category centered (e.g. after a random pick).
  useEffect(() => {
    if (!selected) return
    const idx = slides.findIndex((s) => s.cat?.id === selected.id)
    if (idx >= 0) setPos(idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  function goTo(i: number) {
    const t = Math.max(0, Math.min(slides.length - 1, i))
    setPos(t)
    const s = slides[t]
    if (s.cat) handleCategory(s.cat)
  }

  function handleSlideClick(i: number) {
    if (suppressClickRef.current) return
    const s = slides[i]
    if (!s.cat) { handleRandomCategory(); return }
    goTo(i)
  }

  function onDragStart(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== undefined && e.button > 0) return
    dragRef.current = { down: true, moved: false, startX: e.clientX, base: txFor(pos), id: e.pointerId }
    if (trackRef.current) trackRef.current.style.transition = 'none'
  }
  function onDragMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current
    if (!d.down || e.pointerId !== d.id) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
    }
    if (d.moved && trackRef.current) {
      trackRef.current.style.transform = `translateX(${d.base + dx}px)`
    }
  }
  function onDragEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current
    if (!d.down || e.pointerId !== d.id) return
    d.down = false
    if (trackRef.current) trackRef.current.style.transition = ''
    if (d.moved) {
      const dx = e.clientX - d.startX
      const step = viewW * SLIDE_RATIO + SLIDE_GAP
      suppressClickRef.current = true
      setTimeout(() => { suppressClickRef.current = false }, 350)
      goTo(pos + Math.round(-dx / step))
    } else if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${txFor(pos)}px)`
    }
  }
  const canStart = state.players.length >= MIN_PLAYERS && !!selected
  
  let hintText = ''
  if (!canStart) {
    if (state.players.length < MIN_PLAYERS) {
      hintText = `زيد على الأقل ${MIN_PLAYERS - state.players.length} لاعبين`
    } else if (!selected) {
      hintText = 'اختار فئة أولاً'
    }
  }

  return (
    <>
      <div className="setup-container" dir="rtl">
        <header className="setup-header">
          <h1 className="setup-title">ارسم كلمة 🎨</h1>
          <p className="setup-subtitle">اللعبة المجنونة</p>
        </header>

        <section className="setup-section">
          <h2 className="section-title justify-content-center" style={{textAlign: 'center', display: 'block'}}>شكون غادي يلعب؟ 🎲</h2>
          <p className="section-desc" style={{textAlign: 'center'}}>الأسماء كتكتب وحدها — إلا بغيتي بدلهم 😉</p>
          
          <div className="count-row mt-3">
            {[3,4,5,6,7].map(k => (
              <button 
                key={k}
                type="button"
                className={`count-chip ${state.players.length === k ? 'on' : ''}`}
                onClick={() => setQuickCount(k)}
              >
                {k}
              </button>
            ))}
            <button 
              type="button" 
              className={`count-chip count-more ${state.players.length > 7 ? 'on' : ''}`}
              onClick={() => setQuickCount(state.players.length + 1)}
            >
              ...
            </button>
          </div>
          
          <div className="player-inputs">
            {state.players.map((p) => (
              <div key={p.id} className="player-input-wrap">
                <span className="player-dot" style={{ backgroundColor: p.color }}></span>
                <input
                  type="text"
                  className="player-input"
                  value={p.name}
                  onChange={(e) => dispatch({ type: 'UPDATE_PLAYER', id: p.id, name: e.target.value })}
                  maxLength={14}
                  placeholder={`لاعب ${state.players.indexOf(p) + 1}`}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="setup-section" style={{ paddingRight: 0, paddingLeft: 0 }}>
          <h3 className="section-title px-3 mb-3" style={{ fontSize: '15px', color: 'var(--dim)', justifyContent: 'flex-start', fontFamily: 'Cairo, sans-serif', fontWeight: 800 }}>الفئة</h3>
          <div className="cat-carousel">
            <button type="button" className="nav-btn nav-left d-none d-md-flex" onClick={() => goTo(pos + 1)}>◀</button>
            <div
              className="cat-view"
              ref={viewRef}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <div className="cat-track" ref={trackRef} style={{ transform: `translateX(${txFor(pos)}px)` }}>
                {slides.map((s, i) => (
                  <div
                    key={s.key}
                    className={`cat-slide ${i === pos ? 'centered' : ''} ${s.cat && selected?.id === s.cat.id ? 'on' : ''} ${!s.cat ? 'is-random' : ''}`}
                    onClick={() => handleSlideClick(i)}
                  >
                    <img
                      className="cat-img"
                      src={`${import.meta.env.BASE_URL}cats/cat-${s.img}.webp`}
                      alt={s.title}
                      draggable={false}
                    />
                    {s.n !== null && <span className="slide-n">{s.n}</span>}
                    <span className="cat-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="nav-btn nav-right d-none d-md-flex" onClick={() => goTo(pos - 1)}>▶</button>
            <div className="cat-dots">
              {slides.map((s, i) => (
                <button key={s.key} type="button" className={i === pos ? 'on' : ''} onClick={() => goTo(i)} aria-label={s.title} />
              ))}
            </div>
          </div>
        </section>

        <section className="start-section mt-4 mb-2">
          <button
            type="button"
            className="start-btn"
            disabled={!canStart}
            onClick={() => dispatch({ type: 'START_GAME' })}
          >
            🚀 ابدأ اللعبة ({state.players.length} لاعبين)
          </button>
          {hintText && <p className="start-hint">{hintText}</p>}
        </section>
      </div>

      <style>{`
        .setup-container {
          --paper: #F6EFE2;
          --paper2: #EDE2C9;
          --card: #FFF9EC;
          --ink: #2A2118;
          --ink15: rgba(42,33,24,.15);
          --ink50: rgba(42,33,24,.55);
          --terra: #C8412B;
          --terra2: #E85C2A;
          --saffron: #F2B23D;
          --tea: #1F7A6B;
          --mint: #3FBA9A;
          --dim: #8A7A63;
          --shadow: 0 4px 0 var(--ink);
          --shadow-sm: 0 3px 0 var(--ink);

          font-family: 'Cairo', sans-serif;
          background: var(--paper);
          color: var(--ink);
          max-width: 460px;
          margin: 0 auto;
          width: 100%;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          padding: 20px 18px calc(24px + env(safe-area-inset-bottom));
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .setup-title {
          font-family: 'Lalezar', cursive;
          font-size: clamp(40px, 13vw, 60px);
          line-height: 1;
          color: var(--ink);
          margin: 0 0 4px 0;
        }
        .setup-subtitle {
          font-size: 15px;
          font-weight: 700;
          color: var(--dim);
          margin: 0;
        }

        .setup-section {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-family: 'Lalezar', cursive;
          font-size: 30px;
          margin: 0 0 6px 0;
          color: var(--ink);
          font-weight: 400;
          line-height: 1.1;
        }
        
        .section-desc {
          font-size: 13px;
          color: var(--dim);
          margin-bottom: 12px;
        }

        .count-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
        }
        .count-chip {
          flex: 1;
          max-width: 52px;
          height: 48px;
          padding: 0;
          font-size: 20px;
          font-weight: 900;
          border-radius: 12px;
          background: var(--card);
          border: 2.5px solid var(--ink);
          box-shadow: 0 3px 0 var(--ink);
          color: var(--ink);
          display: grid;
          place-items: center;
          transition: transform 0.1s, box-shadow 0.1s, background 0.15s;
          cursor: pointer;
        }
        .count-chip:hover { transform: translateY(-2px); }
        .count-chip:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--ink); }
        .count-chip.on {
          background: var(--terra);
          color: var(--paper);
          box-shadow: 3px 3px 0 var(--ink);
        }

        .player-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
          margin-bottom: 24px;
        }
        .player-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .player-input-wrap .player-dot {
          position: absolute;
          right: 16px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          z-index: 2;
        }
        .player-input {
          width: 100%;
          font-family: inherit;
          font-size: 16px;
          font-weight: 700;
          padding: 13px 16px 13px 16px;
          padding-right: 40px; /* space for the dot */
          border-radius: 14px;
          border: 2.5px dashed var(--ink50);
          background: var(--card);
          color: var(--ink);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .player-input:focus {
          border-style: solid;
          border-color: var(--tea);
          box-shadow: 0 3px 0 var(--ink);
        }

        .cat-carousel {
          position: relative;
          margin-top: 8px;
          direction: ltr;
        }
        .cat-view {
          overflow: hidden;
          padding: 10px 0 12px;
          touch-action: pan-y;
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }
        .cat-track {
          display: flex;
          gap: 12px;
          will-change: transform;
          transition: transform 0.5s cubic-bezier(.22,.9,.26,1);
        }
        .cat-slide {
          flex: 0 0 72%;
          position: relative;
          padding: 0;
          line-height: 0;
          text-align: center;
          background: var(--card);
          border: 2.5px solid var(--ink);
          border-radius: 16px;
          overflow: hidden;
          color: var(--ink);
          cursor: pointer;
          box-shadow: 0 3px 0 var(--ink);
          opacity: .5;
          transform: scale(.93);
          transition: transform 0.45s cubic-bezier(.22,.9,.26,1), opacity 0.45s, box-shadow 0.2s, border-color 0.2s, background 0.15s;
        }
        .cat-slide.centered { opacity: 1; transform: scale(1); }
        .cat-slide.on {
          border-color: var(--terra);
          box-shadow: 4px 4px 0 var(--terra);
        }
        .cat-slide.is-random { background: var(--paper2); }
        .cat-img {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 1/1;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        .cat-count {
          position: absolute;
          top: 7px;
          left: 8px;
          font-size: 10px;
          font-weight: 900;
          color: #fff;
          background: rgba(10,10,18,.72);
          border: 1.5px solid rgba(255,255,255,.25);
          border-radius: 99px;
          padding: 1px 7px;
          line-height: 1.4;
        }
        .cat-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 0 0 4px;
        }
        .cat-dots button {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: 99px;
          background: var(--ink35, rgba(42,33,24,.3));
          cursor: pointer;
          transition: width 0.3s, background 0.3s;
        }
        .cat-dots button.on { width: 22px; background: var(--terra); }

        .slide-n {
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 10px;
          font-weight: 900;
          color: var(--dim);
          background: var(--paper2);
          border: 1.5px solid var(--ink35);
          border-radius: 99px;
          padding: 1px 6px;
        }

        .slide-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          color: var(--dim);
          margin: -4px 0 2px;
        }

        .spacer { flex: 1; }

        .start-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--terra) 0%, var(--terra2) 55%, var(--saffron) 140%);
          border: 3px solid var(--ink);
          border-radius: 16px;
          padding: 16px 20px;
          font-family: 'Lalezar', cursive;
          font-size: 22px;
          font-weight: 400;
          color: var(--paper);
          box-shadow: 0 4px 0 var(--ink);
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .start-btn:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 1px 0 var(--ink);
        }
        .start-btn:disabled {
          background: var(--paper2);
          box-shadow: 0 2px 0 var(--ink);
          border-color: var(--ink);
          color: var(--ink50);
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
    </>
  )
}
