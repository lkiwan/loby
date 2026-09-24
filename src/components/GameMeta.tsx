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
    <div className={`flex items-stretch divide-x divide-white/[0.08] overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] ${className}`}>
      {items.map(({ Icon, value }) => (
        <span
          key={value}
          className={`inline-flex items-center gap-2 px-3 py-1.5 ${text} font-black leading-none text-neutral-300`}
        >
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
            style={{ background: `${game.starAccent}22` }}
          >
            <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={2.5} style={{ color: game.starAccent }} />
          </span>
          {value}
        </span>
      ))}
    </div>
  );
}