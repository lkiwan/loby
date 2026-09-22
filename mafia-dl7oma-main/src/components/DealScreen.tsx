import { motion } from 'framer-motion'
import { useMafiaGame } from '../game/useMafiaGame'
import { buzz } from '../lib/utils'

export default function DealScreen() {
  const players = useMafiaGame((s) => s.players)
  const advanceToReveal = useMafiaGame((s) => s.advanceToReveal)
  const teller = players.find((p) => p.isTeller)

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden bg-night px-4">
      {/* background */}
      <img
        src={`${import.meta.env.BASE_URL}img/smiley-bg.png`}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      {/* header */}
      <div className="relative z-10 mt-8 mb-3 flex flex-col items-center gap-1.5">
        <motion.p
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-darija text-[11px] font-bold tracking-[0.4em] text-gold/80 uppercase"
        >
          تفريق الأدوار
        </motion.p>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="font-grit text-2xl tracking-wider text-zinc-100"
        >
          L'MAFIA <span className="text-blood">D'LHOUMA</span>
        </motion.p>
      </div>

      {/* continue */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-end pb-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-[320px]"
        >
          <div
            aria-hidden
            className="glow-pulse pointer-events-none absolute -inset-2 rounded-[48%] bg-blood/70 blur-xl"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              buzz([30, 40, 30])
              advanceToReveal()
            }}
            className="btn-horror group relative mx-auto w-full max-w-[280px] overflow-hidden px-5 py-3 text-center"
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="text-horror horror-flicker relative block font-darija text-xl font-black tracking-[0.18em]">
              شوف الكارطة
            </span>
            <span
              aria-hidden
              className="absolute bottom-1.5 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-blood/50 to-transparent"
            />
          </motion.button>
        </motion.div>
      </div>

      <p className="relative z-10 mb-8 text-center font-darija text-sm font-semibold text-zinc-500">
        الحاكم: <span className="text-gold">{teller?.name}</span> — ما تتيش راك!
      </p>
    </div>
  )
}
