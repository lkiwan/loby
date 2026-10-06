'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle, Check, ChevronDown, Clock, Coins,
  Gamepad2, Loader2, LogIn, LogOut,
  Music, Play, Settings, ShieldCheck, UserPlus, Users, Volume2, VolumeX, X, Zap,
  Bell, Home, User
} from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameCard from '@/components/GameCard';
import GameIcon from '@/components/GameIcon';
import GuestNotice from '@/components/landing/GuestNotice';
import ComingSoon from '@/components/landing/ComingSoon';
import LeaderboardTeaser from '@/components/landing/LeaderboardTeaser';
import LobbyFooter from '@/components/landing/LobbyFooter';
import { GAMES, type Game } from '@/lib/games';
import AdBanner from '@/components/AdBanner';
import AdNativeBanner from '@/components/AdNativeBanner';
import { rememberPayMethod } from '@/lib/payMethod';
import { clearSessionRoster } from '@/lib/roster';
import { trackDevice } from '@/lib/device';
import { Sounds, isMuted, setMuted, musicPlayer, isMusicMuted, unlockAudio } from '@/lib/sounds';
import dynamic from 'next/dynamic';

const MissionsPanel        = dynamic(() => import('@/components/MissionsPanel'),        { ssr: false });
const FriendsPanel         = dynamic(() => import('@/components/FriendsPanel'),         { ssr: false });
const DailyMissionButtons  = dynamic(() => import('@/components/DailyMissionButtons'),  { ssr: false });

const TICKER_ITEMS = [
  '🔥 الصداع د الحومة كاين من بكري',
  '🇲🇦 تحداو بعضياتكم بالدارجة',
  '🕹️ كلشي بالدارجة — حتى الكدوب والمعاودة',
  '🎲 تيليفون واحد = بزاف د الشوهة',
  '🤫 واحد فيكم كيكدب — مرحبا بيك فالحومة',
  '💰 تفرج فإشهار — ماشي خسارة، هادا تكتيك',
  '💔 الليلة تولي جريمة فالطبلة، والجيران شاهدين',
];

