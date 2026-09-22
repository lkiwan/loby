import { useGame } from '../store'
import ExitConfirm from './ExitConfirm'

export default function RevealScreen() {
  const [state, dispatch] = useGame()
  const { imposters, players } = state
  const isTeam = imposters.length > 1

  return (
    <div className="screen">
      <div className="bar">
        <b>منظرة الكل 👀</b>
        <span className="cat-pill">REVEAL NIGHT</span>
        <ExitConfirm />
      </div>

      <div className="center">
        <h2 className="anim-fadeup">أقربو للشاشة كاملين!</h2>
        <p className="anim-fadeup d1">النهار والا الليل — عرفو على الجاسوس و سكيتو!</p>
      </div>

      {imposters.map((name, i) => (
        <div key={name} className="big-card imposter stamp-in">
          <div className="bar">
            <span className="cat-pill">جاسوس {imposters.length > 1 ? i + 1 : ''}</span>
            <span>🕵️</span>
          </div>
          <div className="name-plaque">{name}</div>
          <p className="lead">ها الجاسوس — ما تورّيش عليه! 👇</p>
        </div>
      ))}

      <div className="card anim-fadeup">
        <p className="lead">
          {isTeam
            ? `الجواسيس (${imposters.length}) كيشغلو فيها بحمة وحدة: كلهم كيخبّيو نفس «الحركة» و كيحاولو يخربقو على الباقي.`
            : 'الجاسوس هو اللاعب الوحيد اللي ما عندوش لا حركة لا علاقة بيهم.'}
        </p>
        <p className="sm">عدد اللاعبين: <b>{players.length}</b></p>
      </div>

      <div className="spacer" />

      <button className="btn-cta" onClick={() => dispatch({ type: 'REVEAL_DONE' })}>
        😅 فهمت، دوزو لتاب
      </button>
    </div>
  )
}