"use client";

import { useCallback, useId, useState } from "react";
import Image from "next/image";
import { ChevronDown, Loader2, Play } from "lucide-react";
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
  onDirectAd?: () => void;
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

/* ── Elaborate Moroccan Arch Frame — 2.0 ── */
function MoroccanArchFrame({ accent, glow, isMafia }: { accent: string; glow: string; isMafia: boolean }) {
  const gradId = `archGrad_${accent.replace('#', '')}`;

  return (
    <svg
      className="arch-svg absolute inset-0 w-full h-full pointer-events-none z-10"
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="20%"  stopColor={accent} stopOpacity="0.5" />
          <stop offset="50%"  stopColor={accent} stopOpacity="1" />
          <stop offset="80%"  stopColor={accent} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* ── Outer arch — main door frame ── */}
      <path
        d="M 5,200 L 5,70 Q 5,5 100,5 Q 195,5 195,70 L 195,200"
        stroke={`url(#${gradId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity={isMafia ? 1 : 0.92}
      />

      {/* ── Inner arch — decorative inlay ── */}
      <path
        d="M 14,200 L 14,73 Q 14,16 100,16 Q 186,16 186,73 L 186,200"
        stroke={glow}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.42"
        strokeDasharray={isMafia ? "none" : "5 8"}
      />

      {/* ── Third arch — inner shadow line ── */}
      <path
        d="M 20,200 L 20,76 Q 20,22 100,22 Q 180,22 180,76 L 180,200"
        stroke={accent}
        strokeWidth="0.6"
        opacity="0.18"
      />

      {/* ── Keystone — apex gem ── */}
      <path d="M 91,5 L 100,0 L 109,5 L 106,14 L 94,14 Z" fill={accent} opacity="0.95" />
      <circle cx="100" cy="9"  r="2.5" fill={glow}   opacity="0.9" />
      <circle cx="100" cy="9"  r="1.2" fill="white"   opacity="0.6" />

      {/* ── Springing point circles (left) ── */}
      <circle cx="5" cy="70" r="5"   fill={accent} opacity="0.55" />
      <circle cx="5" cy="70" r="2.8" fill={glow}   opacity="0.8" />
      <circle cx="5" cy="70" r="1.2" fill="white"   opacity="0.5" />

      {/* ── Springing point circles (right) ── */}
      <circle cx="195" cy="70" r="5"   fill={accent} opacity="0.55" />
      <circle cx="195" cy="70" r="2.8" fill={glow}   opacity="0.8" />
      <circle cx="195" cy="70" r="1.2" fill="white"   opacity="0.5" />

      {/* ── Left column zellige diamonds ── */}
      <polygon points="5,88  9.5,84  14,88  9.5,92"  fill={accent} opacity="0.55" />
      <polygon points="5,103 9.5,99  14,103 9.5,107" fill={glow}   opacity="0.38" />
      <polygon points="5,118 9.5,114 14,118 9.5,122" fill={accent} opacity="0.45" />
      <polygon points="5,133 9.5,129 14,133 9.5,137" fill={glow}   opacity="0.28" />
      <polygon points="5,148 9.5,144 14,148 9.5,152" fill={accent} opacity="0.35" />

      {/* ── Right column zellige diamonds ── */}
      <polygon points="186,88  190.5,84  195,88  190.5,92"  fill={accent} opacity="0.55" />
      <polygon points="186,103 190.5,99  195,103 190.5,107" fill={glow}   opacity="0.38" />
      <polygon points="186,118 190.5,114 195,118 190.5,122" fill={accent} opacity="0.45" />
      <polygon points="186,133 190.5,129 195,133 190.5,137" fill={glow}   opacity="0.28" />
      <polygon points="186,148 190.5,144 195,148 190.5,152" fill={accent} opacity="0.35" />

      {/* ── Arch ornament circles (muqarnas hint) ── */}
      <circle cx="55"  cy="18" r="1.8" fill={glow}   opacity="0.45" />
      <circle cx="145" cy="18" r="1.8" fill={glow}   opacity="0.45" />
      <circle cx="33"  cy="33" r="1.4" fill={accent} opacity="0.32" />
      <circle cx="167" cy="33" r="1.4" fill={accent} opacity="0.32" />
      <circle cx="18"  cy="50" r="1.2" fill={glow}   opacity="0.28" />
      <circle cx="182" cy="50" r="1.2" fill={glow}   opacity="0.28" />

      {/* ── Column base caps ── */}
      <rect x="1"   y="192" width="14" height="8" rx="2.5" fill={accent} opacity="0.5" />
      <rect x="185" y="192" width="14" height="8" rx="2.5" fill={accent} opacity="0.5" />

      {/* ── Horizontal sill ── */}
      <line x1="1" y1="199" x2="199" y2="199" stroke={accent} strokeWidth="1.5" opacity="0.32" />

      {/* ── Sill ornaments ── */}
      <circle cx="10"  cy="195" r="2" fill={glow}   opacity="0.4" />
      <circle cx="190" cy="195" r="2" fill={glow}   opacity="0.4" />
      <polygon points="97,199 100,195 103,199" fill={accent} opacity="0.5" />
    </svg>
  );
}

/* ── Game thumbnail ── */
function GameThumbnail({ game }: { game: Game }) {
  const src = game.logo || (game.isMafia ? MAFIA_ART : game.keyArt);

  if (!src) {
    return (
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
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${game.isMafia ? "bg-[#0a0e1a]" : "bg-[#080C16]"}`}
    >
      {/* Atmospheric glow blobs */}
      {!game.isMafia && (
        <>
          <div
            className="absolute -end-6 -top-4 h-44 w-44 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-85"
            style={{ background: game.glowAccent }}
          />
          <div
            className="absolute -bottom-8 -start-6 h-40 w-40 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-75"
            style={{ background: game.starAccent }}
          />
        </>
      )}

      {/* Mafia special effects */}
      {game.isMafia && (
        <>
          <div
            className="glow-pulse absolute -bottom-6 start-1/2 h-24 w-3/4 -translate-x-1/2 rounded-[50%] blur-2xl"
            style={{ backgroundColor: `${game.glowAccent}88` }}
          />
          <span className="drip" style={{ left: "10%",  height: 26, backgroundColor: game.starAccent }} />
          <span className="drip" style={{ left: "47%",  height: 38, animationDelay: "1.3s", backgroundColor: game.starAccent }} />
          <span className="drip" style={{ right: "12%", height: 22, animationDelay: "2.4s", backgroundColor: game.starAccent }} />
        </>
      )}

      <Image
        src={src}
        alt={game.darijaTitle}
        fill
        priority={game.isMafia}
        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
        className="object-contain transition-transform duration-700 group-hover:scale-108"
      />

      {/* Bottom fade into card body */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#080C16] to-transparent" />

      {/* Inner vignette for depth */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, ${game.glowAccent}40 100%)`,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   GAME DOOR — MOROCCAN DOOR COMPONENT 2.0
   ══════════════════════════════════════════════ */
export default function GameCard({
  game, coins, loadingAction, isBusy, onPlay, onWatchAd, onDirectAd
}: GameCardProps) {
  const canAfford = coins >= game.cost;
  const ripple    = useRipple();
  const accent    = game.starAccent;
  const glow      = game.glowAccent;

  /* Per-card details disclosure — every card keeps its own state */
  const [showDetails, setShowDetails] = useState(false);
  const detailsId = useId();

  return (
    <div
      className="group game-door"
      style={{
        background: '#080C16',
        border:     `1px solid ${accent}28`,
        boxShadow:  `0 0 0 1px ${accent}08, 0 12px 44px rgba(0,0,0,0.65), inset 0 1px 0 ${accent}08`,
      }}
    >
      {/* ── Top zellige shimmer bar ── */}
      <div
        className="door-top-bar"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${glow}70 20%, ${accent} 50%, ${glow}70 80%, transparent 100%)`,
          boxShadow:  `0 0 16px ${accent}60`,
          height: '4px',
        }}
      />

      {/* ── MAFIA FEATURED badge ── */}
      {game.isMafia && (
        <div
          className="door-featured-badge"
          style={{
            borderColor:     `${accent}70`,
            backgroundColor: `rgba(7,17,31,0.88)`,
            color:           accent,
            border:          `1px solid ${accent}70`,
          }}
        >
          <span style={{ color: accent }}>★</span>
          <span className="font-grit text-[9px] uppercase tracking-widest">FEATURED</span>
        </div>
      )}

      {/* ── ARCH IMAGE ZONE ── */}
      <div 
        className="door-img-zone cursor-pointer"
        onClick={onDirectAd || onWatchAd}
      >
        <GameThumbnail game={game} />
        <MoroccanArchFrame accent={accent} glow={glow} isMafia={game.isMafia} />
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="door-content">

        {/* Title block */}
        <div>
          <h3
            className="font-lalezar leading-tight text-[1.52rem]"
            style={{
              color:      accent,
              textShadow: `0 0 20px ${accent}50`,
            }}
          >
            {game.darijaTitle}
          </h3>
          <p className="mt-0.5 font-grit text-[7.5px] uppercase tracking-[0.2em] text-white/30">
            {game.latinTitle}
          </p>
        </div>

        {/* Details toggle — collapsed body = title + toggle + 2 CTAs */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          aria-controls={detailsId}
          className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border py-[7px] font-cairo text-[11px] font-black leading-none transition active:scale-[0.98]"
          style={{
            borderColor: `${accent}33`,
            background:  `${accent}0F`,
            color:       accent,
          }}
        >
          التفاصيل
          <ChevronDown
            aria-hidden="true"
            strokeWidth={3}
            className={`h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── COLLAPSIBLE DETAILS (stats + description + tags + divider) ──
            Height animates 0fr → 1fr; visibility:hidden keeps the closed
            region out of the tab order and off-screen readers. */}
        <div
          id={detailsId}
          className={`door-details${showDetails ? " is-open" : ""}`}
        >
          <div className="door-details-inner">
            <div className="flex flex-col gap-2">
              {/* Meta row */}
              <GameMetaRow game={game} />

              {/* Description block — tagline + body */}
              <div
                className="rounded-[10px] px-3 py-2.5 space-y-1"
                style={{
                  background:        `${accent}0A`,
                  borderInlineStart: `2px solid ${accent}55`,
                }}
              >
                <p
                  className="font-cairo text-[12px] font-black leading-snug"
                  style={{ color: accent }}
                >
                  {game.tagline}
                </p>
                <p className="font-cairo text-[11px] font-semibold leading-relaxed text-white/58 line-clamp-2">
                  {game.desc}
                </p>
              </div>

              {/* Tags */}
              <GameTags game={game} />

              {/* Zellige ornamental divider */}
              <div className="relative flex items-center gap-2 my-0.5">
                <div
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}40)` }}
                />
                <div
                  className="w-1.5 h-1.5 rotate-45 flex-shrink-0"
                  style={{ background: accent, opacity: 0.6 }}
                />
                <div
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, ${accent}40, transparent)` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA BUTTONS — side by side in one row ── */}
        <div className="mt-auto flex gap-2">

          {/* PRIMARY — لعب دايا (solid red matching reference) */}
          <button
            onClick={(e) => { ripple(e); onPlay(e); }}
            disabled={isBusy || !canAfford}
            className="btn-chunk relative flex-1 min-w-0 overflow-hidden whitespace-nowrap py-[11px] px-1 text-[14px] rounded-[16px] font-cairo font-black"
            style={{
              background:  "rgba(194,52,26,0.95)",
              border:      "1px solid rgba(220,80,40,0.6)",
              color:       "#FFFFFF",
              textShadow:  "0 1px 3px rgba(0,0,0,.5)",
              boxShadow:   canAfford
                ? "0 4px 0 rgba(140,20,5,0.8), 0 10px 20px rgba(190,40,10,0.35)"
                : "none",
              opacity:     !canAfford ? 0.42 : 1,
            }}
          >
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-xl bg-white/18 shadow-inner">
              {isBusy && loadingAction === "coins"
                ? <Loader2 className="h-[14px] w-[14px] animate-spin" />
                : <Play className="h-[14px] w-[14px] fill-current" />}
            </span>
            لعب دايا
          </button>

          {/* SECONDARY — AD | تفرج على الإشهار */}
          <button
            onClick={onWatchAd}
            disabled={isBusy}
            className="btn-chunk relative flex-1 min-w-0 overflow-hidden whitespace-nowrap py-[8px] px-1 rounded-[14px] font-cairo font-black flex items-center justify-center"
            style={{
              background: "rgba(232,180,48,0.1)",
              border:     "1px solid rgba(232,180,48,0.32)",
              /* .btn-chunk (unlayered) sets gap:.5rem — shrink inline so the
                 label fits the half-width button without wrapping */
              gap:        "6px",
            }}
          >
            <span
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md font-black text-[8px]"
              style={{ background: "rgba(232,180,48,0.85)", color: "#060810" }}
            >
              AD
            </span>
            <span className="font-cairo text-[10.5px] font-black" style={{ color: "#E8B430" }}>
              {isBusy && loadingAction === "ad"
                ? <Loader2 className="h-3 w-3 animate-spin inline" />
                : "تفرج على الإشهار"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { GAMES };
