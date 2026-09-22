'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Check, ChevronDown, Clock, Coins,
  Flame, Gamepad2, Loader2, Lock, LogIn, LogOut,
  Play, ShieldCheck, Target, Trophy, Users, Volume2, VolumeX, X, Zap,
} from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameCard from '@/components/GameCard';
import { GAMES, COMING_SOON, type Game } from '@/lib/games';
import { useRewardedAd } from '@/lib/useRewardedAd';
import { trackDevice } from '@/lib/device';
import { Sounds, isMuted, setMuted } from '@/lib/sounds';
import dynamic from 'next/dynamic';

const StarField      = dynamic(() => import('@/components/StarField'),      { ssr: false });
const GameBackground = dynamic(() => import('@/components/GameBackground'), { ssr: false });
const MissionsPanel  = dynamic(() => import('@/components/MissionsPanel'),  { ssr: false });

const TICKER_ITEMS = [
  '🔥 الصراع ديال الحومة كاين من بكري',
  '🇲🇦 تحداو بعضياتكم، بالدارجة',
  '🕹️ كل شي بالدارجة — حتى الكدب والسوالف',
  '🎲 تيليفون واحد = بزاف ديال الفضايح',
  '🤫 واحد فيكم كيكذب — مرحبا بيك فالحومة',
  '💰 شاهد الإعلان — مش هزيمة، هذا تكتيك',
  '💔 الليلة ولا جريمة فلطاولة، والجيران شهادين',
];

const TITLE_WORDS_1 = ['فضح', 'صاحبك'];
const TITLE_WORDS_2 = ['قبل', 'ما', 'يفضحك'];

/* XP formula (mirrors lib/ledger.ts, no prisma import needed client-side) */
function xpForLvl(n: number) { return Math.floor(100 * Math.pow(n, 1.4)); }

/* ── Coin burst particles on button click ── */
function spawnCoins(x: number, y: number) {
  const container = document.body;
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'coin-float';
    el.textContent = '🪙';
    el.style.left = `${x - 12}px`;
    el.style.top  = `${y - 12}px`;
    const angle = (Math.PI * 2 * i) / 7;
    const dist  = 55 + Math.random() * 40;
    el.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--ty', `${Math.sin(angle) * dist - 60}px`);
    el.style.setProperty('--rot', `${-180 + Math.random() * 360}deg`);
    el.style.animationDelay = `${i * 0.045}s`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

/* ── Launch overlay component ── */
function LaunchOverlay({ game }: { game: Game }) {
  return (
    <div className="launch-overlay fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-[#030812]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="cyber-grid opacity-35 absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 65% 65% at 50% 50%, ${
              game.isMafia ? 'rgba(220,38,38,.22)' : 'rgba(0,217,255,.16)'
            }, transparent 65%)`,
          }}
        />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="data-line"
            style={{
              left: `${5 + i * 13}%`,
              height: `${50 + (i % 4) * 30}px`,
              animationDuration: `${2.5 + (i % 4) * 0.7}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">
        {/* Pulse rings + emoji */}
        <div className="relative grid h-32 w-32 place-items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="launch-ring absolute inset-0"
              style={{
                color: game.isMafia ? 'rgba(239,68,68,.55)' : 'rgba(0,217,255,.55)',
                animationDelay: `${i * 0.45}s`,
              }}
            />
          ))}
          <span className="relative z-10 text-6xl drop-shadow-[0_0_28px_rgba(0,217,255,.6)]">
            {game.emoji}
          </span>
        </div>

        {/* Labels */}
        <div>
          <p
            className="font-grit text-[11px] uppercase tracking-[0.22em]"
            style={{ color: game.isMafia ? 'rgba(239,68,68,.7)' : 'rgba(0,217,255,.7)' }}
          >
            LAUNCHING GAME
          </p>
          <h2
            className="font-lalezar mt-1 text-4xl"
            style={{
              color: game.starAccent,
              textShadow: `0 0 24px ${game.starAccent}80`,
            }}
          >
            {game.darijaTitle}
          </h2>
          <p className="mt-1 font-grit text-[10px] uppercase tracking-widest text-neutral-600">
            {game.latinTitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-64 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="launch-progress h-full rounded-full"
            style={{
              background: game.isMafia
                ? 'linear-gradient(90deg, #ff2d55, #f2b23d)'
                : 'linear-gradient(90deg, #00d9ff, #a855f7)',
              boxShadow: game.isMafia
                ? '0 0 10px rgba(255,45,85,.6)'
                : '0 0 10px rgba(0,217,255,.6)',
            }}
          />
        </div>

        <p className="text-blink font-cairo text-sm font-bold text-neutral-500">
          كنجيبو الطاولة…
        </p>
      </div>
    </div>
  );
}

function LobbyContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'coins' | 'ad' | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<'idle' | 'watching' | 'verifying'>('idle');
  const [toast, setToast] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [coinPop, setCoinPop] = useState(false);
  const [launching, setLaunching] = useState<Game | null>(null);
  const [cardsVisible, setCardsVisible] = useState(true);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [xpData, setXpData] = useState<{ xp: number; level: number; streak: number; referralCode?: string } | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) Sounds.click();
  };
  const { show: showRewardedAd } = useRewardedAd();

  /* Prefetch Next.js game routes AND game file bundles in the background.
     This way the browser has the game assets cached before the user clicks play. */
  useEffect(() => {
    GAMES.forEach((g) => {
      router.prefetch(`/games/${g.id}`);
      /* Low-priority fetch of the game's HTML entry point so the browser
         discovers and caches its JS/CSS chunks ahead of time. */
      fetch(`/game-files/${g.id}/index.html`, { priority: 'low' } as RequestInit).catch(() => {});
    });
  }, [router]);

  /* cardsRef kept for future scroll effects */

  /* Fetch XP / streak / referral data once authenticated */
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/economy/balance')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setXpData(data); });
  }, [status]);

  const showToast = (kind: 'error' | 'ok', text: string) => {
    setToast({ kind, text });
    if (kind === 'ok') Sounds.ok(); else Sounds.error();
    window.setTimeout(() => setToast(null), 3200);
  };

  const autoClaimed = useRef(false);
  useEffect(() => {
    if (status !== 'authenticated' || autoClaimed.current) return;
    autoClaimed.current = true;
    void trackDevice();
    (async () => {
      try {
        const res = await fetch('/api/rewards/checkin', { method: 'POST' });
        if (!res.ok) return;
        const data = (await res.json()) as { claimed?: boolean; reward?: number; streak?: number };
        if (data.claimed && typeof data.reward === 'number') {
          await update();
          setCoinPop(true); setTimeout(() => setCoinPop(false), 600);
          Sounds.checkin();
          showToast('ok', `مكافأة اليوم: +${data.reward} 🪙 (اليوم ${data.streak ?? 1})`);
        }
      } catch { /* best-effort */ }
    })();
  }, [status, update]);

  useEffect(() => {
    if (status !== 'authenticated' || searchParams.get('from') !== 'game') return;
    router.replace('/');
    (async () => {
      try {
        const res = await fetch('/api/economy/balance');
        if (!res.ok) return;
        const data = (await res.json()) as { coins?: number };
        if (typeof data.coins === 'number') {
          await update({ coins: data.coins });
          setCoinPop(true); setTimeout(() => setCoinPop(false), 600);
          showToast('ok', `مرحبا بيك! عندك ${data.coins} 🪙`);
        }
      } catch { await update(); }
    })();
  }, [status, searchParams, router, update]);

  const requireAuth = () => {
    if (status === 'authenticated') return true;
    router.push('/login'); return false;
  };

  const playWithCoins = async (gameId: string, e?: React.MouseEvent) => {
    if (!requireAuth()) return;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    const coins = session?.user?.coins ?? 0;
    if (coins < game.cost) {
      showToast('error', `ماعندكش كفاية عملات — كترهم باشر الإعلان 🔁 (${coins}/${game.cost})`);
      return;
    }

    /* Coin burst at click position */
    if (e) spawnCoins(e.clientX, e.clientY);
    Sounds.coin();

    setBusyId(gameId); setBusyAction('coins');
    setLaunching(game); /* Show launch overlay IMMEDIATELY */

    try {
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ gameId, paymentMethod: 'coins' }),
      });
      if (res.ok) {
        const { redirectUrl, remainingCoins } = await res.json();
        if (typeof remainingCoins === 'number') await update({ coins: remainingCoins });
        Sounds.launch();
        router.replace(redirectUrl);
      } else {
        setLaunching(null);
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error ?? 'ما نجحش اللعب، وجرب مرة أخرى');
      }
    } catch {
      setLaunching(null);
      showToast('error', 'مشكل فالأنترنيت — جرب مرة أخرى');
    } finally {
      setBusyId(null); setBusyAction(null);
    }
  };

  const watchAdToPlay = (gameId: string) => {
    if (!requireAuth()) return;
    setSelectedGame(gameId); setAdStatus('idle'); setAdModalOpen(true);
  };

  const startRewardedAd = async () => {
    if (!selectedGame) return;
    setAdStatus('watching');
    const result = await showRewardedAd('unlock', selectedGame);
    setAdStatus('idle');
    if (result.ok) {
      if (result.payload.redirectUrl) {
        const game = GAMES.find((g) => g.id === selectedGame);
        if (game) setLaunching(game);
        setAdStatus('verifying');
        router.replace(result.payload.redirectUrl);
        return;
      }
      if (typeof result.payload.newBalance === 'number') await update({ coins: result.payload.newBalance });
      showToast('ok', `+${result.payload.awarded ?? 0} عملات مكافأة! 🎁`);
      setAdModalOpen(false);
      return;
    }
    setAdModalOpen(false);
    const msgs: Record<string, string> = {
      no_fill: 'ما كتبانش إعلان في هاد اللحظة — جرب بالعملات',
      capped: 'وصلتي للحد اليومي ديال الإعلانات (6)',
      dismissed: 'الإعلان ما كمّلش — جرب مرة أخرى',
    };
    showToast('error', msgs[result.reason ?? ''] ?? 'مشكل فالإعلان — جرب مرة أخرى');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  /* ── Loading screen ── */
  if (status === 'loading') {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#030812] overflow-hidden">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <StarField />
          <GameBackground />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,transparent_25%,rgba(3,8,18,.88)_100%)]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <StarMark size={60} />
          <div className="pulse-glow-ring h-12 w-12 rounded-full border-2 border-cyan-400/40 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          </div>
          <p className="font-lalezar text-2xl text-[#e8d9c0] text-glow-cyan">كنجيبو الكرسات…</p>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#030812] text-[#f1e7d6]">

      {/* Launch overlay */}
      {launching && <LaunchOverlay game={launching} />}

      {/* ═══════════════ BACKGROUND ═══════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <StarField />
        <GameBackground />
        {/* Edge vignette to keep content readable */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,transparent_25%,rgba(3,8,18,.88)_100%)]" />
      </div>

      {/* Scanline */}
      <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        <div className="scanline-pass absolute inset-0" />
      </div>

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <StarMark size={32} />
            <span className="flex flex-col leading-none">
              <span className="font-grit text-[0.95rem] uppercase tracking-tight transition-colors group-hover:text-cyan-300">
                <span className="text-gold-sheen">PLAY</span><span className="text-[#7a9bd6]">M3ANA</span>
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 font-cairo text-[9px] font-black text-[#a08a63]">
                <span className="live-dot" style={{ width: 5, height: 5 }} />
                ساحة اللعب
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthed ? (
              <>
                <div className={`coin-counter ${coinPop ? 'coin-pop' : ''}`}>
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-cairo text-sm font-black tabular-nums">{coins}</span>
                </div>
                {xpData && (() => {
                  const lvl = xpData.level;
                  const cur = xpForLvl(lvl);
                  const nxt = xpForLvl(lvl + 1);
                  const pct = nxt > cur ? Math.round(((xpData.xp - cur) / (nxt - cur)) * 100) : 100;
                  return (
                    <Link href={`/profile/${session?.user?.username}`} className="xp-pill hidden sm:flex group" title={`Level ${lvl} — ${xpData.xp} XP`}>
                      <Zap className="h-3 w-3 shrink-0 text-purple-400" />
                      <span className="font-grit text-[10px] text-purple-300">LV.{lvl}</span>
                      <div className="xp-pill-track">
                        <div className="xp-pill-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })()}
                <span className="hidden max-w-[7rem] truncate font-cairo text-sm font-bold text-[#d8c39a] sm:block">
                  {session?.user?.username}
                </span>
                {session?.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="btn-chunk btn-ink grid h-9 w-9 place-items-center rounded-full" title="Admin">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                  title="خروج"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-chunk btn-amber px-4 py-2 text-[13px]">
                <LogIn className="h-4 w-4" /> دخول
              </Link>
            )}
            <button
              onClick={toggleMute}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-cyan-400/40 hover:text-cyan-300"
              title={muted ? 'تفعيل الأصوات' : 'كتم الأصوات'}
            >
              {muted ? <VolumeX className="h-4 w-4 text-neutral-500" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-scene relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-12 pt-8 text-center">

        {/* Cyber grid */}
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-55" />

        {/* Vertical scanline */}
        <div className="vert-scan" style={{ zIndex: 0 }} />

        {/* Floating data particles */}
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="data-line"
            style={{
              left: `${6 + i * 14}%`,
              height: `${40 + (i % 4) * 28}px`,
              animationDuration: `${3.2 + (i % 5) * 0.9}s`,
              animationDelay: `${i * 0.55}s`,
              zIndex: 0,
            }}
          />
        ))}

        {/* Local perspective floor for hero depth */}
        <div className="perspective-floor" style={{ zIndex: 0 }} />

        {/* HUD corners */}
        <div className="hud-corner hud-corner-tl hidden sm:block" style={{ zIndex: 4 }} />
        <div className="hud-corner hud-corner-tr hidden sm:block" style={{ zIndex: 4 }} />
        <div className="hud-corner hud-corner-bl hidden sm:block" style={{ zIndex: 4 }} />
        <div className="hud-corner hud-corner-br hidden sm:block" style={{ zIndex: 4 }} />

        {/* Badge */}
        <div className="badge-cyber anim-fadeup d1" style={{ position: 'relative', zIndex: 5 }}>
          <span className="live-dot" />
          🃏 قعدة + حومة + فضايح — 100% بالدارجة
        </div>

        {/* Animated title */}
        <div className="relative mt-7 select-none" dir="rtl" style={{ zIndex: 5 }}>
          {/* Row 1 */}
          <p
            className="flex flex-wrap items-center justify-center gap-x-5 font-lalezar leading-none"
            style={{ fontSize: 'clamp(2.4rem,10vw,4.5rem)' }}
          >
            {TITLE_WORDS_1.map((w, i) => (
              <span
                key={i}
                className="letter-in text-[#ede0c6] text-glow-white"
                style={{ animationDelay: `${0.08 + i * 0.16}s` }}
              >
                {w}
              </span>
            ))}
          </p>
          {/* Row 2 — neon gold */}
          <p
            className="flex flex-wrap items-center justify-center gap-x-5 font-lalezar leading-none"
            style={{ fontSize: 'clamp(3.2rem,16vw,7.5rem)' }}
          >
            {TITLE_WORDS_2.map((w, i) => (
              <span
                key={i}
                className="letter-in text-gold-neon"
                style={{ animationDelay: `${0.3 + i * 0.14}s` }}
              >
                {w}
              </span>
            ))}
          </p>
        </div>

        {/* Wavy underline */}
        <svg
          viewBox="0 0 340 20"
          className="anim-fadeup d3 mx-auto mt-1 h-5 w-[280px] sm:w-[340px] text-cyan-400/60"
          aria-hidden
          style={{ position: 'relative', zIndex: 5 }}
        >
          <path
            d="M5 13 c35-10 65-10 100-2 s40 9 80 1 s50-9 110-1 s30 7 40 2"
            fill="none" stroke="currentColor" strokeWidth="4.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        {/* Subtitle */}
        <p
          className="anim-fadeup d3 mx-auto mt-6 max-w-[460px] font-cairo text-[15.5px] font-semibold leading-relaxed text-[#b8a888]"
          style={{ position: 'relative', zIndex: 5 }}
        >
          تيليفون واحد، دراري بزاف، ووحدي فيكم غادي يجيب جائزة{' '}
          <span className="font-black text-[#f0deb4]">«حديث الحومة»</span> الليلة 💀
        </p>

        {/* Stats */}
        <div
          className="anim-fadeup d4 mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ position: 'relative', zIndex: 5 }}
        >
          {[
            { ico: <Gamepad2 className="h-5 w-5 text-amber-400" />, val: `${GAMES.length}`, label: 'ألعاب' },
            { ico: <Users className="h-5 w-5 text-cyan-400" />,     val: '15',              label: 'ضحية ماكس' },
            { ico: <Flame className="h-5 w-5 text-red-400" />,      val: '100%',            label: 'بالدارجة خالصة' },
            { ico: <Clock className="h-5 w-5 text-emerald-400" />,  val: '0ث',              label: 'بلا تنزيل' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              {s.ico}
              <span className="font-lalezar text-xl leading-none text-[#f5eddc]">{s.val}</span>
              <span className="font-cairo text-[10px] font-black text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA for guests */}
        {!isAuthed && (
          <div
            className="anim-fadeup d5 mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ position: 'relative', zIndex: 5 }}
          >
            <div className="cta-glow">
              <Link href="/register" className="btn-arcade relative z-10 inline-flex items-center gap-2.5 px-9 py-4 text-[16px] font-black">
                <Zap className="h-5 w-5" />
                ابدأ الفضايح ببلاش
              </Link>
            </div>
            <Link href="/login" className="btn-chunk btn-ghost-hollow inline-flex items-center gap-2 px-6 py-4 text-[14px]">
              <LogIn className="h-4 w-4" /> عندي حساب
            </Link>
          </div>
        )}

        {/* Authenticated welcome */}
        {isAuthed && (
          <div
            className="anim-fadeup d5 mt-8 flex items-center gap-3"
            style={{ position: 'relative', zIndex: 5 }}
          >
            <div className="relative">
              <div className="sonar-ring text-amber-400" />
              <div className="sonar-ring sonar-ring-2 text-amber-400" />
              <div className="coin-counter relative z-10">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-lalezar text-lg">{coins}</span>
                <span className="font-cairo text-[11px] font-black text-amber-300/70"> كولة</span>
              </div>
            </div>
            <div>
              <p className="font-cairo text-[13px] font-bold text-neutral-400">
                عاود جيتي يا <span className="text-amber-300">{session?.user?.username}</span>؟ حق عليك 🤙
              </p>
              {xpData && xpData.streak >= 2 && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-950/20 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5 text-red-400" />
                  <span className="font-cairo text-[11px] font-black text-red-300">
                    {xpData.streak} يوم متتالي 🔥
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-hint" style={{ zIndex: 5 }}>
          <ChevronDown className="h-6 w-6 text-cyan-400/40" />
        </div>
      </section>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))] sm:px-6">

        {/* LED Ticker */}
        <div className="led-strip py-2.5">
          <div className="led-strip-track">
            {[...Array(2)].map((_, l) => (
              <span key={l} className="flex shrink-0 items-center gap-5 px-6 font-cairo text-[12.5px] font-black text-cyan-300/50">
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="flex items-center gap-5">
                    <span className="text-cyan-500/35">◆</span>{item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Guest notice */}
        {!isAuthed && (
          <div className="mt-5 overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
                  <Coins className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="font-cairo text-[13px] font-bold text-[#e8d5a3]">
                  سجل باش تكشف الخاين ديال الحومة قبل ما يخلص الليل — والدخلة مجانية طبعا 🕵️
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href="/login" className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]">دخول</Link>
                <Link href="/register" className="btn-chunk btn-amber px-4 py-2 text-[12px]">سجل الآن</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── GAMES SECTION ── */}
        <section className="mt-14">
          {/* Section header */}
          <div className="section-entrance mb-10 flex flex-col items-center gap-3 text-center">
            <div className="section-label">الطاولات هاد الليلة</div>
            <h2 className="font-lalezar text-[clamp(2.2rem,8vw,3.5rem)] leading-none text-[#f5eddc] text-glow-amber">
              اختار طاولتك — بصحتك
            </h2>
            <p className="font-cairo text-[13.5px] font-semibold text-[#d8c39a]/55">
              إعلان قصير = طاولة ببلاش. عملات = دخول بكرامة. الاختيار عليك 😅
            </p>
          </div>

          {/* Cards grid */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7"
          >
            {GAMES.map((game, i) => (
              <div
                key={game.id}
                className={`card-entrance stagger-${Math.min(i + 1, 4)} ${i % 2 ? 'lg:mt-6' : ''}`}
              >
                <GameCard
                  game={game}
                  coins={coins}
                  isBusy={busyId === game.id}
                  loadingAction={busyAction}
                  onPlay={(e) => playWithCoins(game.id, e)}
                  onWatchAd={() => watchAdToPlay(game.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── COMING SOON ── */}
        <section className="mt-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="section-label">قريبا فالحومة</div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COMING_SOON.map((g, i) => (
              <div
                key={g.id}
                className={`card-entrance stagger-${(i % 4) + 1} relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060c1a] p-5 opacity-75`}
              >
                {/* Coming soon badge */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-950/40 px-2.5 py-1">
                  <Lock className="h-2.5 w-2.5 text-amber-400" />
                  <span className="font-grit text-[9px] uppercase tracking-wider text-amber-400">قريبا</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-grit text-[10px] uppercase tracking-wider text-neutral-600">{g.latinTitle}</p>
                    <h3 className="font-lalezar text-xl text-neutral-300 leading-tight">{g.darijaTitle}</h3>
                    <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-cairo text-[10px] font-bold text-neutral-500">
                      {g.tag}
                    </span>
                    <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed text-neutral-600">{g.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LEADERBOARD TEASER ── */}
        <section className="mt-14">
          <div className="overflow-hidden rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-950/15 via-[#060c1a] to-[#060c1a] p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-right">
                <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Trophy className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(242,178,61,.5)]" />
                  <span className="font-lalezar text-xl text-amber-300">ساحة النجوم</span>
                </div>
                <p className="font-cairo text-[13px] font-semibold text-neutral-400">
                  واش نتا فالقايمة؟ شوف مكانك بين أحسن اللاعبين فالمنصة 👑
                </p>
              </div>
              <Link
                href="/leaderboard"
                className="btn-chunk btn-amber shrink-0 px-6 py-3 text-[13px]"
              >
                <Trophy className="h-4 w-4" />
                شوف المتصدرين
              </Link>
            </div>
          </div>
        </section>

        {/* ── REFERRAL SECTION (authenticated only) ── */}
        {isAuthed && xpData?.referralCode && (
          <section className="mt-10">
            <div className="overflow-hidden rounded-2xl border border-purple-400/15 bg-gradient-to-br from-purple-950/15 via-[#060c1a] to-[#060c1a] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span className="font-lalezar text-xl text-purple-300">دعو صاحبك</span>
              </div>
              <p className="mb-4 font-cairo text-[13px] font-semibold text-neutral-400">
                شارك الكود مع صاحبك — كلاكم غاديين تربحو عملات زايدة مجانا 🎁
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 overflow-hidden rounded-xl border border-purple-400/15 bg-[#030812] px-4 py-3 font-mono text-[15px] tracking-widest text-purple-200">
                  {xpData.referralCode}
                </code>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(xpData!.referralCode!);
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2200);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 font-cairo text-[13px] font-black text-purple-300 transition hover:bg-purple-400/20 active:scale-95"
                >
                  {referralCopied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  {referralCopied ? 'تم!' : 'نسخ'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="mt-24 flex flex-col items-center gap-2 border-t border-white/[0.05] pt-8 text-center">
          <StarMark size={24} />
          <p className="font-cairo text-[11.5px] font-bold text-[#a08a63]">
            PLAYM3ANA — لعبات جماعية بالدارجة، على تيليفون واحد، والحومة كاملة تشهد 🔥
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-cairo text-[10.5px] font-bold text-[#7a6a4d]">
            <Link href="/leaderboard" className="transition hover:text-amber-300">المتصدرون</Link>
            {isAuthed && <><span>•</span><Link href={`/profile/${session?.user?.username}`} className="transition hover:text-amber-300">بروفيلي</Link></>}
            <span>•</span>
            <Link href="/privacy" className="transition hover:text-amber-300">سياسة الخصوصية</Link>
            <span>•</span>
            <Link href="/terms" className="transition hover:text-amber-300">شروط الاستخدام</Link>
            <span>•</span>
            <Link href="/contact" className="transition hover:text-amber-300">تواصل معنا</Link>
          </div>
          <p className="mt-1 font-cairo text-[10px] font-semibold text-[#7a6a4d]">
            مصنوعة بـ ❤️ وشوية كسكس فالمغرب 🇲🇦 — أي صداقة خربها اللعب هاد الليلة، الله يرحمها 🙏
          </p>
        </footer>
      </main>

      {/* ═══════════════ MISSIONS FAB ═══════════════ */}
      {isAuthed && (
        <button
          onClick={() => setMissionsOpen(true)}
          className="missions-fab"
          aria-label="المهام اليومية"
        >
          <Target className="h-5 w-5" />
          <span className="font-cairo text-[11px] font-bold">مهام</span>
        </button>
      )}

      {/* Missions panel */}
      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => {
            void update();
            setMissionsOpen(false);
            showToast('ok', `مبروك! ربحتي +${reward} 🪙 على المهمة 🎯`);
          }}
        />
      )}

      {/* ═══════════════ AD MODAL ═══════════════ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="bounce-in relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#060c1a] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,.95)]">
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-neutral-400 transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-neutral-300">AD BREAK — إعلان مقابل جلسة</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-neutral-100">ثواني ديالك مقابل الليلة كلها</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-neutral-400">
                  شاهد الإعلان وغادي نفتح ليك الطاولة <b className="text-amber-300">مجانا</b> — ماشي هزيمة، هذا تكتيك 😅
                </p>
                <button onClick={startRewardedAd} className="btn-chunk btn-amber group mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> باشر — وعيني عيناك
                </button>
                <button
                  onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-neutral-500 transition hover:text-neutral-300"
                >
                  لا شكرا، غنثمن بالعملات
                </button>
              </>
            )}
            {adStatus === 'watching' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-6 py-9">
                <div className="relative grid h-16 w-16 place-items-center">
                  <span className="glow-pulse absolute inset-0 rounded-full bg-cyan-400/25 blur-xl" />
                  <Loader2 className="relative h-9 w-9 animate-spin text-cyan-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-cyan-200">صابر، الطاولة كتستناك…</p>
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">لا تهرب — عارفنا الوقتين 👁️</p>
              </div>
            )}
            {adStatus === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">كنأكدو ما شفتيش الإعلان بعينيك مسدودين…</p>
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">تقدر تعيط فالفريق باش تستعدو 🫡</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TOAST ═══════════════ */}
      {toast && (
        <div className="fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div className={`bounce-in flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
            toast.kind === 'error'
              ? 'border-red-500/30 bg-red-950/80 text-red-200'
              : 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
          }`}>
            {toast.kind === 'error'
              ? <AlertTriangle className="h-4 w-4 shrink-0" />
              : <Check className="h-4 w-4 shrink-0" />}
            <span className="font-cairo text-[13px] font-bold">{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense>
      <LobbyContent />
    </Suspense>
  );
}
