'use client';

import { use, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RefreshCw, X, Coins, Trophy, Zap } from 'lucide-react';
import { useRewardedAd } from '@/lib/useRewardedAd';
import { rememberPayMethod, getRememberedPayMethod } from '@/lib/payMethod';
import { StarMark } from '@/components/Star';
import GameIcon from '@/components/GameIcon';
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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#030812] px-6 text-center">
        <div className="mb-2">
          <StarMark size={48} />
        </div>
        <h1 className="font-lalezar text-3xl text-neutral-50 text-glow-cyan">مالقيناش هاد الطبلة 🥲</h1>
        <p className="font-cairo text-sm font-semibold text-neutral-400">
          هاد اللعبة ماكايناش عندنا.
        </p>
        <Link href="/" className="btn-chunk btn-cyber mt-2 px-6 py-3 text-sm">
          رجع للساحة
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#030812]">

      {/* iframe loading screen */}
      {(!iframeLoaded || rosterValue === null) && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[#030812]">
          <div className="pointer-events-none absolute inset-0">
            <div className="cyber-grid opacity-30 absolute inset-0" />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 55% 55% at 50% 50%, ${
                  game?.isMafia ? 'rgba(220,38,38,.18)' : 'rgba(0,217,255,.12)'
                }, transparent 65%)`,
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Pulse rings */}
            <div className="relative grid h-24 w-24 place-items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="launch-ring absolute inset-0"
                  style={{
                    color: game?.isMafia ? 'rgba(239,68,68,.5)' : 'rgba(0,217,255,.5)',
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
              <GameIcon game={game} size={92} />
            </div>

            <div className="text-center">
              <p className="font-grit text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">
                LOADING GAME
              </p>
              <p
                className="mt-1 font-lalezar text-2xl"
                style={{ color: game?.starAccent ?? '#f2b23d', textShadow: `0 0 20px ${game?.starAccent ?? '#f2b23d'}70` }}
              >
                {game?.darijaTitle ?? gameId}
              </p>
            </div>

            <div className="h-0.5 w-48 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="launch-progress h-full rounded-full"
                style={{
                  background: game?.isMafia
                    ? 'linear-gradient(90deg, #ff2d55, #f2b23d)'
                    : 'linear-gradient(90deg, #00d9ff, #a855f7)',
                }}
              />
            </div>

            <p className="text-blink font-cairo text-xs font-bold text-neutral-500">
              اللعبة كتشارجا...
            </p>
          </div>
        </div>
      )}

      {/* top HUD bar */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <span className="pointer-events-none flex min-w-0 items-center gap-2 rounded-full border border-cyan-400/12 bg-[#030812]/70 px-3 py-1.5 backdrop-blur-md">
          <Image
            src="/images/logo-playm3ana-new.png"
            alt="PlayM3ana"
            width={24}
            height={20}
            className="h-5 w-auto shrink-0 object-contain"
          />
          <span className="truncate font-grit text-[11px] uppercase tracking-wide text-neutral-300">
            {game?.latinTitle ?? gameId}
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setExitConfirm(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#030812]/70 text-white shadow-lg backdrop-blur-md transition hover:border-red-500/40 hover:text-red-400 active:scale-90"
            aria-label="خرج من اللعبة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

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

      {/* Game Over modal */}
      {gameOver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="bounce-in relative w-full max-w-xs rounded-2xl border border-cyan-400/20 bg-[#060c1a] p-6 text-center shadow-2xl">
            <div className="mb-3 flex justify-center">
              <Trophy className="h-12 w-12 text-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,.6)]" />
            </div>
            <h2 className="font-lalezar text-2xl text-neutral-50">اللعبة سالات!</h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-neutral-400">
              شكرا حيت لعبتي معانا
            </p>
            {coins !== null && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/12 bg-cyan-400/[0.05] px-4 py-3">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="font-lalezar text-xl text-amber-300">{coins}</span>
                <span className="font-cairo text-sm font-semibold text-neutral-400">مازالا جولة</span>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={async () => { setGameOver(false); await handlePlayAgain(); }}
                disabled={replaying}
                className="btn-chunk btn-amber w-full py-3 text-[13px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                عاود لعب
              </button>
              <button onClick={leave} className="btn-chunk btn-blood w-full py-3 text-[13px]">
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
          <div className="bounce-in relative w-full max-w-xs rounded-2xl border border-cyan-400/15 bg-[#060c1a] p-6 text-center shadow-2xl">
            <h2 className="font-lalezar text-2xl text-neutral-50">واش بغيتي تخرج من اللعبة؟</h2>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-400">
              التقدم ديالك فهاد الجولة غادي يضيع.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handlePlayAgain}
                disabled={replaying}
                className="btn-chunk btn-amber w-full py-3 text-[13px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                عاود لعب
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setExitConfirm(false)} className="btn-chunk btn-ghost-hollow px-3 py-3 text-[13px]">
                  كمل اللعب
                </button>
<button onClick={leave} className="btn-chunk btn-blood px-3 py-3 text-[13px]">
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
