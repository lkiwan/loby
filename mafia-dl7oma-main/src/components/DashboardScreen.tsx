import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { useMafiaGame } from '../game/useMafiaGame'
import { ROLE_META } from '../game/types'
import { FlipCardView, TableCard } from './PlayerCard'
import { useCountdown, fmtClock, buzz } from '../lib/utils'

/* ---------------- decorative phase tint ---------------- */
function TintLayer() {
  const phase = useMafiaGame((s) => s.phase)
  const nightStep = useMafiaGame((s) => s.nightStep)
  const isDawn = nightStep === 'DAWN'

  const bg =
    phase === 'NIGHT_PHASE'
      ? `radial-gradient(ellipse at 50% 30%, ${isDawn ? 'rgba(196,181,253,.10)' : 'rgba(30,58,138,.34)'}, ${isDawn ? 'rgba(88,28,135,.28)' : 'rgba(15,23,42,.55)'} 60%, rgba(2,6,23,.86))`
      : phase === 'DAY_PHASE'
        ? 'radial-gradient(ellipse at 50% 30%, rgba(234,179,8,.16), rgba(120,53,15,.22) 60%, rgba(20,10,2,.75))'
        : phase === 'VOTING'
          ? 'radial-gradient(ellipse at 50% 30%, rgba(220,38,38,.14), rgba(69,10,10,.26) 60%, rgba(10,2,2,.8))'
          : 'rgba(0,0,0,.4)'

  return (
    <motion.div
      key={`${phase}-${nightStep}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="pointer-events-none absolute inset-0"
      style={{ background: bg }}
    />
  )
}

/* ---------------- boulis result flash ---------------- */
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
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8"
      style={{
        background: isMafia
          ? 'radial-gradient(circle at 50% 45%, rgba(220,38,38,.75), rgba(69,10,10,.95))'
          : 'radial-gradient(circle at 50% 45%, rgba(16,185,129,.65), rgba(6,32,25,.95))',
      }}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="flex flex-col items-center"
      >
        {isMafia ? (
          <Skull className="h-24 w-24 text-zinc-100 animate-flicker" />
        ) : (
          <Shield className="h-24 w-24 text-zinc-100 animate-flicker" />
        )}
        <p className="mt-2 font-darija text-xs font-bold tracking-[0.3em] text-zinc-300/80 uppercase">نتيجة البوليس</p>
        <h2 className={`mt-1 font-darija font-black text-4xl tracking-widest ${isMafia ? 'text-zinc-100' : 'text-zinc-100'}`}>
          {isMafia ? 'هادا مافيا!' : 'هادا بريء!'}
        </h2>
        <p className="mt-2 font-darija text-base font-bold text-zinc-200/90">
          {isMafia ? 'هادا مع العصابة، يدو فيها الدم.' : 'هادا بريء، خاطيه الصداع.'}
        </p>
      </motion.div>
      <button
        type="button"
        onClick={() => {
          buzz(20)
          clearBoulisResult()
        }}
        className="btn-gold mt-6 w-full !py-5 text-lg"
      >
        فهمت، دوز.
      </button>
    </motion.div>
  )
}

/* ---------------- elimination dramatic reveal ---------------- */
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
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-night/92 px-6"
      style={{ background: 'radial-gradient(circle at 50% 42%, rgba(180,60,30,.22), rgba(0,0,0,.92) 70%)' }}
    >
      <p className="relative z-10 mb-4 font-darija text-sm font-bold tracking-[0.3em] text-zinc-400 uppercase">
         الحومة قررات:
      </p>

      <div className="relative z-10 w-[min(58vw,230px)] aspect-[3/4.4]">
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
<h3 className="font-darija font-black text-3xl leading-snug text-zinc-100">
                  {lastEliminated.name} الدور ديالو كان: <span className={meta.color}>{meta.label}</span>
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
                className="btn-blood w-full !py-4 text-lg"
              >
                <Check className="mr-2 inline h-5 w-5" /> كمّل اللعب
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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

  const stepDots = (
    <div className="flex items-center gap-1.5">
      {(['EISSABA', 'BOULIS', 'TBIB'] as const).map((st) => (
        <span
          key={st}
          className={`h-1.5 w-1.5 rounded-full ${
            ['EISSABA', 'BOULIS', 'TBIB'].indexOf(nightStep) >= ['EISSABA', 'BOULIS', 'TBIB'].indexOf(st)
              ? 'bg-gold shadow-glowGold'
              : 'bg-white/15'
          }`}
        />
      ))}
    </div>
  )

  /* ---------- control panel content ---------- */
  let panel: React.ReactNode

  if (phase === 'NIGHT_PHASE' && isMafiaNight) {
    const t = nightActions.targetEissaba
    const target = players.find((p) => p.id === t)
    const eissaba = deck.filter((p) => !p.isDead && p.role === 'EISSABA')
    panel = (
      <NightPanel
        stepDots={stepDots}
        icon={<Skull className="h-9 w-9 text-blood" />}
        prompt="فيّق العصابة."
        sub="العصابة غتختار شكون يموت هاد الليلة. كليكي على الكارطة ديالو."
        status={target ? `الضحية هي: ${target.name}` : 'ما ختارو حد'}
        wake={eissaba.map((x) => (
          <span key={x.id} className="rounded-full bg-blood/15 px-2.5 py-0.5 font-darija text-xs font-black text-blood ring-1 ring-blood/30">
            {x.name}
          </span>
        ))}
      >
        <button
          type="button"
          disabled={!t}
          onClick={() => {
            buzz(25)
            setNightStep('BOULIS')
          }}
          className="btn-blood w-full text-lg"
        >
          <Check className="mr-2 inline h-5 w-5" /> أكّد الضربة
        </button>
      </NightPanel>
    )
  } else if (phase === 'NIGHT_PHASE' && isBoulisNight) {
    const boulis = deck.find((p) => !p.isDead && p.role === 'BOULIS')
    panel = (
      <NightPanel
        stepDots={stepDots}
        icon={<Search className="h-9 w-9 text-gold" />}
prompt="فيّق البوليس."
        sub="البوليس غيقلب شي واحد. ورّك على الكارطة باش تشوف واش بريء ولا عصابة."
        status={nightActions.targetBoulis ? `البوليس قلب: ${players.find((p) => p.id === nightActions.targetBoulis)?.name}` : 'باقي ما قلب حد'}
        wake={
          boulis ? (
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-darija text-xs font-black text-gold ring-1 ring-gold/30">
              {boulis.name}
            </span>
          ) : null
        }
      >
        <p className="font-darija text-xs font-bold text-zinc-500">ملي تشوف النتيجة، ورّك على "فهمت" باش تدوز للطبيب.</p>
      </NightPanel>
    )
  } else if (phase === 'NIGHT_PHASE' && isTbibNight) {
    const t = nightActions.targetTbib
    const target = players.find((p) => p.id === t)
    const tbib = deck.find((p) => !p.isDead && p.role === 'TBIB')
    panel = (
      <NightPanel
        stepDots={stepDots}
        icon={<Stethoscope className="h-9 w-9 text-heal" />}
        prompt="فيّق الطبيب."
        sub="الطبيب غيختار شكون يعتق هاد الليلة. كليكي على الكارطة ديال لي بغا يداوي."
        status={target ? `الطبيب عتق: ${target.name}` : 'ما عتق حد'}
        wake={
          tbib ? (
            <span className="rounded-full bg-heal/15 px-2.5 py-0.5 font-darija text-xs font-black text-heal ring-1 ring-heal/30">
              {tbib.name}
            </span>
          ) : null
        }
      >
        <p className="font-darija text-xs font-bold text-zinc-500">سالا الليل، دوز للصباح.</p>
      </NightPanel>
    )
  } else if (phase === 'NIGHT_PHASE' && isDawn) {
    panel = (
      <NightPanel
        stepDots={stepDots}
        icon={<Sunrise className="h-9 w-9 text-amber-400" />}
        prompt="صباح الخير أ الحومة..."
        sub="الليل مشى والنهار طلع. فيّق كلشي!"
        status=""
      >
        <button type="button" onClick={() => { buzz(40); endNight() }} className="btn-gold w-full !py-5 text-lg">
          <Sun className="mr-2 inline h-5 w-5" /> طلّع النهار
        </button>
      </NightPanel>
    )
  } else if (phase === 'DAY_PHASE') {
    const dead = morningReport
    panel = (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <p className="font-darija text-xs font-bold tracking-[0.3em] text-yellow-500/90 uppercase">آش وقع بالليل</p>
        {dead?.saved ? (
          <>
            <p className="font-darija font-black text-3xl text-heal">الطبيب عتق الموقف!</p>
            <p className="font-darija text-sm font-bold text-zinc-300">{players.find((p) => p.id === dead.victimId)?.name} منع من الموت، حتى واحد ما مات هاد الليلة.</p>
          </>
        ) : dead?.victimName ? (
          <>
            <p className="font-darija font-black text-4xl text-blood">{dead.victimName} تصفّات ليه!</p>
            <p className="font-darija text-sm font-bold text-zinc-300">الدور ديالو كان: {dead.victimRole ? ROLE_META[dead.victimRole].label : ''}</p>
          </>
        ) : (
          <>
            <p className="font-darija font-black text-3xl text-heal">حتى حاجة ما وقعات هاد الليلة.</p>
            <p className="font-darija text-sm font-bold text-zinc-300">كلشي فايق. صباح الخير!</p>
          </>
        )}
        <button type="button" onClick={() => { buzz(20); advanceFromReport() }} className="btn-blood font-darija mt-1 w-full !py-4 text-lg">
          <Vote className="mr-2 inline h-5 w-5" /> بدا المحاكمة
        </button>
      </motion.div>
    )
  } else if (phase === 'VOTING') {
    const zero = countdown !== null && countdown <= 0
    panel = (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-darija text-xs font-bold tracking-[0.25em] text-red-400 uppercase">التصويت · الحومة غتصوّت</p>
          <div className="flex items-center gap-2">
            <Timer className={`h-5 w-5 ${zero ? 'text-blood animate-pulse' : 'text-red-400'}`} />
            <span className={`font-grit text-2xl tabular-nums ${zero ? 'text-blood animate-pulse' : 'text-red-300'}`}>
              {fmtClock(countdown ?? 240)}
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-blood"
            animate={{ width: `${((countdown ?? 240) / 240) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <p className="font-darija text-xs font-bold text-zinc-400">
          {zero
            ? 'الوقت سالا! أ الحاكم، كليكي على الكارطة ديال لي غادي تجريو عليه.'
            : 'تناقشو بيناتكم، وملي تتفاهمو كليكي على الكارطة ديال لي بغيتو تخرجوه من الحومة.'}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="flex-1 truncate rounded-xl bg-white/5 px-3 py-2 font-darija text-sm font-bold text-zinc-200">
            {voteChoice ? `صوتو على: ${players.find((p) => p.id === voteChoice)?.name}` : 'ما صوتو على حد'}
          </span>
          <button
            type="button"
            disabled={!voteChoice}
            onClick={() => { buzz([50, 40, 80]); confirmElimination() }}
            className="btn-blood shrink-0 !px-5 text-lg"
          >
            إعدام
          </button>
        </div>
      </motion.div>
    )
  } else {
    panel = null
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-night">
      <TintLayer />

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-1">
        <div className="flex items-center gap-2">
          <MoonStar className="h-5 w-5 text-yellow-500" />
          <h1 className="font-darija font-black text-base tracking-wider text-zinc-100">الحاكم</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white/5 px-2.5 py-1 font-darija text-[11px] font-bold text-zinc-400">
            <Crown className="mr-1 inline h-3 w-3 text-gold" /> {teller?.name}
          </span>
          <button
            type="button"
            aria-label="عاود الطرح"
            onClick={() => {
              if (window.confirm('واش متأكد بغيتي تعاود الطرح من الزيرو؟')) resetGame()
            }}
            className="rounded-full bg-white/5 p-1.5 text-zinc-500 active:scale-90 transition-transform"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 px-4 text-[11px] font-darija font-bold text-zinc-500">
        <span className="text-blood">العصابة لي باقين: {mafiaAlive}</span>
        <span>·</span>
        <span className="text-zinc-300">ولاد الحومة لي باقين: {townAlive}</span>
      </div>

      {/* god grid — clean & readable, no table picture */}
      <div className="relative z-10 mt-1 flex min-h-0 flex-1 flex-col px-4">
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-2 pr-0.5">
          <div className="grid grid-cols-3 gap-2.5">
            {deck.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="aspect-[3/4.4] w-full"
              >
                <TableCard
                  player={p}
                  role={p.role}
                  facing="front"
                  number={i + 1}
                  dead={p.isDead}
                  crosshair={phase === 'NIGHT_PHASE' && nightActions.targetEissaba === p.id}
                  shield={phase === 'NIGHT_PHASE' && nightActions.targetTbib === p.id}
                  selected={phase === 'VOTING' && voteChoice === p.id}
                  interactive={(isMafiaNight || isBoulisNight || isTbibNight || phase === 'VOTING') && !p.isDead}
                  onTap={() => onCardTap(p.id)}
                  className="h-full w-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* control panel */}
      <div className="relative z-20 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`panel-${phase}-${nightStep}-${voteDeadline ?? 'x'}`}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-t-3xl border-t border-gold/20 bg-night-panel/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_50px_rgba(0,0,0,.55)]"
          >
            {panel}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>{boulisResult ? <BoulisFlash key="bf" /> : null}</AnimatePresence>
      <AnimatePresence>{lastEliminated ? <EliminationOverlay key="el" /> : null}</AnimatePresence>
    </div>
  )
}

function NightPanel({
  stepDots,
  icon,
  prompt,
  sub,
  status,
  wake,
  children,
}: {
  stepDots: React.ReactNode
  icon: React.ReactNode
  prompt: string
  sub: string
  status: string
  wake?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-darija text-base font-black text-zinc-50">{prompt}</p>
          <p className="font-darija text-xs font-bold text-zinc-400">{sub}</p>
        </div>
        <div className="shrink-0">{stepDots}</div>
      </div>
      {wake && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-darija text-[10px] font-black tracking-widest text-zinc-500 uppercase">شكون فايق دابا:</span>
          {wake}
        </div>
      )}
      {status ? <span className="truncate font-darija text-xs font-bold text-zinc-500">→ {status}</span> : null}
      {children}
    </div>
  )
}