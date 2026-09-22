import { useEffect, useState } from 'react'
import { useGame } from '../store'
import { actionNumber } from '../game'
import { buzz } from '../sound'
import ExitConfirm from './ExitConfirm'

export default function FinalScreen() {
  const [state, dispatch] = useGame()
  const { action, result } = state
  const [revealed, setRevealed] = useState(false)

  const won = result === 'win'

  useEffect(() => {
    window.parent.postMessage({ type: 'game-over' }, '*')
  }, [])

  return (
    <div className="screen">
      <div className="bar">
        <span style={{ visibility: 'hidden' }} />
        <ExitConfirm />
      </div>
      <div className="center anim-shake" style={{ animationIterationCount: 2 }}>
        <div className="big-emoji">{won ? '🎉' : '😵'}</div>
        <h2>{won ? 'الجاسوس ربح!' : 'الفريق ربح!'}</h2>
        <p className="lead">
          {won ? 'ظنو غاص فالصحيحة — تحية للنفار! 🕵️' : '3 ظنون غالطين — الشينة تاعهم بانت واضحة! 🏆'}
        </p>
      </div>

      {!revealed ? (
        <div className="card center anim-fadeup" style={{ position: 'relative' }}>
          <span className="role-badge role-safe">🤫 الحركة السرية كانت</span>
          <div className="word-reveal blur-word" dir="rtl" aria-hidden>
            <span className="action-num">{actionNumber(action)}</span> {action}
          </div>
          <p className="sm" style={{ marginTop: 8 }}>
            مبخوتة... اضغط باش تبينها 👇
          </p>
          <button
            className="btn-cta"
            onClick={() => {
              buzz([60, 80, 60])
              setRevealed(true)
            }}
          >
            🥁 بينها
          </button>
        </div>
      ) : (
        <>
          <div className="big-card imposter anim-pop">
            <span className="role-badge role-safe">🤫 الحركة السرية كانت</span>
<div className="word-reveal" dir="rtl">
            <span className="action-num">{actionNumber(action)}</span> {action}
          </div>
            <p className="lead">ولا لا، صح عند الجاسوس؟ 😏</p>
          </div>
          <div className="spacer" />
          <button className="btn-cta" onClick={() => { buzz([40, 40, 60]); dispatch({ type: 'FINAL_DONE' }) }}>
            🎮 لعبة أخرى
          </button>
        </>
      )}
    </div>
  )
}