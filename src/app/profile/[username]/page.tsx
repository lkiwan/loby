'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Check, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LobbyFooter from '@/components/landing/LobbyFooter';
import GameIcon from '@/components/GameIcon';
import { GAMES } from '@/lib/games';

function xpForLvl(n: number) {
  return Math.floor(100 * Math.pow(n, 1.4));
}
void xpForLvl;

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
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white" style={{ background: 'var(--bg)' }}>
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_85%_0%,rgba(124,58,237,0.16),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_100%,rgba(225,29,72,0.1),transparent_55%)]" />
        </div>
        <div className="anim-pop relative z-10 flex flex-col items-center">
          <div className="grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-[#F43F5E]/60 bg-[#F43F5E]/10 font-cairo text-[30px] font-black text-[#FF8FA3]" style={{ boxShadow: '0 0 32px rgba(244,63,94,0.25)' }}>
            !
          </div>
          <h1 className="mt-5 font-lalezar text-3xl text-white">مالقيناش هاد اللعّاب 🥲</h1>
          <p className="mt-2 font-cairo text-sm font-semibold" style={{ color: 'var(--dim)' }}>
            يمكن بدل السمية ولا مسح الكونط.
          </p>
          <Link href="/" className="btn-lime mt-5 px-6 py-3 font-cairo text-[14px]">
            رجع للساحة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh text-white" style={{ background: 'var(--bg)', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_85%_0%,rgba(124,58,237,0.13),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_100%,rgba(225,29,72,0.08),transparent_55%)]" />
      </div>

      {/* Topbar (profile-store): back btn · username · wordmark */}
      <header className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-5 sm:px-6">
        <Link
          href="/"
          aria-label="رجع"
          className="grid h-10 w-10 place-items-center rounded-full border transition active:scale-95"
          style={{ background: 'var(--panel2)', borderColor: 'var(--line)', color: '#EDEDF2' }}
        >
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
        <span className="font-cairo text-[16px] font-black text-white">{username}</span>
        <span className="font-cairo text-[13px] font-black tracking-[1.5px]" dir="ltr" style={{ color: 'var(--dim)' }}>
          PLAY<span style={{ color: 'var(--lime)' }}>M3ANA</span>
        </span>
      </header>

      {profile ? (
        <main className="relative z-10 mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6">

          {/* ── ID card (profile-store): letter avatar, LEVEL + XP bar ── */}
          <div className="cut-corner relative mb-4 p-6 text-center" style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}>
            <div
              className="mx-auto grid h-24 w-24 place-items-center rounded-full font-lalezar text-[40px]"
              style={{ background: 'rgba(198,245,66,0.08)', border: '3px solid var(--lime)', color: 'var(--lime)', boxShadow: '0 0 28px rgba(198,245,66,0.3)' }}
            >
              {(profile.username?.[0] ?? '?').toUpperCase()}
            </div>
            <h1 className="mt-4 font-cairo text-[24px] font-black leading-tight text-white">{profile.username}</h1>

            <div className="mt-2.5 flex items-center justify-center gap-2">
              <span className="rounded-full px-2.5 py-1 font-grit text-[11px] font-black tracking-wide" dir="ltr" style={{ background: 'var(--lime)', color: '#131803' }}>
                LEVEL {profile.level}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
              <span className="font-cairo text-[12px] font-bold" style={{ color: 'var(--dim)' }}>{profile.xp.toLocaleString()} XP</span>
            </div>

            {/* XP progress bar */}
            <div className="mt-5 h-[11px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${profile.levelProgress}%`, background: 'linear-gradient(90deg,#8FD41F,#C6F542,#E4FF8F)', boxShadow: '0 0 10px rgba(198,245,66,0.5)' }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between" dir="ltr">
              <span className="font-grit text-[10px]" style={{ color: 'var(--dim)' }}>LV.{profile.level}</span>
              <span className="font-cairo text-[10.5px] font-bold text-white/70">{profile.levelProgress}% to next level</span>
              <span className="font-grit text-[10px]" style={{ color: 'var(--dim)' }}>LV.{profile.level + 1}</span>
            </div>
          </div>

          {/* ── Stats grid (4 real stats) ── */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'كوينز',              val: profile.coins.toLocaleString(), color: 'var(--gold)' },
              { label: 'ڭلسات',              val: profile.gamesPlayed,            color: '#6EE7B7' },
              { label: 'الستريك ديال دابا', val: `${profile.streakCount} 🔥`,     color: '#FDA4AF' },
              { label: 'أطول ستريك',         val: `${profile.longestStreak} يوم`, color: '#FDBA74' },
            ].map((s) => (
              <div key={s.label} className="rounded-[18px] p-4 text-center" style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}>
                <div className="font-cairo text-[23px] font-black leading-none" style={{ color: s.color }}>{s.val}</div>
                <div className="mt-1.5 font-cairo text-[10.5px] font-black" style={{ color: 'var(--dim)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Referral code (profile-store refcard) ── */}
          {profile.referralCode && (
            <div
              className="cut-corner-sm relative mb-4 rounded-[18px] p-5"
              style={{ background: 'linear-gradient(92deg,rgba(198,245,66,0.12),rgba(198,245,66,0.03))', border: '1px solid rgba(198,245,66,0.24)' }}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: 'var(--lime)' }} />
                <span className="font-cairo text-[13px] font-black text-white">الكود د الدعوة ديالك</span>
              </div>
              <p className="mb-3.5 font-cairo text-[11.5px] font-semibold leading-relaxed" style={{ color: 'var(--dim)' }}>
                بارطاجي الكود مع صاحبك — بجوج غاتربحو كوينز 🎁
              </p>
              <button
                onClick={copyReferral}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-mono text-[15px] font-bold tracking-widest transition active:scale-[0.98]"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1.5px dashed rgba(255,201,60,0.55)', color: 'var(--gold)' }}
              >
                <span dir="ltr">{profile.referralCode}</span>
                {copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                <span className="font-cairo text-[12px] font-black tracking-normal">{copied ? 'تم!' : 'كوپي'}</span>
              </button>
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
                    <div key={i} className="flex items-center gap-3 rounded-[16px] p-3" style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}>
                      <GameIcon game={game} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-cairo text-[13.5px] font-bold text-white/85">
                          {game?.darijaTitle ?? s.gameId}
                        </p>
                        <p className="font-cairo text-[11px] font-semibold" style={{ color: 'var(--dim)' }}>
                          {new Date(s.startedAt).toLocaleDateString('ar-MA')}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {s.xpAwarded > 0 && (
                          <span className="font-cairo text-[12.5px] font-black" style={{ color: 'var(--lime)' }}>
                            +{s.xpAwarded} XP
                          </span>
                        )}
                        {s.score !== null && (
                          <span className="font-cairo text-[11px] font-semibold" style={{ color: 'var(--dim)' }}>
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
          <p className="mt-8 text-center font-cairo text-[11.5px] font-semibold" style={{ color: 'var(--dim)' }}>
            مقيد معانا من {new Date(profile.createdAt).toLocaleDateString('ar-MA')} 🇲🇦
          </p>

          <div className="mt-12">
            <LobbyFooter isAuthed={!!session?.user} username={session?.user?.username} />
          </div>
        </main>
      ) : (
        <div className="flex justify-center pt-32">
          <div
            className="h-12 w-12 animate-spin rounded-full border-[3px]"
            style={{ borderColor: 'rgba(198,245,66,0.25)', borderTopColor: 'var(--lime)' }}
          />
        </div>
      )}
    </div>
  );
}
