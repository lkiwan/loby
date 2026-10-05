'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Check, ChevronDown, Clock, Coins,
  Flame, Gamepad2, Loader2, LogIn, LogOut,
  Music, Play, Settings, ShieldCheck, Target, UserPlus, Users, Video, Volume2, VolumeX, X, Zap,
} from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameCard from '@/components/GameCard';
import GameIcon from '@/components/GameIcon';
import GuestNotice from '@/components/landing/GuestNotice';
import ComingSoon from '@/components/landing/ComingSoon';
import HowItWorks from '@/components/landing/HowItWorks';
import LeaderboardTeaser from '@/components/landing/LeaderboardTeaser';
import LobbyFooter from '@/components/landing/LobbyFooter';
import { GAMES, type Game } from '@/lib/games';
import AdBanner from '@/components/AdBanner';
import AdNativeBanner from '@/components/AdNativeBanner';
import { rememberPayMethod } from '@/lib/payMethod';
import { trackDevice } from '@/lib/device';
import { Sounds, isMuted, setMuted, musicPlayer, isMusicMuted } from '@/lib/sounds';
import dynamic from 'next/dynamic';

const MissionsPanel = dynamic(() => import('@/components/MissionsPanel'), { ssr: false });

/* ── Ticker messages ── */
const TICKER_ITEMS = [
  '🔥 الصداع د الحومة كاين من بكري',
  '🇲🇦 تحداو بعضياتكم بالدارجة',
  '🕹️ كلشي بالدارجة — حتى الكدوب والمعاودة',
  '🎲 تيليفون واحد = بزاف د الشوهة',
  '🤫 واحد فيكم كيكدب — مرحبا بيك فالحومة',
  '💰 تفرج فإشهار — ماشي خسارة، هادا تكتيك',
  '💔 الليلة تولي جريمة فالطبلة، والجيران شاهدين',
];

