export const MAX_FRIENDS = 15;
export const MAX_NAME_LEN = 14;
export const ROSTER_PARAM = 'p';

/* Session roster: per-visit player list edited from inside a game.
   Cleared when the user returns to the lobby, so the lobby always shows
   only the names saved in the account. */
export const SESSION_ROSTER_KEY = 'pm3:session-roster:v1';

export type GameRules = { min: number; max: number; minNameLen: number };

export const GAME_RULES: Record<string, GameRules> = {
  mafia: { min: 6, max: 14, minNameLen: 1 },
  'paint-followers': { min: 3, max: 15, minNameLen: 1 },
  '7azr-fazr': { min: 2, max: 15, minNameLen: 1 },
  'bara-salfa': { min: 3, max: 15, minNameLen: 1 },
  'sowl-wla-dir': { min: 3, max: 8, minNameLen: 2 },
};

/* Each game bundle passes a short key to _roster.v1.js via `data-game`. */
export const ROSTER_DATA_GAME: Record<string, string> = {
  mafia: 'mafia',
  'paint-followers': 'paint',
  '7azr-fazr': 'hazr',
  'bara-salfa': 'bara',
  'sowl-wla-dir': 'sowl',
};

export function rosterDataGame(gameId: string | undefined): string {
  if (!gameId) return '';
  return ROSTER_DATA_GAME[gameId] ?? gameId;
}

export function rulesFor(gameId?: string): GameRules {
  return GAME_RULES[gameId ?? ''] ?? { min: 1, max: MAX_FRIENDS, minNameLen: 1 };
}

/* Single source of truth for name shape. Collapses whitespace, trims, caps
   length. Returns null when the result is not a usable name. */
export function normalizeName(raw: unknown, minLen = 1): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LEN);
  if (name.length < minLen) return null;
  return name;
}

export function sanitizeRoster(names: unknown, gameId?: string): string[] {
  const r = rulesFor(gameId);
  const seen = new Set<string>();
  const out: string[] = [];
  if (!Array.isArray(names)) return out;
  for (const raw of names) {
    const n = normalizeName(raw, r.minNameLen);
    if (!n) continue;
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(n);
    if (out.length >= r.max) break;
  }
  return out;
}

export function nameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/* Names that go into the ?p= value. Pads up to the game's minimum so games
   that require a fixed table size never open with empty slots. */
export function rosterForGame(names: string[], gameId?: string): string[] {
  const r = rulesFor(gameId);
  const clean = sanitizeRoster(names, gameId);
  let i = clean.length;
  while (clean.length < r.min && clean.length < r.max) {
    i += 1;
    clean.push(`لاعب ${i}`);
  }
  return clean;
}

/* Serialised value for the ?p= query param. Returns the raw JSON so the caller
   can hand it to URLSearchParams, which does exactly one round of encoding.
   `_roster.v1.js` parses it straight back out. */
export function encodeRoster(names: string[], gameId?: string): string {
  const list = sanitizeRoster(names, gameId);
  return list.length ? JSON.stringify(list) : '';
}

export function decodeRoster(raw: string | null | undefined): string[] {
  if (!raw) return [];
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    try {
      v = JSON.parse(decodeURIComponent(raw));
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/* ---------------------------------------------------------------- session */

export function loadSessionRoster(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_ROSTER_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}

export function saveSessionRoster(names: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_ROSTER_KEY, JSON.stringify(sanitizeRoster(names)));
  } catch {
    /* storage full or blocked — session roster is best-effort */
  }
}

export function clearSessionRoster(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_ROSTER_KEY);
  } catch {
    /* ignore */
  }
}