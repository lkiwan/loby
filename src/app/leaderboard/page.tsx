'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { StarMark } from '@/components/Star';
import dynamic from 'next/dynamic';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

type Player = {
  rank: number;
  id: string;
  username: string | null;
  level: number;
  streakCount: number;
};

const RANK_MEDAL = ['🥈', '🥉'];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?tab=streak')
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data.players ?? []);
        setLoading(false);
      });
  }, []);

  const king   = players[0] ?? null;
  const rest   = players.slice(1);

  return (
    <div className="relative min-h-dvh bg-[#030812] text-[#f1e7d6]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <StarField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_30%,rgba(242,178,61,.07),transparent_65%)]" />
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
            <span className="font-lalezar text-xl text-neutral-100">الكلاسمون</span>
          </div>
          <StarMark size={28} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-8 sm:px-6">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="section-label mb-3">🏆 طوپ اللعابة</div>
          <h1 className="font-lalezar text-[clamp(2rem,8vw,3rem)] leading-none text-[#f5eddc] text-glow-amber">
            شكون ملك الحومة؟
          </h1>
          <p className="mt-2 font-cairo text-[13px] font-semibold text-neutral-500">
            أحسن 5 لعابة بالستريك 🔥
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : players.length === 0 ? (
          <p className="py-16 text-center font-cairo text-sm text-neutral-600">
            ماكاين حتى لعّاب دابا 🏜️
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">

            {/* ── King card ── */}
            {king && (
              <div className="w-full">
                {/* Crown floats above the card */}
                <div className="mb-[-18px] flex justify-center">
                  <span
                    className="text-5xl leading-none drop-shadow-[0_0_18px_rgba(242,178,61,.9)]"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(242,178,61,.7))' }}
                  >
                    👑
                  </span>
                </div>

                <Link
                  href={`/profile/${king.username}`}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border border-amber-400/45 bg-gradient-to-b from-amber-950/30 via-[#07100f]/60 to-[#060c1a] px-6 pb-6 pt-8 text-center shadow-[0_0_48px_rgba(242,178,61,.14)] transition hover:border-amber-400/65 hover:shadow-[0_0_64px_rgba(242,178,61,.22)]"
                >
                  {/* Avatar */}
                  <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-amber-400/55 bg-amber-950/40 font-cairo text-3xl font-black text-amber-200 shadow-[0_0_24px_rgba(242,178,61,.35)] transition group-hover:shadow-[0_0_36px_rgba(242,178,61,.5)]">
                    {(king.username?.[0] ?? '?').toUpperCase()}
                  </div>

                  {/* Name */}
                  <div>
                    <p className="font-cairo text-[22px] font-black text-amber-100 transition group-hover:text-amber-300">
                      {king.username ?? '—'}
                    </p>
                    <p className="font-grit text-[10px] text-neutral-500 mt-0.5">LV.{king.level}</p>
                  </div>

                  {/* Streak pill */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/35 bg-red-950/25 px-5 py-1.5">
                    <span className="font-cairo text-2xl font-black text-red-300">{king.streakCount}</span>
                    <span className="font-cairo text-sm font-bold text-red-400">يوم 🔥</span>
                  </div>
                </Link>
              </div>
            )}

            {/* ── Ranks 2–5 ── */}
            {rest.length > 0 && (
              <div className="w-full flex flex-col gap-2 mt-2">
                {rest.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/profile/${p.username}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition hover:border-cyan-400/25 hover:bg-white/[0.04]"
                  >
                    {/* Medal / rank */}
                    <div className="w-8 shrink-0 text-center">
                      {i < 2 ? (
                        <span className="text-xl">{RANK_MEDAL[i]}</span>
                      ) : (
                        <span className="font-grit text-[11px] text-neutral-600">#{p.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] font-cairo text-sm font-black text-neutral-400">
                      {(p.username?.[0] ?? '?').toUpperCase()}
                    </div>

                    {/* Name + level */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-cairo text-[14px] font-bold text-neutral-200 transition group-hover:text-cyan-300">
                        {p.username ?? '—'}
                      </p>
                      <p className="font-grit text-[10px] text-neutral-500 mt-0.5">LV.{p.level}</p>
                    </div>

                    {/* Streak */}
                    <span className="shrink-0 font-cairo text-[14px] font-black text-red-400">
                      {p.streakCount} يوم 🔥
                    </span>
                  </Link>
                ))}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
