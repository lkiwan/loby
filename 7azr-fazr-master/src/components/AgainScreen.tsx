import { useGame } from '../store'
import ExitConfirm from './ExitConfirm'

export default function AgainScreen() {
  const [state, dispatch] = useGame()

  return (
    <div className="screen">
      <div className="bar">
        <b>نهاية الجولة</b>
        <span className="cat-pill">AGAIN?</span>
        <ExitConfirm />
      </div>
      <div className="center anim-fadeup">
        <div className="big-emoji">🎭</div>
        <h2>جولة أخرى؟</h2>
        <p className="lead">
          الفريق ديال <b>{state.players.length}</b> لاعبين، جاسوس {state.imposterCount} ، و مؤقت{' '}
          <b>{state.timer}</b> ثانية.
        </p>
      </div>

      <div className="card anim-fadeup d1">
        <p className="sm">اللاعبين:</p>
        <div>
          {state.players.map((p, i) => (
            <span key={p} className={`cat-pill ${i % 2 ? 'role-safe' : ''}`} style={{ margin: 3 }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="spacer" />

      <button className="btn-cta" onClick={() => dispatch({ type: 'NEW_ROUND' })}>
        🔁 نفس اللاعبين، جولة جديدة
      </button>
      <button className="btn-ghost" onClick={() => dispatch({ type: 'RECONFIGURE' })}>
        ⚙️ بدّل الإعدادات
      </button>
    </div>
  )
}