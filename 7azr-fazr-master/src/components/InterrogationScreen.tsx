import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store'
import { buzz, timeUp } from '../sound'
import { formatClock } from '../game'
import ExitConfirm from './ExitConfirm'

export default function InterrogationScreen() {
  const [state, dispatch] = useGame()
  const { timer, imposters, interIndex, strikes } = state
  const name = imposters[interIndex]

  const strikeWrong = () => {
    buzz(strikes + 1 >= 3 ? [120, 120, 160] : [70])
    dispatch({ type: 'STRIKE_WRONG' })
  }

  const guessRight = () => {
    buzz([90, 70, 90])
    dispatch({ type: 'GUESS_RIGHT' })
  }

  const [left, setLeft] = useState(timer)
  const [done, setDone] = useState(false)
  const fired = useRef(false)

  useEffect(() => {
    fired.current = false
    setLeft(timer)
    setDone(false)
    const end = Date.now() + timer * 1000
    const id = setInterval(() => {
      const rem = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setLeft(rem)
      if (rem <= 0 && !fired.current) {
        fired.current = true
        clearInterval(id)
        timeUp()
        setTimeout(() => setDone(true), 400)
      }
    }, 200)
    return () => clearInterval(id)
  }, [timer, interIndex])

  const progress = ((timer - left) / timer) * 100
  const low = left <= 30

  return (
    <div className="screen">
      <div className="bar">
        <b>🎙️ استجواب: {name}</b>
        <span className="cat-pill">INT</span>
        <ExitConfirm />
      </div>

      <div className="center anim-fadeup">
        <h2>سلّم على الجاسوس</h2>
        <p className="lead">الجاسوس كيقول ظنو بصوت عالي — والفريق كيحكم: صح ولا غلط؟</p>
      </div>

      <div className={`clock-big ${low ? 'low' : ''}`}>{formatClock(left)}</div>
      <div className="prog-bar">
        <div className={`prog-fill ${low ? 'danger' : ''}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="card center">
        <span className="role-badge role-intrus">🕵️ {name} — الجاسوس</span>
        <p className="sm">عندك {strikes}/3 ظنو غالط· الشينو راك تصي بيهم.</p>
        <div className="count-row" style={{ marginTop: 8 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="count-chip"
              style={{
                maxWidth: 64,
                background: i < strikes ? 'var(--terra)' : 'var(--card)',
                color: i < strikes ? 'var(--paper)' : 'var(--ink)',
              }}
            >
              {i < strikes ? '✗' : '•'}
            </span>
          ))}
        </div>
      </div>

      <div className="spacer" />

      {!done ? (
        <>
          <p className="center sm">الجاسوس كيقول ظنو بصوت عالي — ثم كتحكمو انت 🗣️</p>
          <div className="row">
            <button className="btn-terra btn-sm" onClick={strikeWrong}>
              ❌ غلط
            </button>
            <button className="btn-primary btn-sm" onClick={guessRight}>
              ✅ صح
            </button>
          </div>
          <p className="center sm">3 ظنون غالطين = الجاسوس خسر 🏆</p>
        </>
      ) : (
        <div className="modal-overlay">
          <div className="modal-box anim-pop">
            <div className="big-emoji">🚨</div>
            <h2>خلص الوقت!</h2>
            <p>الجاسوس، هاد آخر ظن. والفريق: كان صح ولا غلط؟</p>
            <div className="row">
              <button className="btn-terra" onClick={strikeWrong}>
                ❌ غلط
              </button>
              <button className="btn-primary" onClick={guessRight}>
                ✅ صح
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}