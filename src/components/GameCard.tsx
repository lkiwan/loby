"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Coins, Loader2, Play, Video } from "lucide-react";
import { MAFIA_ART, type Game, GAMES } from "@/lib/games";
import { GameMetaRow } from "@/components/GameMeta";
import { GameTags } from "@/components/GameTag";
import Star from "@/components/Star";

/* ─────────────────────────────────────────────────────────────
   Props — no expanded/onToggle: content is always fully visible.
   The old mobile-accordion has been removed.
───────────────────────────────────────────────────────────── */
export type GameCardProps = {
  game: Game;
  coins: number;
  loadingAction: "coins" | "ad" | null;
  isBusy: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onWatchAd: () => void;
};

/* ── Ripple effect on button press ── */
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

/* ─────────────────────────────────────────────────────────────
   Thumbnail — renders once, handles all game art variants.
   Mafia: full horror treatment (drips, glow, "FEATURED" badge).
   keyArt games: photo with accent colour glows.
   Fallback: animated star emoji.
───────────────────────────────────────────────────────────── */
function GameThumbnail({ game }: { game: Game }) {
  const src = game.isMafia ? MAFIA_ART : (game.logo || game.keyArt);

  if (!src) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#12294D]">
        <div className="absolute -end-8 -top-6 h-36 w-36 rounded-full opacity-50 blur-2xl"
          style={{ background: game.glowAccent }} />
        <div className="absolute -bottom-10 -start-8 h-32 w-32 rounded-full opacity-45 blur-2xl"
          style={{ background: game.starAccent }} />
        <div className="absolute inset-0 grid place-items-center">
          <Star emoji={game.emoji} accent={game.starAccent} size={88} spin />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${game.isMafia ? "bg-[#0b1a32]" : "bg-[#12294D]"}`}>
      {/* accent glows behind the photo (non-Mafia only) */}
      {!game.isMafia && (
        <>
          <div className="absolute -end-6 -top-4 h-40 w-40 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
            style={{ background: game.glowAccent }} />
          <div className="absolute -bottom-8 -start-6 h-36 w-36 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-85"
            style={{ background: game.starAccent }} />
        </>
      )}

      {/* Mafia horror effects */}
      {game.isMafia && (
        <>
          <div className="glow-pulse absolute -bottom-6 start-1/2 h-24 w-3/4 -translate-x-1/2 rounded-[50%] blur-2xl"
               style={{ backgroundColor: `${game.glowAccent}88` }} />
          <span className="drip" style={{ left: "10%",  height: 26, backgroundColor: game.starAccent }} />
          <span className="drip" style={{ left: "47%",  height: 38, animationDelay: "1.3s", backgroundColor: game.starAccent }} />
          <span className="drip" style={{ right: "12%", height: 22, animationDelay: "2.4s", backgroundColor: game.starAccent }} />
          <span className="absolute start-4 top-4 z-10 rounded-full border px-3 py-1 font-cairo text-[10px] font-black tracking-wide backdrop-blur-sm"
                style={{ borderColor: `${game.starAccent}75`, backgroundColor: "#12294D99", color: game.starAccent }}>
            ★ FEATURED
          </span>
        </>
      )}

      <Image
        src={src}
        alt={game.darijaTitle}
        fill
        priority={game.isMafia}
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* bottom fade so the card border shows cleanly */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#12294D] to-transparent" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GameCard — ONE component for ALL games.

   Layout rules (via Tailwind responsive classes, no JS):
     • Regular games  → always flex-col (vertical card)
     • Mafia          → flex-col on mobile, flex-row on lg+
       (handled by the wrapper col-span in page.tsx + game.isMafia
        flag below)

   Content renders ONCE — no hidden duplicates, no accordion.
───────────────────────────────────────────────────────────── */
export default function GameCard({
  game, coins, loadingAction, isBusy, onPlay, onWatchAd,
}: GameCardProps) {
  const canAfford = coins >= game.cost;
  const ripple    = useRipple();
  const accent    = game.starAccent;

  /* Primary button gradient derived from the game's own palette */
  const btnBg = `linear-gradient(135deg,${game.glowAccent} 0%,${accent} 100%)`;
  const btnShadow = canAfford
    ? `0 5px 0 ${accent}88, 0 12px 24px ${accent}28`
    : "none";

  return (
    <div className={[
      "group navy-card flex overflow-hidden rounded-[24px] bg-[#12294D] border border-[#F5B942]/30 transition-all duration-300 hover:border-[#2DD4BF]/50",
      /* Mafia: side-by-side on large screens */
      game.isMafia
        ? "card-mafia flex-col lg:flex-row"
        : "flex-col",
    ].join(" ")}>

      {/* ── per-game accent top border ── */}
      <div className="absolute inset-x-0 top-0 z-10 h-[2px]"
        style={{
          background: `linear-gradient(90deg,transparent,#F5B94290,#F5B942,#F5B94290,transparent)`,
          boxShadow:  `0 0 14px #F5B94265`,
        }} />

      {/* ══════════════════════
          THUMBNAIL (once)
      ══════════════════════ */}
      <div className={[
        "relative flex-shrink-0 overflow-hidden",
        game.isMafia
          /* mobile: wide banner; desktop: auto height filling the row */
          ? "aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:w-[52%]"
          : "aspect-[16/10]",
      ].join(" ")}>
        <GameThumbnail game={game} />
      </div>

      {/* ══════════════════════
          CONTENT (once)
      ══════════════════════ */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 pt-3.5">

        {/* Title */}
        <div>
          <h3 className={[
            "font-lalezar leading-tight",
            game.isMafia ? "text-[1.65rem]" : "text-[1.35rem]",
          ].join(" ")}
            style={{ color: accent, textShadow: `0 0 20px ${accent}60` }}>
            {game.darijaTitle}
          </h3>
          <p className="mt-0.5 font-grit text-[8px] uppercase tracking-[0.18em] text-[#B8C4D8]">
            {game.latinTitle}
          </p>
        </div>

        {/* Metadata: players · duration · difficulty */}
        <GameMetaRow game={game} />

        {/* Description */}
        <p className="font-cairo text-[11.5px] font-semibold leading-relaxed text-[#B8C4D8] line-clamp-2">
          {game.desc}
        </p>

        {/* Category tags */}
        <GameTags game={game} />

        {/* Thin accent divider */}
        <div className="h-px w-full"
          style={{ background: `linear-gradient(90deg,transparent,${accent}30,transparent)` }} />

        {/* ── CTAs (each renders exactly ONCE) ── */}
        <div className="mt-auto flex flex-col gap-1.5">

          {/* PRIMARY — لعب دابا */}
          <button
            onClick={(e) => { ripple(e); onPlay(e); }}
            disabled={isBusy || !canAfford}
            className="btn-chunk relative w-full overflow-hidden py-[11px] text-[14px] rounded-[16px]"
            style={{
              background:  btnBg,
              color:       "#FFF7E8",
              textShadow:  "0 1px 3px rgba(0,0,0,.4)",
              boxShadow:   btnShadow,
              opacity:     !canAfford ? 0.42 : 1,
            }}
          >
            {/* play icon zone */}
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner">
              {isBusy && loadingAction === "coins"
                ? <Loader2 className="h-[15px] w-[15px] animate-spin" />
                : <Play className="h-[15px] w-[15px] fill-current" />}
            </span>
            لعب دابا
            {/* coin cost badge */}
            <span className="ms-auto flex items-center gap-1 rounded-full border border-amber-400/45 bg-amber-400/10 px-2 py-[4px] font-cairo text-[10px] font-black leading-none text-amber-300">
              <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-amber-400/25">
                <Coins className="h-2.5 w-2.5 text-amber-400" />
              </span>
              {game.cost}
            </span>
          </button>

          {/* SECONDARY — شاهد إعلان ثم العب */}
          <button
            onClick={onWatchAd}
            disabled={isBusy}
            className="btn-chunk relative w-full overflow-hidden py-[9px] text-[11.5px] text-[#B8C4D8] rounded-[16px] bg-[#12294D] border border-[#F5B942]/40 hover:bg-[#F5B942]/10"
          >
            {/* video icon zone */}
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-[#2DD4BF]/15">
              {isBusy && loadingAction === "ad"
                ? <Loader2 className="h-[13px] w-[13px] animate-spin text-[#2DD4BF]" />
                : <Video className="h-[13px] w-[13px] text-[#2DD4BF]" />}
            </span>
            شاهد إعلان ثم العب
            <span className="ms-auto rounded-full border border-[#F5B942]/30 bg-[#F5B942]/10 px-2 py-0.5 font-cairo text-[9px] font-black leading-none text-[#FFF7E8]">
              بدون كوين
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { GAMES };
