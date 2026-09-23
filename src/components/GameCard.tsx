"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, Coins, Loader2, Play, Video, Zap } from "lucide-react";
import { GAMES, MAFIA_ART, type Game } from "@/lib/games";
import Star from "@/components/Star";

type GameCardProps = {
  game: Game;
  coins: number;
  loadingAction: "coins" | "ad" | null;
  isBusy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onPlay: (e: React.MouseEvent) => void;
  onWatchAd: () => void;
};

/* 3D tilt on mouse move */
function TiltCard({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 12;
    el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-10px) scale(1.02)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transition: "transform 0.12s ease",
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* Ripple effect spawner */
function useRipple() {
  return useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple-wave";
    ripple.style.left = `${e.clientX - rect.left - rect.width / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - rect.height / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 560);
  }, []);
}

function GameArt({ game }: { game: Game }) {
  if (game.isMafia) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#0a0010]">
        <Image
          src={MAFIA_ART}
          alt={game.latinTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0010] via-transparent to-black/30" />
        <div className="glow-pulse absolute -bottom-6 start-1/2 h-24 w-3/4 -translate-x-1/2 rounded-[50%] bg-red-700/55 blur-2xl" />

        <span className="drip" style={{ left: "10%", height: 26 }} />
        <span
          className="drip"
          style={{ left: "47%", height: 38, animationDelay: "1.3s" }}
        />
        <span
          className="drip"
          style={{ right: "12%", height: 22, animationDelay: "2.4s" }}
        />

        <div className="absolute inset-x-0 bottom-0 p-3 pb-2">
          <p className="horror-flicker font-grit text-[clamp(1.3rem,5vw,1.75rem)] uppercase leading-none tracking-tight text-horror">
            L&apos;MAFIA
          </p>
          <p className="text-gold-sheen font-grit text-[clamp(0.75rem,2.8vw,1rem)] uppercase tracking-[0.32em]">
            D&apos;LHOUMA
          </p>
        </div>

        <span className="absolute start-3 top-3 rounded-full border border-red-500/45 bg-black/60 px-2.5 py-1 font-cairo text-[9.5px] font-black tracking-wide text-red-400 backdrop-blur-sm">
          ★ FEATURED
        </span>
      </div>
    );
  }

  if (game.keyArt) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#050910]">
        <div
          className="absolute -end-6 -top-4 h-36 w-36 rounded-full opacity-45 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: game.glowAccent }}
        />
        <div
          className="absolute -bottom-8 -start-6 h-32 w-32 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-65"
          style={{ background: game.starAccent }}
        />
        <Image
          src={game.keyArt}
          alt={game.latinTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050910]/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050910]">
      <div
        className="absolute -end-8 -top-6 h-36 w-36 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: game.glowAccent }}
      />
      <div
        className="absolute -bottom-10 -start-8 h-32 w-32 rounded-full opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-65"
        style={{ background: game.starAccent }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="transition-transform duration-500 group-hover:scale-115 group-hover:rotate-8">
          <Star emoji={game.emoji} accent={game.starAccent} size={96} spin />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-2 pb-1 text-center">
        <p
          className="font-lalezar text-[clamp(1.6rem,7.5vw,2.4rem)] leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,.9)]"
          style={{
            color: game.starAccent,
            textShadow: `0 0 22px ${game.starAccent}70`,
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
  expanded,
  onToggle,
  onPlay,
  onWatchAd,
}: GameCardProps) {
  const canAfford = coins >= game.cost;
  const ripple = useRipple();

  return (
    <TiltCard
      className={`group game-card-v2 holo-shimmer ${game.isMafia ? "spinning-border card-mafia" : ""} flex flex-col`}
    >
      {/* Top accent line */}
      {!game.isMafia && (
        <div
          className="absolute inset-x-0 top-0 h-[2px] z-10 rounded-t-[22px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${game.starAccent}90, ${game.starAccent}, ${game.starAccent}90, transparent)`,
            boxShadow: `0 0 12px ${game.starAccent}60`,
          }}
        />
      )}

      {/* Art (desktop) */}
      <div className="relative hidden aspect-[4/5] w-full overflow-hidden rounded-t-[21px] sm:block sm:aspect-auto sm:h-[190px]">
        <GameArt game={game} />

        {/* Hover play overlay */}
        <div className="play-reveal rounded-t-[21px]">
          <button
            onClick={(e) => {
              ripple(e);
              onPlay(e);
            }}
            disabled={isBusy || !canAfford}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden relative"
            style={{
              borderColor: game.starAccent,
              background: `${game.starAccent}28`,
              color: game.starAccent,
              boxShadow: `0 0 20px ${game.starAccent}50`,
            }}
          >
            {isBusy && loadingAction === "coins" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Play className="h-6 w-6 fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom glow fade from art to card (desktop) */}
      <div
        className="pointer-events-none absolute inset-x-0 hidden h-10 z-[5] sm:block"
        style={{
          top: 180,
          background: `linear-gradient(to bottom, ${game.isMafia ? "#0a0010" : "#050910"}, transparent)`,
        }}
      />

      {/* ── Mobile compact card (tap to reveal options) ── */}
      <div className="relative z-10 sm:hidden">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="block w-full text-start"
        >
          {/* Full artwork */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-[21px]">
            <GameArt game={game} />
            <span className="absolute bottom-2 end-2 grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/50 backdrop-blur-sm">
              <ChevronDown
                className={`h-4 w-4 text-white transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </span>
          </div>

          <div className="px-3 pt-2.5">
            {/* Name */}
            <span className="block truncate font-lalezar text-[1.25rem] leading-tight" style={{ color: game.starAccent, textShadow: `0 0 18px ${game.starAccent}60` }}>
              {game.darijaTitle}
            </span>
            <span className="block truncate font-grit text-[8.5px] uppercase tracking-[0.16em] text-neutral-600">
              {game.latinTitle}
            </span>

            {/* Players + cost meta row */}
            <span className="mt-2 flex w-full items-center gap-1.5">
              <span className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-cairo text-[10px] font-black text-neutral-400">
                👥 {game.players}
              </span>
              <span
                className="flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 font-cairo text-[10px] font-black tabular-nums"
                style={{
                  borderColor: `${game.starAccent}50`,
                  background: `${game.starAccent}12`,
                  color: game.starAccent,
                  boxShadow: `0 0 12px ${game.starAccent}22`,
                }}
              >
                <Coins className="h-3 w-3 shrink-0" />
                {game.cost} كوين
              </span>
            </span>
          </div>
        </button>

        {/* Expandable: description + play options */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3">
              <p className="pt-2.5 font-cairo text-[11.5px] font-semibold leading-relaxed text-neutral-500">
                {game.desc}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <button
                  onClick={(e) => {
                    ripple(e);
                    onPlay(e);
                  }}
                  disabled={isBusy || !canAfford}
                  className={`btn-chunk relative overflow-hidden py-2.5 text-[12.5px] ${game.isMafia ? "btn-blood" : "btn-amber"} ${!canAfford ? "opacity-40" : ""}`}
                >
                  {loadingAction === "coins" && isBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  بالعملات
                </button>
                <button
                  onClick={onWatchAd}
                  disabled={isBusy}
                  className="btn-chunk btn-ghost-hollow relative overflow-hidden py-2.5 text-[12.5px]"
                >
                  {loadingAction === "ad" && isBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Video className="h-3.5 w-3.5" />
                  )}
                  إعلان
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop content (unchanged) ── */}
      <div className="relative z-10 hidden flex-1 flex-col gap-2.5 p-4 pt-3 sm:flex">
        {/* Title */}
        <div>
          <p
            className="font-lalezar text-[1.05rem] leading-tight sm:text-[1.3rem]"
            style={{
              color: game.starAccent,
              textShadow: `0 0 18px ${game.starAccent}60`,
            }}
          >
            {game.darijaTitle}
          </p>
          <p className="font-grit text-[8px] uppercase tracking-[0.16em] text-neutral-600 sm:text-[10px] sm:tracking-[0.18em]">
            {game.latinTitle}
          </p>
        </div>

        {/* Description */}
        <p className="font-cairo text-[11.5px] font-semibold leading-relaxed text-neutral-500 line-clamp-2 sm:line-clamp-none">
          {game.desc}
        </p>

        {/* Cost + players */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-cairo text-[10px] font-black text-neutral-400 sm:flex">
            {game.players} 👥
          </span>
          <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-cairo text-[10px] font-black tabular-nums sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]"
            style={{
              borderColor: `${game.starAccent}50`,
              background: `${game.starAccent}12`,
              color: game.starAccent,
              boxShadow: `0 0 12px ${game.starAccent}22`,
            }}
          >
            <Coins className="h-3 w-3" />
            {game.cost} كوين
          </span>
        </div>

        {/* Affordability power bar */}
        <div className="power-bar">
          <div
            className="power-bar-fill"
            style={{
              width: `${Math.min(100, (coins / game.cost) * 100)}%`,
              background: canAfford
                ? `linear-gradient(90deg, ${game.starAccent}, rgba(0,255,136,.8))`
                : `linear-gradient(90deg, rgba(239,68,68,.7), rgba(239,68,68,.4))`,
              boxShadow: canAfford
                ? `0 0 8px ${game.starAccent}60`
                : "0 0 8px rgba(239,68,68,.4)",
            }}
          />
        </div>

        {/* Separator (desktop only) */}
        <div
          className="hidden h-px w-full sm:block"
          style={{
            background: `linear-gradient(90deg, transparent, ${game.starAccent}35, transparent)`,
          }}
        />

        {/* Buttons */}
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          <button
            onClick={(e) => {
              ripple(e);
              onPlay(e);
            }}
            disabled={isBusy || !canAfford}
            className={`btn-chunk relative overflow-hidden py-2.5 text-[12.5px] ${game.isMafia ? "btn-blood" : "btn-amber"} ${!canAfford ? "opacity-40" : ""}`}
          >
            {loadingAction === "coins" && isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            بالعملات
          </button>
          <button
            onClick={onWatchAd}
            disabled={isBusy}
            className="btn-chunk btn-ghost-hollow relative overflow-hidden py-2.5 text-[12.5px]"
          >
            {loadingAction === "ad" && isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Video className="h-3.5 w-3.5" />
            )}
            إعلان
          </button>
        </div>
      </div>
    </TiltCard>
  );
}

export { GAMES };
