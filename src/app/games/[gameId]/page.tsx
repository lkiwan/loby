'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RefreshCw, X, Coins, Trophy, Zap } from 'lucide-react';
import { useRewardedAd } from '@/lib/useRewardedAd';
import { rememberPayMethod, getRememberedPayMethod } from '@/lib/payMethod';
import { StarMark } from '@/components/Star';
import GameIcon from '@/components/GameIcon';
import { GAMES } from '@/lib/games';

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
  const baseUrl         = EXTERNAL_GAMES[resolvedParams.gameId];
  const externalUrl     = baseUrl
    ? token
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      : baseUrl
    : undefined;

  const [exitConfirm, setExitConfirm]       = useState(false);
  const [replaying, setReplaying]           = useState(false);
  const [gameOver, setGameOver]             = useState(false);
  const [coins, setCoins]                   = useState<number | null>(null);
  const [iframeLoaded, setIframeLoaded]     = useState(false);
  const game = GAMES.find((g) => g.id === resolvedParams.gameId);
  const router = useRouter();
  const { show: showRewardedAd } = useRewardedAd();

  /* Eagerly fetch the game's HTML so the browser starts parsing its
     sub-resources (JS bundle, CSS) as early as possible. */
  useEffect(() => {
    if (!baseUrl) return;
    fetch(baseUrl, { priority: 'high' } as RequestInit).catch(() => {});
  }, [baseUrl]);

  /* Reset all state when the URL changes (new play session via play-again).
     router.replace with the same pathname keeps the component mounted,
     so we must reset manually when externalUrl changes. */
  useEffect(() => {
    setIframeLoaded(false);
    setExitConfirm(false);
    setGameOver(false);
    setReplaying(false);
    setCoins(null);
  }, [externalUrl]);

  /* Force-hide the loading screen after 3 seconds if onLoad never fires */
  useEffect(() => {
    if (iframeLoaded) return;
    const t = setTimeout(() => setIframeLoaded(true), 3000);
    return () => clearTimeout(t);
  }, [iframeLoaded]);

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
      if (e.data?.type === 'game-over' || e.data?.type === 'replay-requested') {
        setGameOver(true);
        fetchCoins();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [fetchCoins]);

  const handlePlayAgain = async () => {
    setReplaying(true);
    try {
      /* Reuse the last payment method so replay is one tap — ad path falls
         back to coins when the ad can't fill. */
      if (getRememberedPayMethod() === 'ad') {
        const result = await showRewardedAd('continue', resolvedParams.gameId);
        if (result.ok && result.payload.redirectUrl) {
          rememberPayMethod('ad');
          router.replace(result.payload.redirectUrl);
          return;
        }
        rememberPayMethod('coins');
      }
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ gameId: resolvedParams.gameId, paymentMethod: 'coins' }),
      });
      if (res.ok) {
        rememberPayMethod('coins');
        const { redirectUrl } = await res.json();
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
    <div className="relative h-dvh w-full overflow-hidden bg-[#080b14]">

      {/* iframe loading screen */}
      {!iframeLoaded && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[#080b14]">
          <div className="pointer-events-none absolute inset-0">
            <div className="cyber-grid opacity-20 absolute inset-0" />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${
                  game?.isMafia ? 'rgba(220,38,38,.20)' : 'rgba(0,229,255,.13)'
                }, transparent 65%)`,
              }}
            />
            {/* corner glow orbs */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-15 blur-3xl"
              style={{ background: game?.isMafia ? '#ff2d55' : '#00e5ff' }} />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full opacity-10 blur-3xl bg-[#9b59f8]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Pulse rings */}
            <div className="relative grid h-24 w-24 place-items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="launch-ring absolute inset-0"
                  style={{
                    color: game?.isMafia ? 'rgba(239,68,68,.5)' : 'rgba(0,229,255,.5)',
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
              <GameIcon game={game} size={92} />
            </div>

            <div className="text-center">
              <p className="font-grit text-[10px] uppercase tracking-[0.22em] text-[#00e5ff]/50">
                LOADING GAME
              </p>
              <p
                className="mt-1 font-lalezar text-2xl"
                style={{ color: game?.starAccent ?? '#f5c842', textShadow: `0 0 24px ${game?.starAccent ?? '#f5c842'}80` }}
              >
                {game?.darijaTitle ?? resolvedParams.gameId}
              </p>
            </div>

            <div className="h-0.5 w-52 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="launch-progress h-full rounded-full"
                style={{
                  background: game?.isMafia
                    ? 'linear-gradient(90deg, #ff2d55, #f5c842)'
                    : 'linear-gradient(90deg, #00e5ff, #9b59f8)',
                }}
              />
            </div>

            <p className="text-blink font-cairo text-xs font-bold text-neutral-600">
              اللعبة كتشارجا...
            </p>
          </div>
        </div>
      )}

      {/* top HUD bar */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <span className="pointer-events-none flex items-center gap-2 rounded-full border border-cyan-400/12 bg-[#030812]/70 px-3 py-1.5 backdrop-blur-md">
          <StarMark size={18} />
          <span className="font-grit text-[11px] uppercase tracking-wide text-neutral-300">
            {game?.latinTitle ?? resolvedParams.gameId}
          </span>
        </span>
        <button
          onClick={() => setExitConfirm(true)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#030812]/70 text-white shadow-lg backdrop-blur-md transition hover:border-red-500/40 hover:text-red-400 active:scale-90"
          aria-label="خرج من اللعبة"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <iframe
        src={externalUrl}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; clipboard-write"
        title={`Game: ${resolvedParams.gameId}`}
        onLoad={() => setIframeLoaded(true)}
      />

      {/* Game Over modal */}
      {gameOver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div
            className="bounce-in relative w-full max-w-xs overflow-hidden rounded-3xl border p-6 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,.95)]"
            style={{
              background: 'linear-gradient(160deg,#101828 0%,#080f1c 100%)',
              borderColor: 'rgba(245,200,66,0.25)',
              boxShadow: '0 0 0 1px rgba(245,200,66,0.12), 0 40px 100px -20px rgba(0,0,0,.95)',
            }}
          >
            {/* Ambient glow behind trophy */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-30 blur-3xl bg-amber-400" />

            <div className="relative mb-4 flex justify-center">
              <div className="win-glow grid h-16 w-16 place-items-center rounded-2xl border border-amber-400/30 bg-amber-950/30">
                <Trophy className="h-9 w-9 text-amber-400 drop-shadow-[0_0_18px_rgba(245,200,66,.7)]" />
              </div>
            </div>
            <h2 className="font-lalezar text-[1.8rem] leading-tight text-neutral-50">اللعبة سالات!</h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-neutral-500">
              شكرا حيت لعبتي معانا 🎮
            </p>

            {coins !== null && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#00e5ff]/15 bg-[#00e5ff]/[0.05] px-4 py-3">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="font-lalezar text-xl text-amber-300">{coins.toLocaleString()}</span>
                <span className="font-cairo text-sm font-semibold text-neutral-500">كوين مازالين</span>
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
              <Link href="/?from=game" className="btn-chunk btn-ghost-hollow w-full py-3 text-[13px]">
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                رجع للساحة
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Exit confirm modal */}
      {exitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setExitConfirm(false)} />
          <div
            className="bounce-in relative w-full max-w-xs overflow-hidden rounded-3xl border p-6 text-center shadow-2xl"
            style={{
              background: 'linear-gradient(160deg,#101828 0%,#080f1c 100%)',
              borderColor: 'rgba(0,229,255,0.15)',
              boxShadow: '0 0 0 1px rgba(0,229,255,0.07), 0 30px 80px -20px rgba(0,0,0,.9)',
            }}
          >
            <h2 className="font-lalezar text-2xl text-neutral-50">واش بغيتي تخرج من اللعبة؟</h2>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-500">
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
                <Link href="/?from=game" className="btn-chunk btn-blood px-3 py-3 text-[13px]">
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  خروج
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
