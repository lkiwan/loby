import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MoonStar,
  Sun,
  Sunrise,
  Skull,
  Stethoscope,
  Shield,
  Vote,
  Timer,
  Crown,
  RotateCcw,
  Check,
  Search,
  Users,
} from 'lucide-react'
import { useMafiaGame } from '../game/useMafiaGame'
import { ROLE_META } from '../game/types'
import type { NightStep, Role } from '../game/types'
import { FlipCardView, TableCard } from './PlayerCard'
import { useCountdown, fmtClock, buzz } from '../lib/utils'

const ROLE_HEX: Record<Role, string> = {
  EISSABA: '#FF4D5E',
  BOULIS: '#FFC93C',
  TBIB: '#3DDC84',
  WLAD_LHOUMA: '#FFFFFF',
}

const LIME_BTN =
  'flex items-center justify-center gap-2 rounded-full bg-[#C6F542] px-10 py-3 font-darija text-lg font-black text-[#131803] transition-transform active:scale-95'

/* ---------------- boulis result flash (flat) ---------------- */
function BoulisFlash() {
  const result = useMafiaGame((s) => s.boulisResult)
  const clearBoulisResult = useMafiaGame((s) => s.clearBoulisResult)
  if (!result) return null
  const isMafia = result === 'MAFIA'
  return (
    <motion.div
      key="boulis-flash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#07070D] px-8"
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="flex flex-col items-center"
      >
        <span
          className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-[#12121C] ring-1 ${
            isMafia ? 'ring-[#FF4D5E]/40' : 'ring-[#3DDC84]/40'
          }`}
        >
          {isMafia ? (
            <Skull className="h-12 w-12 text-[#FF4D5E]" />
          ) : (
            <Shield className="h-12 w-12 text-[#3DDC84]" />
          )}
        </span>
        <p className="mt-5 font-darija text-xs font-black uppercase tracking-[0.3em] text-zinc-500">نتيجة البوليس</p>
        <h2
          className="mt-1 font-darija text-4xl font-black tracking-widest"
          style={{ color: isMafia ? '#FF4D5E' : '#3DDC84' }}
        >
          {isMafia ? 'هادا مافيا!' : 'هادا بريء!'}
        </h2>
        <p className="mt-2 text-center font-darija text-base font-bold text-zinc-400">
          {isMafia ? 'هادا مع العصابة، يدو فيها الدم.' : 'هادا بريء، خاطيه الصداع.'}
        </p>
      </motion.div>
      <button
        type="button"
        onClick={() => {
          buzz(20)
          clearBoulisResult()
        }}
        className={`${LIME_BTN} mt-6 w-full max-w-[280px] !py-3.5 text-lg`}
      >
        فهمت، دوز.
      </button>
    </motion.div>
  )
}

/* ---------------- elimination dramatic reveal (flat) ---------------- */
function EliminationOverlay() {
  const lastEliminated = useMafiaGame((s) => s.lastEliminated)
  const postElimination = useMafiaGame((s) => s.postElimination)
  const [face, setFace] = useState(false)

  useEffect(() => {
    if (!lastEliminated) return
    const t = setTimeout(() => setFace(true), 900)
    return () => clearTimeout(t)
  }, [lastEliminated])

  if (!lastEliminated) return null
  const meta = ROLE_META[lastEliminated.role]
  const pulse = lastEliminated.role === 'EISSABA' ? 'red' : lastEliminated.role === 'TBIB' ? 'green' : lastEliminated.role === 'BOULIS' ? 'gold' : 'none'

  return (
    <motion.div
      key="elim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#07070D]/[0.97] px-6"
    >
      <p className="relative z-10 mb-4 font-darija text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
        الحومة قررات:
      </p>

      <div className="relative z-10 aspect-[3/4.4] w-[min(58vw,230px)]">
        <FlipCardView
          layoutId="elim-card"
          role={lastEliminated.role}
          playerName={lastEliminated.name}
          faceUp={face}
          onTap={() => undefined}
          pulse={pulse}
        />
      </div>

      <div className="relative z-10 mt-6 h-32 w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          {face && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <h3 className="font-darija text-3xl font-black leading-snug text-zinc-100">
                {lastEliminated.name} الدور ديالو كان:{' '}
                <span style={{ color: ROLE_HEX[lastEliminated.role] }}>{meta.label}</span>
              </h3>
              <p className="font-darija text-sm font-bold text-zinc-400">
                {lastEliminated.role === 'EISSABA'
                  ? 'راه كان مع العصابة، تهنينا منو!'
                  : 'مسكين... مشا فيها ظلم. كان غير ولد الحومة.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  buzz([30, 60, 30])
                  postElimination()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF4D5E] py-3.5 font-darija text-lg font-black text-white transition-transform active:scale-95"
              >
                <Check className="h-5 w-5" /> كمّل اللعب
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ---------------- night steps pills ---------------- */
const STEPS: { key: NightStep; label: string; hex: string }[] = [
  { key: 'EISSABA', label: 'العصابة', hex: '#FF4D5E' },
  { key: 'BOULIS', label: 'البوليس', hex: '#FFC93C' },
  { key: 'TBIB', label: 'الطبيب', hex: '#3DDC84' },
  { key: 'DAWN', label: 'الصباح', hex: '#FFC93C' },
]

function StepsBar({ active }: { active: NightStep }) {
  const activeIdx = STEPS.findIndex((s) => s.key === active)
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isActive = i === activeIdx
        const isDone = i < activeIdx
        if (isActive && s.key === 'DAWN') {
          return (
            <span key={s.key} className="flex-1 rounded-full bg-[#FFC93C] py-2 text-center font-darija text-sm font-black text-[#131803]">
              {s.label}
            </span>
          )
        }
        if (isActive) {
          return (
            <span
              key={s.key}
              style={{ backgroundColor: `${s.hex}26`, color: s.hex, boxShadow: `inset 0 0 0 1px ${s.hex}66` }}
              className="flex-1 rounded-full py-2 text-center font-darija text-sm font-black"
            >
              {s.label}
            </span>
          )
        }
        return (
          <span
            key={s.key}
            className={`flex-1 rounded-full py-2 text-center font-darija text-sm font-black ${
              isDone ? 'bg-white/10 text-zinc-300' : 'bg-white/[0.03] text-zinc-500 ring-1 ring-white/[0.07]'
            }`}
          >
            {s.label}
          </span>
        )
      })}
    </div>
  )
}

/* ---------------- phase header ---------------- */
function PhaseHead({ icon, title, sub }: { icon?: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      {icon ? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#12121C] ring-1 ring-white/[0.07]">
          {icon}
        </span>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <h2 className="font-darija text-4xl font-black text-white">{title}</h2>
        <p className="font-darija text-sm font-bold text-zinc-500">{sub}</p>
      </div>
    </div>
  )
}

/* ---------------- night step card ---------------- */
function NightCard({
  icon,
  prompt,
  sub,
  status,
  wake,
  grid,
  children,
}: {
  icon: ReactNode
  prompt: string
  sub: string
  status: string
  wake?: ReactNode
  grid: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] bg-[#12121C] px-4 py-4 ring-1 ring-white/[0.06]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-darija text-lg font-black leading-snug text-zinc-50">{prompt}</p>
          <p className="mt-0.5 font-darija text-xs font-bold leading-relaxed text-zinc-400">{sub}</p>
        </div>
      </div>
      {wake ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-darija text-[10px] font-black uppercase tracking-widest text-zinc-500">شكون فايق دابا:</span>
          {wake}
        </div>
      ) : null}
      {status ? <p className="font-darija text-xs font-bold text-zinc-500">→ {status}</p> : null}
      {grid}
      {children}
    </div>
  )
}

function wakeChip(name: string, hex: string) {
  return (
    <span
      key={name}
      style={{ backgroundColor: `${hex}21`, color: hex, boxShadow: `inset 0 0 0 1px ${hex}4D` }}
      className="rounded-full px-2.5 py-0.5 font-darija text-xs font-black"
    >
      {name}
    </span>
  )
}

/* ---------------- main dashboard ---------------- */
export default function DashboardScreen() {
  const players = useMafiaGame((s) => s.players)
  const phase = useMafiaGame((s) => s.phase)
  const nightStep = useMafiaGame((s) => s.nightStep)
  const nightActions = useMafiaGame((s) => s.nightActions)
  const morningReport = useMafiaGame((s) => s.morningReport)
  const voteDeadline = useMafiaGame((s) => s.voteDeadline)
  const voteChoice = useMafiaGame((s) => s.voteChoice)
  const boulisResult = useMafiaGame((s) => s.boulisResult)
  const lastEliminated = useMafiaGame((s) => s.lastEliminated)

  const chooseMafiaTarget = useMafiaGame((s) => s.chooseMafiaTarget)
  const chooseBoulisTarget = useMafiaGame((s) => s.chooseBoulisTarget)
  const chooseTbibTarget = useMafiaGame((s) => s.chooseTbibTarget)
  const chooseVote = useMafiaGame((s) => s.chooseVote)
  const setNightStep = useMafiaGame((s) => s.setNightStep)
  const endNight = useMafiaGame((s) => s.endNight)
  const advanceFromReport = useMafiaGame((s) => s.advanceFromReport)
  const confirmElimination = useMafiaGame((s) => s.confirmElimination)
  const resetGame = useMafiaGame((s) => s.resetGame)

  const countdown = useCountdown(voteDeadline)
  const teller = players.find((p) => p.isTeller)
  const deck = players.filter((p) => !p.isTeller)
  const alive = deck.filter((p) => !p.isDead)
  const mafiaAlive = alive.filter((p) => p.role === 'EISSABA').length
  const townAlive = alive.length - mafiaAlive

  const isMafiaNight = phase === 'NIGHT_PHASE' && nightStep === 'EISSABA'
  const isBoulisNight = phase === 'NIGHT_PHASE' && nightStep === 'BOULIS'
  const isTbibNight = phase === 'NIGHT_PHASE' && nightStep === 'TBIB'
  const isDawn = phase === 'NIGHT_PHASE' && nightStep === 'DAWN'

  const onCardTap = (id: string) => {
    if (isMafiaNight) chooseMafiaTarget(id)
    else if (isBoulisNight) chooseBoulisTarget(id)
    else if (isTbibNight) chooseTbibTarget(id)
    else if (phase === 'VOTING') chooseVote(id)
  }

  /* god-view chip grid — shared by the night card and the voting layout */
  const grid = (
    <div className="grid grid-cols-2 gap-2.5">
      {deck.map((p) => (
        <TableCard
          key={p.id}
          player={p}
          role={p.role}
          dead={p.isDead}
          crosshair={phase === 'NIGHT_PHASE' && nightActions.targetEissaba === p.id}
          shield={phase === 'NIGHT_PHASE' && nightActions.targetTbib === p.id}
          selected={phase === 'VOTING' && voteChoice === p.id}
          interactive={(isMafiaNight || isBoulisNight || isTbibNight || phase === 'VOTING') && !p.isDead}
          onTap={() => onCardTap(p.id)}
          className="w-full"
        />
      ))}
    </div>
  )

  const countsLine = (
    <p className="text-center font-darija text-[11px] font-bold text-zinc-500">
      <span className="text-[#FF4D5E]">العصابة لي باقين: {mafiaAlive}</span>
      <span className="mx-1.5">·</span>
      <span className="text-zinc-300">ولاد الحومة لي باقين: {townAlive}</span>
    </p>
  )

  /* ---------- phase content ---------- */
  let head: ReactNode = null
  let steps: ReactNode = null
  let counts: ReactNode = null
  let content: ReactNode = null

  if (phase === 'NIGHT_PHASE' && isMafiaNight) {
    const t = nightActions.targetEissaba
    const target = players.find((p) => p.id === t)
    const eissaba = deck.filter((p) => !p.isDead && p.role === 'EISSABA')
    head = <PhaseHead icon={<MoonStar className="h-6 w-6 text-zinc-200" />} title="الليل" sub="الحومة كتنعس" />
    steps = <StepsBar active={nightStep} />
    counts = countsLine
    content = (
      <NightCard
        icon={<Skull className="h-7 w-7 text-[#FF4D5E]" />}
        prompt="فيّق العصابة."
        sub="العصابة غتختار شكون يموت هاد الليلة. كليكي على الكارطة ديالو."
        status={target ? `الضحية هي: ${target.name}` : 'ما ختارو حد'}
        wake={eissaba.map((x) => wakeChip(x.name, '#FF4D5E'))}
        grid={grid}
      >
        <button
          type="button"
          disabled={!t}
          onClick={() => {
            buzz(25)
            setNightStep('BOULIS')
          }}
          className={`${LIME_BTN} mx-auto disabled:bg-white/[0.06] disabled:text-zinc-600 disabled:active:scale-100`}
        >
          <Check className="h-5 w-5" /> أكّد الضربة
        </button>
      </NightCard>
    )
  } else if (phase === 'NIGHT_PHASE' && isBoulisNight) {
    const boulis = deck.find((p) => !p.isDead && p.role === 'BOULIS')
    head = <PhaseHead icon={<MoonStar className="h-6 w-6 text-zinc-200" />} title="الليل" sub="الحومة كتنعس" />
    steps = <StepsBar active={nightStep} />
    counts = countsLine
    content = (
      <NightCard
        icon={<Search className="h-7 w-7 text-[#FFC93C]" />}
        prompt="فيّق البوليس."
        sub="البوليس غيقلب شي واحد. ورّك على الكارطة باش تشوف واش بريء ولا عصابة."
        status={nightActions.targetBoulis ? `البوليس قلب: ${players.find((p) => p.id === nightActions.targetBoulis)?.name}` : 'باقي ما قلب حد'}
        wake={boulis ? wakeChip(boulis.name, '#FFC93C') : null}
        grid={grid}
      >
        <p className="text-center font-darija text-xs font-bold text-zinc-500">ملي تشوف النتيجة، ورّك على "فهمت" باش تدوز للطبيب.</p>
      </NightCard>
    )
  } else if (phase === 'NIGHT_PHASE' && isTbibNight) {
    const t = nightActions.targetTbib
    const target = players.find((p) => p.id === t)
    const tbib = deck.find((p) => !p.isDead && p.role === 'TBIB')
    head = <PhaseHead icon={<MoonStar className="h-6 w-6 text-zinc-200" />} title="الليل" sub="الحومة كتنعس" />
    steps = <StepsBar active={nightStep} />
    counts = countsLine
    content = (
      <NightCard
        icon={<Stethoscope className="h-7 w-7 text-[#3DDC84]" />}
        prompt="فيّق الطبيب."
        sub="الطبيب غيختار شكون يعتق هاد الليلة. كليكي على الكارطة ديال لي بغا يداوي."
        status={target ? `الطبيب عتق: ${target.name}` : 'ما عتق حد'}
        wake={tbib ? wakeChip(tbib.name, '#3DDC84') : null}
        grid={grid}
      >
        <p className="text-center font-darija text-xs font-bold text-zinc-500">سالا الليل، دوز للصباح.</p>
      </NightCard>
    )
  } else if (phase === 'NIGHT_PHASE' && isDawn) {
    head = <PhaseHead icon={<Sun className="h-6 w-6 text-[#FFC93C]" />} title="الصباح" sub="الحومة كتفيق" />
    steps = <StepsBar active="DAWN" />
    content = (
      <div className="flex flex-col items-center gap-2 rounded-[28px] bg-[#12121C] px-5 py-6 text-center ring-1 ring-white/[0.06]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
          <Sunrise className="h-8 w-8 text-[#FFC93C]" />
        </span>
        <p className="font-darija text-2xl font-black text-zinc-50">صباح الخير أ الحومة...</p>
        <p className="font-darija text-sm font-bold text-zinc-400">الليل مشى والنهار طلع. فيّق كلشي!</p>
        <button type="button" onClick={() => { buzz(40); endNight() }} className={`${LIME_BTN} mt-3`}>
          <Sun className="h-5 w-5" /> طلّع النهار
        </button>
      </div>
    )
  } else if (phase === 'DAY_PHASE') {
    const dead = morningReport
    head = <PhaseHead icon={<Sun className="h-6 w-6 text-[#FFC93C]" />} title="الصباح" sub="الحومة كتفيق" />
    steps = <StepsBar active="DAWN" />
    content = (
      <>
        <div className="flex flex-col items-center gap-2 rounded-[28px] bg-[#12121C] px-5 py-7 text-center ring-1 ring-white/[0.06]">
          <p className="font-darija text-[11px] font-black uppercase tracking-[0.25em] text-[#FFC93C]/80">آش وقع بالليل</p>
          {dead?.saved ? (
            <>
              <span className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
                <Stethoscope className="h-8 w-8 text-[#3DDC84]" />
              </span>
              <p className="font-darija text-3xl font-black text-[#3DDC84]">الطبيب عتق الموقف!</p>
              <p className="font-darija text-sm font-bold text-zinc-300">{players.find((p) => p.id === dead.victimId)?.name} منع من الموت، حتى واحد ما مات هاد الليلة.</p>
            </>
          ) : dead?.victimName ? (
            <>
              <span className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
                <Skull className="h-8 w-8 text-[#FF4D5E]" />
              </span>
              <p className="font-darija text-4xl font-black text-zinc-50">{dead.victimName} تصفّات ليه!</p>
              <p
                className="font-darija text-base font-black"
                style={{ color: dead.victimRole ? ROLE_HEX[dead.victimRole] : '#D4D4D8' }}
              >
                الدور ديالو كان: {dead.victimRole ? ROLE_META[dead.victimRole].label : ''}
              </p>
            </>
          ) : (
            <>
              <span className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
                <Sun className="h-8 w-8 text-[#FFC93C]" />
              </span>
              <p className="font-darija text-3xl font-black text-[#3DDC84]">حتى حاجة ما وقعات هاد الليلة.</p>
              <p className="font-darija text-sm font-bold text-zinc-300">كلشي فايق. صباح الخير!</p>
            </>
          )}
        </div>
        <p className="flex items-center justify-center gap-2 text-center font-darija text-sm font-bold text-zinc-400">
          <Users className="h-4 w-4 text-zinc-500" /> باقيين {alive.length} على قيد الحياة
        </p>
        <button type="button" onClick={() => { buzz(20); advanceFromReport() }} className={`${LIME_BTN} mx-auto`}>
          <Vote className="h-5 w-5" /> بدا المحاكمة
        </button>
      </>
    )
  } else if (phase === 'VOTING') {
    const zero = countdown !== null && countdown <= 0
    head = <PhaseHead title="التصويت" sub="الحومة كتقرر" />
    counts = countsLine
    content = (
      <>
        {/* gold timer card */}
        <div className="rounded-[28px] bg-[#12121C] px-5 py-4 ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-center gap-3">
            <Timer className={`h-8 w-8 ${zero ? 'animate-pulse text-[#FF4D5E]' : 'text-[#FFC93C]'}`} />
            <span
              className={`font-darija text-5xl font-black tabular-nums ${
                zero ? 'animate-pulse text-[#FF4D5E]' : 'text-[#FFC93C]'
              }`}
            >
              {fmtClock(countdown ?? 240)}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${zero ? 'bg-[#FF4D5E]' : 'bg-[#FFC93C]'}`}
              animate={{ width: `${((countdown ?? 240) / 240) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* instruction card */}
        <div className="rounded-[28px] bg-[#12121C] px-5 py-4 ring-1 ring-white/[0.06]">
          <p className="font-darija text-xs font-black uppercase tracking-[0.2em] text-[#FF4D5E]">التصويت · الحومة غتصوّت</p>
          <p className="mt-1.5 font-darija text-sm font-bold leading-relaxed text-zinc-300">
            {zero
              ? 'الوقت سالا! أ الحاكم، كليكي على الكارطة ديال لي غادي تجريو عليه.'
              : 'تناقشو بيناتكم، وملي تتفاهمو كليكي على الكارطة ديال لي بغيتو تخرجوه من الحومة.'}
          </p>
        </div>

        {grid}

        <p className="text-center font-darija text-sm font-bold text-zinc-400">
          {voteChoice ? `صوتو على: ${players.find((p) => p.id === voteChoice)?.name}` : 'ما صوتو على حد'}
        </p>
        <button
          type="button"
          disabled={!voteChoice}
          onClick={() => { buzz([50, 40, 80]); confirmElimination() }}
          className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#FF4D5E] px-14 py-3.5 font-darija text-xl font-black text-white transition-transform active:scale-95 disabled:bg-white/[0.06] disabled:text-zinc-600 disabled:active:scale-100"
        >
          إعدام
        </button>
      </>
    )
  }

  return (
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#07070D]">
      {/* top bar — teller pill + restart (kept from the real dashboard) */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2 rounded-full bg-[#FFC93C]/[0.08] px-4 py-2 ring-1 ring-[#FFC93C]/30">
          <Crown className="h-4 w-4 fill-[#FFC93C] text-[#FFC93C]" />
          <span className="font-darija text-sm font-extrabold text-zinc-50">الحاكم:</span>
          <span className="font-darija text-sm font-black text-zinc-50">{teller?.name}</span>
        </span>
        <button
          type="button"
          aria-label="عاود الطرح"
          onClick={() => {
            if (window.confirm('واش متأكد بغيتي تعاود الطرح من الزيرو؟')) resetGame()
          }}
          className="rounded-full bg-white/5 p-2 text-zinc-500 transition-transform active:scale-90"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* phase content */}
      <div className="scrollbar-hide relative z-10 mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`dash-${phase}-${nightStep}-${voteDeadline ?? 'x'}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            {head}
            {steps}
            {counts}
            {content}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>{boulisResult ? <BoulisFlash key="bf" /> : null}</AnimatePresence>
      <AnimatePresence>{lastEliminated ? <EliminationOverlay key="el" /> : null}</AnimatePresence>
    </div>
  )
}
