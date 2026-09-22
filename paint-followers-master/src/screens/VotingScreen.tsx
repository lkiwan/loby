import { useState } from 'react'
import { useGame } from '../context/GameContext'

/**
 * VotingScreen — pass-phone-per-player voting.
 * Each player sees all the drawings, then privately votes for the imposter.
 * After voting, they see a "pass phone" overlay before the next player votes.
 * Inspired by bara-salfa-bdarija's private per-player vote flow.
 */
export default function VotingScreen() {
  const { state, dispatch } = useGame()
  const [localVote, setLocalVote] = useState<string | null>(null)
  const [showPassOverlay, setShowPassOverlay] = useState(false)

  const currentVoter = state.players[state.votingIndex]
  const votedAlready = state.votes.some((v) => v.voterId === currentVoter?.id)

  const handleVote = (targetId: string) => {
    if (!currentVoter || targetId === currentVoter.id) return
    setLocalVote(targetId)
    dispatch({ type: 'CAST_VOTE', voterId: currentVoter.id, targetId })
    setTimeout(() => setShowPassOverlay(true), 400)
  }

  const handleAdvance = () => {
    setLocalVote(null)
    setShowPassOverlay(false)
    dispatch({ type: 'ADVANCE_VOTING' })
  }

  const isLast = state.votingIndex === state.players.length - 1
  const nextVoter = state.players[state.votingIndex + 1]

  if (!currentVoter) return null

  return (
    <>
      <style>{`
        .vt-root {
          --paper:#F6EFE2; --card:#FFF9EC; --ink:#2A2118;
          --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.55);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex;flex-direction:column;
          padding:20px 18px calc(24px + env(safe-area-inset-bottom));
          gap:14px;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none;user-select:none;
          position:relative;
        }
        .vt-root *{box-sizing:border-box}

        @keyframes vtSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes vtPop{0%{opacity:0;transform:scale(.84)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
        @keyframes vtFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes vtCheckPop{0%{transform:scale(0) rotate(-10deg)}65%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0)}}

        .vt-header{text-align:center;animation:vtSlideUp .4s both}
        .vt-round-label{font-size:12px;font-weight:900;letter-spacing:.5px;color:var(--dim);text-transform:uppercase;margin-bottom:2px}
        .vt-title{font-family:'Lalezar','Cairo',sans-serif;font-size:clamp(28px,8vw,38px);color:var(--ink)}
        .vt-sub{font-size:15px;font-weight:800;color:var(--dim);margin-top:2px}

        .vt-voter-badge{
          display:flex;align-items:center;gap:8px;
          background:var(--card);border:3px solid var(--ink);
          border-radius:99px;padding:8px 18px 8px 10px;
          box-shadow:var(--shadow-sm);
          width:fit-content;margin:0 auto;
          animation:vtPop .4s .1s both;
        }
        .vt-voter-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--ink)}
        .vt-voter-name{font-size:16px;font-weight:800}

        .vt-prog{height:8px;border-radius:4px;background:var(--ink15);border:2px solid var(--ink);overflow:hidden}
        .vt-prog-fill{
          height:100%;border-radius:2px;
          background:repeating-linear-gradient(-45deg,var(--terra) 0 10px,var(--terra2) 10px 20px);
          transition:width .4s;
        }

        .vt-question{
          font-size:16px;font-weight:900;color:var(--ink);
          text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:12px 16px;
          box-shadow:var(--shadow-sm);
          animation:vtSlideUp .4s .1s both;
        }

        .vt-drawings-row{
          display:flex;gap:8px;overflow-x:auto;
          padding:4px 2px 10px;scrollbar-width:none;
        }
        .vt-drawings-row::-webkit-scrollbar{display:none}
        .vt-drawing-card{
          flex:0 0 calc(33% - 4px);
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:10px 8px;
          text-align:center;box-shadow:var(--shadow-sm);
          display:flex;flex-direction:column;align-items:center;gap:4px;
        }
        .vt-drawing-dot{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink);display:inline-block}
        .vt-drawing-name{font-size:11px;font-weight:800;color:var(--dim)}

        .vt-candidates{display:flex;flex-direction:column;gap:8px;animation:vtSlideUp .4s .15s both}

        .vt-candidate{
          width:100%;text-align:right;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:14px 16px;
          cursor:pointer;
          transition:border-color .15s,background .15s,transform .12s,box-shadow .15s;
          box-shadow:var(--shadow-sm);
          display:flex;align-items:center;gap:10px;
          font-family:inherit;
          position:relative;
          overflow:hidden;
        }
        .vt-candidate::after{
          content:'';position:absolute;inset:0;
          background:repeating-linear-gradient(-45deg,rgba(255,255,255,.1) 0 5px,transparent 5px 10px);
          opacity:.5;pointer-events:none;
        }
        .vt-candidate:hover{border-color:var(--ink);transform:translateY(-2px);box-shadow:var(--shadow)}
        .vt-candidate:active{transform:translateY(1px);box-shadow:0 1px 0 var(--ink)}
        .vt-candidate.voted{
          border-color:var(--terra);background:#FFF1DC;
          box-shadow:3px 3px 0 var(--terra);
          transform:none;
        }
        .vt-candidate.self-disabled{opacity:.35;cursor:not-allowed;transform:none !important}
        .vt-candidate-dot{width:16px;height:16px;border-radius:50%;border:2.5px solid var(--ink);flex-shrink:0}
        .vt-candidate-name{font-size:18px;font-weight:800;flex:1}
        .vt-candidate-check{
          font-size:20px;
          animation:vtCheckPop .4s cubic-bezier(.34,1.56,.64,1) both;
        }
        .vt-candidate-tag{
          font-size:11px;font-weight:900;letter-spacing:.3px;
          padding:2px 10px;border-radius:99px;
          background:var(--saffron);color:var(--ink);
          border:1.5px solid var(--ink);
        }

        .vt-hint{font-size:13px;font-weight:800;color:var(--dim);text-align:center}

        /* Pass-phone overlay */
        .vt-overlay{
          position:absolute;inset:0;
          background:rgba(246,239,226,.97);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:18px;padding:32px;
          animation:vtFadeIn .25s ease both;
          z-index:10;
        }
        .vt-overlay-icon{font-size:64px;animation:vtPop .4s both}
        .vt-overlay-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(26px,7vw,36px);
          text-align:center;color:var(--ink);
          animation:vtSlideUp .4s .1s both;
        }
        .vt-overlay-sub{font-size:15px;font-weight:800;color:var(--dim);text-align:center;animation:vtSlideUp .4s .15s both}
        .vt-overlay-voted-for{
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:12px 24px;
          box-shadow:var(--shadow-sm);
          font-size:16px;font-weight:800;
          animation:vtPop .4s .05s cubic-bezier(.34,1.56,.64,1) both;
          display:flex;align-items:center;gap:10px;
        }
        .vt-overlay-btn{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif;font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper);border:3px solid var(--ink);border-radius:16px;
          padding:16px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
          animation:vtSlideUp .4s .2s both;
        }
        .vt-overlay-btn:hover{transform:translateY(-2px)}
        .vt-overlay-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}

        @media(prefers-reduced-motion:reduce){.vt-root *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="vt-root" dir="rtl">
        {/* Header */}
        <div className="vt-header">
          <div className="vt-round-label">الجولة {state.roundNumber} · التصويت</div>
          <div className="vt-title">من المحتال؟ 🕵️</div>
        </div>

        {/* Current voter */}
        <div className="vt-voter-badge">
          <span className="vt-voter-dot" style={{ backgroundColor: currentVoter.color }} />
          <span className="vt-voter-name">صوت {currentVoter.name}</span>
        </div>

        {/* Progress */}
        <div className="vt-prog">
          <div
            className="vt-prog-fill"
            style={{ width: `${(state.votingIndex / state.players.length) * 100}%` }}
          />
        </div>

        <div className="vt-question">
          🤔 من عندك برأيك هو اللي ما يعرفش الكلمة؟
        </div>

        {/* Candidate list */}
        <div className="vt-candidates">
          {state.players.map((p) => {
            const isSelf = p.id === currentVoter.id
            const isVoted = localVote === p.id

            return (
              <button
                key={p.id}
                className={`vt-candidate ${isVoted ? 'voted' : ''} ${isSelf ? 'self-disabled' : ''}`}
                onClick={() => handleVote(p.id)}
                disabled={!!localVote || isSelf || votedAlready}
                aria-label={isSelf ? 'ما تقدرش تصوت على روحك' : `صوت لـ ${p.name}`}
              >
                <span className="vt-candidate-dot" style={{ backgroundColor: p.color }} />
                <span className="vt-candidate-name">{p.name}</span>
                {isSelf && <span className="vt-candidate-tag">أنت</span>}
                {isVoted && <span className="vt-candidate-check">✅</span>}
              </button>
            )
          })}
        </div>

        <div className="vt-hint">
          {state.votingIndex + 1} / {state.players.length} صوّت
        </div>

        {/* Pass-phone overlay */}
        {showPassOverlay && (
          <div className="vt-overlay">
            <div className="vt-overlay-icon">✅</div>
            <div className="vt-overlay-title">صوتت {currentVoter.name}!</div>

            {/* Show who they voted for */}
            {localVote && (() => {
              const votedPlayer = state.players.find(p => p.id === localVote)
              return (
                <div className="vt-overlay-voted-for">
                  <span style={{width:14,height:14,borderRadius:'50%',border:'2px solid var(--ink)',backgroundColor:votedPlayer?.color,display:'inline-block'}} />
                  صوت على {votedPlayer?.name}
                </div>
              )
            })()}

            {isLast ? (
              <>
                <div className="vt-overlay-sub">الكل صوّت — يلا نشوفو المحتال!</div>
                <button className="vt-overlay-btn" onClick={handleAdvance}>
                  🎉 كشف النتيجة
                </button>
              </>
            ) : (
              <>
                <div className="vt-overlay-sub">مرر الجهاز لـ {nextVoter?.name}</div>
                <button className="vt-overlay-btn" onClick={handleAdvance}>
                  ▶ التالي — {nextVoter?.name}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}