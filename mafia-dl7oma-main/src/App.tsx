import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { useMafiaGame } from './game/useMafiaGame'
import HomeScreen from './components/HomeScreen'
import Jem3atScreen from './components/Jem3atScreen'
import DealScreen from './components/DealScreen'
import PassPlayScreen from './components/PassPlayScreen'
import DashboardScreen from './components/DashboardScreen'
import GameOverScreen from './components/GameOverScreen'

const SCREENS: Record<string, React.ComponentType> = {
  HOME: HomeScreen,
  SETUP: Jem3atScreen,
  DEAL_CARDS: DealScreen,
  PASS_AND_PLAY: PassPlayScreen,
  NIGHT_PHASE: DashboardScreen,
  DAY_PHASE: DashboardScreen,
  VOTING: DashboardScreen,
  GAME_OVER: GameOverScreen,
}

export default function App() {
  const phase = useMafiaGame((s) => s.phase)
  const Screen = SCREENS[phase] ?? Jem3atScreen

  // lock to portrait on mobile
  const [landscape, setLandscape] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 560 : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)')
    const fn = () => setLandscape(mq.matches && window.innerHeight < 560)
    mq.addEventListener?.('change', fn)
    return () => mq.removeEventListener?.('change', fn)
  }, [])

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black">
      {/* backdrop vignette on wide screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(30,20,6,.25), rgba(0,0,0,.9) 70%)' }}
      />

      {/* phone frame */}
      <div className="relative h-full max-h-[100dvh] w-full max-w-[440px] overflow-hidden bg-night grain">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase === 'NIGHT_PHASE' || phase === 'DAY_PHASE' || phase === 'VOTING' ? `dash-${phase}` : phase}
            className="h-full w-full"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* rotate prompt */}
      <AnimatePresence>
        {landscape && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-black/95 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 90, 90, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <RotateCw className="h-16 w-16 text-gold" />
            </motion.div>
            <p className="font-darija text-lg font-black text-zinc-100">Door l'telefon 3la portrait</p>
            <p className="font-darija text-sm font-bold text-zinc-500">L'game kat 7taj n'waq3 stable (vertical).</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}