"use client";

import { Clock3, Gauge, UsersRound } from "lucide-react";
import type { Game } from "@/lib/games";

type GameMetaRowProps = {
  game: Game;
  compact?: boolean;
  className?: string;
};

export function GameMetaRow({ game, compact = false, className = "" }: GameMetaRowProps) {
  const accent = game.starAccent;

  const items = [
    { Icon: UsersRound, label: "لاعبين", value: game.players },
    { Icon: Clock3,     label: "الوقت",  value: game.duration },
    { Icon: Gauge,      label: "المستوى", value: game.difficulty },
  ];

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {items.map(({ Icon, value }) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black font-cairo text-white/70"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
          >
            <Icon className="h-2.5 w-2.5" strokeWidth={2.5} style={{ color: accent }} />
            {value}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-1.5 ${className}`}>
      {items.map(({ Icon, label, value }) => (
        <div
          key={value}
          className="flex flex-col items-center gap-1 rounded-[10px] px-2 py-2"
          style={{
            background: `${accent}0D`,
            border:     `1px solid ${accent}28`,
          }}
        >
          {/* Icon */}
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ background: `${accent}22` }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} style={{ color: accent }} />
          </span>

          {/* Value */}
          <p
            className="font-cairo text-[11.5px] font-black leading-none text-white/90"
          >
            {value}
          </p>

          {/* Label */}
          <p className="font-cairo text-[8.5px] font-semibold leading-none text-white/35">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
