'use client';

import { useCallback, useState } from 'react';

export type AdPlacement = 'unlock' | 'double_reward' | 'continue' | 'daily_bonus';

export type AdResult =
  | { ok: true; payload: { redirectUrl?: string; newBalance?: number; awarded?: number } }
  | { ok: false; reason: 'no_fill' | 'dismissed' | 'capped' | 'error' };

type AdBreakInfo = { breakStatus: string };

export function useRewardedAd() {
  const [busy, setBusy] = useState(false);

  const show = useCallback(
    (placement: AdPlacement, gameId?: string): Promise<AdResult> =>
      new Promise((resolve) => {
        if (busy) return resolve({ ok: false, reason: 'error' });
        setBusy(true);

        (async () => {
          try {
            const startRes = await fetch('/api/ads/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placement, gameId }),
            });
            if (startRes.status === 429) {
              setBusy(false);
              return resolve({ ok: false, reason: 'capped' });
            }
            if (!startRes.ok) {
              setBusy(false);
              return resolve({ ok: false, reason: 'error' });
            }
            const { nonce }: { nonce: string } = await startRes.json();

            const win = window as unknown as {
              adsbygoogle?: unknown[];
              adBreak?: (o: Record<string, unknown>) => void;
              __adsReady?: boolean;
            };

            if (typeof win.adBreak !== 'function' || !Array.isArray(win.adsbygoogle)) {
              setBusy(false);
              return resolve({ ok: false, reason: 'no_fill' });
            }

            let viewed = false;

            win.adBreak({
              type: 'reward',
              name: placement,
              preloadAdBreaks: 'on',
              beforeReward: (showAdFn: unknown) => {
                if (typeof showAdFn === 'function') (showAdFn as () => void)();
              },
              beforeAd: () => document.body.classList.add('ad-playing'),
              afterAd: () => document.body.classList.remove('ad-playing'),
              adViewed: () => {
                viewed = true;
              },
              adDismissed: () => {
                viewed = false;
              },
              adBreakDone: async (info: AdBreakInfo) => {
                setBusy(false);
                if (!viewed && info.breakStatus !== 'viewed') {
                  return resolve({
                    ok: false,
                    reason: info.breakStatus === 'noAdPreloaded' ? 'no_fill' : 'dismissed',
                  });
                }
                try {
                  const r = await fetch('/api/ads/complete', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Idempotency-Key': nonce,
                    },
                    body: JSON.stringify({ nonce }),
                  });
                  if (!r.ok) return resolve({ ok: false, reason: 'error' });
                  resolve({ ok: true, payload: await r.json() });
                } catch {
                  resolve({ ok: false, reason: 'error' });
                }
              },
            });
          } catch {
            setBusy(false);
            resolve({ ok: false, reason: 'error' });
          }
        })();
      }),
    [busy]
  );

  return { show, busy };
}