import { useGame } from './context/GameContext'
import SetupScreen from './screens/SetupScreen'
import RoleRevealScreen from './screens/RoleRevealScreen'
import DrawingScreen from './screens/DrawingScreen'
import VotingScreen from './screens/VotingScreen'
import ResolutionScreen from './screens/ResolutionScreen'

/**
 * Phase switch only — Mafia-style: the game renders NO exit button of
 * its own; the host frame's ✕ is the single exit, so the game screen
 * flows as one unbroken screen under the host header.
 */
export default function App() {
  const { state } = useGame()

  return (
    <>
      {state.phase === 'setup' && <SetupScreen />}
      {state.phase === 'roleReveal' && <RoleRevealScreen />}
      {state.phase === 'drawing' && <DrawingScreen />}
      {state.phase === 'voting' && <VotingScreen />}
      {state.phase === 'resolution' && <ResolutionScreen />}
    </>
  )
}
