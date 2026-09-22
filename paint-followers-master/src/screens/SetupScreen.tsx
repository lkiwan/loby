import { useEffect, useRef } from 'react'
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
  
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const scrollLeft = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' })
  }
  
  const scrollRight = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' })
  }

  const selected = state.category
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
            <button type="button" className="nav-btn nav-left d-none d-md-flex" onClick={scrollLeft}>◀</button>
            <div className="cat-slider" ref={carouselRef}>
              <div
                className="cat-slide is-random"
                onClick={handleRandomCategory}
              >
                <div className="cat-emoji">🎲</div>
                <div className="cat-title">عشوائية</div>
                <div className="cat-count">جرب حظك</div>
              </div>
              
              {CATEGORIES.map((cat, i) => {
                const isSelected = selected?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`cat-slide ${isSelected ? 'on' : ''}`}
                    onClick={() => handleCategory(cat)}
                  >
                    <span className="slide-n">{i + 1}</span>
                    <div className="cat-emoji">{cat.emoji}</div>
                    <div className="cat-title">{cat.title}</div>
                    <div className="cat-count">{cat.words.length} كلمات</div>
                  </div>
                )
              })}
            </div>
            <button type="button" className="nav-btn nav-right d-none d-md-flex" onClick={scrollRight}>▶</button>
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
        }
        .cat-slider {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 6px 2px 14px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
        }
        .cat-slider::-webkit-scrollbar {
          display: none;
        }
        
        .cat-slide {
          flex: 0 0 calc((100% - 18px) / 3.5);
          scroll-snap-align: start;
          position: relative;
          min-height: 130px;
          text-align: center;
          background: var(--card);
          border: 2.5px solid var(--ink);
          border-radius: 16px;
          padding: 16px 8px 12px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          line-height: 1.3;
          box-shadow: 0 3px 0 var(--ink);
        }
        .cat-slide:hover { transform: translateY(-2px); }
        .cat-slide:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--ink); }
        .cat-slide.on {
          background: #FFF1DC;
          box-shadow: 3px 3px 0 var(--terra);
          border-color: var(--terra);
        }
        .cat-slide.is-random { background: var(--paper2); }

        .cat-emoji { font-size: 32px; line-height: 1; margin-top: 4px; }
        .cat-title { font-size: 13px; font-weight: 800; color: var(--ink); }
        .cat-count { font-size: 11px; color: var(--dim); font-weight: 700; }
        .cat-slide.on .cat-count { color: var(--ink50); }
        
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
