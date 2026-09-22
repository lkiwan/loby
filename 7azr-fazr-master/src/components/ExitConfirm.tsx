import { useState } from 'react'
import { useGame } from '../store'
import { buzz } from '../sound'

export default function ExitConfirm() {
  const [, dispatch] = useGame()
  const [open, setOpen] = useState(false)

  const ask = () => {
    buzz([60, 60])
    setOpen(true)
  }
  const cancel = () => setOpen(false)
  const leave = () => {
    setOpen(false)
    dispatch({ type: 'HOME' })
  }

  return (
    <>
      <button
        className="btn-exit"
        onClick={ask}
        aria-label="خروج للبيت"
        title="خروج للبيت"
      >
        ✕
      </button>

      {open && (
        <div className="modal-overlay" onClick={cancel}>
          <div className="modal-box anim-pop" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">🏃</div>
            <h2>تنتي متأكد؟</h2>
            <p className="lead">اللعبة الحالية غادي تضيع؟ كول تعود تبدأ من الأول.</p>
            <div className="row" style={{ marginTop: 18 }}>
              <button className="btn-ghost" onClick={cancel}>
                😅 بقيت هنا
              </button>
              <button className="btn-terra" onClick={leave}>
                🏠 أيوه، رجعني
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}