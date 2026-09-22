import { useGame } from './store'
import HomeScreen from './components/HomeScreen'
import SetupScreen from './components/SetupScreen'
import RevealScreen from './components/RevealScreen'
import PassScreen from './components/PassScreen'
import PreInterScreen from './components/PreInterScreen'
import InterrogationScreen from './components/InterrogationScreen'
import FinalScreen from './components/FinalScreen'
import AgainScreen from './components/AgainScreen'

export default function App() {
  const [state] = useGame()

  return (
    <main className="app">
      {state.phase === 'home' && <HomeScreen />}
      {state.phase === 'setup' && <SetupScreen />}
      {state.phase === 'reveal' && <RevealScreen />}
      {state.phase === 'pass' && <PassScreen />}
      {state.phase === 'pre-inter' && <PreInterScreen />}
      {state.phase === 'inter' && <InterrogationScreen />}
      {state.phase === 'final' && <FinalScreen />}
      {state.phase === 'again' && <AgainScreen />}
    </main>
  )
}