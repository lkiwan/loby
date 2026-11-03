"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { Game } from "@/lib/games";
import Star from "@/components/Star";
import { SolarStar, SolarClock, SolarTv, SolarUsersGroup } from "@/components/SolarIcon";

export type GameCardProps = {
  game: Game;
  coins: number;
  loadingAction: "coins" | "ad" | null;
  isBusy: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onWatchAd: () => void;
  onDirectAd?: () => void;
};

function useRipple() {
  return useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "btn-ripple-wave";
    r.style.left = `${e.clientX - rect.left - rect.width / 2}px`;
    r.style.top = `${e.clientY - rect.top - rect.height / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 560);
  }, []);
}

/* ══════════════════════════════════════════════
   STORE POSTERS game card (redesign port)
   Clean text-free poster fills the card; the game name is HTML text
   (Nunito 900) over a bottom fade, ONE meta line, a gold-coin price
   pill, and exactly two buttons — "Play" (coins flow) and "Free"
   (rewarded-ad flow). All handlers/disabled logic are the original
   ones; only the presentation changed.
   ══════════════════════════════════════════════ */
export default function GameCard({
  game,
  coins,
  loadingAction,
  isBusy,
  onPlay,
  onWatchAd,
  onDirectAd,
}: GameCardProps) {
  const canAfford = coins >= game.cost;
  const ripple = useRipple();
  const poster = game.poster || game.keyArt || game.logo;

  return (
    <article
      className="group relative aspect-[3/4.05] overflow-hidden rounded-[20px] border bg-[var(--panel)]"
      style={{ borderColor: "var(--line)" }}
    >
      {/* ── Poster (click = the ad flow, as before) ── */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onDirectAd || onWatchAd}
      >
        {poster ? (
          <Image
            src={poster}
            alt={game.darijaTitle}
            fill
            priority={game.isMafia}
            sizes="(max-width:640px) 80vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ objectPosition: "50% 30%" }}
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-[#080C16]">
            <div
              className="absolute -end-8 -top-6 h-36 w-36 rounded-full opacity-50 blur-2xl"
              style={{ background: game.glowAccent }}
            />
            <div
              className="absolute -bottom-10 -start-8 h-32 w-32 rounded-full opacity-45 blur-2xl"
              style={{ background: game.starAccent }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <Star emoji={game.emoji} accent={game.starAccent} size={88} spin />
            </div>
          </div>
        )}
      </div>

      {/* ── Diagonal-cut corner (bg-coloured notch, preview style) ── */}
      <div className="cut-notch z-[2]" aria-hidden="true" />

      {/* ── Top-left stack: price pill (+ FEATURED tag on Mafia) ── */}
      <div className="absolute left-2.5 top-2.5 z-[3] flex flex-col items-start gap-1.5">
        <span
          className="inline-flex items-center gap-[5px] rounded-full py-1 pe-2.5 ps-1 font-nunito text-[12.5px] font-black"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--lime)",
          }}
        >
          <span
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #FFF3C4, #FFC53D 60%, #E8A00C)",
              color: "#7A5200",
            }}
            aria-hidden="true"
          >
            ★
          </span>
          {game.cost}
        </span>
        {game.isMafia && (
          <span
            className="inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 font-nunito text-[10px] font-black uppercase tracking-[0.6px] text-white"
            style={{
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <SolarStar className="h-[11px] w-[11px] shrink-0" style={{ color: "var(--gold)" }} />
            Featured
          </span>
        )}
      </div>

      {/* ── Bottom fade ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[66%]"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.95))",
        }}
        aria-hidden="true"
      />

      {/* ── Bottom stack: title · meta · buttons ── */}
      <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col justify-end p-[11px] pt-0">
        <h3
          className="font-nunito text-[17.5px] font-black uppercase leading-[1.08] tracking-[0.3px] text-white"
          style={{
            textShadow:
              "0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)",
          }}
        >
          {game.latinTitle}
        </h3>

        {/* ONE meta line: players · duration (the game's own data) */}
        <div
          className="mt-1 flex items-center gap-[5px] whitespace-nowrap font-cairo text-[11.5px] font-extrabold text-[#EDEDF5]"
          style={{ textShadow: "0 2px 8px #000" }}
        >
          <SolarUsersGroup className="h-[12.5px] w-[12.5px] shrink-0" />
          <span>{game.players}</span>
          <span aria-hidden="true">·</span>
          <SolarClock className="h-[12.5px] w-[12.5px] shrink-0" />
          <span>{game.duration}</span>
        </div>

        {/* ── Two buttons: Play (coins) · Free (ad) ── */}
        <div className="mt-[9px] flex gap-[7px]">
          <button
            type="button"
            onClick={(e) => {
              ripple(e);
              onPlay(e);
            }}
            disabled={isBusy || !canAfford}
            className="relative flex h-[38px] flex-1 items-center justify-center gap-[5px] overflow-hidden whitespace-nowrap rounded-[11px] font-nunito text-[13px] font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            style={{ background: "var(--lime)", color: "#131803" }}
          >
            {isBusy && loadingAction === "coins" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Play"
            )}
          </button>
          <button
            type="button"
            onClick={onWatchAd}
            disabled={isBusy}
            className="relative flex h-[38px] flex-1 items-center justify-center gap-[5px] overflow-hidden whitespace-nowrap rounded-[11px] font-nunito text-[13px] font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
          >
            {isBusy && loadingAction === "ad" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <SolarTv className="h-[14px] w-[14px] shrink-0" />
                Free
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export { GAMES } from "@/lib/games";
