import { create } from 'zustand'
import type {
  GamePhase,
  GameState,
  MorningReport,
  NightStep,
  Player,
  Role,
  VictoryFaction,
} from './types'
import { MIN_PLAYERS } from './types'

export interface GameStore extends GameState {
  goHome: () => void
  goSetup: () => void
  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  setPlayerName: (id: string, name: string) => void
  setTeller: (id: string) => void
  setMafiaCount: (n: number) => void
  randomTeller: () => void
  startGame: () => void
  advanceToReveal: () => void
  flipUp: () => void
  flipBack: () => void
  hideAndNext: () => void
  unlockDashboard: () => void
  setNightStep: (step: NightStep) => void
  chooseMafiaTarget: (id: string) => void
  chooseBoulisTarget: (id: string) => void
  chooseTbibTarget: (id: string) => void
  clearBoulisResult: () => void
  endNight: () => void
  advanceFromReport: () => void
  chooseVote: (id: string) => void
  confirmElimination: () => void
  postElimination: () => void
  resetGame: () => void
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const uid = () => Math.random().toString(36).slice(2, 10)

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Distribute roles: mafiaCount Eissaba, 1 Boulis, 1 Tbib, rest Wlad L'Houma. */
export function dealRoles(count: number, mafiaCount = 1): Role[] {
  const mafia = Math.max(1, Math.min(mafiaCount, count - 2))
  const roles: Role[] = []
  for (let i = 0; i < mafia; i++) roles.push('EISSABA')
  roles.push('BOULIS', 'TBIB')
  for (let i = 0; i < count - mafia - 2; i++) roles.push('WLAD_LHOUMA')
  return shuffle(roles)
}

const EMPTY_STATE: GameState = {
  phase: 'SETUP',
  players: [],
  nightStep: 'EISSABA',
  nightActions: { targetEissaba: null, targetBoulis: null, targetTbib: null },
  mafiaCount: 1,
  revealOrder: [],
  revealIndex: 0,
  cardFaceUp: false,
  cardsLocked: false,
  boulisResult: null,
  morningReport: null,
  lastEliminated: null,
  voteDeadline: null,
  voteChoice: null,
  nightKillChoice: null,
  winner: null,
}

const base = (): GameState => {
  const defaults = Array.from({ length: 6 }, (_, i) => ({
    id: uid(),
    name: `لاعب ${i + 1}`,
    role: null,
    isDead: false,
    isTeller: false,
    cardViewed: false,
  }))
  return {
    ...EMPTY_STATE,
    phase: 'HOME',
    players: defaults,
    nightActions: { ...EMPTY_STATE.nightActions },
  }
}

export const useMafiaGame = create<GameStore>()((set, get) => ({
  ...base(),

  goHome: () => set({ phase: 'HOME' }),

  goSetup: () => set({ phase: 'SETUP' }),

  addPlayer: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const exists = get().players.some((p) => p.name.trim().toLowerCase() === trimmed.toLowerCase())
    if (exists) return
    const p = get().players
    if (p.length >= 14) return
    set((s) => ({
      players: [...s.players, { id: uid(), name: trimmed, role: null, isDead: false, isTeller: false, cardViewed: false }],
    }))
  },

  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  setPlayerName: (id, name) =>
    set((s) => {
      const trimmed = name.trim().toLowerCase()
      const taken = s.players.some((p) => p.id !== id && p.name.trim().toLowerCase() === trimmed)
      if (!trimmed || taken) return s
      const final = name.trim()
      return {
        players: s.players.map((p) => (p.id === id ? { ...p, name: final } : p)),
      }
    }),

  setTeller: (id) =>
    set((s) => {
      const isNowTeller = s.players.find((p) => p.id === id)?.isTeller ?? false
      // toggle: clicking the current teller unchoses them
      return {
        players: s.players.map((p) => ({ ...p, isTeller: isNowTeller ? false : p.id === id })),
      }
    }),

  setMafiaCount: (n) =>
    set((s) => {
      const nonTellers = Math.max(1, s.players.length - 1)
      const min = 1
      const max = Math.max(1, nonTellers - 3)
      return { mafiaCount: Math.min(max, Math.max(min, Math.round(n))) }
    }),

  randomTeller: () =>
    set((s) => {
      const chosen = s.players[Math.floor(Math.random() * s.players.length)]
      if (!chosen) return s
      return {
        players: s.players.map((p) => ({ ...p, isTeller: p.id === chosen.id })),
      }
    }),

  startGame: () => {
    const { players } = get()
    if (players.length < MIN_PLAYERS) return
    let roster = [...players]
    // ensure exactly one teller
    if (!roster.some((p) => p.isTeller)) {
      const idx = Math.floor(Math.random() * roster.length)
      roster = roster.map((p, i) => ({ ...p, isTeller: i === idx }))
    }
    const nonTellers = roster.filter((p) => !p.isTeller)
    const roles = dealRoles(nonTellers.length, get().mafiaCount)
    const roleById = new Map<string, Role>()
    nonTellers.forEach((p, i) => roleById.set(p.id, roles[i]))
    roster = roster.map((p) => (p.isTeller ? p : { ...p, role: roleById.get(p.id) ?? null }))
    const revealOrder = shuffle(nonTellers.map((p) => p.id))
    set({
      players: roster,
      phase: 'DEAL_CARDS',
      revealOrder,
      revealIndex: 0,
      cardFaceUp: false,
      cardsLocked: false,
    })
  },

  advanceToReveal: () => set({ phase: 'PASS_AND_PLAY' }),

  flipUp: () => {
    const s = get()
    const target = s.revealOrder[s.revealIndex]
    set({
      cardFaceUp: true,
      players: s.players.map((p) => (p.id === target ? { ...p, cardViewed: true } : p)),
    })
  },

  flipBack: () => set({ cardFaceUp: false }),

  hideAndNext: () =>
    set((s) => {
      const last = s.revealIndex >= s.revealOrder.length - 1
      return {
        cardFaceUp: false,
        revealIndex: last ? s.revealIndex : s.revealIndex + 1,
        cardsLocked: last ? true : s.cardsLocked,
      }
    }),

  unlockDashboard: () => set({ cardsLocked: false, phase: 'NIGHT_PHASE', nightStep: 'EISSABA' }),

  setNightStep: (step) => set({ nightStep: step }),

  chooseMafiaTarget: (id) => {
    const p = get().players.find((x) => x.id === id)
    if (!p || p.isDead) return
    set((s) => ({ nightActions: { ...s.nightActions, targetEissaba: id }, nightKillChoice: id }))
  },

  chooseBoulisTarget: (id) => {
    const p = get().players.find((x) => x.id === id)
    if (!p || p.isDead) return
    set((s) => ({
      nightActions: { ...s.nightActions, targetBoulis: id },
      boulisResult: p.role === 'EISSABA' ? 'MAFIA' : 'INNOCENT',
      nightStep: s.nightStep === 'BOULIS' ? 'TBIB' : s.nightStep,
      nightKillChoice: s.nightKillChoice,
    }))
  },

  chooseTbibTarget: (id) => {
    const p = get().players.find((x) => x.id === id)
    if (!p || p.isDead) return
    set((s) => ({ nightActions: { ...s.nightActions, targetTbib: id }, nightStep: 'DAWN' }))
  },

  clearBoulisResult: () => set({ boulisResult: null }),

  endNight: () => {
    const s = get()
    const { targetEissaba, targetTbib } = s.nightActions
    const victim = targetEissaba ? s.players.find((p) => p.id === targetEissaba) : undefined
    const saved = !!victim && targetTbib === victim.id
    const report: MorningReport = {
      victimId: victim?.id ?? null,
      victimName: saved ? null : victim?.name ?? null,
      victimRole: saved ? null : victim?.role ?? null,
      saved,
    }
    const players = s.players.map((p) =>
      p.id === victim?.id && !saved ? { ...p, isDead: true } : p,
    )
    const alive = players.filter((p) => !p.isDead && !p.isTeller)
    const mafia = alive.filter((p) => p.role === 'EISSABA').length
    const town = alive.length - mafia
    const isWin = mafia === 0 || mafia >= town
    set({
      players,
      morningReport: report,
      nightKillChoice: null,
      boulisResult: null,
      phase: isWin ? 'GAME_OVER' : 'DAY_PHASE',
      winner: isWin ? (mafia === 0 ? 'WLAD_LHOUMA' : 'EISSABA') : s.winner,
    })
  },

  advanceFromReport: () =>
    set({ morningReport: null, phase: 'VOTING', voteDeadline: Date.now() + 4 * 60 * 1000, voteChoice: null }),

  chooseVote: (id) =>
    set((s) => {
      const p = s.players.find((x) => x.id === id)
      if (!p || p.isDead) return s
      return { voteChoice: s.voteChoice === id ? null : id }
    }),

  confirmElimination: () => {
    const s = get()
    const target = s.players.find((p) => p.id === s.voteChoice)
    if (!target || target.isDead) return
    set({
      players: s.players.map((p) => (p.id === target.id ? { ...p, isDead: true } : p)),
      lastEliminated: { name: target.name, role: target.role ?? 'WLAD_LHOUMA' },
      voteChoice: null,
      voteDeadline: null,
    })
  },

  postElimination: () => {
    const s = get()
    const alive = s.players.filter((p) => !p.isDead && !p.isTeller)
    const mafia = alive.filter((p) => p.role === 'EISSABA').length
    const town = alive.length - mafia
    let phase: GamePhase = 'NIGHT_PHASE'
    let winner: VictoryFaction | null = null
    if (mafia === 0) {
      phase = 'GAME_OVER'
      winner = 'WLAD_LHOUMA'
    } else if (mafia >= town) {
      phase = 'GAME_OVER'
      winner = 'EISSABA'
    }
    set({
      lastEliminated: null,
      nightStep: 'EISSABA',
      nightActions: { targetEissaba: null, targetBoulis: null, targetTbib: null },
      nightKillChoice: null,
      boulisResult: null,
      phase,
      winner,
    })
  },

  resetGame: () => set({ ...base() }),
}))

/** convenience builders for the components */
export const selectRevealPlayer = (s: GameState): Player | null => {
  const id = s.revealOrder[s.revealIndex]
  return s.players.find((p) => p.id === id) ?? null
}