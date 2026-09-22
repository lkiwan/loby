import { useState } from 'react'
import Ticker from './Ticker'
import { useGame } from '../store'

export default function HomeScreen() {
  const [, dispatch] = useGame()
  const [how, setHow] = useState(false)

  return (
    <div className="screen">
      <div className="home-bg">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
        <div className="home-orb home-orb-3" />
      </div>

      <Ticker />

      <div className="hero">
        <div className="anim-pop home-mascot-wrap">
          <svg className="star8" viewBox="0 0 100 100">
            <path
              d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z"
              fill="none"
              stroke="#F2B23D"
              strokeWidth="5"
            />
            <path
              d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z"
              fill="none"
              stroke="#2A2118"
              strokeWidth="1.6"
              opacity="0.55"
              transform="translate(0 4)"
            />
          </svg>
          <div className="tape" />
          <div className="tape bl" />
          <span className="home-mascot-emoji">🔍</span>
        </div>

        <div className="home-title-wrap">
          <h1 className="anim-fadeup d1 home-title-bara">
            7ZER <span style={{ color: '#2A2118' }}>FZER</span>
          </h1>
          <span className="anim-fadeup d2 home-title-salfa">حزر فزر</span>
        </div>

        <div className="anim-pop d3 home-darija-badge">لعبة 100% بالدارجة 🗣️</div>
      </div>

      <div
        className="anim-fadeup d3"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        <p className="home-tagline anim-fadeup" style={{ marginTop: 0, textAlign: 'center' }}>
          لعبة جماعية: واحد ولا جوج كيخبّيو شي حركة سرية، والباقي كيحاولو يخرجوها بالسوالي.
        </p>

        <div className="home-feats" style={{ marginTop: 14 }}>
          <div className="home-feat">
            <span className="home-feat-ico">👥</span>
            <span className="home-feat-lbl">3 حتى 15 لاعب</span>
          </div>
          <div className="home-feat">
            <span className="home-feat-ico">🕵️</span>
            <span className="home-feat-lbl">جاسوس ولا جوج</span>
          </div>
          <div className="home-feat">
            <span className="home-feat-ico">⏱️</span>
            <span className="home-feat-lbl">مؤقت للاستجواب</span>
          </div>
        </div>

        <button className="btn-cta anim-pop d5" style={{ marginTop: 18 }} onClick={() => dispatch({ type: 'SETUP' })}>
          🚀 هيا نلعبو
        </button>
      </div>

      <button className="btn-ghost anim-fadeup" onClick={() => setHow(true)}>
        📖 كيفاش كتلعب؟
      </button>

      {how && (
        <div className="modal-overlay" onClick={() => setHow(false)}>
          <div className="modal-box anim-pop" onClick={(e) => e.stopPropagation()}>
            <h2>📖 كيفاش كتلعب؟</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'right' }}>
              <div className="step">
                <span className="step-num">1</span>
                <p className="lead">كل واحد فيكوم كيحصل على حركة سرية — إلا الجاسوس.</p>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <p className="lead">الجاسوس ما عندوش حركة، خاصو يقلب بالأسئلة شكون كيديرها.</p>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <p className="lead">إلا عرف الجاسوس الحركة قبل ما يكمل الوقت: ربح. إلا لا: ربح الفريق.</p>
              </div>
              <div className="step">
                <span className="step-num">4</span>
                <p className="lead">دوزو التاب من لاعب للاعب — السر يبقى بيناتكم!</p>
              </div>
            </div>
            <div className="row" style={{ marginTop: 18 }}>
              <button className="btn-primary" onClick={() => setHow(false)}>
                فهمت، نشدو اللعب 😄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}