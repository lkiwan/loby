import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Player, Role } from '../game/types'
import { ROLE_META } from '../game/types'
import { CardBackArt, RoleArt } from './CardArt'
import { Shield, Crosshair } from 'lucide-react'

export interface PlayerCardProps {
  player?: Player
  role?: Role | null
  facing?: 'front' | 'back'
  size?: 'table' | 'big'
  layoutId?: string
  glow?: boolean
  dead?: boolean
  selected?: boolean
  crosshair?: boolean
  shield?: boolean
  tilt?: number
  number?: number
  onTap?: () => void
  interactive?: boolean
  className?: string
}

/* dark, worn card shell (paper over wood) */
export function CardShell({
  children,
  className = '',
  tilt = 0,
  glow = false,
  style,
}: {
  children: React.ReactNode
  className?: string
  tilt?: number
  glow?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      className={`relative rounded-[10px] shadow-card select-none ${className}`}
      style={{
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        transition: 'box-shadow .3s ease',
        ...(glow ? { boxShadow: '0 0 26px 6px rgba(234,179,8,.5)' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Worn inner face texture shared by front & back. */
export function CardFaceTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[10px]"
      style={{
        background:
          'repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px), linear-gradient(135deg, rgba(255,255,255,.06), rgba(0,0,0,0))',
      }}
    />
  )
}

const MAFIA_BORDER = { boxShadow: '0 0 0 2px #dc2626, 0 0 18px 2px rgba(220,38,38,.45)' }

/* ---------------- static table card ---------------- */
export function TableCard({
  player,
  role,
  facing = 'front',
  glow = false,
  dead = false,
  selected = false,
  crosshair = false,
  shield = false,
  tilt = 0,
  number,
  onTap,
  interactive = false,
  className = '',
}: PlayerCardProps) {
  const r = role ?? player?.role ?? null
  const meta = r ? ROLE_META[r] : null
  const isMafia = r === 'EISSABA'
  const aura =
    r === 'EISSABA' ? 'bg-blood/20 ring-blood/40' : r === 'BOULIS' ? 'bg-gold/15 ring-gold/40' : r === 'TBIB' ? 'bg-heal/15 ring-heal/40' : 'bg-zinc-400/10 ring-zinc-400/25'

  return (
    <CardShell
      tilt={tilt}
      glow={glow}
      className={`${className} ${interactive ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      <button
        type="button"
        disabled={!interactive}
        onClick={onTap}
        className="relative block h-full w-full rounded-[10px] overflow-hidden disabled:cursor-default"
        style={dead ? undefined : isMafia && meta ? MAFIA_BORDER : undefined}
      >
        {facing === 'back' ? (
          <div className="relative h-full w-full">
            <CardBackArt className="h-full w-full" />
            <CardFaceTexture />
          </div>
        ) : (
          <div
            className={`relative flex h-full w-full flex-col px-1 pt-1 pb-0.5 ${
              dead ? 'grayscale' : ''
            }`}
            style={{ background: 'linear-gradient(160deg, #2c2a2e 0%, #19181c 55%, #0b0a0d 100%)' }}
          >
            <CardFaceTexture />

            {/* seat number badge */}
            {number != null && (
              <span className="absolute left-1 top-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-grit text-[9px] leading-none text-night shadow-glowGold">
                {number}
              </span>
            )}

            {/* role art in a tinted aura */}
            <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center pb-0.5">
              <div
                className={`flex items-center justify-center rounded-full p-1.5 ring-1 ${aura}`}
                style={dead ? { opacity: 0.5 } : undefined}
              >
                {r ? <RoleArt role={r} className="h-8 w-8" /> : null}
              </div>
            </div>

            {/* name — readable */}
            <span
              className={`relative z-10 line-clamp-2 px-0.5 text-center font-darija text-[11px] font-black leading-[1.15] tracking-tight ${
                dead ? 'text-zinc-500 line-through' : 'text-zinc-50'
              }`}
            >
              {player?.name}
            </span>

            {/* role label */}
            <span
              className={`relative z-10 truncate text-center text-[8px] font-black tracking-widest ${
                meta?.color ?? 'text-zinc-400'
              }`}
            >
              {meta?.label ?? ''}
            </span>

            {dead && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="absolute inset-0 bg-zinc-950/70" />
                <span className="relative z-10 font-grit text-base text-blood line-through drop-shadow-[0_0_8px_rgba(220,38,38,.8)]">
                  MAT
                </span>
              </div>
            )}

            {/* role overlays for night actions */}
            {crosshair && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Crosshair className="h-7 w-7 text-blood animate-pulse drop-shadow-[0_0_8px_rgba(220,38,38,.9)]" />
              </div>
            )}
            {shield && (
              <div className="absolute -right-1 -bottom-1 z-20 flex items-center justify-center rounded-full bg-heal/90 p-1">
                <Shield className="h-4 w-4 text-night" />
              </div>
            )}
            {selected && (
              <div className="absolute inset-0 rounded-[10px] ring-[3px] ring-blood shadow-glowRed" />
            )}
          </div>
        )}
      </button>
    </CardShell>
  )
}

/* ---------------- big interactive flip card ---------------- */
export function FlipCardView({
  role,
  playerName,
  faceUp,
  layoutId,
  onTap,
  pulse,
}: {
  role: Role | null
  playerName: string
  faceUp: boolean
  layoutId?: string
  onTap: () => void
  pulse: 'red' | 'green' | 'gold' | 'none'
}) {
  const meta = role ? ROLE_META[role] : null
  const pulseGlow =
    pulse === 'red'
      ? { boxShadow: '0 0 60px 12px rgba(220,38,38,.55)' }
      : pulse === 'green'
        ? { boxShadow: '0 0 60px 12px rgba(16,185,129,.5)' }
        : pulse === 'gold'
          ? { boxShadow: '0 0 60px 12px rgba(234,179,8,.45)' }
          : {}

  return (
    <motion.div
      layoutId={layoutId}
      className="preserve-3d relative h-full w-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
        onClick={onTap}
        role="button"
        tabIndex={0}
      >
        {/* back */}
        <div className="backface-hidden absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.7)]">
          <CardBackArt className="h-full w-full" />
          <CardFaceTexture />
        </div>
        {/* front */}
        <div
          className="backface-hidden absolute inset-0 rounded-2xl overflow-hidden"
          style={{ transform: 'rotateY(180deg)', ...pulseGlow }}
        >
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-2 p-4"
            style={{ background: 'linear-gradient(165deg, #27272a 0%, #18181b 55%, #09090b 100%)' }}
          >
            <CardFaceTexture />
            <div className={`relative w-full max-w-[160px] ${meta?.color ?? 'text-zinc-300'}`}>
              {role ? <RoleArt role={role} className="mx-auto h-32 w-32" /> : null}
            </div>
            <span className="relative z-10 font-darija text-xl font-black text-zinc-100">{playerName}</span>
            <span className={`relative z-10 font-darija font-black text-3xl tracking-widest ${meta?.color ?? 'text-zinc-300'}`}>
              {meta?.label ?? '...'}
            </span>
            <span className="relative z-10 font-darija text-sm font-bold tracking-widest text-zinc-400 uppercase">
              {meta?.sub ?? ''}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}