import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { Player, Role } from '../game/types'
import { ROLE_META } from '../game/types'
import { CardBackArt, RoleArt } from './CardArt'
import { Shield, Crosshair, X } from 'lucide-react'

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

/* Role label colors (flat Store Posters palette). */
const ROLE_HEX: Record<Role, string> = {
  EISSABA: '#FF4D5E',
  BOULIS: '#FFC93C',
  TBIB: '#3DDC84',
  WLAD_LHOUMA: '#FFFFFF',
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

/* ---------------- table chip (Teller god view) ----------------
   Flat chip per the accepted Dashboard designs: portrait role-art
   thumbnail + name + role label. State tints: mafia target = red,
   doctor save = green, vote selection = solid red, dead = greyed ✕. */
export function TableCard({
  player,
  role,
  facing = 'front',
  dead = false,
  selected = false,
  crosshair = false,
  shield = false,
  onTap,
  interactive = false,
  className = '',
}: PlayerCardProps) {
  const r = role ?? player?.role ?? null
  const meta = r ? ROLE_META[r] : null

  if (facing === 'back') {
    return (
      <div className={`relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${className}`}>
        <CardBackArt className="h-full w-full" />
      </div>
    )
  }

  const bg = selected
    ? 'bg-[#FF4D5E]'
    : crosshair
      ? 'bg-[#FF4D5E]/[0.13]'
      : shield
        ? 'bg-[#3DDC84]/[0.10]'
        : dead
          ? 'bg-white/[0.03]'
          : 'bg-[#1C1C29]'
  const ring = selected
    ? 'ring-white/25'
    : shield
      ? 'ring-[#3DDC84]/50'
      : crosshair
        ? 'ring-[#FF4D5E]/50'
        : 'ring-white/[0.08]'

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onTap}
      className={`relative flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-right ring-1 transition-transform ${bg} ${ring} ${
        interactive ? 'cursor-pointer active:scale-[0.97]' : 'disabled:cursor-default'
      } ${className}`}
    >
      {/* portrait role art thumbnail */}
      <span
        className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ${
          selected ? 'ring-white/40' : 'ring-white/10'
        } ${dead ? 'opacity-50 grayscale' : ''}`}
      >
        {r ? <RoleArt role={r} fit="cover" className="h-full w-full" /> : null}
      </span>

      {/* name + role label */}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-darija text-[15px] font-black leading-tight ${
            dead ? 'text-zinc-500 line-through' : 'text-zinc-50'
          }`}
        >
          {player?.name}
        </span>
        <span
          className={`block truncate font-darija text-[11px] font-bold leading-tight ${
            selected ? 'text-white/75' : dead ? 'text-zinc-600' : ''
          }`}
          style={!selected && !dead && r ? { color: ROLE_HEX[r] } : undefined}
        >
          {meta?.label ?? ''}
        </span>
      </span>

      {/* state markers */}
      {dead ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
          <X className="h-3.5 w-3.5 text-zinc-500" />
        </span>
      ) : crosshair || shield ? (
        <span className="flex shrink-0 items-center gap-1.5">
          {crosshair && <Crosshair className="h-5 w-5 text-[#FF4D5E]" />}
          {shield && (
            <span className="flex items-center justify-center rounded-full bg-[#3DDC84] p-1">
              <Shield className="h-3.5 w-3.5 text-[#131803]" />
            </span>
          )}
        </span>
      ) : null}
    </button>
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
  /* flat design: the old colored glow becomes a thin role-colored ring */
  const pulseRing =
    pulse === 'red'
      ? { boxShadow: '0 0 0 1px rgba(255,77,94,.55)' }
      : pulse === 'green'
        ? { boxShadow: '0 0 0 1px rgba(61,220,132,.55)' }
        : pulse === 'gold'
          ? { boxShadow: '0 0 0 1px rgba(255,201,60,.55)' }
          : { boxShadow: '0 0 0 1px rgba(255,255,255,.10)' }

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
        {/* back — face-down skull card */}
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[22px] ring-1 ring-white/10">
          <CardBackArt className="h-full w-full" />
        </div>
        {/* front — portrait role art fills the card, name overlaid at the bottom */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-[22px]"
          style={{ transform: 'rotateY(180deg)', ...pulseRing }}
        >
          <div className="relative h-full w-full bg-[#12121C]">
            {role ? <RoleArt role={role} fit="cover" className="absolute inset-0 h-full w-full" /> : null}
            <span className="sr-only">{playerName}</span>
            <div
              dir="rtl"
              className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-16"
            >
              <span
                className="font-darija text-4xl font-black leading-none"
                style={{ color: role ? ROLE_HEX[role] : '#D4D4D8' }}
              >
                {meta?.label ?? '...'}
              </span>
              <span className="font-darija text-base font-bold text-white/90">{meta?.sub ?? ''}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
