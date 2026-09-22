export type Role = 'EISSABA' | 'BOULIS' | 'TBIB' | 'WLAD_LHOUMA'

export type GamePhase =
  | 'HOME'
  | 'SETUP'
  | 'DEAL_CARDS'
  | 'PASS_AND_PLAY'
  | 'NIGHT_PHASE'
  | 'DAY_PHASE'
  | 'VOTING'
  | 'GAME_OVER'

/** Night steps ordered for the Teller. */
export type NightStep = 'EISSABA' | 'BOULIS' | 'TBIB' | 'DAWN'

export type BoulisResult = 'MAFIA' | 'INNOCENT' | null

export interface Player {
  id: string
  name: string
  role: Role | null
  isDead: boolean
  isTeller: boolean
  /** non-null once the card has been secretly viewed */
  cardViewed: boolean
}

export interface NightActions {
  targetEissaba: string | null
  targetBoulis: string | null
  targetTbib: string | null
}

export type VictoryFaction = 'WLAD_LHOUMA' | 'EISSABA'
export type DieCause = 'NIGHT_KILL' | 'VOTE' | null

export interface MorningReport {
  victimName: string | null
  victimId: string | null
  victimRole: Role | null
  saved: boolean
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  nightStep: NightStep
  nightActions: NightActions
  /** how many Eissaba (mafia) players — configurable in setup */
  mafiaCount: number
  /** shuffled order (non-tellers only) in which cards are revealed */
  revealOrder: string[]
  /** the player index (in revealOrder) that must currently look */
  revealIndex: number
  /** whether the revealed card is face-up */
  cardFaceUp: boolean
  /** Lock toggled when the circulate/deal screen finishes (lock until Hakem unlocks). */
  cardsLocked: boolean
  /** transient detective result, shown as a full-screen flash */
  boulisResult: BoulisResult
  morningReport: MorningReport | null
  /** last vote detail for the elimination animation */
  lastEliminated: { name: string; role: Role } | null
  /** 4-minute vote countdown deadline (ms epoch); null when not voting */
  voteDeadline: number | null
  /** the player currently selected for elimination (tap toggle) */
  voteChoice: string | null
  /** the player picked to die tonight (before doctor check) */
  nightKillChoice: string | null
  winner: VictoryFaction | null
}

export const MIN_PLAYERS = 6

export const ROLE_META: Record<Role, { label: string; color: string; sub: string }> = {
  EISSABA: { label: 'العصابة', color: 'text-blood', sub: 'المافيا' },
  BOULIS: { label: 'البوليس', color: 'text-gold', sub: 'المحامي' },
  TBIB: { label: 'الطبيب', color: 'text-heal', sub: 'الدكتور' },
  WLAD_LHOUMA: { label: 'ولاد الحومة', color: 'text-zinc-300', sub: 'المدنيين' },
}