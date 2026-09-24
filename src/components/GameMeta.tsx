"use client";

import { Clock3, Gauge, UsersRound } from "lucide-react";
import type { Game } from "@/lib/games";

type GameMetaRowProps = {
  game: Game;
  compact?: boolean;
  className?: string;
};

/**
 * Reusable metadata strip for a game card:
 * player count, estimated duration and difficulty level.
 * Uses one icon family (Lucide) with identical weight/size so the
 * hierarchy stays visually consistent across every card.
 */
export function GameMetaRow({ game, compact = false, className = "" }: GameMetaRowProps) {
  const icon = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const text = compact ? "text-[10px]" : "text-[11px]";

  const items = [
    { Icon: UsersRound, value: game.players },
    { Icon: Clock3, value: game.duration },
    { Icon: Gauge, value: game.difficulty },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {items.map(({ Icon, value }) => (
        <span
          key={value}
          className={`inline-flex items-center gap-1 ${text} font-black leading-none text-neutral-400`}
        >
          <Icon className={icon} strokeWidth={2.25} />
          {value}
        </span>
      ))}
    </div>
  );
}