/* ── Coin burst particles ── */
function spawnCoins(x: number, y: number) {
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
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

/* ── Game launch overlay ── */
function LaunchOverlay({ game }: { game: Game }) {
  return (
    <div className="launch-overlay fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#050918]">
      <div className="pointer-events-none absolute inset-0">
        <div className="cyber-grid opacity-20 absolute inset-0" />
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${game.isMafia ? 'rgba(239,68,68,.18)' : 'rgba(34,211,238,.14)'}, transparent 65%)` }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="launch-ring absolute inset-0"
              style={{ color: game.isMafia ? 'rgba(239,68,68,.55)' : 'rgba(34,211,238,.55)', animationDelay: `${i * 0.45}s` }} />
          ))}
          <GameIcon game={game} size={108} />
        </div>
        <div>
          <p className="font-grit text-[10px] uppercase tracking-[0.22em]"
            style={{ color: game.isMafia ? 'rgba(239,68,68,.65)' : 'rgba(34,211,238,.65)' }}>
            LAUNCHING GAME
          </p>
          <h2 className="font-lalezar mt-1 text-4xl"
            style={{ color: game.starAccent, textShadow: `0 0 22px ${game.starAccent}70` }}>
            {game.darijaTitle}
          </h2>
          <p className="mt-0.5 font-grit text-[10px] uppercase tracking-widest text-neutral-700">{game.latinTitle}</p>
        </div>
        <div className="h-1 w-60 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="launch-progress h-full rounded-full"
            style={{
              background: game.isMafia ? 'linear-gradient(90deg,#dc2626,#f87171)' : 'linear-gradient(90deg,#06b6d4,#a78bfa)',
              boxShadow:  game.isMafia ? '0 0 10px rgba(220,38,38,.5)' : '0 0 10px rgba(34,211,238,.5)',
            }} />
        </div>
        <p className="text-blink font-cairo text-sm font-bold text-neutral-600">كنوجدو الطبلة…</p>
      </div>
    </div>
  );
}

/* ── Floating game orb (hero right column) ── */
function GameOrb({
  game, delay, rotate, className,
}: { game: Game; delay: number; rotate: string; className?: string }) {
  return (
    <div
      className={`glass-card flex flex-col items-center justify-center gap-1.5 p-3.5 ${className ?? ''} orb-float`}
      style={{
        '--r': rotate,
        animationDelay: `${delay}s`,
        width: 78, height: 78,
        borderColor: `${game.starAccent}22`,
        boxShadow: `0 0 24px ${game.glowAccent}18, 0 8px 24px rgba(0,0,0,0.4)`,
        transform: `rotate(${rotate})`,
      } as React.CSSProperties}
    >
      <span className="text-[1.65rem] leading-none">{game.emoji}</span>
      <span className="font-cairo text-[8px] font-black leading-none text-neutral-600">
        {game.darijaTitle.split(' ')[0]}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main LobbyContent
───────────────────────────────────────────────────────────────── */
function LobbyContent() {
  const { data: session, status, update } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [busyId, setBusyId]         = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'coins' | 'ad' | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [adStatus, setAdStatus]     = useState<'idle' | 'watching' | 'verifying'>('idle');
  const [countdown, setCountdown]   = useState(5);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toast, setToast]           = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [coinPop, setCoinPop]       = useState(false);
  const [launching, setLaunching]   = useState<Game | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [xpData, setXpData]         = useState<{ xp: number; level: number; gamesPlayed: number; streak: number; referralCode?: string } | null>(null);
  const [missionsOpen, setMissionsOpen]   = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [authSheetOpen, setAuthSheetOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen]     = useState(false);

  /* Settings state */
  const [me, setMe] = useState<{
    username?: string | null; displayName?: string | null;
    email?: string | null; hasPassword?: boolean;
    nextNameChangeAt?: string | null; canChangeName?: boolean;
  } | null>(null);
  const [nameDraft, setNameDraft]   = useState('');
  const [nameBusy, setNameBusy]     = useState(false);
  const [nameMsg, setNameMsg]       = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pwDraft, setPwDraft]       = useState({ cur: '', n1: '', n2: '' });
  const [pwBusy, setPwBusy]         = useState(false);
  const [pwMsg, setPwMsg]           = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json() as typeof me;
        setMe(data);
        setNameDraft(data?.displayName ?? '');
      }
    } catch { /* settings still works */ }
  }, []);

  const openSettings = () => { setSettingsOpen(true); if (isAuthed) void fetchMe(); };

  const saveName = async () => {
    const v = nameDraft.trim().replace(/\s+/g, ' ');
    if (v.length < 2 || v.length > 30) { setNameMsg({ kind: 'err', text: 'السمية خاص تكون بين 2 و 30 حرف.' }); return; }
    setNameBusy(true); setNameMsg(null);
    try {
      const res  = await fetch('/api/me/name', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: v }) });
      const data = await res.json() as { displayName?: string; nextNameChangeAt?: string; error?: string };
      if (res.ok && data.displayName) {
        await update({ displayName: data.displayName });
        setMe((p) => p ? { ...p, displayName: data.displayName, nextNameChangeAt: data.nextNameChangeAt ?? null, canChangeName: false } : p);
        setNameMsg({ kind: 'ok', text: 'تبدلات السمية بنجاح. غادي تبدل مرة أخرى من بعد 7 أيام.' });
      } else { setNameMsg({ kind: 'err', text: data.error || 'صاب مشكل. عاود جرب.' }); }
    } catch { setNameMsg({ kind: 'err', text: 'صاب مشكل فالخادم. عاود جرب.' }); }
    setNameBusy(false);
  };

  const savePassword = async () => {
    if (pwDraft.n1.length < 6) { setPwMsg({ kind: 'err', text: 'الباسورد الجديد خاص يكون فيه 6 حروف على الأقل.' }); return; }
    if (pwDraft.n1 !== pwDraft.n2) { setPwMsg({ kind: 'err', text: 'الباسورد الجديد ماشي كيف كيف فالتأكيد.' }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      const res  = await fetch('/api/me/password', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwDraft.cur, newPassword: pwDraft.n1, confirmPassword: pwDraft.n2 }) });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) { setPwDraft({ cur: '', n1: '', n2: '' }); setPwMsg({ kind: 'ok', text: 'تبدل الباسورد بنجاح.' }); }
      else { setPwMsg({ kind: 'err', text: data.error || 'صاب مشكل. عاود جرب.' }); }
    } catch { setPwMsg({ kind: 'err', text: 'صاب مشكل فالخادم. عاود جرب.' }); }
    setPwBusy(false);
  };

  const [muted, setMutedState]           = useState(false);
  const [musicMuted, setMusicMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); setMusicMutedState(isMusicMuted()); }, []);

  const toggleMute = () => { const n = !muted; setMuted(n); setMutedState(n); if (!n) Sounds.click(); };
  const toggleMusic = () => { const n = !musicMuted; musicPlayer.setVolume(n); setMusicMutedState(n); if (!n) musicPlayer.start(); };

  useEffect(() => {
    const tryStart = () => { if (!isMusicMuted()) musicPlayer.start(); };
    window.addEventListener('click',      tryStart, { once: true });
    window.addEventListener('touchstart', tryStart, { once: true });
    return () => { musicPlayer.stop(); };
  }, []);

  useEffect(() => {
    if (!adModalOpen && adTimerRef.current) { clearInterval(adTimerRef.current); adTimerRef.current = null; setAdStatus('idle'); }
  }, [adModalOpen]);

  useEffect(() => {
    GAMES.forEach((g) => {
      router.prefetch(`/games/${g.id}`);
      fetch(`/game-files/${g.id}/index.html`, { priority: 'low' } as RequestInit).catch(() => {});
    });
  }, [router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/economy/balance').then((r) => r.ok ? r.json() : null).then((d) => { if (d) setXpData(d); });
  }, [status]);

  const showToast = (kind: 'error' | 'ok', text: string) => {
    setToast({ kind, text });
    kind === 'ok' ? Sounds.ok() : Sounds.error();
    window.setTimeout(() => setToast(null), 3200);
  };

  const autoClaimed = useRef(false);
  useEffect(() => {
    if (status !== 'authenticated' || autoClaimed.current) return;
    autoClaimed.current = true;
    void trackDevice();
    (async () => {
      try {
        const res  = await fetch('/api/rewards/checkin', { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json() as { claimed?: boolean; reward?: number; streak?: number };
        if (data.claimed && typeof data.reward === 'number') {
          await update();
          setCoinPop(true); setTimeout(() => setCoinPop(false), 600);
          Sounds.checkin();
          showToast('ok', `كادو د اليوم: +${data.reward} 🪙 (نهار ${data.streak ?? 1})`);
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
        const data = await res.json() as { coins?: number };
        if (typeof data.coins === 'number') { await update({ coins: data.coins }); setCoinPop(true); setTimeout(() => setCoinPop(false), 600); showToast('ok', `مرحبا بك! عندك ${data.coins} 🪙`); }
      } catch { await update(); }
    })();
  }, [status, searchParams, router, update]);

  const requireAuth = (gameId: string, method: 'coins' | 'ad') => {
    if (status === 'authenticated') return true;
    const intent = `?play=${gameId}&method=${method}`;
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      router.push(`/login${intent}`);
    } else {
      router.replace(intent, { scroll: false });
      setAuthSheetOpen(true);
    }
    return false;
  };

  const playWithCoins = async (gameId: string, e?: React.MouseEvent) => {
    if (!requireAuth(gameId, 'coins')) return;
    rememberPayMethod('coins');
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    const userCoins = session?.user?.coins ?? 0;
    if (userCoins < game.cost) { showToast('error', `ماعندكش كوينز كافيين — تفرج فإشهار باش تزيدهم 🔁 (${userCoins}/${game.cost})`); return; }
    if (e) spawnCoins(e.clientX, e.clientY);
    Sounds.coin();
    setBusyId(gameId); setBusyAction('coins');
    setLaunching(game);
    try {
      const res = await fetch('/api/games/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ gameId, paymentMethod: 'coins' }) });
      if (res.ok) {
        const { redirectUrl, remainingCoins } = await res.json();
        if (typeof remainingCoins === 'number') await update({ coins: remainingCoins });
        Sounds.launch();
        router.replace(redirectUrl);
      } else {
        setLaunching(null);
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error ?? 'اللعبة ماخدماتش، عاود جرب');
      }
    } catch { setLaunching(null); showToast('error', 'مشكل فالكونيكسيون — عاود جرب'); }
    finally { setBusyId(null); setBusyAction(null); }
  };

  const watchAdToPlay = (gameId: string) => { if (!requireAuth(gameId, 'ad')) return; setSelectedGame(gameId); setAdStatus('idle'); setAdModalOpen(true); };

  const startRewardedAd = async () => {
    const gameId = selectedGame;
    if (!gameId) return;
    try {
      const startRes = await fetch('/api/ads/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placement: 'unlock', gameId }) });
      if (startRes.status === 429) { setAdModalOpen(false); showToast('error', 'عاود جرب من بعد شوية'); return; }
      if (!startRes.ok)            { setAdModalOpen(false); showToast('error', 'مشكل فالإشهار — عاود جرب'); return; }
      const { nonce } = await startRes.json() as { nonce: string };
      setAdStatus('watching'); setCountdown(5);
      let remaining = 5;
      adTimerRef.current = setInterval(() => {
        remaining -= 1; setCountdown(remaining);
        if (remaining > 0) return;
        if (adTimerRef.current) { clearInterval(adTimerRef.current); adTimerRef.current = null; }
        setAdStatus('verifying');
        void (async () => {
          try {
            const r = await fetch('/api/ads/complete', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': nonce }, body: JSON.stringify({ nonce }) });
            if (!r.ok) { setAdModalOpen(false); showToast('error', 'مشكل فالإشهار — عاود جرب'); return; }
            const payload = await r.json() as { redirectUrl?: string; newBalance?: number; awarded?: number };
            if (payload.redirectUrl) {
              rememberPayMethod('ad');
              const game = GAMES.find((g) => g.id === gameId);
              if (game) setLaunching(game);
              router.replace(payload.redirectUrl); return;
            }
            if (typeof payload.newBalance === 'number') await update({ coins: payload.newBalance });
            showToast('ok', `+${payload.awarded ?? 0} كوينز كادو! 🎁`);
            setAdModalOpen(false);
          } catch { setAdModalOpen(false); showToast('error', 'مشكل فالإشهار — عاود جرب'); }
        })();
      }, 1000);
    } catch { setAdModalOpen(false); showToast('error', 'مشكل فالإشهار — عاود جرب'); }
  };

  const handleLogout = async () => { await signOut({ redirect: false }); router.push('/login'); };

  const resumedPlay = useRef(false);
  useEffect(() => {
    if (status !== 'authenticated' || resumedPlay.current) return;
    const gameId = searchParams.get('play');
    const method = searchParams.get('method');
    if (!gameId || !GAMES.some((g) => g.id === gameId)) return;
    if (method !== 'coins' && method !== 'ad') return;
    resumedPlay.current = true;
    router.replace('/', { scroll: false });
    if (method === 'coins') void playWithCoins(gameId);
    else watchAdToPlay(gameId);
  }, [status, searchParams, router]);

  /* ─────────────────────── LOADING ─────────────────────── */
  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#050918]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-scene absolute inset-0 opacity-60" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative grid h-16 w-16 place-items-center">
            <div className="pulse-glow-ring absolute inset-0 rounded-full border-2 border-cyan-400/30" />
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          </div>
          <p className="font-lalezar text-xl text-slate-400">كنوجدو الكراسا…</p>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins    = session?.user?.coins ?? 0;

  /* ─────────────────────── RETURN ─────────────────────── */
  return (
    <div className="relative min-h-dvh overflow-x-hidden" dir="rtl">

      {/* Launch overlay */}
      {launching && <LaunchOverlay game={launching} />}

      {/* ═══════ TOAST ═══════ */}
      {toast && (
        <div className={`fixed end-4 top-20 z-[200] flex max-w-xs items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-md ${
          toast.kind === 'ok'
            ? 'border-emerald-400/25 bg-emerald-950/80 text-emerald-200'
            : 'border-red-400/25 bg-red-950/80 text-red-200'
        }`}>
          {toast.kind === 'ok'
            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
          <p className="font-cairo text-[12.5px] font-bold leading-relaxed">{toast.text}</p>
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <header className="glass-header sticky top-0 z-[50]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 font-grit text-[13px] font-black text-[#03080e] shadow-[0_0_16px_rgba(34,211,238,0.35)]">
              P
            </div>
            <span className="font-grit text-[0.92rem] uppercase tracking-tight transition-colors group-hover:text-cyan-300">
              <span className="text-cyan-400">PLAY</span><span className="text-slate-300">M3ANA</span>
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <>
                {/* XP pill */}
                {xpData && (() => {
                  const lvl   = xpData.level;
                  const inLvl = (xpData.gamesPlayed ?? 0) % 10;
                  const pct   = Math.round((inLvl / 10) * 100);
                  return (
                    <Link href={`/profile/${session?.user?.username}`} className="xp-pill group hidden sm:flex" title={`Level ${lvl}`}>
                      <Zap className="h-3 w-3 shrink-0 text-violet-400" />
                      <span className="font-grit text-[10px] text-violet-300">LV.{lvl}</span>
                      <div className="xp-pill-track">
                        <div className="xp-pill-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  );
                })()}

                {/* Coin badge */}
                <div className={`flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-[#0a0e28]/90 px-3 py-1.5 font-cairo text-[13px] font-black tabular-nums text-amber-300 pointer-events-none ${coinPop ? 'coin-pop' : ''}`}>
                  <Coins className="h-3.5 w-3.5" /> {coins}
                </div>

                <span className="hidden max-w-[7rem] truncate font-cairo text-sm font-bold text-slate-300 sm:block">
                  {session?.user?.displayName || session?.user?.username}
                </span>

                {session?.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-cyan-400/30 sm:grid" title="Admin">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button onClick={handleLogout} className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-red-500/40 hover:text-red-400 sm:grid" title="خروج">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-chunk btn-ghost-hollow hidden px-4 py-2 text-[13px] sm:inline-flex">
                  <LogIn className="h-4 w-4" /> دخول
                </Link>
                <Link href="/register" className="btn-chunk btn-arcade px-4 py-2 text-[13px]">
                  <Zap className="h-4 w-4" /> ابدا فابور
                </Link>
              </>
            )}

            {/* Settings (mobile) */}
            <button onClick={openSettings} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-cyan-400/30 sm:hidden" aria-label="الإعدادات">
              <Settings className="h-4 w-4" />
            </button>

            {/* Mute / Music (desktop) */}
            <button onClick={toggleMute} className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-cyan-400/30 sm:grid" title={muted ? 'شعل الصوت' : 'طفي الصوت'}>
              {muted ? <VolumeX className="h-4 w-4 text-neutral-500" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button onClick={toggleMusic} className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-cyan-400/30 sm:grid" title={musicMuted ? 'شعل الموسيقى' : 'طفي الموسيقى'}>
              <Music className={`h-4 w-4 ${musicMuted ? 'text-neutral-500' : 'text-cyan-400'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="hero-scene relative overflow-hidden px-4 pb-12 pt-10 sm:min-h-[calc(100dvh-64px)] sm:pb-16 sm:pt-16">

        {/* Subtle decorative dots */}
        <div className="cyber-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="perspective-floor" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8" dir="rtl">

          {/* ── Left: Text content ── */}
          <div className="flex w-full flex-col items-center gap-5 text-center sm:w-[55%] sm:items-start sm:text-start">

            {/* Badge */}
            <div className="badge-cyber anim-fadeup d1 inline-flex">
              <span className="live-dot" />
              🃏 حومة + شوهة — 100% بالدارجة
            </div>

            {/* Title */}
            <div className="select-none" dir="rtl">
              <h1 className="font-lalezar leading-[1.1]" style={{ fontSize: 'clamp(2.8rem,10vw,5.2rem)' }}>
                <span className="letter-in block text-slate-100" style={{ animationDelay: '0.08s' }}>
                  اللعبة كتحلى
                </span>
                <span className="letter-in block text-gold-neon" style={{ animationDelay: '0.22s' }}>
                  مع صحابك
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="anim-fadeup d3 max-w-[420px] font-cairo text-[14px] font-semibold leading-relaxed text-slate-400 sm:text-[15px]">
              تيليفون واحد، دراري بزاف، وواحد فيكم غادي{' '}
              <span className="font-black text-slate-200">يفضح الجميع</span> 💀
            </p>

            {/* Stat pills */}
            <div className="anim-fadeup d4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {[
                { ico: <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />, val: `${GAMES.length}`, label: 'ألعاب' },
                { ico: <Users     className="h-3.5 w-3.5 text-violet-400" />, val: '15',              label: 'لاعب ماكس' },
                { ico: <Flame     className="h-3.5 w-3.5 text-amber-400" />,  val: '100%',            label: 'دارجة' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-[rgba(10,14,38,0.85)] px-3.5 py-1.5 backdrop-blur-sm">
                  {s.ico}
                  <span className="font-lalezar text-base leading-none text-slate-100">{s.val}</span>
                  <span className="font-cairo text-[10px] font-black text-slate-500">{s.label}</span>
                </div>
              ))}
              {isAuthed && xpData && xpData.streak >= 2 && (
                <div className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-950/30 px-3.5 py-1.5">
                  <Flame className="h-3.5 w-3.5 text-red-400" />
                  <span className="font-cairo text-[11px] font-black text-red-300">{xpData.streak} يام 🔥</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="anim-fadeup d5">
              {!isAuthed ? (
                <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                  <div className="cta-glow">
                    <Link href="/register" className="btn-chunk btn-arcade relative z-10 inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-black">
                      <Zap className="h-5 w-5" /> يلا نلعبو — فابور
                    </Link>
                  </div>
                  <a href="#games" className="btn-chunk btn-ghost-hollow inline-flex items-center gap-2 px-6 py-3.5 text-[13px]">
                    <ChevronDown className="h-4 w-4" /> شوف الألعاب
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="sonar-ring text-amber-400" />
                    <div className="sonar-ring sonar-ring-2 text-amber-400" />
                    <div className="coin-counter relative z-10">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span className="font-lalezar text-lg">{coins}</span>
                      <span className="font-cairo text-[11px] font-black text-amber-400/65"> كوين</span>
                    </div>
                  </div>
                  <p className="font-cairo text-[13px] font-bold text-slate-400">
                    رجعتي يا{' '}
                    <span className="font-black text-slate-200">{session?.user?.displayName || session?.user?.username}</span>
                    ؟ مرحبا 🤙
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Floating game orbs ── */}
          <div className="relative hidden h-[320px] w-[320px] shrink-0 sm:block lg:h-[380px] lg:w-[380px]">
            {/* Center ambient glow */}
            <div className="absolute inset-1/4 rounded-full bg-cyan-400/8 blur-3xl" />
            <div className="absolute inset-[30%] rounded-full bg-violet-400/6 blur-2xl" />

            {/* 4 game orbs in staggered positions */}
            <GameOrb game={GAMES[1]} delay={0}    rotate="-6deg"  className="absolute top-[2%]  left-[5%]" />
            <GameOrb game={GAMES[2]} delay={0.45} rotate="7deg"   className="absolute top-[8%]  right-[2%]" />
            <GameOrb game={GAMES[3]} delay={0.9}  rotate="-4deg"  className="absolute bottom-[18%] left-[2%]" />
            <GameOrb game={GAMES[4]} delay={1.3}  rotate="5deg"   className="absolute bottom-[4%]  right-[5%]" />

            {/* Center large orb: Mafia */}
            <div
              className="absolute inset-0 m-auto glass-card orb-float-inv flex flex-col items-center justify-center gap-2"
              style={{
                width: 106, height: 106, top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                borderColor: `${GAMES[0].starAccent}28`,
                boxShadow: `0 0 36px ${GAMES[0].glowAccent}25, 0 12px 32px rgba(0,0,0,0.5)`,
                animationDelay: '0.6s',
              }}
            >
              <span className="text-[2.2rem] leading-none">{GAMES[0].emoji}</span>
              <span className="font-cairo text-[8.5px] font-black text-neutral-600">{GAMES[0].darijaTitle.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Mobile hero game orbs row */}
        <div className="relative z-10 mt-6 flex justify-center gap-3 sm:hidden">
          {GAMES.slice(0, 4).map((g, i) => (
            <div key={g.id} className="glass-card flex flex-col items-center justify-center gap-1 p-2.5 orb-float"
              style={{ width: 60, height: 60, borderColor: `${g.starAccent}20`, boxShadow: `0 0 16px ${g.glowAccent}15`, animationDelay: `${i * 0.3}s` }}>
              <span className="text-xl leading-none">{g.emoji}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 start-1/2 hidden scroll-hint sm:block">
          <ChevronDown className="h-6 w-6 text-slate-600" />
        </div>
      </section>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))] sm:px-6">

        {/* ── Ticker ── */}
        <div className="led-strip my-1 py-2.5">
          <div className="led-strip-track">
            {[...Array(2)].map((_, l) => (
              <span key={l} className="flex shrink-0 items-center gap-5 px-6 font-cairo text-[12.5px] font-black text-cyan-400/40">
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="flex items-center gap-5">
                    <span className="text-cyan-600/30">◆</span>{item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Guest notice */}
        {!isAuthed && <GuestNotice />}

        {/* ── GAMES ── */}
        <section id="games" className="mt-8 sm:mt-14">
          <div className="section-entrance mb-6 flex flex-col items-center gap-2.5 text-center sm:mb-10">
            <div className="section-label">🎮 الطبلات د هاد الليلة</div>
            <h2 className="font-lalezar leading-none text-slate-100" style={{ fontSize: 'clamp(1.9rem,8vw,3.2rem)' }}>
              عزل طبلتك
            </h2>
            <p className="font-cairo text-[12.5px] font-semibold text-slate-500 sm:text-[13.5px]">
              إشهار قصير = طبلة فابور · كوينز = دخلة بكرامتك 😅
            </p>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {GAMES.map((game, i) => (
              <div key={game.id} className={game.isMafia ? 'sm:col-span-2 lg:col-span-4' : `card-entrance stagger-${Math.min(i, 3) + 1}`}>
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

        {/* Ad banner */}
        <AdBanner />

        {/* Coming soon */}
        <ComingSoon />

        {/* How it works */}
        <HowItWorks />

        {/* Leaderboard teaser */}
        <LeaderboardTeaser />

        {/* Referral */}
        {isAuthed && xpData?.referralCode && (
          <section className="mt-10">
            <div className="overflow-hidden rounded-2xl border border-violet-400/12 bg-[rgba(10,14,38,0.85)] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                <span className="font-lalezar text-xl text-violet-300">عرض على صاحبك</span>
              </div>
              <p className="mb-4 font-cairo text-[13px] font-semibold text-slate-500">
                بارطاجي الكود مع صاحبك — بجوج غاتربحو كوينز فابور 🎁
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 overflow-hidden rounded-xl border border-violet-400/12 bg-[#04060f] px-4 py-3 font-mono text-[15px] tracking-widest text-violet-200">
                  {xpData.referralCode}
                </code>
                <button onClick={() => { void navigator.clipboard.writeText(xpData!.referralCode!); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2200); }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-400/25 bg-violet-400/8 px-4 py-3 font-cairo text-[13px] font-black text-violet-300 transition hover:bg-violet-400/16">
                  {referralCopied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  {referralCopied ? 'تم!' : 'كوپي'}
                </button>
              </div>
            </div>
          </section>
        )}

        <LobbyFooter isAuthed={isAuthed} username={session?.user?.username} />
      </main>

      {/* ═══════ MISSIONS FAB ═══════ */}
      {isAuthed && (
        <button onClick={() => setMissionsOpen(true)} className="missions-fab" aria-label="المهام">
          <Target className="h-5 w-5" />
          <span className="font-cairo text-[11px] font-bold">مهام</span>
        </button>
      )}

      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => { void update(); setMissionsOpen(false); showToast('ok', `مبروك! ربحتي +${reward} 🪙 على المهمة 🎯`); }}
        />
      )}

      {/* ═══════ AD MODAL ═══════ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="bounce-in relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#070b1f] p-6 shadow-2xl">
            <button onClick={() => setAdModalOpen(false)} className="absolute start-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400" aria-label="close">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={24} />
              <p className="font-cairo text-[13px] font-black text-slate-300">إشهار باش تلعب</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-slate-100">ثواني من وقتك مقابل الليلة كاملة</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-slate-400">
                  شاهد الإعلان وغادي نفتح ليك الطاولة <b className="text-amber-300">فابور</b> — ماشي هزيمة، هذا تكتيك 😅
                </p>
                <button onClick={startRewardedAd} className="btn-chunk btn-amber mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> تفرج — وعيني عينك
                </button>
                <button onClick={() => setAdModalOpen(false)} className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-slate-500 hover:text-slate-300">
                  لا شكرا، غانخلص بالكوينز
                </button>
              </>
            )}
            {adStatus === 'watching' && (
              <div className="mt-4 flex flex-col gap-3">
                <AdNativeBanner />
                <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-4">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <span className="glow-pulse absolute inset-0 rounded-full bg-cyan-400/20 blur-xl" />
                    <span className="relative font-lalezar text-2xl text-cyan-400">{countdown}</span>
                  </div>
                  <div>
                    <p className="font-cairo text-[13px] font-black text-cyan-200">صبر على الإشهار…</p>
                    <p className="font-cairo text-[11px] font-semibold text-slate-500">
                      غادي تدخل للطبلة من بعد {countdown} {countdown === 1 ? 'ثانية' : 'ثواني'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {adStatus === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/35 bg-emerald-400/8">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">كنتأكدو بلي ماتفرجتيش ف الإشهار وعينيك مسدودين…</p>
                <p className="font-cairo text-[12px] font-semibold text-slate-400">تقدر تعيط لصحابك باش توجدو 🫡</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ AUTH SHEET (mobile) ═══════ */}
      {authSheetOpen && (
        <div className="fixed inset-0 z-[65] sm:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthSheetOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-cyan-400/15 bg-[#070b1f] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            <button onClick={() => setAuthSheetOpen(false)} className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400" aria-label="close">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={24} />
              <p className="font-cairo text-[13px] font-black text-slate-300">التهاليب محجوزين للعضاء</p>
            </div>
            <h3 className="mt-4 font-lalezar text-2xl text-slate-100">دخول في 5 ثواني باش تفرش الطبلة</h3>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-slate-400">
              دخل ولا صاوب كونط فابور — وعندك 100 كوين باش تبدا الشوهة فابور 🪙
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/login" className="btn-chunk btn-arcade w-full py-3.5 text-[15px]">
                <LogIn className="h-5 w-5" /> دخول
              </Link>
              <Link href="/register" className="btn-chunk btn-ghost-hollow w-full py-3.5 text-[14px]">
                <UserPlus className="h-5 w-5" /> صاوب كونط — فابور
              </Link>
            </div>
            <button onClick={() => setAuthSheetOpen(false)} className="mt-3 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-slate-500 hover:text-slate-300">
              شوف الطبلات — من بعد ندير الحساب
            </button>
          </div>
        </div>
      )}

      {/* ═══════ SETTINGS SHEET (mobile) ═══════ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[66] sm:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-cyan-400/15 bg-[#070b1f] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            <button onClick={() => setSettingsOpen(false)} className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-slate-400 hover:border-red-500/40 hover:text-red-400" aria-label="close">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-5">
              <Settings className="h-5 w-5 text-cyan-400" />
              <p className="font-cairo text-[14px] font-black text-slate-200">الإعدادات</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {isAuthed && (
                <div className="flex items-center justify-between rounded-2xl border border-amber-400/12 bg-amber-950/10 px-4 py-3">
                  <span className="font-cairo text-[13px] font-bold text-slate-300">الكوينز ديالك</span>
                  <span className="flex items-center gap-1.5 font-cairo text-[15px] font-black tabular-nums text-amber-300">
                    <Coins className="h-4 w-4" /> {coins}
                  </span>
                </div>
              )}

              <button onClick={toggleMute} className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-slate-300">
                  {muted ? <VolumeX className="h-4 w-4 text-neutral-500" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
                  الصوت
                </span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${muted ? 'bg-white/8' : 'bg-cyan-500/35'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${muted ? 'start-0.5' : 'start-[1.375rem]'}`} />
                </span>
              </button>

              <button onClick={toggleMusic} className="flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-slate-300">
                  <Music className={`h-4 w-4 ${musicMuted ? 'text-neutral-500' : 'text-cyan-400'}`} />
                  الموسيقى
                </span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${musicMuted ? 'bg-white/8' : 'bg-cyan-500/35'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${musicMuted ? 'start-0.5' : 'start-[1.375rem]'}`} />
                </span>
              </button>

              {isAuthed && (
                <div className="rounded-2xl border border-violet-400/15 bg-violet-950/10 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="h-4 w-4 shrink-0 text-violet-300" />
                    <span className="font-cairo text-[13px] font-bold text-slate-300">تبديل السمية</span>
                  </div>
                  {me?.username && (
                    <p className="mt-1.5 font-cairo text-[11px] text-slate-500">
                      اسم الكونط الأصلي: <span className="font-bold text-slate-400">{me.username}</span>
                      {me.email ? ` (${me.email})` : ''}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input value={nameDraft} onChange={(e) => { setNameDraft(e.target.value); setNameMsg(null); }}
                      maxLength={30} disabled={nameBusy || me?.canChangeName === false}
                      placeholder="السمية الجديدة…"
                      className="w-full min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 font-cairo text-[13px] font-bold text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-violet-400/45 disabled:opacity-40" />
                    <button onClick={() => void saveName()} disabled={nameBusy || me?.canChangeName === false}
                      className="btn-chunk btn-amber shrink-0 px-4 py-2.5 text-[12px] disabled:opacity-40">
                      {nameBusy ? '…' : 'حفظ'}
                    </button>
                  </div>
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11px] font-bold text-violet-300/75">
                      <Clock className="h-3.5 w-3.5" />
                      تقدر تبدل من بعد {new Date(me.nextNameChangeAt).toLocaleDateString('ar-MA')}
                    </p>
                  )}
                  {nameMsg && (
                    <p className={`mt-2 font-cairo text-[11px] font-bold ${nameMsg.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>{nameMsg.text}</p>
                  )}
                </div>
              )}

              {isAuthed && me?.hasPassword && (
                <div className="rounded-2xl border border-cyan-400/12 bg-cyan-950/8 px-4 py-3.5">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-cyan-300" />
                    <span className="font-cairo text-[13px] font-bold text-slate-300">تغيير الباسورد</span>
                  </div>
                  {(['cur', 'n1', 'n2'] as const).map((k, idx) => (
                    <input key={k} type="password"
                      value={pwDraft[k]}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, [k]: e.target.value })); setPwMsg(null); }}
                      placeholder={['الباسورد الحالي', 'الباسورد الجديد', 'تأكيد الباسورد'][idx]}
                      className="mb-2 w-full rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 font-cairo text-[13px] text-slate-200 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/40" />
                  ))}
                  <button onClick={() => void savePassword()} disabled={pwBusy}
                    className="btn-chunk btn-arcade w-full py-2.5 text-[13px] disabled:opacity-40">
                    {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ الباسورد'}
                  </button>
                  {pwMsg && (
                    <p className={`mt-2 font-cairo text-[11px] font-bold ${pwMsg.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>{pwMsg.text}</p>
                  )}
                </div>
              )}

              {isAuthed && (
                <button onClick={handleLogout} className="btn-chunk btn-ghost-hollow mt-1 w-full py-3.5 text-[13px] text-red-400 hover:border-red-500/35">
                  <LogOut className="h-4 w-4" /> خروج
                </button>
              )}
              {!isAuthed && (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="btn-chunk btn-arcade w-full py-3.5 text-[14px]"><LogIn className="h-4 w-4" /> دخول</Link>
                  <Link href="/register" className="btn-chunk btn-ghost-hollow w-full py-3.5 text-[13px]"><UserPlus className="h-4 w-4" /> صاوب كونط — فابور</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Export with Suspense (needed for useSearchParams)
───────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center bg-[#050918]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}
