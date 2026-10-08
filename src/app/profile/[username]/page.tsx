'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2, Copy, Check, Zap, Coins } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LobbyFooter from '@/components/landing/LobbyFooter';
import { StarMark } from '@/components/Star';
import GameIcon from '@/components/GameIcon';
import { GAMES } from '@/lib/games';

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
  const { data: session } = useSession();
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
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#07111F] zellige-bg px-6 text-center">
        <StarMark size={48} />
        <h1 className="font-lalezar text-3xl text-white">مالقيناش هاد اللعّاب 🥲</h1>
        <p className="font-cairo text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
          يمكن بدل السمية ولا مسح الكونط.
        </p>
        <Link href="/" className="mt-2 px-6 py-3 rounded-[14px] font-cairo font-black text-[14px]"
          style={{ background: 'linear-gradient(135deg,#F5C842,#D8A62A)', color: '#07111F' }}>
          رجع للساحة
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#07111F] text-white" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[360px] w-[360px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: '#D8A62A' }} />
        <div className="absolute top-1/3 right-0 h-[280px] w-[280px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: '#6D3CCF' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-3 pb-2">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between rounded-full px-4"
          style={{ background: 'rgba(7,17,31,0.94)', backdropFilter: 'blur(24px)', border: '1px solid rgba(216,166,42,0.14)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          <Link href="/"
            className="flex items-center gap-2 font-cairo text-sm font-bold transition"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <ArrowRight className="h-4 w-4" />
            رجع
          </Link>
          <span className="font-lalezar text-[17px] text-white">{username}</span>
          <div className="flex items-center gap-2">
            <Image
              alt="PlayM3ana"
              loading="lazy"
              width={34}
              height={28}
              className="h-7 w-auto object-contain"
              src="/images/logo-playm3ana-new.png"
            />
            <span className="font-cairo font-black text-[15px] tracking-tight">
              <span className="text-white">PLAY</span>
              <span style={{ color: "rgb(232, 180, 48)" }}>M3ANA</span>
            </span>
          </div>
        </div>
      </header>

      {profile ? (
        <main className="relative z-10 mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6">

          {/* ── Profile card ── */}
          <div className="mb-4 overflow-hidden rounded-[22px]"
            style={{ background: 'rgba(9,22,40,0.95)', border: '1px solid rgba(216,166,42,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
            {/* Top arch bar */}
            <div className="h-[3px]"
              style={{ background: 'linear-gradient(90deg,transparent,#6D3CCF,#D8A62A,#C75B39,#D8A62A,#6D3CCF,transparent)', boxShadow: '0 0 16px rgba(216,166,42,0.5)' }} />

            <div className="p-5">
              {/* Avatar + name row */}
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-lalezar text-3xl"
                  style={{ background: 'rgba(216,166,42,0.1)', border: '2px solid rgba(216,166,42,0.45)', color: '#D8A62A', boxShadow: '0 0 20px rgba(216,166,42,0.2)' }}>
                  {(profile.username?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <h1 className="font-lalezar text-[22px] text-white">{profile.username}</h1>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-grit text-[11px] uppercase tracking-wide" style={{ color: '#D8A62A' }}>
                      LEVEL {profile.level}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                    <span className="font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{profile.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>

              {/* XP progress bar */}
              <div className="mb-1 flex justify-between">
                <span className="font-grit text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>LV.{profile.level}</span>
                <span className="font-grit text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>LV.{profile.level + 1}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${profile.levelProgress}%`, background: 'linear-gradient(90deg,#C75B39,#D8A62A,#F5C842)', boxShadow: '0 0 10px rgba(216,166,42,0.5)' }} />
              </div>
              <p className="mt-1 font-cairo text-[10px] text-left" dir="ltr" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {profile.levelProgress}% to next level
              </p>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'كوينز',              val: profile.coins.toLocaleString(), color: '#D8A62A',  bg: 'rgba(216,166,42,0.08)',  border: 'rgba(216,166,42,0.22)' },
              { label: 'ڭلسات',              val: profile.gamesPlayed,            color: '#1aad84',  bg: 'rgba(26,173,132,0.07)',  border: 'rgba(26,173,132,0.22)' },
              { label: 'الستريك ديال دابا', val: `${profile.streakCount} 🔥`,     color: '#EF4444',  bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.22)'  },
              { label: 'أطول ستريك',         val: `${profile.longestStreak} يوم`, color: '#F97316',  bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.22)' },
            ].map((s) => (
              <div key={s.label} className="rounded-[16px] p-4 text-center"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="font-lalezar text-2xl leading-none" style={{ color: s.color }}>{s.val}</div>
                <div className="mt-1 font-cairo text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Referral code ── */}
          {profile.referralCode && (
            <div className="mb-4 rounded-[18px] p-5"
              style={{ background: 'rgba(216,166,42,0.06)', border: '1px solid rgba(216,166,42,0.2)' }}>
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: '#D8A62A' }} />
                <span className="font-cairo text-[13px] font-black" style={{ color: '#D8A62A' }}>الكود د الدعوة ديالك</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden rounded-xl px-4 py-2.5 font-mono text-[15px] tracking-widest text-white"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(216,166,42,0.18)' }}>
                  {profile.referralCode}
                </code>
                <button onClick={copyReferral}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 font-cairo text-[12px] font-black transition active:scale-95"
                  style={{ background: 'rgba(216,166,42,0.12)', border: '1px solid rgba(216,166,42,0.3)', color: '#D8A62A' }}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'تم!' : 'كوپي'}
                </button>
              </div>
              <p className="mt-2 font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                بارطاجي الكود مع صاحبك — بجوج غاتربحو كوينز 🎁
              </p>
            </div>
          )}

          {/* ── Recent sessions ── */}
          {profile.recentSessions.length > 0 && (
            <div>
              <h2 className="mb-3 font-lalezar text-[19px] text-white">آخر الڭلسات</h2>
              <div className="flex flex-col gap-2">
                {profile.recentSessions.map((s, i) => {
                  const game = GAMES.find((g) => g.id === s.gameId);
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-[14px] p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <GameIcon game={game} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-cairo text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {game?.darijaTitle ?? s.gameId}
                        </p>
                        <p className="font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(s.startedAt).toLocaleDateString('ar-MA')}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {s.xpAwarded > 0 && (
                          <span className="font-cairo text-[12px] font-black" style={{ color: '#D8A62A' }}>
                            +{s.xpAwarded} XP
                          </span>
                        )}
                        {s.score !== null && (
                          <span className="font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
          <p className="mt-8 text-center font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            مقيد معانا من {new Date(profile.createdAt).toLocaleDateString('ar-MA')} 🇲🇦
          </p>

          <div className="mt-12">
            <LobbyFooter isAuthed={!!session?.user} username={session?.user?.username} />
          </div>
        </main>
      ) : (
        <div className="flex justify-center pt-32">
          <div className="pulse-glow-ring grid h-12 w-12 place-items-center rounded-full border-2"
            style={{ borderColor: 'rgba(216,166,42,0.4)' }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#D8A62A' }} />
          </div>
        </div>
      )}
    </div>
  );
}
