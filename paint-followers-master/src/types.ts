export interface Point {
  x: number
  y: number
}

export interface Stroke {
  playerId: string
  color: string
  points: Point[]
  width: number
}

export interface Player {
  id: string
  name: string
  color: string
}

export interface Category {
  id: string
  title: string
  emoji: string
  words: string[]
}

export type Phase =
  | 'setup'
  | 'roleReveal'
  | 'drawing'
  | 'voting'
  | 'resolution'

export interface Vote {
  voterId: string
  targetId: string
}

export interface GameSnapshot {
  phase: Phase
  players: Player[]
  category: Category | null
  secretWord: string | null
  imposterId: string | null
  revealOrder: string[]
  revealIndex: number
  drawOrder: string[]
  drawIndex: number
  strokes: Stroke[]
  votes: Vote[]
  votingIndex: number
  drawnPlayerIds: string[]   // players who committed at least 1 stroke this round
  guessedWords: string[] | null
  guessCorrect: boolean | null
  imposterCaught: boolean | null
  lastImposterId: string | null
  scores: Record<string, number>
  roundNumber: number
}

export type GameAction =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'UPDATE_PLAYER'; id: string; name: string }
  | { type: 'SELECT_CATEGORY'; category: Category }
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_REVEAL' }
  | { type: 'COMMIT_STROKE'; stroke: Stroke }
  | { type: 'NEXT_DRAWER' }
  | { type: 'CAST_VOTE'; voterId: string; targetId: string }
  | { type: 'ADVANCE_VOTING' }
  | { type: 'GO_TO_VOTING' }
  | { type: 'RESOLVE' }
  | { type: 'GUESS_WORD'; word: string }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RESET' }