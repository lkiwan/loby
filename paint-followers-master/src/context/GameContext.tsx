import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { GameAction, GameSnapshot, Player, Vote } from '../types'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  pickGuessWords,
  pickImposterId,
  pickRandomCategory,
  pickWord,
  shuffleArray,
} from '../data/words'

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function createInitialSnapshot(): GameSnapshot {
  return {
    phase: 'setup',
    players: [],
    category: null,
    secretWord: null,
    imposterId: null,
    revealOrder: [],
    revealIndex: 0,
    drawOrder: [],
    drawIndex: 0,
    strokes: [],
    votes: [],
    votingIndex: 0,
    drawnPlayerIds: [],
    guessedWords: null,
    guessCorrect: null,
    imposterCaught: null,
    lastImposterId: null,
    scores: {},
    roundNumber: 1,
  }
}

function startGame(snapshot: GameSnapshot): GameSnapshot {
  if (snapshot.players.length < MIN_PLAYERS) return snapshot
  const category = snapshot.category ?? pickRandomCategory()
  const secretWord = pickWord(category)
  const playerIds = snapshot.players.map((p) => p.id)
  const imposterId = pickImposterId(playerIds, snapshot.lastImposterId)
  const guessedWords = pickGuessWords(category, secretWord)

  const scores = { ...snapshot.scores }
  for (const id of playerIds) {
    if (!(id in scores)) scores[id] = 0
  }

  return {
    ...snapshot,
    phase: 'roleReveal',
    category,
    secretWord,
    imposterId,
    guessedWords,
    revealOrder: shuffleArray(playerIds),
    revealIndex: 0,
    drawOrder: shuffleArray(playerIds),
    drawIndex: 0,
    strokes: [],
    votes: [],
    votingIndex: 0,
    drawnPlayerIds: [],
    guessCorrect: null,
    imposterCaught: null,
    scores,
  }
}

function advanceReveal(snapshot: GameSnapshot): GameSnapshot {
  if (snapshot.revealIndex + 1 >= snapshot.revealOrder.length) {
    return { ...snapshot, phase: 'drawing' }
  }
  return { ...snapshot, revealIndex: snapshot.revealIndex + 1 }
}

function nextDrawer(snapshot: GameSnapshot): GameSnapshot {
  // Cycle infinitely through drawOrder — never auto-transition to voting
  const nextIndex = (snapshot.drawIndex + 1) % snapshot.drawOrder.length
  return { ...snapshot, drawIndex: nextIndex }
}

function castVote(snapshot: GameSnapshot, voterId: string, targetId: string): GameSnapshot {
  const existingVotes = snapshot.votes.filter((v) => v.voterId !== voterId)
  const vote: Vote = { voterId, targetId }
  return { ...snapshot, votes: [...existingVotes, vote] }
}

function advanceVoting(snapshot: GameSnapshot): GameSnapshot {
  const nextIndex = snapshot.votingIndex + 1
  if (nextIndex >= snapshot.players.length) {
    return resolveVotes(snapshot)
  }
  return { ...snapshot, votingIndex: nextIndex }
}

function resolveVotes(snapshot: GameSnapshot): GameSnapshot {
  if (snapshot.phase !== 'voting') return snapshot

  const counts = new Map<string, number>()
  for (const v of snapshot.votes) {
    counts.set(v.targetId, (counts.get(v.targetId) ?? 0) + 1)
  }

  const imposterVotes = counts.get(snapshot.imposterId ?? '') ?? 0
  const maxVotes = Math.max(0, ...counts.values())
  const imposterCaught = imposterVotes === maxVotes && maxVotes > 0

  const newScores = { ...snapshot.scores }
  if (imposterCaught) {
    for (const v of snapshot.votes) {
      if (v.targetId === snapshot.imposterId) {
        newScores[v.voterId] = (newScores[v.voterId] ?? 0) + 1
      }
    }
  }

  return { ...snapshot, phase: 'resolution', imposterCaught, scores: newScores }
}

function makeGuess(state: GameSnapshot, word: string): GameSnapshot {
  const guessCorrect = word === state.secretWord
  const newScores = { ...state.scores }
  if (guessCorrect && state.imposterId) {
    newScores[state.imposterId] = (newScores[state.imposterId] ?? 0) + 1
  }
  return { ...state, guessCorrect, scores: newScores }
}

function playAgain(snapshot: GameSnapshot): GameSnapshot {
  const fresh = startGame(snapshot)
  return { ...fresh, roundNumber: snapshot.roundNumber + 1 }
}

function reducer(snapshot: GameSnapshot, action: GameAction): GameSnapshot {
  switch (action.type) {
    case 'ADD_PLAYER': {
      if (snapshot.players.length >= MAX_PLAYERS) return snapshot
      const name = action.name.trim()
      if (!name) return snapshot
      if (snapshot.players.some((p) => p.name === name)) return snapshot
      const player: Player = {
        id: uid(),
        name,
        color: PLAYER_COLORS[snapshot.players.length % PLAYER_COLORS.length],
      }
      return { ...snapshot, players: [...snapshot.players, player] }
    }
    case 'REMOVE_PLAYER':
      return { ...snapshot, players: snapshot.players.filter((p) => p.id !== action.id) }
    case 'UPDATE_PLAYER':
      return {
        ...snapshot,
        players: snapshot.players.map((p) =>
          p.id === action.id ? { ...p, name: action.name } : p
        ),
      }
    case 'SELECT_CATEGORY':
      return { ...snapshot, category: action.category }
    case 'START_GAME':
      return startGame(snapshot)
    case 'ADVANCE_REVEAL':
      return advanceReveal(snapshot)
    case 'COMMIT_STROKE': {
      // Add drawer to drawnPlayerIds on first stroke
      const drawerId = snapshot.drawOrder[snapshot.drawIndex]
      const drawnPlayerIds = snapshot.drawnPlayerIds.includes(drawerId)
        ? snapshot.drawnPlayerIds
        : [...snapshot.drawnPlayerIds, drawerId]
      return {
        ...snapshot,
        strokes: [...snapshot.strokes, action.stroke],
        drawnPlayerIds,
      }
    }
    case 'NEXT_DRAWER':
      return nextDrawer(snapshot)
    case 'GO_TO_VOTING':
      return { ...snapshot, phase: 'voting', votingIndex: 0, votes: [] }
    case 'CAST_VOTE':
      return castVote(snapshot, action.voterId, action.targetId)
    case 'ADVANCE_VOTING':
      return advanceVoting(snapshot)
    case 'RESOLVE':
      return resolveVotes(snapshot)
    case 'GUESS_WORD':
      return makeGuess(snapshot, action.word)
    case 'PLAY_AGAIN':
      return playAgain(snapshot)
    case 'RESET':
      return createInitialSnapshot()
    default:
      return snapshot
  }
}

interface GameContextValue {
  state: GameSnapshot
  dispatch: Dispatch<GameAction>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialSnapshot)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
