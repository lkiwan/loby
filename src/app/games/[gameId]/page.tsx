'use client';

import { use, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RefreshCw, X } from 'lucide-react';
import { useRewardedAd } from '@/lib/useRewardedAd';
import { rememberPayMethod, getRememberedPayMethod } from '@/lib/payMethod';
import { SolarStar, SolarPlay } from '@/components/SolarIcon';
import GameAdOverlay from '@/components/GameAdOverlay';
import { GAMES } from '@/lib/games';
import {
  ROSTER_PARAM,
  encodeRoster,
  loadSessionRoster,
  rosterForGame,
} from '@/lib/roster';

const EXTERNAL_GAMES: Record<string, string> = {
  'paint-followers': '/game-files/paint-followers/index.html',
  'mafia':           '/game-files/mafia/index.html',
  '7azr-fazr':       '/game-files/7azr-fazr/index.html',
  'bara-salfa':      '/game-files/bara-salfa/index.html',
  'sowl-wla-dir':    '/game-files/sowl-wla-dir/index.html',
};

export default function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams  = use(params);
  const { token }       = use(searchParams);
  const gameId         = resolvedParams.gameId;
  const baseUrl         = EXTERNAL_GAMES[gameId];
  const game            = GAMES.find((g) => g.id === gameId);

  /* accountNames = the saved list, session = this visit's override on top of it */
  const [accountNames, setAccountNames] = useState<string[]>([]);
  const [session, setSession]         = useState<string[] | null>(null);
  /* derived: false again while a new game's account list is still loading */
  const [readyGameId, setReadyGameId] = useState<string | null>(null);

  const iframeRef  = useRef<HTMLIFrameElement | null>(null);
  const appliedRef = useRef<string[]>([]);
  const rosterRef  = useRef<string[]>([]);
  const countedRef = useRef<string | null>(null);

  const rosterNames  = useMemo(() => (session ?? accountNames), [session, accountNames]);

  useEffect(() => {
    let alive = true;
    appliedRef.current = [];
    /* read the session override before the account list so a returning player
       gets the same table they were just playing. Deferred one microtask so no
       state is written synchronously inside the effect
       (react-hooks/set-state-in-effect). */
    const stored = loadSessionRoster();
    Promise.resolve().then(() => {
      if (alive) setSession(stored);
    });
    fetch('/api/friends', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { friends: [] }))
      .then((d: { friends?: { name: string }[] }) => {
        if (!alive) return;
        setAccountNames((d.friends ?? []).map((x: { name: string }) => x.name));
      })
      .catch(() => { /* keep the empty account list */ })
      .finally(() => { if (alive) setReadyGameId(gameId); });
    return () => {
      alive = false;
    };
  }, [gameId]);

  useEffect(() => {
    rosterRef.current = rosterNames;
  }, [rosterNames]);

  const rosterValue = useMemo(
    () =>
      readyGameId === gameId
        ? encodeRoster(rosterForGame(rosterNames, gameId), gameId)
        : null,
    [readyGameId, rosterNames, gameId],
  );

  const externalUrl = useMemo(() => {
    if (!baseUrl) return undefined;
    const qs = new URLSearchParams();
    if (token) qs.set('token', token);
    if (rosterValue) qs.set(ROSTER_PARAM, rosterValue);
    const q = qs.toString();
    return q ? `${baseUrl}?${q}` : baseUrl;
  }, [baseUrl, token, rosterValue]);

  const [exitConfirm, setExitConfirm]       = useState(false);
  const [replaying, setReplaying]           = useState(false);
  const [gameOver, setGameOver]             = useState(false);
  const [coins, setCoins]                   = useState<number | null>(null);
  const [iframeLoaded, setIframeLoaded]     = useState(false);

  /* Reset all per-round state when the URL changes (new play session via
     play-again). router.replace with the same pathname keeps the component
     mounted, so we adjust during render instead of in an effect — the
     documented "adjusting state when a prop changes" pattern. */
  const [prevExternalUrl, setPrevExternalUrl] = useState(externalUrl);
  if (prevExternalUrl !== externalUrl) {
    setPrevExternalUrl(externalUrl);
    setIframeLoaded(false);
    setExitConfirm(false);
    setGameOver(false);
    setReplaying(false);
    setCoins(null);
  }

  const router = useRouter();
  const { show: showRewardedAd } = useRewardedAd();

  const countPlay = useCallback(() => {
    if (!externalUrl || countedRef.current === externalUrl) return;
    countedRef.current = externalUrl;
    const names = appliedRef.current.length ? appliedRef.current : rosterRef.current;
    if (!names.length) return;
    fetch('/api/friends/plays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, names }),
      keepalive: true,
    }).catch(() => { /* the round still counts as played locally */ });
  }, [externalUrl, gameId]);

  const leave = useCallback(() => {
    countPlay();
    router.push('/');
  }, [countPlay, router]);

  /* Eagerly fetch the game's HTML so the browser starts parsing its
     sub-resources (JS bundle, CSS) as early as possible. */
  useEffect(() => {
    if (!baseUrl) return;
    fetch(baseUrl, { priority: 'high' } as RequestInit).catch(() => {});
  }, [baseUrl]);

  /* Force-hide the loading screen after 3 seconds if onLoad never fires */
  useEffect(() => {
    if (iframeLoaded || rosterValue === null) return;
    const t = setTimeout(() => setIframeLoaded(true), 3000);
    return () => clearTimeout(t);
  }, [iframeLoaded, rosterValue]);

  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch('/api/economy/balance');
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins ?? data.balance ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  /* Store topbar coin pill: fetch the balance once on mount too (the same
     fetchCoins already used when a game ends refreshes it afterwards). */
  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data as { type?: string; names?: unknown } | null;
      if (!data || typeof data.type !== 'string') return;
      /* games are same-origin, but only trust our own frame's roster report */
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (data.type === 'roster-applied' && Array.isArray(data.names)) {
        appliedRef.current = data.names.filter((n): n is string => typeof n === 'string');
        return;
      }
      if (data.type === 'game-over' || data.type === 'replay-requested') {
        countPlay();
        setGameOver(true);
        fetchCoins();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [countPlay, fetchCoins]);

  const handlePlayAgain = async () => {
    setReplaying(true);
    try {
      /* Reuse the last payment method so replay is one tap — ad path falls
         back to coins when the ad can't fill. */
      if (getRememberedPayMethod() === 'ad') {
        const result = await showRewardedAd('continue', gameId);
        if (result.ok && result.payload.redirectUrl) {
          rememberPayMethod('ad');
          countPlay();
          router.replace(result.payload.redirectUrl);
          return;
        }
        rememberPayMethod('coins');
      }
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ gameId, paymentMethod: 'coins' }),
      });
      if (res.ok) {
        rememberPayMethod('coins');
        const { redirectUrl } = await res.json();
        countPlay();
        router.replace(redirectUrl);
      } else {
        router.replace('/?from=game');
      }
    } catch {
      router.replace('/?from=game');
    } finally {
      setReplaying(false);
    }
  };

  if (!externalUrl) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#07070D] px-6 text-center">
        <div className="mb-1" style={{ color: 'var(--gold)' }}>
          <SolarStar className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-black text-white">مالقيناش هاد الطبلة 🥲</h1>
        <p className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>
          هاد اللعبة ماكايناش عندنا.
        </p>
        <Link href="/" className="btn-lime mt-2 px-6 py-3 text-sm">
          رجع للساحة
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#07070D]">

      {/* ── Store topbar: wordmark · game title/meta · coin pill · exit ── */}
      <header
        className="relative z-50 flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-[max(0.6rem,env(safe-area-inset-top))]"
        style={{
          background: 'rgba(7,7,13,0.88)',
          backdropFilter: 'blur(16px) saturate(160%)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="whitespace-nowrap font-nunito text-[15px] font-black tracking-[0.3px]">
            <span className="text-white">PLAY</span>
            <span style={{ color: 'var(--lime)' }}>M3ANA</span>
          </span>
          <span className="h-6 w-px shrink-0" style={{ background: 'var(--line)' }} aria-hidden="true" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-nunito text-[13px] font-black uppercase tracking-[0.4px] text-white">
              {game?.latinTitle ?? gameId}
            </p>
            <p className="truncate text-[10.5px] font-bold" style={{ color: 'var(--dim)' }}>
              {game ? `${game.players} لاعبين · ${game.duration} · ${game.tag}` : 'Host'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {coins !== null && (
            <div
              className="flex select-none items-center gap-1.5 rounded-full px-2.5 py-[5px] font-nunito text-[13.5px] font-black tabular-nums"
              style={{
                background: 'rgba(255,201,60,0.10)',
                border: '1px solid rgba(255,201,60,0.27)',
                color: 'var(--gold)',
              }}
            >
              <span
                className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[10.5px]"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #FFF3C4, #FFC53D 60%, #E8A00C)',
                  color: '#7A5200',
                }}
                aria-hidden="true"
              >
                ★
              </span>
              {coins}
            </div>
          )}
          <button
            onClick={() => setExitConfirm(true)}
            className="grid h-10 w-10 place-items-center rounded-full text-white transition active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)' }}
            aria-label="خرج من اللعبة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Stage: the game iframe + host loading screen ── */}
      <div className="relative min-h-0 flex-1">
        {rosterValue !== null && (
          <iframe
            ref={iframeRef}
            key={externalUrl}
            src={externalUrl}
            className="h-full w-full border-0"
            allow="autoplay; fullscreen; clipboard-write"
            title={`Game: ${gameId}`}
            onLoad={() => setIframeLoaded(true)}
          />
        )}

        {/* iframe loading screen — clean poster art + HTML title (preview) */}
        {(!iframeLoaded || rosterValue === null) && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[#07070D] px-6">
            <div
              className="relative w-[min(200px,52vw)] overflow-hidden rounded-[22px]"
              style={{ border: '1px solid var(--line)', boxShadow: '0 24px 44px -16px rgba(0,0,0,0.8)' }}
            >
              {game?.poster ? (
                <Image
                  src={game.poster}
                  alt=""
                  width={400}
                  height={520}
                  className="block aspect-[10/13] w-full object-cover object-top"
                  priority
                />
              ) : (
                <div className="grid aspect-[10/13] w-full place-items-center" style={{ background: 'var(--panel)' }}>
                  <span className="text-6xl">{game?.emoji ?? '🎲'}</span>
                </div>
              )}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 block px-2.5 pb-2.5 pt-9 text-center font-nunito text-[15px] font-black uppercase leading-[1.12] tracking-[0.5px] text-white"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.86))',
                  textShadow: '0 2px 10px rgba(0,0,0,0.65)',
                }}
              >
                {game?.latinTitle ?? gameId}
              </span>
            </div>

            <div className="text-center">
              <p className="font-nunito text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--lime)' }}>
                LOADING GAME
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {game?.darijaTitle ?? gameId}
              </p>
            </div>

            <div className="h-[6px] w-52 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="launch-progress h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8FD41F, var(--lime))' }}
              />
            </div>

            <p className="text-blink text-xs font-bold" style={{ color: 'var(--dim)' }}>
              اللعبة كتشارجا...
            </p>
          </div>
        )}
      </div>

      {/* Game Ad Overlay */}
      {rosterValue !== null && iframeLoaded && !gameOver && (
        <GameAdOverlay />
      )}

      {/* Game Over modal */}
      {gameOver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div
            className="bounce-in relative w-full max-w-xs rounded-[22px] p-6 text-center shadow-2xl"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            <div className="mb-3 flex justify-center" style={{ color: 'var(--gold)' }}>
              <SolarStar className="h-14 w-14" />
            </div>
            <h2 className="text-2xl font-black text-white">اللعبة سالات!</h2>
            <p className="mt-1 text-[13px] font-semibold" style={{ color: 'var(--dim)' }}>
              شكرا حيت لعبتي معانا
            </p>
            {coins !== null && (
              <div
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl px-4 py-3"
                style={{ background: 'var(--panel2)', border: '1px solid var(--line)' }}
              >
                <span
                  className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[12px]"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #FFF3C4, #FFC53D 60%, #E8A00C)',
                    color: '#7A5200',
                  }}
                  aria-hidden="true"
                >
                  ★
                </span>
                <span className="font-nunito text-xl font-black" style={{ color: 'var(--gold)' }}>{coins}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>مازالا جولة</span>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={async () => { setGameOver(false); await handlePlayAgain(); }}
                disabled={replaying}
                className="btn-lime w-full py-3.5 text-[15px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <SolarPlay className="h-4 w-4" />}
                عاود لعب
              </button>
              <button onClick={leave} className="btn-store-blood w-full py-3 text-[14px]">
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                رجع للساحة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirm modal */}
      {exitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExitConfirm(false)} />
          <div
            className="bounce-in relative w-full max-w-xs rounded-[22px] p-6 text-center shadow-2xl"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            <h2 className="text-2xl font-black text-white">واش بغيتي تخرج من اللعبة؟</h2>
            <p className="mt-1.5 text-[13px] font-semibold" style={{ color: 'var(--dim)' }}>
              التقدم ديالك فهاد الجولة غادي يضيع.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handlePlayAgain}
                disabled={replaying}
                className="btn-lime w-full py-3.5 text-[15px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                عاود لعب
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setExitConfirm(false)} className="btn-store-ghost px-3 py-3 text-[14px]">
                  كمل اللعب
                </button>
                <button onClick={leave} className="btn-store-blood px-3 py-3 text-[14px]">
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  خروج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