const TITLE_WORDS_1 = ['فضح', 'صاحبك'];
const TITLE_WORDS_2 = ['قبل', 'ما', 'يفضحك'];

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
          <GameIcon game={game} size={116} />
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
          كنوجدو الطبلة…
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
  const [countdown, setCountdown] = useState(5);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toast, setToast] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [coinPop, setCoinPop] = useState(false);
  const [launching, setLaunching] = useState<Game | null>(null);
  const [cardsVisible, setCardsVisible] = useState(true);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [xpData, setXpData] = useState<{ xp: number; level: number; gamesPlayed: number; streak: number; referralCode?: string } | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── Settings: name + password ── */
  const [me, setMe] = useState<{
    username?: string | null;
    displayName?: string | null;
    email?: string | null;
    hasPassword?: boolean;
    nextNameChangeAt?: string | null;
    canChangeName?: boolean;
  } | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pwDraft, setPwDraft] = useState({ cur: '', n1: '', n2: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = (await res.json()) as {
          username?: string | null;
          displayName?: string | null;
          email?: string | null;
          hasPassword?: boolean;
          nextNameChangeAt?: string | null;
          canChangeName?: boolean;
        };
        setMe(data);
        setNameDraft(data.displayName ?? '');
      }
    } catch {
      /* settings sheet still works without profile info */
    }
  }, []);

  const openSettings = () => {
    setSettingsOpen(true);
    if (isAuthed) void fetchMe();
  };

  const openFriends = () => {
    if (!isAuthed) {
      if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
        router.push('/login');
      } else {
        setAuthSheetOpen(true);
      }
      return;
    }
    /* Back in the lobby: drop the in-game edits so the panel shows exactly the
       names saved in the account, never the temporary round roster. */
    clearSessionRoster();
    setFriendsOpen(true);
  };

  const saveName = async () => {
    const v = nameDraft.trim().replace(/\s+/g, ' ');
    if (v.length < 2 || v.length > 30) {
      setNameMsg({ kind: 'err', text: 'السمية خاص تكون بين 2 و 30 حرف.' });
      return;
    }
    setNameBusy(true);
    setNameMsg(null);
    try {
      const res = await fetch('/api/me/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: v }),
      });
      const data = (await res.json()) as { displayName?: string; nextNameChangeAt?: string; error?: string };
      if (res.ok && data.displayName) {
        await update({ displayName: data.displayName });
        setMe((prev) =>
          prev
            ? { ...prev, displayName: data.displayName, nextNameChangeAt: data.nextNameChangeAt ?? null, canChangeName: false }
            : prev
        );
        setNameMsg({ kind: 'ok', text: 'تبدلات السمية بنجاح. غادي تبدل مرة أخرى من بعد 7 أيام.' });
      } else {
        setNameMsg({ kind: 'err', text: data.error || 'صاب مشكل. عاود جرب.' });
      }
    } catch {
      setNameMsg({ kind: 'err', text: 'صاب مشكل فالخادم. عاود جرب.' });
    }
    setNameBusy(false);
  };

  const savePassword = async () => {
    if (pwDraft.n1.length < 6) {
      setPwMsg({ kind: 'err', text: 'الباسورد الجديد خاص يكون فيه 6 حروف على الأقل.' });
      return;
    }
    if (pwDraft.n1 !== pwDraft.n2) {
      setPwMsg({ kind: 'err', text: 'الباسورد الجديد ماشي كيف كيف فالتأكيد.' });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await fetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwDraft.cur,
          newPassword: pwDraft.n1,
          confirmPassword: pwDraft.n2,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setPwDraft({ cur: '', n1: '', n2: '' });
        setPwMsg({ kind: 'ok', text: 'تبدل الباسورد بنجاح.' });
      } else {
        setPwMsg({ kind: 'err', text: data.error || 'صاب مشكل. عاود جرب.' });
      }
    } catch {
      setPwMsg({ kind: 'err', text: 'صاب مشكل فالخادم. عاود جرب.' });
    }
    setPwBusy(false);
  };
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) Sounds.click();
  };

  const [musicMuted, setMusicMutedState] = useState(false);
  const [showMusicHint, setShowMusicHint] = useState(false);
  useEffect(() => { setMusicMutedState(isMusicMuted()); }, []);

  useEffect(() => {
    if (isMusicMuted()) return;
    musicPlayer.start();
    setShowMusicHint(true);
    const t = setTimeout(() => setShowMusicHint(false), 5800);
    return () => { musicPlayer.stop(); clearTimeout(t); };
  }, []);

  const toggleMusic = () => {
    const next = !musicMuted;
    musicPlayer.setVolume(next);
    setMusicMutedState(next);
    if (!next) { unlockAudio(); musicPlayer.start(); }
    else musicPlayer.stop();
  };
  useEffect(() => {
    if (!adModalOpen && adTimerRef.current) {
      clearInterval(adTimerRef.current);
      adTimerRef.current = null;
      setAdStatus('idle');
    }
  }, [adModalOpen]);

  useEffect(() => {
    GAMES.forEach((g) => {
      router.prefetch(`/games/${g.id}`);
      fetch(`/game-files/${g.id}/index.html`, { priority: 'low' } as RequestInit).catch(() => {});
    });
  }, [router]);

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
          showToast('ok', `كادو د اليوم: +${data.reward} 🪙 (نهار${data.streak ?? 1})`);
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
          showToast('ok', `مرحبا بك! عندك ${data.coins} 🪙`);
        }
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
    const coins = session?.user?.coins ?? 0;
    if (coins < game.cost) {
      showToast('error', `ماعندكش كوينز كافيين — تفرج فإشهار باش تزيدهم 🔁 (${coins}/${game.cost})`);
      return;
    }

    if (e) spawnCoins(e.clientX, e.clientY);
    Sounds.coin();

    setBusyId(gameId); setBusyAction('coins');
    setLaunching(game);

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
        showToast('error', err.error ?? 'اللعبة ماخدماتش، عاود جرب');
      }
    } catch {
      setLaunching(null);
      showToast('error', 'مشكل فالكونيكسيون — عاود جرب');
    } finally {
      setBusyId(null); setBusyAction(null);
    }
  };

  const watchAdToPlay = (gameId: string) => {
    if (!requireAuth(gameId, 'ad')) return;
    setSelectedGame(gameId); setAdStatus('idle'); setAdModalOpen(true);
  };

  const startRewardedAd = async () => {
    const gameId = selectedGame;
    if (!gameId) return;
    try {
      const startRes = await fetch('/api/ads/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placement: 'unlock', gameId }),
      });
      if (startRes.status === 429) {
        setAdModalOpen(false);
        showToast('error', 'عاود جرب من بعد شوية');
        return;
      }
      if (!startRes.ok) {
        setAdModalOpen(false);
        showToast('error', 'مشكل فالإشهار — عاود جرب');
        return;
      }
      const { nonce } = (await startRes.json()) as { nonce: string };
      setAdStatus('watching');
      setCountdown(5);
      let remaining = 5;
      adTimerRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining > 0) return;
        if (adTimerRef.current) { clearInterval(adTimerRef.current); adTimerRef.current = null; }
        setAdStatus('verifying');
        void (async () => {
          try {
            const r = await fetch('/api/ads/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Idempotency-Key': nonce },
              body: JSON.stringify({ nonce }),
            });
            if (!r.ok) { setAdModalOpen(false); showToast('error', 'مشكل فالإشهار — عاود جرب'); return; }
            const payload = (await r.json()) as { redirectUrl?: string; newBalance?: number; awarded?: number };
            if (payload.redirectUrl) {
              rememberPayMethod('ad');
              const game = GAMES.find((g) => g.id === gameId);
              if (game) setLaunching(game);
              router.replace(payload.redirectUrl);
              return;
            }
            if (typeof payload.newBalance === 'number') await update({ coins: payload.newBalance });
            showToast('ok', `+${payload.awarded ?? 0} كوينز كادو! 🎁`);
            setAdModalOpen(false);
          } catch {
            setAdModalOpen(false);
            showToast('error', 'مشكل فالإشهار — عاود جرب');
          }
        })();
      }, 1000);
    } catch {
      setAdModalOpen(false);
      showToast('error', 'مشكل فالإشهار — عاود جرب');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

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

  if (status === 'loading') {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#07111F] overflow-hidden zellige-bg">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#07111F]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#D8A62A]/6 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-[#6D3CCF]/8 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Moroccan arch loading frame */}
          <div className="relative">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent"/>
                  <stop offset="50%" stopColor="#D8A62A"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
              </defs>
              <path d="M 8,100 L 8,44 Q 8,4 60,4 Q 112,4 112,44 L 112,100"
                stroke="url(#loadGrad)" strokeWidth="2" opacity="0.8"/>
              <polygon points="55,4 60,0 65,4 63,10 57,10" fill="#D8A62A" opacity="0.9"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pt-4">
              <StarMark size={52} />
            </div>
          </div>
          <div className="pulse-glow-ring h-10 w-10 rounded-full border-2 border-[#D8A62A]/40 grid place-items-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#D8A62A]" />
          </div>
          <p className="font-lalezar text-2xl text-[#F5E7CE] text-glow-gold">كنوجدو الكراسا…</p>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#060810] text-white"
      style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
      {launching && <LaunchOverlay game={launching} />}

      {/* ══════════════════════════════════════════
          HEADER — sticky dark bar
      ══════════════════════════════════════════ */}
      {/* RTL: first child → visual RIGHT, last child → visual LEFT */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-[54px]"
        style={{ background: 'rgba(6,8,16,0.55)', backdropFilter: 'blur(16px) saturate(160%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* FIRST → visual RIGHT */}
        <div className="flex items-center gap-1.5">
          <button
            className="h-8 w-8 grid place-items-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" />
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={toggleMute}
            className="h-8 w-8 grid place-items-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-white/42" /> : <Volume2 className="h-3.5 w-3.5 text-white/42" />}
          </button>
          <button
            onClick={toggleMusic}
            title={musicMuted ? 'تشغيل الموسيقى' : 'إيقاف الموسيقى'}
            className="h-8 w-8 grid place-items-center rounded-full transition-all"
            style={{
              background: musicMuted ? 'rgba(255,255,255,0.05)' : 'rgba(232,180,48,0.12)',
              border: musicMuted ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(232,180,48,0.35)',
            }}
          >
            <Music className="h-3.5 w-3.5" style={{ color: musicMuted ? 'rgba(255,255,255,0.35)' : '#E8B430' }} />
          </button>
          {isAuthed ? (
            <a
              href="#most-played"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-cairo font-black text-[12px]"
              style={{ background: 'linear-gradient(135deg,#F5CC6B,#E8B430)', color: '#060810', boxShadow: '0 2px 12px rgba(232,180,48,0.4)' }}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              لعب دايا
            </a>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-cairo font-black text-[12px]"
              style={{ background: 'linear-gradient(135deg,#F5CC6B,#E8B430)', color: '#060810', boxShadow: '0 2px 12px rgba(232,180,48,0.4)' }}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              لعب دايا
            </Link>
          )}
        </div>

        {/* CENTER: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-playm3ana-new.png" alt="PlayM3ana" width={34} height={28} className="h-7 w-auto object-contain" />
          <span className="font-cairo font-black text-[15px] tracking-tight">
            <span className="text-white">PLAY</span>
            <span style={{ color: '#E8B430' }}>M3ANA</span>
          </span>
        </Link>

        {/* LAST → visual LEFT: hamburger */}
        <button
          onClick={openSettings}
          className="h-9 w-9 grid place-items-center rounded-xl transition hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
        >
          <svg width="17" height="13" viewBox="0 0 17 13" fill="none" aria-hidden="true">
            <rect width="17" height="2.2" rx="1.1" fill="rgba(255,255,255,0.8)" />
            <rect y="5.4" width="11" height="2.2" rx="1.1" fill="rgba(255,255,255,0.8)" />
            <rect y="10.8" width="17" height="2.2" rx="1.1" fill="rgba(255,255,255,0.8)" />
          </svg>
        </button>
      </header>

      {/* Coins pill */}
      {isAuthed && (
        <div
          className={`fixed end-4 top-[62px] z-[55] flex select-none items-center gap-1.5 rounded-full border px-3 py-1 font-cairo text-[13px] font-black tabular-nums pointer-events-none backdrop-blur-sm ${coinPop ? 'coin-pop' : ''}`}
          style={{ borderColor: 'rgba(232,180,48,0.35)', background: 'rgba(6,8,16,0.95)', color: '#E8B430', boxShadow: '0 0 14px rgba(232,180,48,0.25)' }}
        >
          <Coins className="h-3.5 w-3.5" />
          {coins}
        </div>
      )}

      {/* Level pill — mirrored on start side (visual right in RTL) */}
      {isAuthed && xpData && (
        <div
          className="fixed start-4 top-[62px] z-[55] flex select-none items-center gap-1.5 rounded-full border px-3 py-1 pointer-events-none backdrop-blur-sm"
          style={{ borderColor: 'rgba(232,180,48,0.25)', background: 'rgba(6,8,16,0.95)', boxShadow: '0 0 10px rgba(232,180,48,0.15)' }}
        >
          <span className="font-grit text-[12px]" style={{ color: '#E8B430' }}>LV.{xpData.level}</span>
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, ((xpData.xp % Math.floor(100 * Math.pow(xpData.level, 1.4))) / Math.max(1, Math.floor(100 * Math.pow(xpData.level, 1.4)))) * 100)}%`,
                background: 'linear-gradient(90deg,#E8B430,#F5CC6B)',
              }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO — image complète + contenu superposé
      ══════════════════════════════════════════ */}
      <section className="relative w-full" style={{ background: '#060810' }}>

        {/* IMAGE — aspect ratio exact 1672/941, object-contain = photo complète visible */}
        <div className="relative w-full" style={{ aspectRatio: '1672 / 941' }}>
          <Image
            src="/images/moroccan-hero-full.png"
            alt="PLAYM3ANA — ساحة الألعاب المغربية"
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
          />
        </div>

        {/* GRADIENT OVERLAY — fondu du bas vers le haut, couvre ~55% inférieur */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '62%',
            background: 'linear-gradient(to top, #060810 0%, #060810 28%, rgba(6,8,16,0.85) 55%, rgba(6,8,16,0.3) 80%, transparent 100%)',
          }}
        />

        {/* CONTENU — superposé en bas de l'image */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 flex flex-col gap-3">

          {/* LIVE badge */}
          <div
            className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full font-cairo text-[10px] font-black"
            style={{ background: 'rgba(194,52,26,0.25)', border: '1px solid rgba(194,52,26,0.5)', color: '#FF7A5E', backdropFilter: 'blur(4px)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
            LIVE GAMING
          </div>

          <h1 className="font-lalezar leading-[1.08]" style={{ fontSize: 'clamp(1.75rem,7.5vw,2.4rem)', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
            <span className="text-white">اللعب كيزيد</span><br />
            <span style={{
              background: 'linear-gradient(135deg,#F5CC6B 0%,#E8B430 45%,#C2341A 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>الحلا مع صحابك</span>
          </h1>

          <div className="flex items-center gap-2.5">
            <a
              href="#most-played"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] font-cairo font-black text-[14px]"
              style={{ background: 'rgba(194,52,26,0.95)', border: '1px solid rgba(220,80,40,0.55)', color: 'white', boxShadow: '0 4px 20px rgba(194,52,26,0.6)' }}
            >
              <Gamepad2 className="h-4 w-4" />
              لعب دايا
            </a>
            {!isAuthed && (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-[14px] font-cairo font-black text-[12px]"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
              >
                صاوب كونط
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIVE TICKER — activity strip
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-2.5"
        style={{ background: 'rgba(194,52,26,0.1)', borderTop: '1px solid rgba(194,52,26,0.22)', borderBottom: '1px solid rgba(194,52,26,0.12)' }}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 z-10" style={{ background: 'linear-gradient(to left, #060810, transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 z-10" style={{ background: 'linear-gradient(to right, #060810, transparent)' }} />
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="font-cairo text-[11px] font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.52)' }}>
              {item}
              <span className="mx-4" style={{ color: 'rgba(232,180,48,0.45)' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS — 3 community numbers
      ══════════════════════════════════════════ */}
      <div
        className="grid grid-cols-3"
        style={{ background: 'rgba(6,8,16,0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {[
          { emoji: '🎮', num: '+50',   label: 'لعبة مختلفة',     color: '#E8B430' },
          { emoji: '🏆', num: '+100K', label: 'لاعب نشيط',        color: '#10A07A' },
          { emoji: '⭐', num: '4.8',   label: 'تقييم المستخدمين', color: '#F5CC6B' },
        ].map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1 py-4"
            style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <span className="text-[18px]">{s.emoji}</span>
            <p className="font-lalezar text-[16px] leading-none" style={{ color: s.color }}>{s.num}</p>
            <p className="font-cairo text-[8.5px] font-semibold text-center px-2 leading-tight" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          أبواب المدينة — GAME DOORS (mobile carousel)
      ══════════════════════════════════════════ */}
      <section id="most-played" className="pt-5 pb-4 sm:hidden">
        <div className="flex items-center justify-between px-4 mb-4">
          <a href="#most-played" className="font-cairo text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
            عرض الكل
          </a>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: '#E8B430', opacity: 0.65 }} />
            <h2 className="font-lalezar text-[19px] text-white">أبواب المدينة</h2>
            <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: '#E8B430', opacity: 0.65 }} />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {GAMES.map((game, i) => {
            const rankBg  = ['#E8B430','#A855F7','#C2341A','#EF4444','#10A07A'][i];
            const rankClr = i === 0 ? '#060810' : '#fff';
            return (
              /* Wrapper fixe 150px — GameCard se dimensionne à l'intérieur */
              <div key={game.id} className="snap-center shrink-0 relative" style={{ width: 150 }}>
                <GameCard
                  game={game}
                  coins={coins}
                  isBusy={busyId === game.id}
                  loadingAction={busyAction}
                  onPlay={(e) => playWithCoins(game.id, e)}
                  onWatchAd={() => watchAdToPlay(game.id)}
                />
                {/* Rank badge superposé sur la card */}
                <div
                  className="absolute top-3 end-3 z-20 h-6 w-6 rounded-full grid place-items-center font-cairo text-[10px] font-black pointer-events-none"
                  style={{ background: rankBg, color: rankClr, boxShadow: `0 2px 8px ${rankBg}70` }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Desktop: full game cards grid */}
      <section id="games-section" className="hidden sm:block px-6 pb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2.5 h-2.5 rotate-45 flex-shrink-0" style={{ background: '#E8B430', opacity: 0.7 }} />
          <h2 className="font-lalezar text-[22px] text-white">أبواب المدينة</h2>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(232,180,48,0.3),transparent)' }} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              coins={coins}
              isBusy={busyId === game.id}
              loadingAction={busyAction}
              onPlay={(e) => playWithCoins(game.id, e)}
              onWatchAd={() => watchAdToPlay(game.id)}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES — filter by type
      ══════════════════════════════════════════ */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {([
            { id: 'g', icon: '👥', label: 'الألعاب الجماعية', bg: 'rgba(72,42,155,0.85)',  border: 'rgba(105,65,210,0.55)', color: '#C4A8FF' },
            { id: 'd', icon: '🎨', label: 'الكتف مع الرسم',   bg: 'rgba(12,75,95,0.85)',   border: 'rgba(40,175,200,0.55)', color: '#6DE6F5' },
            { id: 'm', icon: '🧠', label: 'ألعاب ذكاء',        bg: 'rgba(8,68,42,0.85)',    border: 'rgba(22,165,95,0.55)',  color: '#4DDD9A' },
            { id: 's', icon: '⚡', label: 'ألعاب سريعة',       bg: 'rgba(80,52,4,0.85)',    border: 'rgba(235,175,35,0.55)', color: '#F5D060' },
            { id: 'f', icon: '⚽', label: 'كرة القدم',         bg: 'rgba(6,58,28,0.85)',    border: 'rgba(30,190,88,0.55)',  color: '#86EFAC' },
          ] as const).map((cat) => (
            <button
              key={cat.id}
              className="shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-[14px] min-w-[68px] transition-transform hover:scale-105 active:scale-95"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
            >
              <span className="text-[22px] leading-none">{cat.icon}</span>
              <span className="font-cairo text-[8.5px] font-black text-center" style={{ color: cat.color, whiteSpace: 'nowrap' }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════ MISSIONS — floating buttons (DailyMissionButtons, bottom-left) ══════ */}

      {/* ══════ GUEST CTA ══════ */}
      {!isAuthed && (
        <section className="px-4 pb-4">
          <div
            className="rounded-[20px] p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(232,180,48,0.1) 0%,rgba(6,8,16,0.95) 100%)', border: '1px solid rgba(232,180,48,0.22)' }}
          >
            <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[20px]"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(232,180,48,0.7),#E8B430,rgba(232,180,48,0.7),transparent)' }} />
            <p className="font-lalezar text-[19px] text-white mb-1">دخل وبدا تلعب مجاناً 🎮</p>
            <p className="font-cairo text-[11px] text-white/38 mb-4">عندك 100 كوين باش تبدا الشوهة</p>
            <div className="flex gap-2.5">
              <Link
                href="/register"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{ background: 'linear-gradient(135deg,#F5CC6B,#E8B430)', color: '#060810' }}
              >
                صاوب كونط
              </Link>
              <Link
                href="/login"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
              >
                دخول
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════ REFERRAL ══════ */}
      {isAuthed && xpData?.referralCode && (
        <section className="px-4 pb-4">
          <div className="rounded-[18px] p-4" style={{ background: 'rgba(232,180,48,0.06)', border: '1px solid rgba(232,180,48,0.18)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" style={{ color: '#E8B430' }} />
              <span className="font-lalezar text-[17px]" style={{ color: '#E8B430' }}>عرض على صاحبك</span>
            </div>
            <p className="font-cairo text-[11px] text-white/42 mb-3">بارطاجي الكود — بجوج غاتربحو كوينز فابور 🎁</p>
            <div className="flex items-center gap-2.5">
              <code
                className="flex-1 rounded-xl px-3 py-2.5 font-mono text-[13px] tracking-widest text-white"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(232,180,48,0.18)' }}
              >
                {xpData.referralCode}
              </code>
              <button
                onClick={() => { void navigator.clipboard.writeText(xpData!.referralCode!); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2200); }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-cairo text-[12px] font-black"
                style={{ background: 'rgba(232,180,48,0.12)', border: '1px solid rgba(232,180,48,0.28)', color: '#E8B430' }}
              >
                {referralCopied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                {referralCopied ? 'تم!' : 'كوپي'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Ad + Footer */}
      <div className="px-4 pb-4"><AdBanner /></div>
      <div className="px-4"><LobbyFooter isAuthed={isAuthed} username={session?.user?.username} /></div>

      {/* ══════════════════════════════════════════
          BOTTOM NAV — 4 tabs, mobile only
      ══════════════════════════════════════════ */}
      {/* RTL: first DOM child → visual RIGHT */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:hidden"
        style={{ background: '#060810', borderTop: '1px solid rgba(232,180,48,0.1)' }}
      >
        {/* الرئيسية — visual RIGHT (DOM first in RTL) */}
        <button className="flex flex-col items-center gap-0.5 px-3 py-1">
          <Home className="h-[22px] w-[22px] text-white/35" />
          <span className="font-cairo text-[10px] text-white/35">الرئيسية</span>
        </button>
        {/* التصنيفات */}
        <button onClick={openFriends} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="13" y="4" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="3" y="13" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="13" y="13" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
          </svg>
          <span className="font-cairo text-[10px] text-white/35">التصنيفات</span>
        </button>
        {/* الألعاب — ACTIVE */}
        <a
          href="#most-played"
          className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full"
          style={{ background: 'rgba(194,52,26,0.9)', boxShadow: '0 2px 14px rgba(194,52,26,0.5)' }}
        >
          <Gamepad2 className="h-[22px] w-[22px] text-white" />
          <span className="font-cairo text-[10px] font-black text-white">الألعاب</span>
        </a>
        {/* حسابي — visual LEFT (DOM last in RTL) */}
        <button onClick={openSettings} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <User className="h-[22px] w-[22px] text-white/35" />
          <span className="font-cairo text-[10px] text-white/35">حسابي</span>
        </button>
      </nav>

      {/* Missions Panel */}
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

      {/* ═══════════════ FRIENDS PANEL ═══════════════ */}
      {friendsOpen && (
        <FriendsPanel onClose={() => setFriendsOpen(false)} />
      )}

      {/* ═══════════════ DAILY MISSION FLOATING BUTTONS ═══════════════ */}
      {isAuthed && <DailyMissionButtons />}

      {/* Music auto-start hint — fades in/out once via CSS animation */}
      {showMusicHint && !musicMuted && (
        <div
          className="fixed bottom-[78px] sm:bottom-10 inset-x-0 flex justify-center z-[43] pointer-events-none select-none"
          style={{ animation: 'musicHint 5.5s ease forwards' }}
        >
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-sm"
            style={{ background: 'rgba(6,8,16,0.88)', border: '1px solid rgba(232,180,48,0.28)', color: '#E8B430' }}
          >
            <Music className="h-3 w-3" />
            <span className="font-cairo text-[10.5px] font-bold">المسّ أو اضغط لتشغيل الموسيقى 🎵</span>
          </div>
        </div>
      )}

      {/* ═══════════════ AD MODAL ═══════════════ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="bounce-in relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-xl" style={{ background: '#0D1828', border: '1px solid rgba(232,180,48,0.2)' }}>
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute start-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">إشهار باش تلعب</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-[#FFF7E8]">ثواني من وقتك مقابل الليلة كاملة</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
                  شاهد الإعلان وغادي نفتح ليك الطاولة <b className="text-[#F5B942]">فابور</b> — ماشي هزيمة، هذا تكتيك 😅
                </p>
                <button onClick={startRewardedAd} className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> تفرج على الإشهار — وعيني عينك
                </button>
                <button
                  onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
                >
                  لا شكرا، غانخلص بالكوينز
                </button>
              </>
            )}
            {adStatus === 'watching' && (
              <div className="mt-4 flex flex-col gap-3">
                <AdNativeBanner />
                <div className="flex items-center gap-3 rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 px-4 py-4">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <span className="glow-pulse absolute inset-0 rounded-full bg-[#2DD4BF]/25 blur-xl" />
                    <span className="relative font-lalezar text-2xl text-[#2DD4BF]">{countdown}</span>
                  </div>
                  <div>
                    <p className="font-cairo text-[13px] font-black text-[#2DD4BF]">صبر على الإشهار…</p>
                    <p className="font-cairo text-[11px] font-semibold text-[#B8C4D8]">
                      غادي تدخل للطبلة من بعد {countdown} {countdown === 1 ? 'ثانية' : 'ثواني'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {adStatus === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">كنتأكدو بلي ماتفرجتيش ف الإشهار وعينيك مسدودين…</p>
                <p className="font-cairo text-[12px] font-semibold text-emerald-100/70">تقدر تعيط لصحابك باش توجدو 🫡</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ GUEST AUTH SHEET ═══════════════ */}
      {authSheetOpen && (
        <div className="fixed inset-0 z-[65] sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthSheetOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:relative sm:inset-auto sm:rounded-2xl sm:pb-6 sm:w-full sm:max-w-[440px] shadow-[0_-20px_80px_rgba(0,0,0,.9)]" style={{ background: '#0D1828', border: '1px solid rgba(232,180,48,0.2)' }}>
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">التهاليب محجوزين للعضاء</p>
            </div>
            <h3 className="mt-4 font-lalezar text-2xl text-[#FFF7E8]">دخول في 5 ثواني باش تفرش الطبلة</h3>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
              دخل ولا صاوب كونط فابور — وعندك 100 كوين باش تبدا الشوهة فابور 🪙
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/login" className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 w-full py-3.5 text-[15px]">
                <LogIn className="h-5 w-5" /> دخول
              </Link>
              <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                <UserPlus className="h-5 w-5" /> صاوب كونط — فابور
              </Link>
            </div>
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="mt-3 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
            >
              شوف الطبلات — من بعد ندير الحساب
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ SETTINGS SHEET ═══════════════ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[66] sm:flex sm:items-center sm:justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:relative sm:inset-auto sm:rounded-2xl sm:pb-6 sm:w-full sm:max-w-[500px] sm:max-h-[85dvh] shadow-[0_-20px_80px_rgba(0,0,0,.9)]" style={{ background: '#0D1828', border: '1px solid rgba(232,180,48,0.2)' }}>
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#2DD4BF]" />
              <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">الإعدادات</p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {/* Coins */}
              {isAuthed && (
                <div className="flex items-center justify-between rounded-2xl border border-[#F5B942]/20 bg-[#F5B942]/10 px-4 py-3">
                  <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">الكوينز ديالك</span>
                  <span className="flex items-center gap-1.5 font-cairo text-[15px] font-black tabular-nums text-[#F5B942]">
                    <Coins className="h-4 w-4" /> {coins}
                  </span>
                </div>
              )}

              {/* Sound toggle */}
              <button
                onClick={toggleMute}
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8]">
                  {muted
                    ? <VolumeX className="h-4 w-4 text-[#B8C4D8]" />
                    : <Volume2 className="h-4 w-4 text-[#2DD4BF]" />}
                  الصوت
                </span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${muted ? 'bg-white/10' : 'bg-[#2DD4BF]/40'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${muted ? 'start-0.5' : 'start-[1.375rem]'}`} />
                </span>
              </button>

              {/* Music toggle */}
              <button
                onClick={toggleMusic}
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8]">
                  <Music className={`h-4 w-4 ${musicMuted ? 'text-[#B8C4D8]' : 'text-[#2DD4BF]'}`} />
                  الموسيقى
                </span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${musicMuted ? 'bg-white/10' : 'bg-[#2DD4BF]/40'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${musicMuted ? 'start-0.5' : 'start-[1.375rem]'}`} />
                </span>
              </button>

              {/* Change name */}
              {isAuthed && (
                <div className="rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/10 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="h-4 w-4 shrink-0 text-[#2DD4BF]" />
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">تبديل السمية</span>
                  </div>
                  {me?.username && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      اسم الكونط الأصلي: <span className="font-bold text-[#FFF7E8]">{me.username}</span>
                      {me.email ? ` (${me.email})` : ''}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) => { setNameDraft(e.target.value); setNameMsg(null); }}
                      maxLength={30}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      placeholder="السمية الجديدة…"
                      className="w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-[#2DD4BF]/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void saveName()}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl shrink-0 px-4 py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {nameBusy ? '…' : 'حفظ'}
                    </button>
                  </div>
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#2DD4BF]/80">
                      <Clock className="h-3.5 w-3.5" />
                      تقدر تبدل من بعد {new Date(me.nextNameChangeAt).toLocaleDateString('ar-MA')}
                    </p>
                  )}
                  {nameMsg && (
                    <p className={`mt-2 font-cairo text-[11px] font-bold ${nameMsg.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
                      {nameMsg.text}
                    </p>
                  )}
                </div>
              )}

              {/* Change password */}
              {isAuthed && (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-950/10 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">تبديل الباسورد</span>
                  </div>
                  {me?.hasPassword === false && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      هاد الحساب تسجل بجوجل — الباسورد ماشي مربوط بيه.
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-col gap-2">
                    <input
                      type="password"
                      value={pwDraft.cur}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, cur: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="الباسورد الحالي"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n1}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n1: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="الباسورد الجديد"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n2}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n2: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="عاود اكتب الباسورد الجديد"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void savePassword()}
                      disabled={pwBusy || me?.hasPassword === false}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {pwBusy ? '…' : 'بدل الباسورد'}
                    </button>
                  </div>
                  {pwMsg && (
                    <p className={`mt-2 font-cairo text-[11px] font-bold ${pwMsg.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
                      {pwMsg.text}
                    </p>
                  )}
                </div>
              )}

              {/* Guest CTA */}
              {!isAuthed && (
                <>
                  <Link href="/login" className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 mt-1 w-full py-3.5 text-[15px]">
                    <LogIn className="h-5 w-5" /> دخول
                  </Link>
                  <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                    <UserPlus className="h-5 w-5" /> صاوب كونط — فابور
                  </Link>
                </>
              )}

              {/* Logout */}
              {isAuthed && (
                <button
                  onClick={() => { void handleLogout(); }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-950/20 py-3.5 font-cairo text-[13px] font-black text-red-300"
                >
                  <LogOut className="h-4 w-4" /> خروج
                </button>
              )}
            </div>
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
    <Suspense fallback={null}>
      <LobbyContent />
    </Suspense>
  );
}
