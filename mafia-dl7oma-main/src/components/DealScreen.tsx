import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { useMafiaGame } from '../game/useMafiaGame'
import { buzz } from '../lib/utils'
import { CardBackArt } from './CardArt'

export default function DealScreen() {
  const players = useMafiaGame((s) => s.players)
  const advanceToReveal = useMafiaGame((s) => s.advanceToReveal)
  const teller = players.find((p) => p.isTeller)

  return (
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#07070D] px-5">
      {/* title */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-14 text-center font-darija text-4xl font-black text-[#FFC93C]"
      >
        توزعو الكارطات
      </motion.h1>

      {/* face-down card — same art + frame as the Pass&Play flip card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
        className="mx-auto mt-9 w-[min(62vw,250px)]"
      >
        <div className="aspect-[3/4.4] w-full overflow-hidden rounded-[22px] ring-1 ring-white/10">
          <CardBackArt className="h-full w-full" />
        </div>
      </motion.div>

      {/* teller pill + note + continue */}
      <div className="mt-auto flex flex-col items-center pb-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 rounded-full bg-[#FFC93C]/[0.08] px-6 py-3 ring-1 ring-[#FFC93C]/30"
        >
          <span className="font-darija text-lg font-extrabold text-zinc-50">الحاكم:</span>
          <span className="font-darija text-lg font-black text-zinc-50">{teller?.name ?? '—'}</span>
          <Crown className="h-5 w-5 fill-[#FFC93C] text-[#FFC93C]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center font-darija text-sm font-semibold text-zinc-500"
        >
          الحاكم ما عندوش كارطة — هو غير كيسيّر اللعبة
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            buzz([30, 40, 30])
            advanceToReveal()
          }}
          className="mt-7 rounded-full bg-[#C6F542] px-12 py-3.5 font-darija text-xl font-black text-[#131803]"
        >
          شوف الكارطة
        </motion.button>
      </div>
    </div>
  )
}
