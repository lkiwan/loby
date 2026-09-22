'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RefreshCw, X, Coins, Trophy } from 'lucide-react';
import { StarMark } from '@/components/Star';
import { GAMES } from '@/lib/games';

const EXTERNAL_GAMES: Record<string, string> = {
  'paint-followers': '/game-files/paint-followers/index.html',
  'mafia': '/game-files/mafia/index.html',
  '7azr-fazr': '/game-files/7azr-fazr/index.html',
  'bara-salfa': '/game-files/bara-salfa/index.html',
};

export default function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = use(params);
  const { token } = use(searchParams);
  const baseUrl = EXTERNAL_GAMES[resolvedParams.gameId];
  const externalUrl = token ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : baseUrl;
  const [exitConfirm, setExitConfirm] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);
  const router = useRouter();

  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch('/api/economy/balance');
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins ?? data.balance ?? null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'game-over') {
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
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ gameId: resolvedParams.gameId, paymentMethod: 'coins' }),
      });
      if (res.ok) {
        const { redirectUrl } = await res.json();
        router.replace(redirectUrl);
      } else {
        router.replace('/?from=game');
      }
    } catch {
      router.replace('/?from=game');
    }
  };

  if (!externalUrl) {
    return (
      <div className="scene flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#0d0b08] px-6 text-center">
        <StarMark size={48} />
        <h1 className="font-lalezar text-3xl text-neutral-50">الطاولة ما تلقاتهاش 🥲</h1>
        <p className="font-cairo text-sm font-semibold text-neutral-400">
          هاد اللعبة ماشي موجودة فالمخزن ديالنا.
        </p>
        <Link href="/" className="btn-chunk btn-amber mt-2 px-6 py-3 text-sm">
          رجع للساحة
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* top HUD bar */}
      <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <span className="pointer-events-none flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <StarMark size={18} />
          <span className="font-grit text-[11px] uppercase tracking-wide text-neutral-300">
            {GAMES.find((g) => g.id === resolvedParams.gameId)?.latinTitle ?? resolvedParams.gameId}
          </span>
        </span>
        <button
          onClick={() => setExitConfirm(true)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:border-red-500/40 hover:text-red-400"
          aria-label="خروج من اللعبة"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <iframe
        src={externalUrl}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups"
        title={`Game: ${resolvedParams.gameId}`}
      />

      {gameOver && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="anim-pop relative w-full max-w-xs rounded-2xl border border-[#6b542e]/50 bg-[#171210] p-6 text-center shadow-2xl">
            <div className="mb-3 flex justify-center">
              <Trophy className="h-12 w-12 text-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,.6)]" />
            </div>
            <h2 className="font-lalezar text-2xl text-neutral-50">اللعبة خلصات!</h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-neutral-400">
              شكراً على اللعب
            </p>
            {coins !== null && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="font-lalezar text-xl text-amber-300">{coins}</span>
                <span className="font-cairo text-sm font-semibold text-neutral-400">كولة باقية</span>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={async () => {
                  setGameOver(false);
                  await handlePlayAgain();
                }}
                disabled={replaying}
                className="btn-chunk btn-amber w-full py-3 text-[13px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                ألعب مرة أخرى
              </button>
              <Link href="/?from=game" className="btn-chunk btn-blood w-full py-3 text-[13px]">
                <ArrowRight className="h-4 w-4" />
                رجع للساحة
              </Link>
            </div>
          </div>
        </div>
      )}

      {exitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExitConfirm(false)} />
          <div className="anim-pop relative w-full max-w-xs rounded-2xl border border-[#6b542e]/50 bg-[#171210] p-6 text-center shadow-2xl">
            <h2 className="font-lalezar text-2xl text-neutral-50">بغيتي تخرج من اللعبة؟</h2>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-400">
              تقدموك فهاد الجولة غادي يتضيع.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handlePlayAgain}
                disabled={replaying}
                className="btn-chunk btn-amber w-full py-3 text-[13px]"
              >
                {replaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                ألعب مرة أخرى
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExitConfirm(false)}
                  className="btn-chunk btn-ghost-hollow px-3 py-3 text-[13px]"
                >
                  كمّل اللعب
                </button>
                <Link href="/?from=game" className="btn-chunk btn-blood px-3 py-3 text-[13px]">
                  <ArrowRight className="h-4 w-4" />
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