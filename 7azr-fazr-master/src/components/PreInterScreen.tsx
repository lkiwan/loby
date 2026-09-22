import { useGame } from '../store'
import { buzz } from '../sound'
import ExitConfirm from './ExitConfirm'

export default function PreInterScreen() {
  const [state, dispatch] = useGame()
  const { imposters, interIndex, timer } = state
  const name = imposters[interIndex] ?? imposters[0]
  const seconds = Math.round(timer / 60)

  return (
    <div className="screen">
      <div className="bar">
        <b>الاستجواب</b>
        <span className="cat-pill">PRE-INTER</span>
        <ExitConfirm />
      </div>
      <div className="center anim-fadeup">
        <div className="big-emoji">🎯</div>
        <h2>استجواب {name}</h2>
        <p className="lead">الوقت: {seconds} د ~ اللي كيستجوب هو {name}.</p>
        <p className="sm">الجاسوس كيجاوب خوه بصوت عالي — هادشي اللي خاصو يصمعو للجواب.</p>
      </div>

      <div className="spacer" />

      <button
        className="btn-cta"
        onClick={() => {
          buzz([60, 60])
          dispatch({ type: 'INTER_START' })
        }}
      >
        ⏱️ خليني نبدا الوقت
      </button>
    </div>
  )
}