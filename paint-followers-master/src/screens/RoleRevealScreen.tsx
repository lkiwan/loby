import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'

/**
 * RoleReveal — hold-to-reveal mechanic.
 * Player holds to reveal -> rolling animation -> permanently shows role/word -> "Next Player" button.
 */
export default function RoleRevealScreen() {
  const { state, dispatch } = useGame()

  const currentPlayerId = state.revealOrder[state.revealIndex]
  const currentPlayer = state.players.find((p) => p.id === currentPlayerId)
  const isImposter = currentPlayerId === state.imposterId
  const isLast = state.revealIndex === state.revealOrder.length - 1

  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0) // 0–100
  const [revealed, setRevealed] = useState(false) // permanent reveal
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const HOLD_DURATION = 200 // fast hold

  const startHold = useCallback((e: React.PointerEvent) => {
    if (revealed) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setHolding(true)
    setProgress(0)
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // Hold complete -> reveal immediately without rolling animation
        setHolding(false)
        setRevealed(true)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [revealed])

  const stopHold = useCallback(() => {
    if (revealed) return
    cancelAnimationFrame(rafRef.current)
    setHolding(false)
    setProgress(0)
  }, [revealed])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Reset state when player changes
  useEffect(() => {
    setRevealed(false)
    setProgress(0)
    setHolding(false)
  }, [currentPlayerId])

  if (!currentPlayer) return null

  const handleNext = () => dispatch({ type: 'ADVANCE_REVEAL' })

  // Word content
  const wordContent = isImposter
    ? { label: 'أنت المحتال!', emoji: '🕵️', sub: 'مثل أنك تعرف الكلمة!' }
    : { label: state.secretWord ?? '', emoji: '🎨', sub: `${state.category?.emoji} ${state.category?.title}` }

  return (
    <>
      <style>{`
        .rr-root {
          --paper:#F6EFE2; --card:#FFF9EC;
          --ink:#2A2118; --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.5);
          --terra:#C8412B; --saffron:#F2B23D; --tea:#1F7A6B; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:24px 20px calc(28px + env(safe-area-inset-bottom));
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
        }
        .rr-root *{box-sizing:border-box}

        @keyframes rrSlide{
          from{opacity:0;transform:translateX(30px)}
          to{opacity:1;transform:none}
        }
        @keyframes rrPop{
          0%{opacity:0;transform:scale(.8) rotate(-3deg)}
          60%{transform:scale(1.05) rotate(1deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rrRoll{
          0%{transform:translateY(-100%);opacity:0}
          20%{transform:translateY(0);opacity:1}
          80%{transform:translateY(0);opacity:1}
          100%{transform:translateY(100%);opacity:0}
        }
        @keyframes rrStamp{
          0%{transform:scale(1.5);opacity:0}
          100%{transform:scale(1);opacity:1}
        }

        .rr-inner {
          width:100%; max-width:440px;
          display:flex; flex-direction:column; align-items:center; gap:24px;
          /* Key triggers slide animation on every player change */
          animation: rrSlide 0.4s ease-out both;
        }

        /* ── HEADER ── */
        .rr-header {
          text-align:center;
          background:var(--card); border:3px solid var(--ink);
          border-radius:18px; padding:16px 20px;
          box-shadow:var(--shadow-sm); width:100%;
        }
        .rr-step {
          font-size:14px; font-weight:800; color:var(--dim);
          margin-bottom:8px;
        }
        .rr-player-name {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:36px; line-height:1;
        }

        /* ── HOLD BUTTON / CARD ── */
        .rr-card-wrap {
          width:100%; aspect-ratio:1; max-height:360px;
          position:relative;
          perspective:1000px;
        }
        .rr-card {
          width:100%; height:100%;
          background:var(--card); border:3px dashed var(--ink50);
          border-radius:24px; box-shadow:var(--shadow-sm);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:20px;
          transition:transform .2s, box-shadow .2s, border-color .25s, background .25s;
          cursor:pointer; touch-action:none;
          position:relative; overflow:hidden;
        }
        .rr-card:active:not(.revealed){
          transform:translateY(4px); box-shadow:0 0 0 var(--ink);
        }
        .rr-card.holding {
          border-color:var(--terra);
          border-style:solid;
          background:#FFF1DC;
        }
        .rr-card.revealed {
          cursor:default;
          border-style:solid;
          animation:rrPop 0.5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .rr-card.revealed.imp { background:#FFD9C7; border-color:var(--terra); }
        .rr-card.revealed.ok { background:#D8F0E4; border-color:var(--tea); }

        /* Progress ring (bara-salfa style) */
        .rr-prog-ring {
          width:88px; height:88px; border-radius:50%;
          display:grid; place-items:center;
          border:3px solid var(--ink);
          margin-bottom:16px;
        }
        .rr-prog-inner {
          width:64px; height:64px; border-radius:50%;
          background:var(--paper); display:grid; place-items:center;
          font-size:28px; border:2px solid var(--ink);
        }

        /* Content */
        .rr-card-content { z-index:2; position:relative; }
        .rr-hint { font-size:15px; font-weight:800; color:var(--dim); }

        /* Revealed Content */
        .rr-rev-emoji { font-size:64px; margin-bottom:8px; animation:rrStamp .4s cubic-bezier(.34,1.56,.64,1); }
        .rr-rev-label {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(32px, 9vw, 42px);
          color:var(--ink); line-height:1.2;
          background:linear-gradient(180deg,rgba(242,178,61,.5),rgba(242,178,61,.22));
          padding:2px 18px; border-radius:10px; transform:rotate(-1deg);
          display:inline-block; margin:8px 0;
          text-shadow:2px 2px 0 rgba(255,255,255,.65);
        }
        .rr-rev-sub { font-size:16px; font-weight:800; color:var(--ink50); margin-top:8px; }

        /* ── NEXT BUTTON ── */
        .rr-next-btn {
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:24px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--saffron) 140%);
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
          animation:rrSlide .3s both .2s;
        }
        .rr-next-btn:active{transform:translateY(3px);box-shadow:0 3px 0 var(--ink)}
        
        .rr-pass-text {
          font-size:14px; font-weight:800; color:var(--dim);
          text-align:center; margin-top:-10px;
          animation:rrSlide .3s both .3s;
        }

        @media(prefers-reduced-motion:reduce){.rr-root *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="rr-root" dir="rtl">
        <div className="rr-inner" key={currentPlayerId}>
          
          <div className="rr-header">
            <div className="rr-step">اللاعب {state.revealIndex + 1} من {state.players.length}</div>
            <div className="rr-player-name" style={{ color: currentPlayer.color }}>
              {currentPlayer.name}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--dim)', marginTop: 4 }}>
              عطيو التيليفون لـ {currentPlayer.name}
            </div>
          </div>

          <div className="rr-card-wrap">
            <div
              className={`rr-card ${holding ? 'holding' : ''} ${revealed ? 'revealed' : ''} ${revealed ? (isImposter ? 'imp' : 'ok') : ''}`}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
              onPointerLeave={stopHold}
            >
              {!revealed && (
                <>
                  <div className="rr-prog-ring" style={{ background: `conic-gradient(var(--saffron) ${progress}%, var(--ink15) 0)` }}>
                    <div className="rr-prog-inner">👁️</div>
                  </div>
                  <div className="rr-card-content">
                    <div className="rr-hint">اضغط مطولاً لكشف دورك</div>
                  </div>
                </>
              )}

              {revealed && (
                <div className="rr-card-content">
                  <div className="rr-rev-emoji">{wordContent.emoji}</div>
                  <div className="rr-rev-label">{wordContent.label}</div>
                  <div className="rr-rev-sub">{wordContent.sub}</div>
                </div>
              )}
            </div>
          </div>

          {revealed && (
            <>
              <button className="rr-next-btn" onClick={handleNext}>
                {isLast ? '🎨 يلا نرسمو!' : '✅ التالي'}
              </button>
              {!isLast && (
                <div className="rr-pass-text">خبي دورك وعطي التيليفون للي بعدك</div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}