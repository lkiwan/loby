import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { Canvas } from '../components/Canvas'
import type { Point, Stroke } from '../types'

export default function DrawingScreen() {
  const { state, dispatch } = useGame()

  const currentDrawerId = state.drawOrder[state.drawIndex]
  const currentDrawer = state.players.find((p) => p.id === currentDrawerId)

  const [brushSize, setBrushSize] = useState(5)

  const allDrawn = state.players.every((p) => state.drawnPlayerIds.includes(p.id))

  if (!currentDrawer) return null

  const handleStrokeComplete = (points: Point[]) => {
    const stroke: Stroke = {
      playerId: currentDrawerId,
      color: currentDrawer.color,
      points,
      width: brushSize,
    }
    dispatch({ type: 'COMMIT_STROKE', stroke })
  }

  const handleDone = () => dispatch({ type: 'NEXT_DRAWER' })
  const handleVote = () => dispatch({ type: 'GO_TO_VOTING' })

  return (
    <>
      <style>{`
        .dr-root {
          --paper:#F6EFE2; --card:#FFF9EC;
          --ink:#2A2118; --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.5);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --mint:#3FBA9A; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          height:100dvh; overflow:hidden;
          display:flex; flex-direction:column;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
        }
        .dr-root *{box-sizing:border-box}

        @keyframes drPulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes drPop{0%{opacity:0;transform:scale(.82) rotate(-2deg)}70%{transform:scale(1.04)}100%{opacity:1;transform:none}}
        @keyframes drFade{from{opacity:0}to{opacity:1}}

        /* ── HEADER & QUEUE ── */
        .dr-header {
          flex-shrink:0;
          display:flex; flex-direction:column; gap:12px;
          padding:16px 16px 8px;
          background:var(--card);
          border-bottom:3px solid var(--ink);
          box-shadow:var(--shadow-sm);
          position:relative; z-index:10;
        }
        
        .dr-turn-banner {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center;
        }
        .dr-turn-title {
          font-size:14px; font-weight:800; color:var(--dim);
          margin-bottom:2px;
        }
        .dr-turn-name {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:36px; line-height:1;
          color:var(--ink);
          text-shadow:1px 1px 0 rgba(255,255,255,0.5);
          animation:drPop .3s cubic-bezier(.34,1.56,.64,1) both;
        }

        .dr-queue-row {
          display:flex; align-items:center; gap:8px;
          overflow-x:auto; padding-bottom:8px;
          scrollbar-width:none; -ms-overflow-style:none;
        }
        .dr-queue-row::-webkit-scrollbar { display:none; }
        
        .dr-q-chip {
          display:flex; align-items:center; gap:6px;
          background:var(--paper); border:2.5px solid var(--ink);
          border-radius:99px; padding:6px 12px 6px 8px;
          font-size:13px; font-weight:800; color:var(--dim);
          box-shadow:0 2px 0 var(--ink);
          opacity: 0.6;
          transition:all .2s;
          white-space:nowrap;
        }
        .dr-q-chip.active {
          opacity: 1;
          background:var(--paper);
          color:var(--ink);
          border-color:var(--ink);
          transform:scale(1.05);
          box-shadow:0 3px 0 var(--ink);
        }
        .dr-q-chip .dot {
          width:12px; height:12px; border-radius:50%;
          border:2px solid var(--ink);
        }

        /* ── BODY ── */
        .dr-body {
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          padding:12px; gap:12px;
        }
        @media(min-width:768px){
          .dr-body{flex-direction:row; padding:16px 20px; gap:16px}
        }

        /* ── CANVAS COLUMN ── */
        .dr-canvas-col {
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          gap:8px;
        }
        @media(min-width:768px){
          .dr-canvas-col{flex:2}
        }
        .dr-canvas-wrap {
          flex:1; min-height:200px;
        }

        /* ── CONTROLS COLUMN ── */
        .dr-ctrl-col {
          flex-shrink:0;
          display:flex; flex-direction:column;
          gap:12px;
        }
        @media(min-width:768px){
          .dr-ctrl-col{width:280px}
        }

        /* ── BRUSH PICKER ── */
        .dr-brush-row{
          display:flex; align-items:center; gap:8px; justify-content:center;
          background:var(--card); border:3px solid var(--ink);
          padding:10px; border-radius:16px; box-shadow:var(--shadow-sm);
        }
        .dr-brush-label{font-size:16px;font-weight:800;color:var(--dim);flex-shrink:0}
        .dr-brush-btn{
          padding:6px 14px; border-radius:99px;
          border:2.5px solid var(--ink); background:var(--paper);
          font-size:13px; font-weight:800; cursor:pointer;
          box-shadow:0 2px 0 var(--ink);
          transition:transform .1s, background .15s;
          font-family:inherit; color:var(--ink);
        }
        .dr-brush-btn:active{transform:translateY(1px)}
        .dr-brush-btn.on{background:var(--ink);color:var(--paper)}

        /* ── BUTTONS ── */
        .dr-btn-done{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:22px;
          background:linear-gradient(135deg,var(--tea),var(--mint));
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
        }
        .dr-btn-done:hover{transform:translateY(-2px)}
        .dr-btn-done:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}

        .dr-btn-vote{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
          animation:drPop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .dr-btn-vote:hover{transform:translateY(-2px)}
        .dr-btn-vote:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
        .dr-vote-hint{
          font-size:13px;font-weight:800;color:var(--dim);
          text-align:center; margin-top:-4px;
        }

        .dr-btn-vote-ghost{
          width:100%;
          font-size:15px;font-weight:800;color:var(--dim);
          background:none;border:0;cursor:pointer;padding:8px;
          font-family:inherit;
        }
        .dr-btn-vote-ghost:hover{color:var(--terra)}

        @media(prefers-reduced-motion:reduce){.dr-root *{animation:none!important;transition:none!important}}
      `}</style>

      <div className="dr-root" dir="rtl">

        {/* ── HEADER & QUEUE ── */}
        <div className="dr-header">
          <div className="dr-turn-banner" key={currentDrawer.id}>
            <div className="dr-turn-title">دورك باش ترسم!</div>
            <div className="dr-turn-name" style={{ color: currentDrawer.color }}>
              {currentDrawer.name}
            </div>
          </div>
          
          <div className="dr-queue-row">
            {state.drawOrder.map((pid, idx) => {
              const p = state.players.find(x => x.id === pid)!
              const isCurrent = idx === state.drawIndex
              return (
                <div key={`${pid}-${idx}`} className={`dr-q-chip ${isCurrent ? 'active' : ''}`}>
                  <span className="dot" style={{ backgroundColor: p.color }} />
                  {p.name}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="dr-body">

          {/* ── LEFT / TOP: CANVAS ── */}
          <div className="dr-canvas-col">
            <div className="dr-canvas-wrap">
              <Canvas
                key={`round-${state.roundNumber}`}
                strokes={state.strokes}
                activeColor={currentDrawer.color}
                brushSize={brushSize}
                onStrokeComplete={handleStrokeComplete}
                drawerId={currentDrawerId}
              />
            </div>
          </div>

          {/* ── RIGHT / BOTTOM: CONTROLS ── */}
          <div className="dr-ctrl-col">

            {/* Brush picker */}
            <div className="dr-brush-row">
              <span className="dr-brush-label">🖌️</span>
              {([3, 5, 10, 18] as const).map((s) => (
                <button
                  key={s}
                  className={`dr-brush-btn ${brushSize === s ? 'on' : ''}`}
                  onClick={() => setBrushSize(s)}
                >
                  {s === 3 ? 'رفيع' : s === 5 ? 'عادي' : s === 10 ? 'سميك' : 'عريض'}
                </button>
              ))}
            </div>

            {/* Done button */}
            <button className="dr-btn-done" onClick={handleDone}>
              ✅ كملت — التالي
            </button>

            {/* Vote button — only when everyone drew at least once */}
            {allDrawn ? (
              <>
                <button className="dr-btn-vote" onClick={handleVote}>
                  🗳️ يلا نصوتو!
                </button>
                <div className="dr-vote-hint">الكل رسم — تقدرو تكملو الرسم أو تصوتو</div>
              </>
            ) : (
              <button className="dr-btn-vote-ghost" onClick={handleVote}>
                تخطى للتصويت ←
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}