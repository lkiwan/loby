"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Coins, Loader2, Play, Video } from "lucide-react";
import { MAFIA_ART, type Game, GAMES } from "@/lib/games";
import { GameMetaRow } from "@/components/GameMeta";
import { GameTags } from "@/components/GameTag";
import Star from "@/components/Star";

export type GameCardProps = {
  game: Game;
  coins: number;
  loadingAction: "coins" | "ad" | null;
  isBusy: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onWatchAd: () => void;
};

function useRipple() {
  return useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const r    = document.createElement("span");
    r.className  = "btn-ripple-wave";
    r.style.left = `${e.clientX - rect.left - rect.width / 2}px`;
    r.style.top  = `${e.clientY - rect.top  - rect.height / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 560);
  }, []);
}

/* ── Game art (top panel of card) ── */
function GameArt({ game }: { game: Game }) {
  const src = game.isMafia ? MAFIA_ART : game.keyArt;

  if (!src) {
    return (
      <div className="relative h-full w-full overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 55% 35%, ${game.glowAccent}35, transparent 65%), #090d28` }}>
        <div className="absolute -end-6 -top-4 h-44 w-44 rounded-full blur-3xl opacity-50"
          style={{ background: game.glowAccent }} />
        <div className="absolute -bottom-8 -start-5 h-36 w-36 rounded-full blur-3xl opacity-40"
          style={{ background: game.starAccent }} />
        <div className="absolute inset-0 grid place-items-center">
          <Star emoji={game.emoji} accent={game.starAccent} size={80} spin />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#06091e]">
      {!game.isMafia && (
        <>
          <div className="absolute -end-5 -top-3 h-44 w-44 rounded-full blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-75"
            style={{ background: game.glowAccent }} />
          <div className="absolute -bottom-6 -start-4 h-36 w-36 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-65"
            style={{ background: game.starAccent }} />
        </>
      )}
      {game.isMafia && (
        <>
          <div className="absolute -bottom-4 start-1/2 h-20 w-3/4 -translate-x-1/2 rounded-[50%] bg-red-800/50 blur-2xl" />
          <span className="drip" style={{ left: "12%",  height: 28 }} />
          <span className="drip" style={{ left: "48%",  height: 40, animationDelay: "1.3s" }} />
          <span className="drip" style={{ right: "14%", height: 24, animationDelay: "2.5s" }} />
        </>
      )}
      <Image
        src={src}
        alt={game.darijaTitle}
        fill
        priority={game.isMafia}
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-600 group-hover:scale-105"
      />
      {/* subtle vignette at the bottom of the image */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0e26] to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GameCard V2 — glass morphism
   Layout: image (top) + glass content panel (bottom)
   Portrait for regular games, wide horizontal for Mafia
