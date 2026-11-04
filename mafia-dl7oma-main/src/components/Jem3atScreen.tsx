import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Minus, Pencil, Play, Plus, Skull, Trash2, UserRound, Users } from 'lucide-react'
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
  const mafiaCount = useMafiaGame((s) => s.mafiaCount)
  const setMafiaCount = useMafiaGame((s) => s.setMafiaCount)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [dupe, setDupe] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  // select the old name only once, when entering edit mode
  useEffect(() => {
    if (editingId !== null) editRef.current?.select()
  }, [editingId])

  const teller = players.find((p) => p.isTeller)

  const enough = players.length >= MIN_PLAYERS
  const capped = players.length >= 14

  // same bounds the store enforces in setMafiaCount (min 1, max nonTellers − 3)
  const mafiaMax = Math.max(1, Math.max(1, players.length - 1) - 3)

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
    <div dir="rtl" className="relative flex h-full flex-col overflow-hidden bg-[#07070D]">
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-5 pt-5 pb-4"
      >
        {/* title + poster thumbnail */}
        <div dir="ltr" className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-grit leading-[0.95]">
              <span className="block text-[38px] text-white">L'MAFIA</span>
              <span className="block text-[38px] text-[#E5322D]">D'LHOUMA</span>
            </h1>
            <p dir="rtl" className="mt-2 text-right font-darija text-[15px] font-extrabold text-[#FFC93C]">
              مرر و العب
            </p>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}img/role-eissaba.png`}
            alt="L'Mafia d'L'Houma"
            draggable={false}
            className="h-[108px] w-[86px] shrink-0 rounded-2xl object-cover object-top ring-1 ring-white/10"
          />
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-5">
        {/* add form */}
        <form onSubmit={submit} className="mb-4 flex gap-2.5">
          <motion.div
            className="relative flex-1"
            animate={dupe ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="pointer-events-none absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.07]">
              <UserRound className="h-[18px] w-[18px] text-zinc-400" />
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (dupe) setDupe(false)
              }}
              placeholder="سمّي اللاعبين..."
              maxLength={16}
              className={`w-full rounded-2xl bg-[#12121C] py-3.5 pl-4 pr-12 font-darija text-[15px] font-bold text-zinc-50 outline-none ring-1 placeholder-zinc-500 ${dupe ? 'ring-[#E5322D]/70' : 'ring-white/[0.08] focus:ring-[#C6F542]/50'}`}
              autoComplete="off"
            />
          </motion.div>
          <button
            type="submit"
            disabled={capped}
            className="flex w-[52px] shrink-0 items-center justify-center self-stretch rounded-2xl bg-[#C6F542] text-[#131803] transition-transform active:scale-95 disabled:opacity-40"
            aria-label="زيد اللاعب"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </form>

        {dupe && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-3 mb-3 flex items-center gap-1.5 px-1 font-darija text-[11px] font-bold text-[#FF6B6B]"
          >
            <Skull className="h-3.5 w-3.5" />
            هادي السميّة كاينة ديالا. ختر سميّة أخرى.
          </motion.p>
        )}

        {/* player roster */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-2">
          <p className="mb-2 flex items-center gap-1.5 px-1 font-darija text-xs font-semibold text-zinc-500">
            <Pencil className="h-3.5 w-3.5" />
            ديز على السمية باش تبدلها بسرعة
          </p>
          <div className="mb-2.5 flex items-center justify-between px-1">
            <span className="font-darija text-sm font-bold text-zinc-300">
              لعبة · {players.length}/14
            </span>
            <span className="rounded-full bg-[#12121C] px-3 py-1 font-darija text-xs font-bold text-zinc-400 ring-1 ring-white/[0.08]">
              الحاكم: <b className="text-[#FFC93C]">{teller?.name ?? '—'}</b>
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
                className={`mb-2 flex items-center gap-2.5 rounded-2xl bg-[#12121C] px-3.5 py-3 ring-1 ${
                  p.isTeller ? 'ring-[#FFC93C]/40' : 'ring-white/[0.07]'
                }`}
              >
                <span className="w-5 text-center font-darija text-sm font-bold text-zinc-500">{i + 1}</span>
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
                    className={`min-w-0 flex-1 rounded-lg bg-[#0B0B13] px-2 py-1 font-darija text-base font-bold text-zinc-50 outline-none ring-2 ${dupe ? 'ring-[#E5322D]/80' : 'ring-[#C6F542]/60'}`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(p.id, p.name)}
                    title="ديز باش تبدّل السميّة"
                    className={`flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-lg px-1 py-0.5 font-darija text-base font-extrabold transition-colors ${
                      p.isTeller ? 'text-[#FFC93C]' : 'text-zinc-50'
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
                  className={`rounded-xl p-2 transition-all active:scale-90 ${
                    p.isTeller ? 'bg-[#FFC93C] text-[#131803]' : 'text-zinc-500 hover:text-[#FFC93C]'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removePlayer(p.id)}
                  aria-label="مشّاه"
                  className="rounded-xl p-2 text-zinc-500 transition-colors hover:text-[#FF6B6B] active:scale-90"
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

        {/* imposter count — always-visible stepper */}
        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-[#12121C] px-3 py-2.5 ring-1 ring-white/[0.07]">
          <button
            type="button"
            onClick={() => {
              setMafiaCount(mafiaCount - 1)
              buzz(15)
            }}
            disabled={mafiaCount <= 1}
            aria-label="نقّص العصابة"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#C6F542] ring-1 ring-white/15 transition-all active:scale-90 disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Skull className="h-6 w-6 text-[#E5322D]" />
            <span className="font-darija text-lg font-black text-zinc-50">العصابة</span>
            <span className="font-darija text-lg font-black text-zinc-50">{mafiaCount}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMafiaCount(mafiaCount + 1)
              buzz(15)
            }}
            disabled={mafiaCount >= mafiaMax}
            aria-label="زوّد العصابة"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#C6F542] ring-1 ring-white/15 transition-all active:scale-90 disabled:pointer-events-none disabled:opacity-30"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* start */}
        <div className="pb-6 pt-1">
          <motion.button
            whileTap={!enough ? undefined : { scale: 0.96 }}
            onClick={() => {
              if (!enough) return
              buzz([30, 40, 30])
              startGame()
            }}
            disabled={!enough}
            className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#C6F542] px-12 py-3.5 font-darija text-xl font-black text-[#131803] transition-opacity disabled:opacity-40"
          >
            <Play className="h-5 w-5 fill-[#131803]" />
            ابدا اللعبة
          </motion.button>
          <p className={`mt-3 text-center font-darija text-xs font-semibold ${enough ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {enough ? 'اللعبة غتفرق الأدوار بوحدها' : `باقي ${MIN_PLAYERS - players.length} لاعبين`}
          </p>
        </div>
      </div>
    </div>
  )
}
