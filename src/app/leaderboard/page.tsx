'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Loader2 } from 'lucide-react';
import { StarMark } from '@/components/Star';

type Player = {
  rank: number;
  id: string;
  username: string | null;
  level: number;
  streakCount: number;
};

const RANK_COLORS = [
  { medal: '🥇', border: 'rgba(245,200,66,0.55)', bg: 'rgba(245,200,66,0.06)', streak: '#F5C842', shadow: 'rgba(245,200,66,0.25)' },
  { medal: '🥈', border: 'rgba(180,180,200,0.4)',  bg: 'rgba(180,180,200,0.04)', streak: '#C0C0D0', shadow: 'rgba(180,180,200,0.12)' },
  { medal: '🥉', border: 'rgba(199,91,57,0.4)',    bg: 'rgba(199,91,57,0.05)',  streak: '#C75B39', shadow: 'rgba(199,91,57,0.12)' },
];

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

  const king = players[0] ?? null;
  const rest = players.slice(1);

  return (
    <div className="relative min-h-dvh bg-[#07111F] text-white" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full opacity-[0.08] blur-3xl"
          style={{ background: '#D8A62A' }} />
        <div className="absolute bottom-1/3 left-0 h-[250px] w-[250px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: '#6D3CCF' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-3 pb-2">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between rounded-full px-4"
          style={{ background: 'rgba(7,17,31,0.94)', backdropFilter: 'blur(24px)', border: '1px solid rgba(216,166,42,0.14)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          <Link href="/"
            className="flex items-center gap-2 font-cairo text-sm font-bold transition"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <ArrowRight className="h-4 w-4" />
            رجع
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" style={{ color: '#D8A62A', filter: 'drop-shadow(0 0 8px rgba(216,166,42,0.6))' }} />
            <span className="font-lalezar text-[17px] text-white">الكلاسمون</span>
          </div>
          <StarMark size={26} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pb-8 pt-6 sm:px-6">

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="section-label mb-3">🏆 طوپ اللعابة</div>
          <h1 className="font-lalezar leading-none text-white" style={{ fontSize: 'clamp(2rem,8vw,3rem)', textShadow: '0 0 30px rgba(216,166,42,0.35)' }}>
            شكون ملك الحومة؟
          </h1>
          <p className="mt-2 font-cairo text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>
            أحسن 5 لعابة بالستريك 🔥
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="pulse-glow-ring grid h-12 w-12 place-items-center rounded-full border-2"
              style={{ borderColor: 'rgba(216,166,42,0.4)' }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#D8A62A' }} />
            </div>
          </div>
        ) : players.length === 0 ? (
          <p className="py-16 text-center font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ماكاين حتى لعّاب دابا 🏜️
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">

            {/* ── King card ── */}
            {king && (
              <div className="w-full">
                {/* Crown */}
                <div className="mb-[-18px] flex justify-center">
                  <span className="text-5xl leading-none" style={{ filter: 'drop-shadow(0 0 16px rgba(216,166,42,0.9))' }}>
                    👑
                  </span>
                </div>

                <Link href={`/profile/${king.username}`}
                  className="group relative flex flex-col items-center gap-3 rounded-[22px] px-6 pb-6 pt-8 text-center transition"
                  style={{ background: 'linear-gradient(160deg,rgba(216,166,42,0.1) 0%,rgba(9,22,40,0.98) 60%)', border: '1px solid rgba(216,166,42,0.45)', boxShadow: '0 0 48px rgba(216,166,42,0.12), 0 16px 40px rgba(0,0,0,0.6)' }}>
                  {/* Top arch bar */}
                  <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[22px]"
                    style={{ background: 'linear-gradient(90deg,transparent,#D8A62A,#F5C842,#D8A62A,transparent)', boxShadow: '0 0 16px rgba(216,166,42,0.6)' }} />

                  {/* Avatar */}
                  <div className="grid h-20 w-20 place-items-center rounded-full font-cairo text-3xl font-black transition"
                    style={{ background: 'rgba(216,166,42,0.12)', border: '2px solid rgba(216,166,42,0.55)', color: '#D8A62A', boxShadow: '0 0 24px rgba(216,166,42,0.35)' }}>
                    {(king.username?.[0] ?? '?').toUpperCase()}
                  </div>

                  {/* Name */}
                  <div>
                    <p className="font-cairo text-[22px] font-black text-white">{king.username ?? '—'}</p>
                    <p className="font-grit text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>LV.{king.level}</p>
                  </div>

                  {/* Streak pill */}
                  <div className="inline-flex items-center gap-2 rounded-full px-5 py-1.5"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)' }}>
                    <span className="font-cairo text-2xl font-black" style={{ color: '#FCA5A5' }}>{king.streakCount}</span>
                    <span className="font-cairo text-sm font-bold" style={{ color: '#EF4444' }}>يوم 🔥</span>
                  </div>
                </Link>
              </div>
            )}

            {/* ── Ranks 2–5 ── */}
            {rest.length > 0 && (
              <div className="w-full flex flex-col gap-2 mt-2">
                {rest.map((p, i) => {
                  const rankInfo = RANK_COLORS[i + 1] ?? { medal: `#${p.rank}`, border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.02)', streak: 'rgba(255,255,255,0.55)', shadow: 'transparent' };
                  return (
                    <Link key={p.id} href={`/profile/${p.username}`}
                      className="group flex items-center gap-3 rounded-[16px] px-4 py-3.5 transition"
                      style={{ background: rankInfo.bg, border: `1px solid ${rankInfo.border}`, boxShadow: `0 4px 16px ${rankInfo.shadow}` }}>
                      {/* Medal / rank */}
                      <div className="w-8 shrink-0 text-center">
                        {i < 2 ? (
                          <span className="text-xl">{rankInfo.medal}</span>
                        ) : (
                          <span className="font-grit text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>#{p.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-cairo text-sm font-black"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${rankInfo.border}`, color: rankInfo.streak }}>
                        {(p.username?.[0] ?? '?').toUpperCase()}
                      </div>

                      {/* Name + level */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-cairo text-[14px] font-bold text-white">{p.username ?? '—'}</p>
                        <p className="font-grit text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>LV.{p.level}</p>
                      </div>

                      {/* Streak */}
                      <span className="shrink-0 font-cairo text-[14px] font-black" style={{ color: '#EF4444' }}>
                        {p.streakCount} يوم 🔥
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
