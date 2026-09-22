import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { chooseImposters, pickAction } from './game'
import type { Setup } from './game'

const SAVE_KEY = 'hazer-fzer-save-v1'

interface SavedSetup {
  players: string[]
  imposters: number
  timer: number
  savedAt: number
}

function loadSaved(): SavedSetup | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedSetup
    if (!Array.isArray(data.players)) return null
    return data
  } catch {
    return null
  }
}

function saveSetup(setup: Setup) {
  try {
    const data: SavedSetup = {
      players: setup.names,
      imposters: setup.imposters,
      timer: setup.timer,
      savedAt: Date.now(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function saveSetupDraft(setup: Setup) {
  saveSetup(setup)
}

export type Phase =
  | 'home'
  | 'setup'
  | 'reveal'
  | 'pass'
  | 'pre-inter'
  | 'inter'
  | 'final'
  | 'again'

export type Result = 'win' | 'lose' | null

export interface GameState {
  phase: Phase
  players: string[]
  imposterCount: number
  timer: number
  imposters: string[]
  action: string
  passIndex: number
  interIndex: number
  strikes: number
  result: Result
}

type Action =
  | { type: 'HOME' }
  | { type: 'SETUP' }
  | { type: 'START'; setup: Setup }
  | { type: 'REVEAL_DONE' }
  | { type: 'NEXT_PASS' }
  | { type: 'TO_PRE_INTER'; index: number }
  | { type: 'INTER_START' }
  | { type: 'STRIKE_WRONG' }
  | { type: 'GUESS_RIGHT' }
  | { type: 'FINAL_DONE' }
  | { type: 'NEW_ROUND' }
  | { type: 'RECONFIGURE' }

const saved = typeof window !== 'undefined' ? loadSaved() : null
const initialState: GameState = {
  phase: 'home',
  players: saved?.players ?? ['اللاعب 1', 'اللاعب 2', 'اللاعب 3'],
  imposterCount: saved?.imposters ?? 1,
  timer: saved?.timer ?? 120,
  imposters: [],
  action: '',
  passIndex: 0,
  interIndex: 0,
  strikes: 0,
  result: null,
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HOME':
      return { ...state, phase: 'home' }
    case 'SETUP':
      return { ...state, phase: 'setup' }
    case 'START':
      saveSetup(action.setup)
      return {
        ...state,
        players: action.setup.names,
        imposterCount: action.setup.imposters,
        timer: action.setup.timer,
        imposters: chooseImposters(action.setup.names, action.setup.imposters),
        action: pickAction(),
        passIndex: 0,
        interIndex: 0,
        strikes: 0,
        result: null,
        phase: 'reveal',
      }
    case 'REVEAL_DONE':
      return { ...state, phase: 'pass', passIndex: 0 }
    case 'NEXT_PASS':
      return { ...state, passIndex: state.passIndex + 1 }
    case 'TO_PRE_INTER':
      return { ...state, phase: 'pre-inter', interIndex: action.index }
    case 'INTER_START':
      return { ...state, phase: 'inter', strikes: 0 }
    case 'STRIKE_WRONG':
      return {
        ...state,
        strikes: state.strikes + 1,
        phase: state.strikes + 1 >= 3 ? 'final' : state.phase,
        result: state.strikes + 1 >= 3 ? 'lose' : state.result,
      }
    case 'GUESS_RIGHT':
      return { ...state, phase: 'final', result: 'win' }
    case 'FINAL_DONE':
      return { ...state, phase: 'again' }
    case 'NEW_ROUND':
      return {
        ...state,
        imposters: chooseImposters(state.players, state.imposterCount),
        action: pickAction(),
        passIndex: 0,
        interIndex: 0,
        strikes: 0,
        result: null,
        phase: 'reveal',
      }
    case 'RECONFIGURE':
      return { ...state, phase: 'setup' }
    default:
      return state
  }
}

const GameContext = createContext<[GameState, Dispatch<Action>] | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <GameContext.Provider value={[state, dispatch]}>{children}</GameContext.Provider>
}

export function useGame(): [GameState, Dispatch<Action>] {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}