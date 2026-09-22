import { useGame } from '../store'
import { buzz } from '../sound'
import { actionNumber } from '../game'
import HoldReveal from './HoldReveal'
import ExitConfirm from './ExitConfirm'

export default function PassScreen() {
  const [state, dispatch] = useGame()
  const { players, imposters, action, passIndex } = state

  const crew = players.filter((p) => !imposters.includes(p))
  const current = crew[passIndex]
  const isLast = passIndex === crew.length - 1

  const hideAndNext = () => {
    buzz([20, 30])
    if (isLast) {
      dispatch({ type: 'TO_PRE_INTER', index: 0 })
    } else {
      dispatch({ type: 'NEXT_PASS' })
    }
  }

  return (
    <div className="screen">
      <div className="bar">
        <b>
          اللاعب {passIndex + 1} / {crew.length}
        </b>
        <span className="cat-pill">دوزو التاب</span>
        <ExitConfirm />
      </div>

      <div className="center anim-fadeup">
        <h2>دوز التاب لـ</h2>
        <div className="name-plaque">{current}</div>
        <p className="lead">ماعندكش توصّل ليدك حتى يكون التاب راح ليك!</p>
      </div>

      <HoldReveal key={passIndex} hint="ضغط باش تكشف السر" veilIcon="🃏" onReveal={() => {}}>
        <div>
          <span className="role-badge role-safe">🤫 الحركة السرية</span>
          <div className="word-reveal" dir="rtl">
            <span className="action-num">{actionNumber(action)}</span> {action}
          </div>
          <p className="lead">أدّي هاد الحركة و أنت كتجاوب على أسئلة الجاسوس — بلا ما تضيف على بالو.</p>
        </div>
      </HoldReveal>

      <div className="spacer" />

      <button className="btn-primary" onClick={hideAndNext}>
        {isLast ? '🤫 شدّو سركم — نشدو الاستجواب' : '🤐 خبّاها و دوز التاب للي بعدي'}
      </button>
    </div>
  )
}