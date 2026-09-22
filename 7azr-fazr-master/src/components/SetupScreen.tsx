import { useEffect, useMemo, useState } from 'react'
import { useGame, saveSetupDraft } from '../store'
import { MIN_PLAYERS, MAX_PLAYERS, MIN_TIMER, MAX_TIMER, maxImposters, defaultNames } from '../game'

const QUICK = [2, 3, 4, 5, 6, 7]

export default function SetupScreen() {
  const [state, dispatch] = useGame()
  const [count, setCount] = useState(state.players.length)
  const [names, setNames] = useState<string[]>(state.players)
  const [imposters, setImposters] = useState(state.imposterCount)
  const [timer, setTimer] = useState(state.timer)
  const [typerOpen, setTyperOpen] = useState(state.players.length > 7)
  const [impOpen, setImpOpen] = useState(false)

  const maxImp = useMemo(() => maxImposters(count), [count])
  const players = useMemo(() => defaultNames(count), [count])

  const finalNames = players.map((def, i) => names[i]?.trim() || def)

  const canStart = count >= MIN_PLAYERS && imposters <= maxImp

  useEffect(() => {
    saveSetupDraft({ players: count, names: finalNames, imposters, timer })
  }, [count, finalNames, imposters, timer])

  function chooseCount(n: number) {
    setCount(n)
    setTyperOpen(n > 7)
    setImposters((imp) => Math.min(imp, maxImposters(n)))
  }

  return (
    <div className="screen">
      <div className="bar">
        <b>إعداد الحفلة</b>
        <span className="cat-pill">SET UP</span>
      </div>

      <h2>شحال من لاعب؟</h2>
      <div className="count-row">
        {QUICK.map((n) => (
          <button key={n} className={`count-chip ${n === count && !typerOpen ? 'on' : ''}`} onClick={() => chooseCount(n)}>
            {n}
          </button>
        ))}
        <button
          className={`count-chip count-more ${typerOpen ? 'on' : ''}`}
          onClick={() => setTyperOpen((o) => !o)}
          aria-label="عدد آخر"
        >
          …
        </button>
      </div>

      {typerOpen && (
        <>
          <div className="count-typer anim-fadeup">
            <button className="count-chip" onClick={() => chooseCount(Math.max(MIN_PLAYERS, count - 1))}>
              −
            </button>
            <input
              type="number"
              className="count-input"
              value={count}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!Number.isNaN(v)) chooseCount(Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, v)))
              }}
            />
            <button className="count-chip" onClick={() => chooseCount(Math.min(MAX_PLAYERS, count + 1))}>
              +
            </button>
          </div>
          <p className="count-hint">
            <span className="wag">👆</span> كتب العدد هنا حتى 15 لاعب
          </p>
        </>
      )}

      <h2>الأسماء</h2>
      <p className="sm">خلي الاسم فاضي باش يبقى «{players[0]}» بصيفطتو.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {players.map((def, i) => (
          <input
            key={i}
            value={names[i] ?? ''}
            placeholder={def}
            onChange={(e) => {
              const next = [...names]
              next[i] = e.target.value
              setNames(next)
            }}
          />
        ))}
      </div>

      <h2>شحال من جاسوس؟ 🕵️</h2>
      <button className={`pick ${impOpen ? 'on' : ''}`} onClick={() => setImpOpen((o) => !o)}>
        🕵️ <b>{imposters}</b> جاسوس {imposters > 1 ? 'جواسيس' : ''}{' '}
        <span className="sub">{impOpen ? 'ضغط باش تقفل' : 'ضغط باش تبدل (+ / −)'}</span>
      </button>

      {impOpen && (
        <div className="count-typer anim-fadeup">
          <button className="count-chip" onClick={() => setImposters((i) => Math.max(1, i - 1))}>
            −
          </button>
          <span className="count-value">{imposters} 🕵️</span>
          <button className="count-chip" onClick={() => setImposters((i) => Math.min(maxImp, i + 1))}>
            +
          </button>
        </div>
      )}
      <p className="count-hint">
        <span className="wag">👈</span> حتى {maxImp} جواسيس مع {count} لاعبين
      </p>

      <h2>مدة الاستجواب ⏱️</h2>
      <div className="count-typer">
        <button className="count-chip" onClick={() => setTimer((t) => Math.max(MIN_TIMER, t - 10))}>
          −
        </button>
        <input
          type="number"
          className="count-input"
          value={timer}
          min={MIN_TIMER}
          max={MAX_TIMER}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10)
            if (!Number.isNaN(v)) setTimer(Math.min(MAX_TIMER, Math.max(MIN_TIMER, v)))
          }}
        />
        <button className="count-chip" onClick={() => setTimer((t) => Math.min(MAX_TIMER, t + 10))}>
          +
        </button>
        <span className="count-unit">ثانية</span>
      </div>
      <div className="count-row" style={{ marginTop: 6 }}>
        {[60, 120, 180, 300].map((s) => (
          <button key={s} className={`count-chip ${s === timer ? 'on' : ''}`} onClick={() => setTimer(s)} style={{ maxWidth: 64 }}>
            {s}
          </button>
        ))}
      </div>
      <p className="count-hint">
        <span className="wag">👈</span> 120 ثانية هي المدة المثالية
      </p>

      <div className="spacer" />

      <button
        className="btn-cta"
        disabled={!canStart}
        onClick={() => dispatch({ type: 'START', setup: { players: count, names: finalNames, imposters, timer } })}
      >
        🎬 ابداو اللعبة
      </button>
      <button className="btn-ghost" onClick={() => dispatch({ type: 'HOME' })}>
        🏠 رجع للبيت
      </button>
    </div>
  )
}