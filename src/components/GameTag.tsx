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
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
            style={{
              borderColor: `${game.starAccent}55`,
              background: `${game.starAccent}14`,
              color: game.starAccent,
            }}
          >
            <Icon className={icon} strokeWidth={2.25} />
            <span className={`font-cairo font-black leading-none ${text}`}>{label}</span>
          </span>
        );
      })}
    </div>
  );
}