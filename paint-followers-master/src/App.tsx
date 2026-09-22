import { useState } from 'react'
import { useGame } from './context/GameContext'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import RoleRevealScreen from './screens/RoleRevealScreen'
import DrawingScreen from './screens/DrawingScreen'
import VotingScreen from './screens/VotingScreen'
import ResolutionScreen from './screens/ResolutionScreen'

export default function App() {
  const { state, dispatch } = useGame()
  const [started, setStarted] = useState(false)
  const [showQuit, setShowQuit] = useState(false)

  const isPlaying = started && state.phase !== 'setup'

  return (
    <>
      <style>{`
        .app-quit-btn {
          position: fixed; top: 16px; left: 16px; z-index: 50;
          width: 40px; height: 40px; border-radius: 12px;
          background: #FFF9EC; border: 2.5px solid #2A2118;
          color: #2A2118; font-size: 18px; font-weight: bold;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 3px 0 #2A2118;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .app-quit-btn:active {
          transform: translateY(2px); box-shadow: 0 1px 0 #2A2118;
        }
        .app-quit-modal {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(42,33,24,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; animation: qFade 0.2s;
        }
        .app-quit-box {
          background: #F6EFE2; border: 3px solid #2A2118;
          border-radius: 20px; padding: 24px; width: 100%; max-width: 320px;
          box-shadow: 0 8px 0 #2A2118; text-align: center;
          animation: qPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .app-quit-title {
          font-family: 'Lalezar', 'Cairo', sans-serif;
          font-size: 28px; color: #C8412B; margin-bottom: 8px;
        }
        .app-quit-text {
          font-family: 'Cairo', sans-serif; font-size: 15px; font-weight: 800;
          color: #8A7A63; margin-bottom: 24px;
        }
        .app-quit-row { display: flex; gap: 12px; }
        .app-quit-yes {
          flex: 1; font-family: 'Lalezar', 'Cairo', sans-serif; font-size: 20px;
          background: #C8412B; color: #F6EFE2; border: 2.5px solid #2A2118;
          border-radius: 12px; padding: 10px; cursor: pointer;
          box-shadow: 0 3px 0 #2A2118;
        }
        .app-quit-no {
          flex: 1; font-family: 'Lalezar', 'Cairo', sans-serif; font-size: 20px;
          background: #FFF9EC; color: #2A2118; border: 2.5px solid #2A2118;
          border-radius: 12px; padding: 10px; cursor: pointer;
          box-shadow: 0 3px 0 #2A2118;
        }
        @keyframes qFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes qPop { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>

      {/* Main content */}
      {!started ? (
        <HomeScreen onStart={() => setStarted(true)} />
      ) : (
        <>
          {state.phase === 'setup' && <SetupScreen />}
          {state.phase === 'roleReveal' && <RoleRevealScreen />}
          {state.phase === 'drawing' && <DrawingScreen />}
          {state.phase === 'voting' && <VotingScreen />}
          {state.phase === 'resolution' && <ResolutionScreen />}
        </>
      )}

      {/* Global Quit Button */}
      {isPlaying && (
        <button className="app-quit-btn" onClick={() => setShowQuit(true)} aria-label="خروج">
          ✕
        </button>
      )}

      {/* Quit Modal */}
      {showQuit && (
        <div className="app-quit-modal" dir="rtl">
          <div className="app-quit-box">
            <div className="app-quit-title">بغيتي تخرج؟</div>
            <div className="app-quit-text">كل النقاط غادي تمشي وتعاودو من الأول. متأكد؟</div>
            <div className="app-quit-row">
              <button
                className="app-quit-no"
                onClick={() => setShowQuit(false)}
              >
                لا، كمل
              </button>
              <button
                className="app-quit-yes"
                onClick={() => {
                  setShowQuit(false)
                  setStarted(false)
                  dispatch({ type: 'RESET' })
                }}
              >
                آه، نخرج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}