═══════════════════════════════════════════════ */
export default function GameCard({
  game, coins, loadingAction, isBusy, onPlay, onWatchAd,
}: GameCardProps) {
  const canAfford = coins >= game.cost;
  const ripple    = useRipple();
  const accent    = game.starAccent;

  /* Primary button style derived from game palette */
  const playBg = game.isMafia
    ? "linear-gradient(135deg, #dc2626 0%, #ef4444 55%, #fca5a5 130%)"
    : `linear-gradient(135deg, ${game.glowAccent} 0%, ${accent} 100%)`;
  const playShadow = canAfford
    ? game.isMafia
      ? "0 0 20px rgba(239,68,68,0.30), 0 4px 12px rgba(0,0,0,0.40)"
      : `0 0 18px ${accent}50, 0 4px 12px rgba(0,0,0,0.40)`
    : "none";

  return (
    <div className={[
      "group game-card-v2 holo-shimmer flex flex-col overflow-hidden",
      game.isMafia ? "card-mafia spinning-border" : "",
    ].join(" ")}>

      {/* ── per-game accent line at top ── */}
      <div className="absolute inset-x-0 top-0 z-10 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}80, ${accent}, ${accent}80, transparent)`,
          boxShadow:  `0 0 10px ${accent}50`,
        }} />

      {/* ── Mafia FEATURED badge ── */}
      {game.isMafia && (
        <div className="absolute start-3.5 top-3.5 z-20 flex items-center gap-1.5 rounded-full border border-red-500/30 bg-black/65 px-3 py-1 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]" />
          <span className="font-grit text-[9px] uppercase tracking-widest text-red-300">FEATURED</span>
        </div>
      )}

      {/* ── GAME ART ── */}
      <div className={[
        "relative flex-shrink-0 overflow-hidden",
        game.isMafia
          ? "aspect-[16/9] sm:aspect-[21/9] lg:aspect-[32/11]"
          : "aspect-[16/10]",
      ].join(" ")}>
        <GameArt game={game} />

        {/* cost chip — floats over image, top-end corner */}
        <div className="absolute end-3 top-3 z-20 flex items-center gap-1 rounded-full border border-amber-400/30 bg-black/70 px-2.5 py-1 backdrop-blur-sm">
          <Coins className="h-3 w-3 text-amber-400" />
          <span className="font-cairo text-[11px] font-black leading-none text-amber-300">{game.cost}</span>
        </div>
      </div>

      {/* ── GLASS CONTENT PANEL ── */}
      <div className="flex flex-1 flex-col gap-2.5 border-t border-white/[0.05] bg-[rgba(10,14,38,0.95)] p-4 pt-3.5">

        {/* title */}
        <div>
          <h3 className={[
            "font-lalezar leading-tight",
            game.isMafia ? "text-[1.55rem]" : "text-[1.3rem]",
          ].join(" ")}
            style={{ color: accent, textShadow: `0 0 18px ${accent}45` }}>
            {game.darijaTitle}
          </h3>
          <p className="mt-0.5 font-grit text-[8px] uppercase tracking-[0.18em] text-neutral-700">
            {game.latinTitle}
          </p>
        </div>

        {/* meta */}
        <GameMetaRow game={game} />

        {/* desc */}
        <p className="font-cairo text-[11.5px] font-semibold leading-relaxed text-neutral-500 line-clamp-2">
          {game.desc}
        </p>

        {/* tags */}
        <GameTags game={game} />

        {/* thin accent divider */}
        <div className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}22, transparent)` }} />

        {/* ── CTAs ── */}
        <div className="mt-auto flex flex-col gap-1.5">

          {/* PRIMARY */}
          <button
            onClick={(e) => { ripple(e); onPlay(e); }}
            disabled={isBusy || !canAfford}
            className="btn-chunk relative w-full overflow-hidden py-[10px] text-[13px]"
            style={{
              background:  canAfford ? playBg : "rgba(255,255,255,0.04)",
              color:       canAfford ? (game.isMafia ? "#fff" : "#03080e") : "#475569",
              fontWeight:  "900",
              boxShadow:   playShadow,
              border:      canAfford ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-xl bg-black/20">
              {isBusy && loadingAction === "coins"
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Play className="h-3.5 w-3.5 fill-current" />}
            </span>
            {canAfford ? "لعب دابا" : "ماكاينش كوينز"}
          </button>

          {/* SECONDARY */}
          <button
            onClick={onWatchAd}
            disabled={isBusy}
            className="btn-chunk btn-ghost-hollow relative w-full overflow-hidden py-[8px] text-[11px]"
          >
            <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-lg bg-violet-400/12">
              {isBusy && loadingAction === "ad"
                ? <Loader2 className="h-3 w-3 animate-spin text-violet-300" />
                : <Video className="h-3 w-3 text-violet-300" />}
            </span>
            شاهد إعلان ثم العب
            <span className="ms-auto rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 font-cairo text-[9px] font-black leading-none text-neutral-600">
              بدون كوين
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { GAMES };
