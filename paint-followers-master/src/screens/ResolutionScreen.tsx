import { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'

type RevealPhase = 'mystery' | 'reveal' | 'guess' | 'scores'

function spawnConfetti(container: HTMLDivElement) {
  const colors = ['#C8412B', '#F2B23D', '#1F7A6B', '#3FBA9A', '#E85C2A', '#FFF9EC', '#fff']
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div')
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:-24px;
      width:${7 + Math.random() * 9}px;
      height:${10 + Math.random() * 10}px;
      border-radius:3px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border:1.5px solid rgba(42,33,24,.3);
      animation:confFall ${1.6 + Math.random() * 1.8}s linear ${Math.random() * 0.9}s both;
      pointer-events:none;
      transform:rotate(${Math.random() * 360}deg);
    `
    container.appendChild(el)
    setTimeout(() => el.remove(), 4500)
  }
}

export default function ResolutionScreen() {
  const { state, dispatch } = useGame()
  const [phase, setPhase] = useState<RevealPhase>('mystery')
  const confettiRef = useRef<HTMLDivElement>(null)

  const imposter = state.players.find((p) => p.id === state.imposterId)
  const sortedPlayers = [...state.players].sort(
    (a, b) => (state.scores[b.id] ?? 0) - (state.scores[a.id] ?? 0),
  )
  const topScore = state.scores[sortedPlayers[0]?.id] ?? 0

  // Fire confetti when reveal phase shows AND imposter was caught
  useEffect(() => {
    if (phase === 'reveal' && state.imposterCaught && confettiRef.current) {
      spawnConfetti(confettiRef.current)
    }
  }, [phase, state.imposterCaught])

  useEffect(() => {
    if (phase === 'scores') {
      window.parent.postMessage({ type: 'game-over' }, '*')
    }
  }, [phase])

  return (
    <>
      <style>{`
        .rs-root {
          --paper:#F6EFE2; --card:#FFF9EC; --ink:#2A2118;
          --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.55);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --mint:#3FBA9A; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center;
          padding:24px 20px calc(28px + env(safe-area-inset-bottom));
          gap:18px;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
          position:relative; overflow:hidden;
        }
        .rs-root *{box-sizing:border-box}
        .rs-inner{width:100%;max-width:520px;display:flex;flex-direction:column;gap:16px}

        @keyframes confFall{
          0%{transform:translateY(-24px) rotate(0deg);opacity:1}
          100%{transform:translateY(105vh) rotate(720deg);opacity:0}
        }
        @keyframes rsPop{
          0%{opacity:0;transform:scale(.78) rotate(-3deg)}
          65%{transform:scale(1.06) rotate(.5deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rsSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes rsBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px) scale(1.02)}}
        @keyframes rsStamp{
          0%{opacity:0;transform:scale(1.6) rotate(-8deg)}
          60%{transform:scale(.92) rotate(.5deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rsSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes rsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}

        /* ── SHARED ── */
        .rs-btn{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif;font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper);border:3px solid var(--ink);border-radius:16px;
          padding:16px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
        }
        .rs-btn:hover{transform:translateY(-2px)}
        .rs-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
        .rs-btn-ghost{
          width:100%;
          font-family:'Cairo',sans-serif;font-size:16px;font-weight:800;
          background:var(--card);border:3px solid var(--ink);border-radius:16px;
          padding:13px;cursor:pointer;box-shadow:var(--shadow-sm);color:var(--ink);
          transition:transform .12s;
        }
        .rs-btn-ghost:hover{transform:translateY(-2px)}
        .rs-btn-ghost:active{transform:translateY(1px)}

        /* ── MYSTERY PHASE ── */
        .rs-mystery{
          text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:18px;
        }
        .rs-mystery-spies{font-size:56px;animation:rsPulse 2s ease-in-out infinite;letter-spacing:8px}
        .rs-mystery-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(28px,8vw,42px);
          color:var(--ink);
        }
        .rs-mystery-card{
          background:var(--card);border:3px dashed var(--ink50);
          border-radius:20px;padding:24px 20px;width:100%;
          box-shadow:var(--shadow-sm);
          display:flex;flex-direction:column;align-items:center;gap:12px;
        }
        .rs-mystery-ring{
          width:80px;height:80px;border-radius:50%;
          border:4px solid var(--ink);background:var(--paper);
          display:grid;place-items:center;font-size:36px;
          animation:rsSpin 8s linear infinite;
        }
        .rs-mystery-sub{font-size:16px;font-weight:800;color:var(--dim)}

        /* ── REVEAL PHASE ── */
        .rs-reveal{
          display:flex;flex-direction:column;align-items:center;gap:16px;
          text-align:center;
        }
        .rs-reveal-icon{font-size:64px;animation:rsStamp .5s cubic-bezier(.34,1.56,.64,1) both}
        .rs-reveal-banner{
          width:100%;border-radius:20px;border:3px solid var(--ink);
          box-shadow:var(--shadow);padding:20px;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both .1s;
        }
        .rs-reveal-banner.caught{background:linear-gradient(160deg,#E2F4E8,#D5F0DC)}
        .rs-reveal-banner.escaped{background:linear-gradient(160deg,#FFE6DA,#FFD9C7)}
        .rs-reveal-result{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(26px,7vw,36px);
          color:var(--ink);
        }
        .rs-reveal-imposter{
          display:flex;align-items:center;gap:8px;
          font-size:22px;font-weight:900;
        }
        .rs-reveal-dot{width:16px;height:16px;border-radius:50%;border:2.5px solid var(--ink)}
        .rs-reveal-word{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(32px,9vw,46px);
          background:linear-gradient(180deg,rgba(242,178,61,.55),rgba(242,178,61,.2));
          padding:4px 18px;border-radius:10px;transform:rotate(-1deg);
          display:inline-block;
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both .2s;
        }
        .rs-reveal-word-label{font-size:13px;font-weight:800;color:var(--dim)}

        /* ── GUESS PHASE ── */
        .rs-guess{
          display:flex;flex-direction:column;gap:14px;
        }
        .rs-guess-header{
          text-align:center;
          background:var(--card);border:3px solid var(--saffron);
          border-radius:16px;padding:14px 16px;box-shadow:var(--shadow-sm);
          animation:rsSlideUp .4s both;
        }
        .rs-guess-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(20px,5vw,28px);
          color:var(--ink);margin-bottom:4px;
        }
        .rs-guess-sub{font-size:14px;font-weight:800;color:var(--dim)}
        .rs-guess-grid{
          display:grid;grid-template-columns:1fr 1fr;gap:8px;
          animation:rsSlideUp .4s .08s both;
        }
        .rs-guess-btn{
          width:100%;text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:14px 10px;
          cursor:pointer;font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(16px,4vw,22px);
          transition:border-color .15s,background .15s,transform .12s,box-shadow .12s;
          box-shadow:var(--shadow-sm);
        }
        .rs-guess-btn:hover{border-color:var(--terra);transform:translateY(-2px);box-shadow:var(--shadow)}
        .rs-guess-btn:active{transform:translateY(1px);box-shadow:0 1px 0 var(--ink)}
        .rs-guess-result{
          text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:16px;padding:18px;box-shadow:var(--shadow-sm);
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .rs-guess-result-icon{font-size:48px;display:block;margin-bottom:8px}
        .rs-guess-result-text{font-size:18px;font-weight:900}

        /* ── SCORES PHASE ── */
        .rs-scores-box{
          background:var(--card);border:3px solid var(--ink);
          border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);
          animation:rsSlideUp .4s both;
        }
        .rs-scores-head{
          background:var(--ink);color:var(--paper);
          padding:10px 16px;font-size:14px;font-weight:900;letter-spacing:.5px;
        }
        .rs-scores-table{width:100%;border-collapse:collapse}
        .rs-scores-table td{
          padding:11px 14px;border-bottom:2.5px dashed var(--ink15);
          font-weight:800;font-size:16px;color:var(--ink);
        }
        .rs-scores-table td.pts{
          text-align:left;color:var(--terra);font-weight:900;font-size:18px;
          font-variant-numeric:tabular-nums;white-space:nowrap;
        }
        .rs-scores-table tr:last-child td{border-bottom:0}
        .rs-scores-table tr.winner td{animation:rsBob 1.4s ease-in-out infinite}
        .rs-score-dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);display:inline-block;margin-left:6px}
        .rs-imp-tag{font-size:11px;color:var(--terra);font-weight:800;margin-right:4px}

        @media(prefers-reduced-motion:reduce){.rs-root *{animation:none!important;transition:none!important}}
      `}</style>

      {/* Confetti layer */}
      <div
        ref={confettiRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}
      />

      <div className="rs-root" dir="rtl">
        <div className="rs-inner">

          {/* ═══════════════════════════════════════════
              PHASE 1: MYSTERY — "who is the imposter?"
          ═══════════════════════════════════════════ */}
          {phase === 'mystery' && (
            <div className="rs-mystery">
              <div className="rs-mystery-spies">🕵️🕵️🕵️</div>
              <div className="rs-mystery-title">مين هو المحتال؟</div>
              <div className="rs-mystery-card">
                <div className="rs-mystery-ring">🎭</div>
                <div className="rs-mystery-sub">الجواب غير معلوم...</div>
              </div>
              <button className="rs-btn" onClick={() => setPhase('reveal')}>
                🎭 كشف المحتال!
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE 2: REVEAL — show imposter + result
          ═══════════════════════════════════════════ */}
          {phase === 'reveal' && (
            <div className="rs-reveal">
              <div className="rs-reveal-icon">
                {state.imposterCaught ? '🎉' : '😈'}
              </div>

              <div className={`rs-reveal-banner ${state.imposterCaught ? 'caught' : 'escaped'}`}>
                <div className="rs-reveal-result">
                  {state.imposterCaught ? 'تم كشف المحتال! 🎊' : 'المحتال هرب! 😈'}
                </div>

                <div className="rs-reveal-imposter">
                  <span className="rs-reveal-dot" style={{ backgroundColor: imposter?.color }} />
                  <span>{imposter?.name}</span>
                  <span style={{ fontSize: 14, color: 'var(--dim)', fontWeight: 800 }}>كان المحتال</span>
                </div>
                {/* No word revealed here anymore so the imposter doesn't cheat */}
              </div>

              {/* Next step: Always go to the guess phase if there are words to guess */}
              {state.guessedWords ? (
                <button className="rs-btn" onClick={() => setPhase('guess')}>
                  🎯 خلّيه يخمن الكلمة!
                </button>
              ) : (
                <button className="rs-btn" onClick={() => setPhase('scores')}>
                  🏆 شوف النقاط
                </button>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE 3: GUESS — imposter picks the word
          ═══════════════════════════════════════════ */}
          {phase === 'guess' && (
            <div className="rs-guess">
              {state.guessCorrect === null ? (
                <>
                  <div className="rs-guess-header">
                    <div className="rs-guess-title">
                      🎯 يا {imposter?.name}، خمن الكلمة!
                    </div>
                    <div className="rs-guess-sub">
                      اختر الكلمة الصحيحة من القائمة — نقطة إضافية إذا صح!
                    </div>
                  </div>
                  <div className="rs-guess-grid">
                    {state.guessedWords?.map((w) => (
                      <button
                        key={w}
                        className="rs-guess-btn"
                        onClick={() => dispatch({ type: 'GUESS_WORD', word: w })}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="rs-guess-result">
                    <span className="rs-guess-result-icon">
                      {state.guessCorrect ? '🏆' : '❌'}
                    </span>
                    <div className="rs-guess-result-text">
                      {state.guessCorrect
                        ? `${imposter?.name} خمّن صح! الكلمة هي "${state.secretWord}" 🎉`
                        : `غلط — الكلمة كانت "${state.secretWord}"`}
                    </div>
                  </div>
                  <button className="rs-btn" onClick={() => setPhase('scores')}>
                    🏆 شوف النقاط
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════
              PHASE 4: SCORES — scoreboard + actions
          ═══════════════════════════════════════════ */}
          {phase === 'scores' && (
            <>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: "'Lalezar','Cairo',sans-serif",
                  fontSize: 'clamp(26px,7vw,36px)',
                }}
              >
                🏅 النقاط
              </div>

              <div className="rs-scores-box">
                <div className="rs-scores-head">الجولة {state.roundNumber} — الترتيب</div>
                <table className="rs-scores-table">
                  <tbody>
                    {sortedPlayers.map((p, i) => {
                      const pts = state.scores[p.id] ?? 0
                      const isWinner = pts === topScore && topScore > 0 && i === 0
                      return (
                        <tr key={p.id} className={isWinner ? 'winner' : ''}>
                          <td>
                            <span className="rs-score-dot" style={{ backgroundColor: p.color }} />
                            {isWinner && '🥇 '}
                            {p.name}
                            {p.id === state.imposterId && (
                              <span className="rs-imp-tag">(المحتال)</span>
                            )}
                          </td>
                          <td className="pts">{pts} نقطة</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <button className="rs-btn" onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
                🎮 جولة جديدة
              </button>
              <button className="rs-btn-ghost" onClick={() => dispatch({ type: 'RESET' })}>
                إعادة تعيين من الأول
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}