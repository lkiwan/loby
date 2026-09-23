'use client';

export type PayMethod = 'coins' | 'ad';

const KEY = 'playm3ana:paymethod';

/* Remember how the player last paid so replay / play-again can reuse it and
   skip re-choosing. Defaults to coins (the primary, non-interruptive path). */
export function rememberPayMethod(method: PayMethod): void {
  try {
    window.localStorage.setItem(KEY, method);
  } catch {
    /* storage disabled — memory is best-effort */
  }
}

export function getRememberedPayMethod(): PayMethod {
  if (typeof window === 'undefined') return 'coins';
  try {
    return window.localStorage.getItem(KEY) === 'ad' ? 'ad' : 'coins';
  } catch {
    return 'coins';
  }
}