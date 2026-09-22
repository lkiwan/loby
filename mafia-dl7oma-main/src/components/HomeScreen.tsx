import { useMemo } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Skull, Shield, Stethoscope, Home } from 'lucide-react'
import { useMafiaGame } from '../game/useMafiaGame'
import { buzz } from '../lib/utils'

const TITLE = "L'MAFIA"

export default function HomeScreen() {
  const goSetup = useMafiaGame((s) => s.goSetup)

  // slide-to-spin the mafia card
  const dragX = useMotionValue(0)
  const spin = useTransform(dragX, [-180, 180], [-34, 34])

  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        top: 8 + Math.random() * 82,
        size: 2 + Math.random() * 3,
        dur: 5 + Math.random() * 6,
        delay: Math.random() * 6,
      })),
    [],
  )

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-night">
      {/* background image */}
      <img
        src={`${import.meta.env.BASE_URL}img/home-bg.jpeg`}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* readability overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 32%, rgba(0,0,0,.10), rgba(0,0,0,.55) 70%), linear-gradient(to top, rgba(0,0,0,.9) 0%, rgba(0,0,0,.25) 35%, rgba(0,0,0,.4) 100%)',
        }}
      />

      {/* floating dust motes */}
      {motes.map((m) => (
        <motion.span
          key={m.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-amber-200/50"
          style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size }}
          animate={{ y: [0, -34, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: m.dur, repeat: Infinity, delay: m.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 pb-8 pt-7">
        {/* ============ header ============ */}
        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-1 flex items-center gap-2 font-darija text-[11px] font-black tracking-[0.45em] text-zinc-300 uppercase"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,.9)' }}
        >
          <span className="h-px w-10 bg-gold/70" />
          لعبة ديال الحومة
          <span className="h-px w-10 bg-gold/70" />
        </motion.p>

        {/* ============ title ============ */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center">
            {TITLE.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 220, damping: 18 }}
                className={`font-grit text-[52px] leading-none tracking-tight ${
                  ch === "'" ? 'text-gold' : 'text-horror'
                } ${ch === "'" ? '' : 'horror-flicker'}`}
                style={{ ...(ch === "'" ? { fontSize: '38px', textShadow: '0 4px 18px rgba(0,0,0,.9)' } : { animationDelay: `${(i % 5) * 0.7}s` }) }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.55em' }}
            transition={{ delay: 0.75, duration: 0.9 }}
            className="horror-flicker mt-0.5 font-grit text-2xl text-gold"
            style={{ textShadow: '0 0 6px rgba(234,179,8,.55), 0 4px 18px rgba(0,0,0,.9)', animationDelay: '1.4s' }}
          >
            D'LHOUMA
          </motion.p>
        </div>

        {/* ============ centered mafia card (slide to spin) ============ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 140, damping: 16 }}
          className="relative flex items-center justify-center"
        >
          {/* breathing glow */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute rounded-[28px]"
            style={{
              inset: '-14%',
              background: 'radial-gradient(circle, rgba(220,38,38,.45), rgba(234,179,8,.18) 55%, transparent 75%)',
              filter: 'blur(18px)',
            }}
            animate={{ opacity: [0.55, 0.9, 0.55], scale: [0.97, 1.03, 0.97] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            drag="x"
            dragSnapToOrigin
            dragElastic={0.75}
            whileDrag={{ scale: 1.06, filter: 'brightness(1.15)' }}
            onDragStart={() => buzz(25)}
            style={{ x: dragX, rotate: spin }}
            className="touch-none relative cursor-grab active:cursor-grabbing"
          >
            <img
              src={`${import.meta.env.BASE_URL}img/card-mafia.png`}
              alt="L'Mafia d'L'Houma"
              draggable={false}
              className="h-[36vh] max-h-[300px] w-auto object-contain drop-shadow-[0_26px_50px_rgba(0,0,0,.75)]"
            />
          </motion.div>
        </motion.div>

        {/* ============ bottom ============ */}
        <div className="w-full">
          {/* role chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-4 flex flex-wrap items-center justify-center gap-1.5"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-blood/40 bg-blood/25 px-3.5 py-1.5 font-darija text-xs font-black text-red-100 shadow-[0_0_18px_rgba(220,38,38,.2)] backdrop-blur-sm">
              <Skull className="h-3.5 w-3.5 text-blood" />
              عصابة
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-3.5 py-1.5 font-darija text-xs font-black text-yellow-100 shadow-[0_0_18px_rgba(234,179,8,.18)] backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 text-gold" />
              بوليس
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-heal/40 bg-heal/20 px-3.5 py-1.5 font-darija text-xs font-black text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,.16)] backdrop-blur-sm">
              <Stethoscope className="h-3.5 w-3.5 text-heal" />
              طبيب
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-darija text-xs font-black text-zinc-100 backdrop-blur-sm">
              <Home className="h-3.5 w-3.5 text-zinc-300" />
              ولاد الحومة
            </span>
          </motion.div>

          {/* CTA — Yallah Nbdaw */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="relative mx-auto w-full max-w-[320px]"
          >
            <div aria-hidden className="glow-pulse pointer-events-none absolute -inset-2 rounded-[48%] bg-blood/70 blur-xl" />

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                buzz([40, 50, 60])
                goSetup()
              }}
              className="btn-horror group relative w-full max-w-[280px] px-5 py-3 mx-auto text-center overflow-hidden"
            >
              <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="text-horror horror-flicker relative block font-darija font-black text-xl tracking-[0.18em]">
                يلا نبداو
              </span>
              <span aria-hidden className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-12 h-px bg-gradient-to-r from-transparent via-blood/50 to-transparent" />
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25 }}
            className="mt-3 text-center font-darija text-xs font-semibold text-zinc-400"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,.9)' }}
          >
            على الأقل 6 لاعبين · كلشي ف تيلي واحد
          </motion.p>
        </div>
      </div>
    </div>
  )
}