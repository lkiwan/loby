export const MAX_FRIENDS = 15;
export const MAX_NAME_LEN = 14;
export const ROSTER_PARAM = 'p';

export const GAME_RULES: Record<string, { min: number; max: number; minNameLen: number }> = {
  mafia: { min: 6, max: 14, minNameLen: 1 },
  'paint-followers': { min: 3, max: 15, minNameLen: 1 },
  '7azr-fazr': { min: 2, max: 15, minNameLen: 1 },
  'bara-salfa': { min: 3, max: 15, minNameLen: 1 },
  'sowl-wla-dir': { min: 3, max: 8, minNameLen: 2 },
};

export function sanitizeRoster(names: string[], gameId?: string): string[] {
  const r = GAME_RULES[gameId || ''];
  const max = r?.max ?? MAX_FRIENDS;
  const minLen = r?.minNameLen ?? 1;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const n = String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LEN);
    if (n.length < minLen) continue;
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(n);
    if (out.length >= max) break;
  }
  return out;
}

export function encodeRoster(names: string[], gameId?: string): string {
  if (!names.length) return '';
  return encodeURIComponent(JSON.stringify(sanitizeRoster(names, gameId)));
}

export function decodeRoster(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
