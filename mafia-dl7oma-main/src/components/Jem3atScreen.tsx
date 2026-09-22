import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Crown, Minus, Pencil, Plus, Shield, Skull, Stethoscope, Trash2, UserRound, Users } from 'lucide-react'
import { useMafiaGame } from '../game/useMafiaGame'
import { MIN_PLAYERS } from '../game/types'
import { buzz } from '../lib/utils'

export default function Jem3atScreen() {
  const players = useMafiaGame((s) => s.players)
  const addPlayer = useMafiaGame((s) => s.addPlayer)
  const removePlayer = useMafiaGame((s) => s.removePlayer)
  const setPlayerName = useMafiaGame((s) => s.setPlayerName)
  const setTeller = useMafiaGame((s) => s.setTeller)
  const startGame = useMafiaGame((s) => s.startGame)
  const goHome = useMafiaGame((s) => s.goHome)
  const mafiaCount = useMafiaGame((s) => s.mafiaCount)
  const setMafiaCount = useMafiaGame((s) => s.setMafiaCount)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [stepperOpen, setStepperOpen] = useState(false)
  const [dupe, setDupe] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  // select the old name only once, when entering edit mode
  useEffect(() => {
    if (editingId !== null) editRef.current?.select()
  }, [editingId])

  const teller = players.find((p) => p.isTeller)

  const enough = players.length >= MIN_PLAYERS
  const capped = players.length >= 14

  // civilians = non-teller players − mafia − boulis − tbib
  const civilians = Math.max(0, Math.max(0, players.length - 1) - mafiaCount - 2)

  const isTaken = (value: string, exceptId?: string) =>
    players.some((p) => p.id !== exceptId && p.name.trim().toLowerCase() === value.trim().toLowerCase() && value.trim() !== '')

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setDraft(currentName)
    setDupe(false)
  }

  const commitEdit = (id: string) => {
    if (isTaken(draft, id)) {
      setDupe(true)
      buzz(40)
      return
    }
    setPlayerName(id, draft)
    setEditingId(null)
    setDupe(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || capped) return
    if (isTaken(name)) {
      setDupe(true)
      setName('')
      buzz(40)
      return
    }
    setDupe(false)
    addPlayer(name)
    setName('')
    buzz(15)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-night">
      {/* ambience */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% -10%, rgba(220,38,38,.14), transparent 55%), radial-gradient(ellipse at 50% 110%, rgba(234,179,8,.08), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 pt-6 pb-4"
      >
        <button
          type="button"
          onClick={() => {
            buzz([20, 30])
            goHome()
          }}
          aria-label="رجع لّلّول"
          title="رجع لّلّول"
          className="absolute left-4 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-gold/50 hover:text-gold active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* logo (left, tilted) + title (right) */}
        <div className="flex items-center justify-center gap-4 pl-10">
          <div className="relative flex h-24 w-20 shrink-0 items-center justify-center -rotate-6">
            {/* static side glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 top-1/2 h-16 w-3.5 -translate-y-1/2 rounded-full blur-[8px]"
              style={{ backgroundColor: 'rgba(220,38,38,.85)' }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 top-1/2 h-16 w-3.5 -translate-y-1/2 rounded-full blur-[8px]"
              style={{ backgroundColor: 'rgba(153,27,27,.85)' }}
            />
            <motion.img
              src={`${import.meta.env.BASE_URL}img/card-mafia.png`}
              alt="L'Mafia d'L'Houma"
              draggable={false}
              className="relative h-24 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 8px 20px rgba(127,29,29,.6))' }}
            />
          </div>

          <div className="min-w-0 text-start">
            <h1 className="font-grit text-[27px] leading-tight text-zinc-100">
              L'MAFIA <span className="text-blood">D'LHOUMA</span>
            </h1>
            <p className="mt-0.5 font-darija text-sm font-semibold tracking-[0.3em] text-yellow-500/80 uppercase">
              مرر و العب · طلب الحاكم
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-5">
        {/* add form */}
        <form onSubmit={submit} className="mb-4 flex gap-2">
          <motion.div
            className="relative flex-1"
            animate={dupe ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (dupe) setDupe(false)
              }}
              placeholder="سميّات اللاعبيين..."
              maxLength={16}
              className={`w-full rounded-xl border bg-white/5 px-4 py-3.5 pl-9 font-darija text-sm font-bold text-zinc-100 placeholder-zinc-500 outline-none focus:bg-white/[.07] ${dupe ? 'border-blood/70 focus:border-blood' : 'border-white/10 focus:border-gold/60'}`}
              autoComplete="off"
            />
          </motion.div>
          <button
            type="submit"
            disabled={capped}
            className="btn-gold shrink-0 !px-4"
            aria-label="زيد اللاعب"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        {dupe && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-3 mb-3 flex items-center gap-1.5 px-1 font-darija text-[11px] font-bold text-blood"
          >
            <Skull className="h-3.5 w-3.5" />
            هادي السميّة كاينة ديالا. ختر سميّة أخرى.
          </motion.p>
        )}

        {/* player roster */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-2">
          <p className="mb-2 px-1 font-darija text-[11px] font-bold text-zinc-500">
            <Pencil className="mr-1 inline h-3 w-3 text-gold" />
            ديز على السميّة باش تبدّلها بسرعة.
          </p>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="font-darija text-xs font-bold tracking-wider text-zinc-400 uppercase">
              لّعبة · {players.length}/14
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-darija text-[11px] font-bold text-zinc-400">
              الحاكم: <b className="text-gold">{teller?.name ?? '—'}</b>
            </span>
          </div>

          <AnimatePresence initial={false}>
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ${
                  p.isTeller ? 'bg-gold/10 ring-gold/50' : 'bg-white/5 ring-white/10'
                }`}
              >
                <span className="w-5 text-center font-grit text-xs text-zinc-500">{i + 1}</span>
                {editingId === p.id ? (
                  <input
                    value={draft}
                    maxLength={16}
                    autoFocus
                    ref={editRef}
                    onFocus={(e) => {
                      if (editingId === p.id) e.target.select()
                    }}
                    onChange={(e) => {
                      setDraft(e.target.value)
                      if (dupe) setDupe(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitEdit(p.id)
                      }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => commitEdit(p.id)}
                    className={`min-w-0 flex-1 rounded-lg bg-night-panel px-2 py-1 font-darija text-sm font-bold text-gold outline-none ring-2 ${dupe ? 'ring-blood/70' : 'ring-gold/60'}`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(p.id, p.name)}
                    title="ديز باش تبدّل السميّة"
                    className={`flex min-w-0 flex-1 items-center gap-1 truncate rounded-lg px-2 py-1 text-left font-darija text-sm font-bold transition-colors ${
                      p.isTeller ? 'text-gold' : 'text-zinc-100'
                    } hover:bg-white/5`}
                  >
                    <span className="truncate">{p.name}</span>
                    <Pencil className="h-3 w-3 shrink-0 text-zinc-600" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTeller(p.id)
                    buzz(20)
                  }}
                  aria-label="ختر الحاكم"
                  title="ختر الحاكم"
                  className={`rounded-lg p-2 transition-all active:scale-90 ${
                    p.isTeller ? 'bg-gold text-night shadow-glowGold' : 'bg-white/5 text-zinc-500 hover:text-gold'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePlayer(p.id)}
                  aria-label="مشّاه"
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:text-blood active:scale-90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {players.length === 0 && (
            <div className="mt-8 flex flex-col items-center gap-2 text-zinc-600">
              <Users className="h-10 w-10" />
              <p className="font-darija text-sm font-semibold">زيد سميّات اللاعبيين...</p>
            </div>
          )}
        </div>

        {/* role roster — mafia count changeable */}
        <div className="mb-3 rounded-2xl border border-white/10 bg-night-panel/90 px-2 py-2 shadow-card backdrop-blur">
          <div className="flex items-stretch justify-between text-center">
            {/* mafia (click to edit count) — animated to signal it's tappable */}
            <motion.div className="relative flex flex-1">
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(220,38,38,.5), transparent 72%)',
                }}
                animate={{ opacity: [0.25, 0.75, 0.25], scale: [0.96, 1.05, 0.96] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.button
                type="button"
                onClick={() => {
                  setStepperOpen((v) => !v)
                  buzz(15)
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                whileTap={{ scale: 0.94 }}
                className={`relative z-10 flex w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors ${
                  stepperOpen ? 'bg-blood/15 ring-1 ring-blood/40' : 'hover:bg-white/5'
                }`}
              >
              <span className="font-darija text-[9px] font-black tracking-widest text-blood uppercase">العصابة</span>
              {stepperOpen ? (
                <span className="flex items-center gap-1.5">
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMafiaCount(mafiaCount - 1)
                      buzz(15)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-red-200 active:scale-90"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-6 text-center font-darija text-sm font-black text-blood">{mafiaCount}</span>
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMafiaCount(mafiaCount + 1)
                      buzz(15)
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-red-200 active:scale-90"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1 font-darija text-sm font-black text-blood">
                  <Skull className="h-3.5 w-3.5" />
                  {mafiaCount}
                </span>
              )}
            </motion.button>
            </motion.div>

            <div className="my-1 w-px bg-white/10" />

            {/* fixed roles */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5">
              <span className="font-darija text-[9px] font-black tracking-widest text-gold uppercase">البوليس</span>
              <span className="flex items-center gap-1 font-darija text-sm font-black text-gold">
                <Shield className="h-3.5 w-3.5" />1
              </span>
            </div>

            <div className="my-1 w-px bg-white/10" />

            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5">
              <span className="font-darija text-[9px] font-black tracking-widest text-heal uppercase">الطبيب</span>
              <span className="flex items-center gap-1 font-darija text-sm font-black text-heal">
                <Stethoscope className="h-3.5 w-3.5" />1
              </span>
            </div>

            <div className="my-1 w-px bg-white/10" />

            {/* civilians — auto from leftover players */}
            <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5">
              <span className="font-darija text-[9px] font-black tracking-widest text-zinc-400 uppercase">ولاد الحومة</span>
              <span className="flex items-center gap-1 font-darija text-sm font-black text-zinc-300">
                <Users className="h-3.5 w-3.5" />
                {civilians}
              </span>
            </div>
          </div>
        </div>

        {/* start */}
        <div className="pb-6 pt-1">
          <div className="relative mx-auto w-full max-w-[320px]">
            {enough && (
              <div aria-hidden className="glow-pulse pointer-events-none absolute -inset-2 rounded-[48%] bg-blood/70 blur-xl" />
            )}
            <motion.button
              whileTap={!enough ? undefined : { scale: 0.96 }}
              onClick={() => {
                if (!enough) return
                buzz([30, 40, 30])
                startGame()
              }}
              disabled={!enough}
              className={`btn-horror group relative mx-auto w-full max-w-[280px] overflow-hidden px-5 py-3 text-center ${
                enough ? '' : 'opacity-40 grayscale'
              }`}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="text-horror horror-flicker relative block font-darija text-xl font-black tracking-[0.18em]">
                ابدا اللعبة
              </span>
              <span
                aria-hidden
                className="absolute bottom-1.5 left-1/2 h-px w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-blood/50 to-transparent"
              />
            </motion.button>
          </div>
          <p className={`mt-3 text-center font-darija text-xs font-bold ${enough ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {enough
              ? 'اللعبة غتفرق الأدوار بوحدها. يلا نبداو!'
              : `باقي ${MIN_PLAYERS - players.length} لاعبين`}
          </p>
        </div>
      </div>
    </div>
  )
}