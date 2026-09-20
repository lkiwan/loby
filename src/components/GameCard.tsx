'use client';

import Image from 'next/image';
import { Coins, Loader2, Play, Sparkles, Video } from 'lucide-react';
import { GAMES, MAFIA_ART, type Game } from '@/lib/games';
import Star from '@/components/Star';

type GameCardProps = {
  game: Game;
  coins: number;
  loadingAction: 'coins' | 'ad' | null;
  isBusy: boolean;
  onPlay: () => void;
  onWatchAd: () => void;
};

/** Per-game "poster" header — the actual logo work. */
function GameArt({ game, isFeatured }: { game: Game; isFeatured: boolean }) {
  if (game.isMafia) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#1a0505]">
        {/* real mafia key-art from the game folder */}
        <Image
          src={MAFIA_ART}
          alt={game.latinTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={isFeatured}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12030a] via-transparent to-black/40" />
        <div className="glow-pulse absolute -bottom-10 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-[50%] bg-[#DC2626]/60 blur-2xl" />

        {/* strip of hanging blood */}
        <span className="drip" style={{ left: '12%', height: 22 }} />
        <span className="drip" style={{ left: '47%', height: 34, animationDelay: '1.2s' }} />
        <span className="drip" style={{ right: '14%', height: 18, animationDelay: '2.1s' }} />

        <div className="absolute inset-x-0 bottom-0 p-3 pb-2.5">
          <p className="horror-flicker font-grit text-[clamp(1.35rem,5vw,1.7rem)] uppercase leading-none tracking-tight text-horror">
            L&apos;MAFIA
          </p>
          <p className="text-gold-sheen font-grit text-[clamp(0.85rem,3vw,1rem)] uppercase tracking-[0.3em]">
            D&apos;LHOUMA
          </p>
        </div>
        {isFeatured && (
          <span className="absolute left-3 top-3 rounded-full border border-[#DC2626]/50 bg-black/60 px-2.5 py-1 font-cairo text-[10px] font-black tracking-wide text-[#EF4444] backdrop-blur-sm">
            ★ FEATURED
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="paper-card relative h-full w-full">
      {/* tinted glow behind the sticker */}
      <div
        className="absolute -right-10 -top-8 h-36 w-36 rounded-full opacity-50 blur-2xl"
        style={{ background: game.glowAccent }}
      />
      <div
        className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: game.starAccent }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1">
          <Star emoji={game.emoji} accent={game.starAccent} size={96} spin />
        </div>
      </div>

      {/* washi tape */}
      <span
        className="absolute left-1/2 top-2.5 h-3.5 w-14 -translate-x-1/2 rotate-2 rounded-[3px] border border-[#2a2118]/30"
        style={{ background: 'rgba(242,178,61,.85)' }}
      />
      <span
        className="absolute left-1/2 top-2.5 h-3.5 w-12 -translate-x-1/2 -rotate-3 rounded-[3px] border border-[#2a2118]/25"
        style={{ background: 'rgba(255,249,236,.7)' }}
      />

      <div className="absolute inset-x-0 bottom-0 pb-3 text-center">
        <p
          className="font-lalezar text-[clamp(1.8rem,8.5vw,2.6rem)] leading-none"
          style={{
            color: '#2A2118',
            textShadow: '2px 2px 0 rgba(242,178,61,.9)',
          }}
        >
          {game.darijaTitle}
        </p>
      </div>
    </div>
  );
}

export default function GameCard({
  game,
  coins,
  loadingAction,
  isBusy,
  onPlay,
  onWatchAd,
}: GameCardProps) {
  const canAfford = coins >= game.cost;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)]">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <GameArt game={game} isFeatured={game.id === 'mafia'} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-grit text-[0.95rem] uppercase leading-tight tracking-wide text-neutral-100">
              {game.latinTitle}
            </h3>
            <p className="mt-0.5 font-cairo text-[13px] font-bold text-neutral-400">
              {game.darijaTitle}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-cairo text-[10px] font-black text-neutral-300">
            {game.players} 👥
          </span>
        </div>

        <p className="font-cairo text-[12.5px] font-semibold leading-relaxed text-neutral-400">
          {game.desc}
        </p>

        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 font-cairo text-[11px] font-black">
              <Sparkles className="h-3 w-3 text-neutral-400" />
              {game.tag}
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] font-black text-amber-400">
              <Coins className="h-4 w-4" />
              {game.cost}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPlay}
              disabled={isBusy || !canAfford}
              className={`btn-chunk px-3 py-2.5 text-[13px] ${
                game.isMafia ? 'btn-blood' : 'btn-amber'
              }`}
              title={canAfford ? `Play for ${game.cost} coins` : 'Not enough coins'}
            >
              {loadingAction === 'coins' && isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>العب بالعملات</span>
            </button>
            <button
              onClick={onWatchAd}
              disabled={isBusy}
              className="btn-chunk btn-ghost-hollow px-3 py-2.5 text-[13px]"
            >
              {loadingAction === 'ad' && isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              <span>شاهد إعلان</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export { GAMES };