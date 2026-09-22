'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { StarMark } from '@/components/Star';
import dynamic from 'next/dynamic';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

type Player = {
  rank: number;
  id: string;
  username: string | null;
  coins: number;
  xp: number;
  level: number;
  streakCount: number;
};

const TABS = [
  { id: 'coins', label: 'عملات', icon: '🪙' },
  { id: 'xp',    label: 'XP',    icon: '⚡' },
  { id: 'streak', label: 'سلسلة', icon: '🔥' },
] as const;

type Tab = typeof TABS[number]['id'];

const MEDALS = ['🥇', '🥈', '🥉'];

function getValue(p: Player, tab: Tab) {
  if (tab === 'xp')     return `${p.xp.toLocaleString()} XP`;
  if (tab === 'streak') return `${p.streakCount} يوم 🔥`;
  return `${p.coins.toLocaleString()} 🪙`;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('coins');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?tab=${tab}`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players ?? []);
        setLoading(false);
      });
  }, [tab]);

  return (
    <div className="relative min-h-dvh bg-[#030812] text-[#f1e7d6]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <StarField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_30%,rgba(242,178,61,.06),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,transparent_25%,rgba(3,8,18,.9)_100%)]" />
      </div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-cairo text-sm font-bold text-neutral-400 transition hover:text-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            رجع
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(242,178,61,.5)]" />
            <span className="font-lalezar text-xl text-neutral-100">المتصدرون</span>
          </div>
          <StarMark size={28} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="section-label mb-3">🏆 ساحة النجوم</div>
          <h1 className="font-lalezar text-[clamp(2rem,8vw,3.2rem)] leading-none text-[#f5eddc] text-glow-amber">
            من هو ملك الحومة؟
          </h1>
          <p className="mt-2 font-cairo text-[13px] font-semibold text-neutral-500">
            أكبر 50 لاعب في المنصة 👑
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex justify-center">
          <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-cairo text-[13px] font-black transition ${
                  tab === t.id
                    ? 'bg-cyan-400/12 text-cyan-300 border border-cyan-400/25'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Players */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((p, i) => (
              <Link
                key={p.id}
                href={`/profile/${p.username}`}
                className={`group flex items-center gap-3 rounded-xl border p-4 transition ${
                  i < 3
                    ? 'border-amber-400/20 bg-amber-950/[0.08] hover:border-amber-400/35'
                    : 'border-white/[0.05] bg-white/[0.015] hover:border-cyan-400/20 hover:bg-white/[0.035]'
                }`}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {i < 3 ? (
                    <span className="text-2xl">{MEDALS[i]}</span>
                  ) : (
                    <span className="font-grit text-[11px] text-neutral-600">#{p.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border font-cairo text-sm font-black ${
                    i === 0
                      ? 'border-amber-400/40 bg-amber-950/30 text-amber-300'
                      : i === 1
                      ? 'border-neutral-400/30 bg-neutral-800/30 text-neutral-300'
                      : i === 2
                      ? 'border-orange-500/30 bg-orange-950/20 text-orange-400'
                      : 'border-white/[0.07] bg-white/[0.03] text-neutral-500'
                  }`}
                >
                  {(p.username?.[0] ?? '?').toUpperCase()}
                </div>

                {/* Name + level */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-cairo text-[14px] font-bold text-neutral-200 transition group-hover:text-cyan-300">
                    {p.username ?? '—'}
                  </p>
                  <p className="font-grit text-[10px] text-neutral-600 mt-0.5">LV.{p.level}</p>
                </div>

                {/* Value */}
                <span
                  className={`shrink-0 font-cairo text-[14px] font-black ${
                    tab === 'streak'
                      ? 'text-red-400'
                      : tab === 'xp'
                      ? 'text-purple-400'
                      : 'text-amber-400'
                  }`}
                >
                  {getValue(p, tab)}
                </span>
              </Link>
            ))}

            {players.length === 0 && (
              <p className="py-16 text-center font-cairo text-sm text-neutral-600">
                ما كاين حتى لاعب دابا 🏜️
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
