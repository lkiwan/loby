"use client";

import {
  Brain, Clapperboard, CircleHelp, Eye, Flame, Ghost, Laugh,
  Lightbulb, MessagesSquare, Palette, ScanSearch, Search, Skull,
  Tag, Users, type LucideIcon, Crosshair,
} from "lucide-react";
import type { Game } from "@/lib/games";

/* One Lucide icon per game category — single icon family, consistent
   stroke/size. Labels not in the map fall back to a neutral tag icon. */
const TAG_ICONS: Record<string, LucideIcon> = {
  'صراحة': MessagesSquare,
  'ضحك': Laugh,
  'مرح': Laugh,
  'تحدي': Flame,
  'تحقيق': Search,
  'صحاب': Users,
  'ذكاء': Brain,
  'مراقبة': Eye,
  'تحليل': ScanSearch,
  'إبداع': Palette,
  'رسم': Palette,
  'تخمام': Lightbulb,
  'أدوار': Clapperboard,
  'تكتيك': Crosshair,
  'جريمة': Skull,
  'الكدوب': Ghost,
  'أسئلة': CircleHelp,
};

type GameTagsProps = {
  game: Game;
  compact?: boolean;
  className?: string;
};

export function GameTags({ game, compact = false, className = "" }: GameTagsProps) {
  const icon = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const text = compact ? "text-[9.5px]" : "text-[10px]";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {(game.tags ?? []).slice(0, 3).map((label) => {
        const Icon = TAG_ICONS[label] ?? Tag;
        return (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border px-1.5 py-1"
            style={{
              borderColor: `${game.starAccent}50`,
              background: `${game.starAccent}12`,
              color: game.starAccent,
            }}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px]"
              style={{ background: `${game.starAccent}28` }}
            >
              <Icon className={compact ? "h-2.5 w-2.5" : "h-[11px] w-[11px]"} strokeWidth={2.5} />
            </span>
            <span className={`font-cairo font-black leading-none ${text} pe-0.5`}>{label}</span>
          </span>
        );
      })}
    </div>
  );
}