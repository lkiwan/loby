"use client";

import Image from "next/image";
import { MAFIA_ART, type Game } from "@/lib/games";
import Star from "@/components/Star";

type GameIconProps = {
  game?: Game | null;
  size?: number;
  className?: string;
};

/**
 * Structured circular icon for a game: the game's photo inside a
 * round accent ring with a soft glow. Falls back to the star emblem
 * + emoji when the game has no photo.
 */
export default function GameIcon({ game, size = 96, className = "" }: GameIconProps) {
  const accent = game?.starAccent ?? "#f2b23d";
  const art = game?.isMafia ? MAFIA_ART : game?.keyArt;

  if (!art) {
    return (
      <div
        className={`inline-grid place-items-center ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Star emoji={game?.emoji ?? "🎮"} accent={accent} size={size} spin />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 22px ${accent}55, inset 0 0 0 2px ${accent}99, inset 0 0 20px rgba(0,0,0,.45)`,
      }}
      aria-hidden
    >
      <Image src={art} alt="" fill sizes={`${size}px`} className="object-cover" />
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.4), transparent 55%)" }}
      />
    </div>
  );
}