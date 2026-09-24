'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Copy, Check, Zap, Coins } from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameIcon from '@/components/GameIcon';
import { GAMES } from '@/lib/games';
import dynamic from 'next/dynamic';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

function xpForLvl(n: number) {
  return Math.floor(100 * Math.pow(n, 1.4));
}

type ProfileData = {
  username: string;
  image: string | null;
  coins: number;
  xp: number;
  level: number;
  levelProgress: number;
  gamesPlayed: number;
  streakCount: number;
  longestStreak: number;
  referralCode: string | null;
  createdAt: string;
  recentSessions: Array<{
    gameId: string;
    startedAt: string;
    score: number | null;
    xpAwarded: number;
  }>;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProfile(data); });
  }, [username]);

  const copyReferral = () => {
    if (!profile?.referralCode) return;
    void navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#030812] px-6 text-center">
        <StarMark size={48} />
        <h1 className="font-lalezar text-3xl text-neutral-50">مالقيناش هاد اللعّاب 🥲</h1>
        <p className="font-cairo text-sm font-semibold text-neutral-400">
          يمكن بدل السمية ولا مسح الكونط.
        </p>
        <Link href="/" className="btn-chunk btn-cyber mt-2 px-6 py-3 text-sm">
          رجع للساحة
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#030812] text-[#f1e7d6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <StarField />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(168,85,247,.06),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,transparent_25%,rgba(3,8,18,.9)_100%)]" />
      </div>

      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-cairo text-sm font-bold text-neutral-400 transition hover:text-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            رجع
          </Link>
          <span className="font-lalezar text-xl text-neutral-100">{username}</span>
          <StarMark size={28} />
        </div>
      </header>

      {profile ? (
        <main className="relative z-10 mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6">
          {/* Profile card */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-purple-400/15 bg-[#060c1a]">
            {/* Top accent */}
            <div
              className="h-1.5"
              style={{ background: 'linear-gradient(90deg, #a855f7, #00d9ff, #f2b23d)' }}
            />
            <div className="p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-purple-400/30 bg-purple-950/20 font-lalezar text-3xl text-purple-300">
                  {(profile.username?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <h1 className="font-lalezar text-2xl text-neutral-100">{profile.username}</h1>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-grit text-[11px] uppercase tracking-wide text-purple-400">
                      LEVEL {profile.level}
                    </span>
                    <span className="text-neutral-700">·</span>
                    <span className="font-cairo text-[11px] text-neutral-500">{profile.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>

              {/* XP progress bar */}
              <div className="mb-1 flex justify-between">
                    <span className="font-grit text-[10px] text-neutral-600">LV.{profile.level} 🎮</span>
                    <span className="font-grit text-[10px] text-neutral-600">LV.{profile.level + 1}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${profile.levelProgress}%`,
                        background: 'linear-gradient(90deg, #a855f7, #00d9ff)',
                        boxShadow: '0 0 10px rgba(168,85,247,.5)',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-left font-cairo text-[10px] text-neutral-600" dir="ltr">
                    {profile.levelProgress}% to next level
                  </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'كوينز',       val: profile.coins.toLocaleString(),   color: 'text-amber-400',  icon: '🪙' },
              { label: 'ڭلسات',       val: profile.gamesPlayed,               color: 'text-cyan-400',   icon: '🎮' },
              { label: 'الستريك ديال دابا', val: `${profile.streakCount} 🔥`,       color: 'text-red-400',    icon: '' },
              { label: 'أطول ستريك',  val: `${profile.longestStreak} يوم`,    color: 'text-orange-400', icon: '' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
              >
                <div className={`font-lalezar text-2xl leading-none ${s.color}`}>{s.val}</div>
                <div className="mt-1 font-cairo text-[11px] text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Referral code */}
          {profile.referralCode && (
            <div className="mb-4 rounded-2xl border border-purple-400/20 bg-purple-950/10 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="font-cairo text-[13px] font-black text-purple-300">الكود د الدعوة ديالك</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden rounded-lg border border-purple-400/15 bg-[#030812] px-4 py-2.5 font-mono text-[15px] tracking-widest text-purple-200">
                  {profile.referralCode}
                </code>
                <button
                  onClick={copyReferral}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-purple-400/30 bg-purple-400/10 px-4 py-2.5 font-cairo text-[12px] font-black text-purple-300 transition hover:bg-purple-400/20 active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'تم!' : 'كوپي'}
                </button>
              </div>
              <p className="mt-2 font-cairo text-[11px] text-neutral-600">
                بارطاجي الكود مع صاحبك — بجوج غاتربحو كوينز 🎁
              </p>
            </div>
          )}

          {/* Recent sessions */}
          {profile.recentSessions.length > 0 && (
            <div>
              <h2 className="mb-3 font-lalezar text-xl text-neutral-300">آخر الڭلسات</h2>
              <div className="flex flex-col gap-2">
                {profile.recentSessions.map((s, i) => {
                  const game = GAMES.find((g) => g.id === s.gameId);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >
                      <GameIcon game={game} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-cairo text-[13px] font-bold text-neutral-300">
                          {game?.darijaTitle ?? s.gameId}
                        </p>
                        <p className="font-cairo text-[11px] text-neutral-600">
                          {new Date(s.startedAt).toLocaleDateString('ar-MA')}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {s.xpAwarded > 0 && (
                          <span className="font-cairo text-[12px] font-black text-purple-400">
                            +{s.xpAwarded} XP
                          </span>
                        )}
                        {s.score !== null && (
                          <span className="font-cairo text-[11px] text-neutral-600">
                            {s.score.toLocaleString()} نقطة
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member since */}
          <p className="mt-8 text-center font-cairo text-[11px] text-neutral-700">
            مقيد معانا من {new Date(profile.createdAt).toLocaleDateString('ar-MA')} 🇲🇦
          </p>
        </main>
      ) : (
        <div className="flex justify-center pt-32">
          <div className="pulse-glow-ring grid h-12 w-12 place-items-center rounded-full border-2 border-cyan-400/40">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          </div>
        </div>
      )}
    </div>
  );
}
