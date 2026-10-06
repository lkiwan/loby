'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle, Check, ChevronDown, Clock, Coins,
  Flame, Gamepad2, Loader2, LogIn, LogOut,
  Music, Play, Settings, ShieldCheck, Target, UserPlus, Users, Volume2, VolumeX, X, Zap,
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

const MissionsPanel  = dynamic(() => import('@/components/MissionsPanel'),  { ssr: false });
const FriendsPanel   = dynamic(() => import('@/components/FriendsPanel'),   { ssr: false });

const TICKER_ITEMS = [
  '≡ƒöÑ ╪º┘ä╪╡╪»╪º╪╣ ╪» ╪º┘ä╪¡┘ê┘à╪⌐ ┘â╪º┘è┘å ┘à┘å ╪¿┘â╪▒┘è',
  '≡ƒç▓≡ƒçª ╪¬╪¡╪»╪º┘ê ╪¿╪╣╪╢┘è╪º╪¬┘â┘à ╪¿╪º┘ä╪»╪º╪▒╪¼╪⌐',
  '≡ƒò╣∩╕Å ┘â┘ä╪┤┘è ╪¿╪º┘ä╪»╪º╪▒╪¼╪⌐ ΓÇö ╪¡╪¬┘ë ╪º┘ä┘â╪»┘ê╪¿ ┘ê╪º┘ä┘à╪╣╪º┘ê╪»╪⌐',
  '≡ƒÄ▓ ╪¬┘è┘ä┘è┘ü┘ê┘å ┘ê╪º╪¡╪» = ╪¿╪▓╪º┘ü ╪» ╪º┘ä╪┤┘ê┘ç╪⌐',
  '≡ƒñ½ ┘ê╪º╪¡╪» ┘ü┘è┘â┘à ┘â┘è┘â╪»╪¿ ΓÇö ┘à╪▒╪¡╪¿╪º ╪¿┘è┘â ┘ü╪º┘ä╪¡┘ê┘à╪⌐',
  '≡ƒÆ░ ╪¬┘ü╪▒╪¼ ┘ü╪Ñ╪┤┘ç╪º╪▒ ΓÇö ┘à╪º╪┤┘è ╪«╪│╪º╪▒╪⌐╪î ┘ç╪º╪»╪º ╪¬┘â╪¬┘è┘â',
  '≡ƒÆö ╪º┘ä┘ä┘è┘ä╪⌐ ╪¬┘ê┘ä┘è ╪¼╪▒┘è┘à╪⌐ ┘ü╪º┘ä╪╖╪¿┘ä╪⌐╪î ┘ê╪º┘ä╪¼┘è╪▒╪º┘å ╪┤╪º┘ç╪»┘è┘å',
];

const TITLE_WORDS_1 = ['┘ü╪╢╪¡', '╪╡╪º╪¡╪¿┘â'];
const TITLE_WORDS_2 = ['┘é╪¿┘ä', '┘à╪º', '┘è┘ü╪╢╪¡┘â'];

/* ΓöÇΓöÇ Coin burst particles on button click ΓöÇΓöÇ */
function spawnCoins(x: number, y: number) {
  const container = document.body;
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'coin-float';
    el.textContent = '≡ƒ¬Ö';
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

/* ΓöÇΓöÇ Launch overlay component ΓöÇΓöÇ */
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
          ┘â┘å┘ê╪¼╪»┘ê ╪º┘ä╪╖╪¿┘ä╪⌐ΓÇª
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

  /* ΓöÇΓöÇ Settings: name + password ΓöÇΓöÇ */
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
      setNameMsg({ kind: 'err', text: '╪º┘ä╪│┘à┘è╪⌐ ╪«╪º╪╡ ╪¬┘â┘ê┘å ╪¿┘è┘å 2 ┘ê 30 ╪¡╪▒┘ü.' });
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
        setNameMsg({ kind: 'ok', text: '╪¬╪¿╪»┘ä╪º╪¬ ╪º┘ä╪│┘à┘è╪⌐ ╪¿┘å╪¼╪º╪¡. ╪║╪º╪»┘è ╪¬╪¿╪»┘ä ┘à╪▒╪⌐ ╪ú╪«╪▒┘ë ┘à┘å ╪¿╪╣╪» 7 ╪ú┘è╪º┘à.' });
      } else {
        setNameMsg({ kind: 'err', text: data.error || '╪╡╪º╪¿ ┘à╪┤┘â┘ä. ╪╣╪º┘ê╪» ╪¼╪▒╪¿.' });
      }
    } catch {
      setNameMsg({ kind: 'err', text: '╪╡╪º╪¿ ┘à╪┤┘â┘ä ┘ü╪º┘ä╪«╪º╪»┘à. ╪╣╪º┘ê╪» ╪¼╪▒╪¿.' });
    }
    setNameBusy(false);
  };

  const savePassword = async () => {
    if (pwDraft.n1.length < 6) {
      setPwMsg({ kind: 'err', text: '╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪º┘ä╪¼╪»┘è╪» ╪«╪º╪╡ ┘è┘â┘ê┘å ┘ü┘è┘ç 6 ╪¡╪▒┘ê┘ü ╪╣┘ä┘ë ╪º┘ä╪ú┘é┘ä.' });
      return;
    }
    if (pwDraft.n1 !== pwDraft.n2) {
      setPwMsg({ kind: 'err', text: '╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪º┘ä╪¼╪»┘è╪» ┘à╪º╪┤┘è ┘â┘è┘ü ┘â┘è┘ü ┘ü╪º┘ä╪¬╪ú┘â┘è╪».' });
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
        setPwMsg({ kind: 'ok', text: '╪¬╪¿╪»┘ä ╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪¿┘å╪¼╪º╪¡.' });
      } else {
        setPwMsg({ kind: 'err', text: data.error || '╪╡╪º╪¿ ┘à╪┤┘â┘ä. ╪╣╪º┘ê╪» ╪¼╪▒╪¿.' });
      }
    } catch {
      setPwMsg({ kind: 'err', text: '╪╡╪º╪¿ ┘à╪┤┘â┘ä ┘ü╪º┘ä╪«╪º╪»┘à. ╪╣╪º┘ê╪» ╪¼╪▒╪¿.' });
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
  useEffect(() => { setMusicMutedState(isMusicMuted()); }, []);

  useEffect(() => {
    if (isMusicMuted()) return;
    musicPlayer.start();
    return () => { musicPlayer.stop(); };
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
          showToast('ok', `┘â╪º╪»┘ê ╪» ╪º┘ä┘è┘ê┘à: +${data.reward} ≡ƒ¬Ö (┘å┘ç╪º╪▒${data.streak ?? 1})`);
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
          showToast('ok', `┘à╪▒╪¡╪¿╪º ╪¿┘â! ╪╣┘å╪»┘â ${data.coins} ≡ƒ¬Ö`);
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
      showToast('error', `┘à╪º╪╣┘å╪»┘â╪┤ ┘â┘ê┘è┘å╪▓ ┘â╪º┘ü┘è┘è┘å ΓÇö ╪¬┘ü╪▒╪¼ ┘ü╪Ñ╪┤┘ç╪º╪▒ ╪¿╪º╪┤ ╪¬╪▓┘è╪»┘ç┘à ≡ƒöü (${coins}/${game.cost})`);
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
        showToast('error', err.error ?? '╪º┘ä┘ä╪╣╪¿╪⌐ ┘à╪º╪«╪»┘à╪º╪¬╪┤╪î ╪╣╪º┘ê╪» ╪¼╪▒╪¿');
      }
    } catch {
      setLaunching(null);
      showToast('error', '┘à╪┤┘â┘ä ┘ü╪º┘ä┘â┘ê┘å┘è┘â╪│┘è┘ê┘å ΓÇö ╪╣╪º┘ê╪» ╪¼╪▒╪¿');
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
        showToast('error', '╪╣╪º┘ê╪» ╪¼╪▒╪¿ ┘à┘å ╪¿╪╣╪» ╪┤┘ê┘è╪⌐');
        return;
      }
      if (!startRes.ok) {
        setAdModalOpen(false);
        showToast('error', '┘à╪┤┘â┘ä ┘ü╪º┘ä╪Ñ╪┤┘ç╪º╪▒ ΓÇö ╪╣╪º┘ê╪» ╪¼╪▒╪¿');
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
            if (!r.ok) { setAdModalOpen(false); showToast('error', '┘à╪┤┘â┘ä ┘ü╪º┘ä╪Ñ╪┤┘ç╪º╪▒ ΓÇö ╪╣╪º┘ê╪» ╪¼╪▒╪¿'); return; }
            const payload = (await r.json()) as { redirectUrl?: string; newBalance?: number; awarded?: number };
            if (payload.redirectUrl) {
              rememberPayMethod('ad');
              const game = GAMES.find((g) => g.id === gameId);
              if (game) setLaunching(game);
              router.replace(payload.redirectUrl);
              return;
            }
            if (typeof payload.newBalance === 'number') await update({ coins: payload.newBalance });
            showToast('ok', `+${payload.awarded ?? 0} ┘â┘ê┘è┘å╪▓ ┘â╪º╪»┘ê! ≡ƒÄü`);
            setAdModalOpen(false);
          } catch {
            setAdModalOpen(false);
            showToast('error', '┘à╪┤┘â┘ä ┘ü╪º┘ä╪Ñ╪┤┘ç╪º╪▒ ΓÇö ╪╣╪º┘ê╪» ╪¼╪▒╪¿');
          }
        })();
      }, 1000);
    } catch {
      setAdModalOpen(false);
      showToast('error', '┘à╪┤┘â┘ä ┘ü╪º┘ä╪Ñ╪┤┘ç╪º╪▒ ΓÇö ╪╣╪º┘ê╪» ╪¼╪▒╪¿');
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
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#0B1F3A] overflow-hidden zellige-bg">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1F3A]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <StarMark size={60} />
          <div className="pulse-glow-ring h-12 w-12 rounded-full border-2 border-[#2DD4BF]/40 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#2DD4BF]" />
          </div>
          <p className="font-lalezar text-2xl text-[#FFF7E8] text-glow-gold">┘â┘å┘ê╪¼╪»┘ê ╪º┘ä┘â╪▒╪º╪│╪ºΓÇª</p>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0B1F3A] text-[#FFF7E8] zellige-bg pb-24">
      {launching && <LaunchOverlay game={launching} />}

      {/* Header */}
      <header className="header-zellige sticky top-4 z-30 mx-4 rounded-full bg-[#12294D] border border-white/10 shadow-lg mt-4 px-4 py-2 flex items-center justify-between sm:mx-auto sm:max-w-6xl">
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <button className="relative">
                <Bell className="h-5 w-5 text-[#B8C4D8]" />
                <span className="absolute top-0 end-0 h-2 w-2 rounded-full bg-[#F97066]" />
              </button>
              <button onClick={openSettings} className="grid h-8 w-8 place-items-center rounded-full bg-[#0B1F3A] border border-[#2DD4BF]/30">
                <User className="h-4 w-4 text-[#2DD4BF]" />
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-gold rounded-full px-4 py-1.5 text-sm font-bold bg-[#F5B942] text-[#0B1F3A]">
              ╪»╪«┘ê┘ä
            </Link>
          )}
        </div>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-playm3ana-new.png" alt="PlayM3ana" width={39} height={32} className="h-8 w-auto object-contain" />
          <span className="text-gradient-gold-teal font-grit text-lg font-bold tracking-tight">PLAYM3ANA</span>
        </Link>
      </header>

      {/* Coins pill */}
      {isAuthed && (
        <div className={`fixed start-4 top-[84px] z-[55] flex select-none items-center gap-1.5 rounded-full border border-[#F5B942]/40 bg-[#12294D]/95 px-3 py-1 font-cairo text-[13px] font-black tabular-nums text-[#F5B942] shadow-[0_0_14px_rgba(245,185,66,.35)] pointer-events-none ${coinPop ? 'coin-pop' : ''}`}>
          <Coins className="h-3.5 w-3.5" />
          {coins}
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(5rem,env(safe-area-inset-bottom))] sm:px-6 mt-6 flex flex-col gap-6">
        
        {/* Hero Card */}
        <section className="hero-card-zellige zellige-corners rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#F97066] p-6 text-[#FFF7E8] shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-start gap-2">
            {isAuthed ? (
              <>
                <h2 className="font-lalezar text-3xl">╪ú┘ç┘ä╪º ╪¿┘è┘â ┘è╪º ╪│┘è╪»! ≡ƒ¬ö</h2>
                <p className="font-cairo text-sm font-semibold opacity-90">╪¼┘ä╪│╪⌐ ╪º┘ä┘ä╪╣╪¿ ╪»╪º┘è╪▒┘è┘å┘ç╪º ╪»╪º╪¿╪º ΓÇö ╪¼╪º┘ç╪▓ ╪¬╪»╪«┘ä ┘à╪╣ ╪╡╪¡╪º╪¿┘â╪ƒ</p>
              </>
            ) : (
              <>
                <h2 className="font-lalezar text-3xl">┘à╪▒╪¡╪¿╪º ╪¿┘è┘â ┘ü╪º┘ä╪¡┘ê┘à╪⌐! ≡ƒ¬ö</h2>
                <p className="font-cairo text-sm font-semibold opacity-90 mb-2">╪╡╪º┘ê╪¿ ┘â┘ê┘å╪╖ ╪»╪º╪¿╪º ╪¿╪º╪┤ ╪¬┘ä╪╣╪¿ ┘à╪╣ ╪╡╪¡╪º╪¿┘â ┘ê╪¬╪╣┘è╪┤ ╪º┘ä╪┤┘ê┘ç╪⌐</p>
                <div className="flex gap-3 mt-2 w-full">
                  <Link href="/register" className="flex-1 bg-[#F5B942] text-[#0B1F3A] font-bold py-2 rounded-xl text-center">╪¿╪»╪º ┘ü╪º╪¿┘ê╪▒</Link>
                  <Link href="/login" className="flex-1 bg-white/20 backdrop-blur font-bold py-2 rounded-xl text-center">╪╣┘å╪»┘è ┘â┘ê┘å╪╖</Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Lobby of the day */}
        <section className="lobby-card-zellige zellige-corners rounded-2xl bg-[#12294D] border border-white/10 p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-lalezar text-xl text-[#F5B942]">≡ƒÄë ╪º┘ä┘ä┘ê╪¿┘è ╪»┘è╪º┘ä ╪º┘ä┘è┘ê┘à</h3>
            <div className="flex items-center gap-1.5 bg-[#2DD4BF]/10 px-2 py-1 rounded-full border border-[#2DD4BF]/20">
              <span className="live-dot bg-[#2DD4BF] h-2 w-2 rounded-full animate-pulse" />
              <span className="font-cairo text-xs font-bold text-[#2DD4BF]">┘à╪¿╪º╪┤╪▒ ╪º┘ä╪ó┘å</span>
            </div>
          </div>
          <p className="font-cairo text-sm text-[#B8C4D8] mb-4">╪¡╪╢┘ê╪▒: 2,831 ┘ä╪º╪╣╪¿ ╪»╪º╪¿╪º ΓÇó 14 ╪║╪▒┘ü╪⌐ ┘à┘ü╪¬┘ê╪¡╪⌐</p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#2DD4BF] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#F97066] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
              <div className="h-8 w-8 rounded-full border-2 border-[#12294D] bg-[#F5B942] grid place-items-center"><User className="h-4 w-4 text-[#0B1F3A]"/></div>
            </div>
            <button className="btn-gold bg-[#F5B942] text-[#0B1F3A] font-bold px-5 py-2 rounded-xl text-sm">
              ╪»╪«┘ä ╪º┘ä┘ä┘ê╪¿┘è
            </button>
          </div>
        </section>

        {/* New Games Row */}
        <section className="mt-2">
          <h3 className="section-title-zellige font-lalezar text-2xl text-[#FFF7E8] mb-4">Γ£¿ ╪º┘ä┘ä╪╣╪º╪¿ ╪º┘ä╪¼╪»╪» ╪º┘ä┘è┘ê┘à</h3>
          
          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5">
            {GAMES.map((game, i) => (
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

          {/* Mobile Horizontal Scroll */}
          <div className="flex sm:hidden overflow-x-auto gap-4 pb-4 snap-x -mx-4 px-4 scrollbar-hide">
            {GAMES.map((game, i) => {
              const colors = ['from-[#2DD4BF] to-teal-500', 'from-[#F97066] to-orange-500', 'from-[#F5B942] to-amber-500', 'from-blue-500 to-indigo-500', 'from-purple-500 to-pink-500'];
              const bgGrad = colors[i % colors.length];
              const statuses = ['╪│╪«┘ê┘å ≡ƒöÑ', '┘â┘è┘à╪┤┘è ╪»╪º╪¿╪º', '╪¼╪»┘è╪»!'];
              const status = statuses[i % statuses.length];
              return (
                <div key={game.id} className="game-card-zellige snap-center shrink-0 w-40 rounded-2xl bg-[#12294D] border border-white/10 overflow-hidden flex flex-col" onClick={(e) => playWithCoins(game.id, e)}>
                  <div className={`h-24 bg-gradient-to-br ${bgGrad} flex items-center justify-center relative`}>
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur rounded-full px-2 py-0.5 font-cairo text-[10px] font-bold text-white status-chip">
                      {status}
                    </div>
                    {game.logo ? <Image src={game.logo} alt={game.darijaTitle} width={48} height={48} className="rounded-xl" /> : <GameIcon game={game} size={48} />}
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h4 className="font-lalezar text-[15px] text-[#FFF7E8] truncate">{game.darijaTitle}</h4>
                    <div className="flex items-center gap-1 font-cairo text-[11px] text-[#B8C4D8]">
                      <Users className="h-3 w-3" />
                      <span>{120 + i * 15} ┘ä╪º╪╣╪¿</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Missions Card */}
        {isAuthed && (
          <section className="missions-card-zellige bg-[#12294D] rounded-2xl border border-white/10 p-4 flex items-center justify-between cursor-pointer" onClick={() => setMissionsOpen(true)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#F5B942]/20 grid place-items-center">
                <Target className="h-5 w-5 text-[#F5B942]" />
              </div>
              <div>
                <h3 className="font-lalezar text-lg text-[#FFF7E8]">≡ƒÄü ┘à┘ç╪º┘à┘â ╪º┘ä┘è┘ê┘à</h3>
                <p className="font-cairo text-xs text-[#B8C4D8]">┘â┘à┘ä ╪º┘ä┘à┘ç╪º┘à ┘ê╪▒╪¿╪¡ ┘â┘ê┘è┘å╪▓</p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-[#B8C4D8] -rotate-90" />
          </section>
        )}

        {/* Guest Notice */}
        {!isAuthed && <GuestNotice />}

        {/* Ad Banner */}
        <AdBanner />

        {/* Coming Soon */}
        <ComingSoon />

        {/* Leaderboard Teaser */}
        <LeaderboardTeaser />

        {/* Referral Section */}
        {isAuthed && xpData?.referralCode && (
          <section className="mt-4">
            <div className="overflow-hidden rounded-2xl border border-[#F5B942]/20 bg-gradient-to-br from-[#12294D] to-[#0B1F3A] p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#F5B942]" />
                <span className="font-lalezar text-xl text-[#F5B942]">╪╣╪▒╪╢ ╪╣┘ä┘ë ╪╡╪º╪¡╪¿┘â</span>
              </div>
              <p className="mb-4 font-cairo text-[13px] font-semibold text-[#B8C4D8]">
                ╪¿╪º╪▒╪╖╪º╪¼┘è ╪º┘ä┘â┘ê╪» ┘à╪╣ ╪╡╪º╪¡╪¿┘â ΓÇö ╪¿╪¼┘ê╪¼ ╪║╪º╪¬╪▒╪¿╪¡┘ê ┘â┘ê┘è┘å╪▓ ┘ü╪º╪¿┘ê╪▒ ≡ƒÄü
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 overflow-hidden rounded-xl border border-[#F5B942]/20 bg-[#0B1F3A] px-4 py-3 font-mono text-[15px] tracking-widest text-[#FFF7E8]">
                  {xpData.referralCode}
                </code>
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(xpData!.referralCode!);
                    setReferralCopied(true);
                    setTimeout(() => setReferralCopied(false), 2200);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-4 py-3 font-cairo text-[13px] font-black text-[#2DD4BF] transition hover:bg-[#2DD4BF]/20 active:scale-95"
                >
                  {referralCopied ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  {referralCopied ? '╪¬┘à!' : '┘â┘ê┘╛┘è'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <LobbyFooter isAuthed={isAuthed} username={session?.user?.username} />
      </main>

      {/* Sticky CTA */}
      <div className="sticky-cta-zellige fixed bottom-20 left-4 right-4 z-40 sm:hidden">
        <button className="w-full bg-[#F5B942] text-[#0B1F3A] font-lalezar text-lg py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          ╪¿╪»╪º ┘ä╪╣╪¿ ╪»╪º╪¿╪º ΓÇö ╪¼┘ä╪│╪⌐ ╪¼╪»┘è╪»╪⌐
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="bottom-tab-bar fixed bottom-0 left-0 right-0 h-16 bg-[#12294D] border-t border-white/10 z-50 flex items-center justify-around sm:hidden px-2 pb-safe">
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#F5B942]">
          <Home className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">╪º┘ä╪▒╪ª┘è╪│┘è╪⌐</span>
        </div>
        <button onClick={openFriends} className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]">
          <Users className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">╪º┘ä╪╡╪¡╪º╪¿</span>
        </button>
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]">
          <Gamepad2 className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">╪º┘ä┘ä╪╣╪º╪¿</span>
        </div>
        <div className="bottom-tab-bar-item flex flex-col items-center gap-1 text-[#B8C4D8]" onClick={openSettings}>
          <User className="h-5 w-5" />
          <span className="font-cairo text-[10px] font-bold">╪¡╪│╪º╪¿┘è</span>
        </div>
      </nav>

      {/* Missions Panel */}
      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => {
            void update();
            setMissionsOpen(false);
            showToast('ok', `┘à╪¿╪▒┘ê┘â! ╪▒╪¿╪¡╪¬┘è +${reward} ≡ƒ¬Ö ╪╣┘ä┘ë ╪º┘ä┘à┘ç┘à╪⌐ ≡ƒÄ»`);
          }}
        />
      )}

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ FRIENDS PANEL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      {friendsOpen && (
        <FriendsPanel onClose={() => setFriendsOpen(false)} />
      )}

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ AD MODAL ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="bounce-in relative w-full max-w-md overflow-hidden rounded-2xl border border-[#2DD4BF]/20 bg-[#12294D] p-6 shadow-xl">
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute start-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">╪Ñ╪┤┘ç╪º╪▒ ╪¿╪º╪┤ ╪¬┘ä╪╣╪¿</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-[#FFF7E8]">╪½┘ê╪º┘å┘è ┘à┘å ┘ê┘é╪¬┘â ┘à┘é╪º╪¿┘ä ╪º┘ä┘ä┘è┘ä╪⌐ ┘â╪º┘à┘ä╪⌐</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
                  ╪┤╪º┘ç╪» ╪º┘ä╪Ñ╪╣┘ä╪º┘å ┘ê╪║╪º╪»┘è ┘å┘ü╪¬╪¡ ┘ä┘è┘â ╪º┘ä╪╖╪º┘ê┘ä╪⌐ <b className="text-[#F5B942]">┘ü╪º╪¿┘ê╪▒</b> ΓÇö ┘à╪º╪┤┘è ┘ç╪▓┘è┘à╪⌐╪î ┘ç╪░╪º ╪¬┘â╪¬┘è┘â ≡ƒÿà
                </p>
                <button onClick={startRewardedAd} className="bg-[#F5B942] text-[#0B1F3A] font-bold rounded-xl flex items-center justify-center gap-2 mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> ╪¬┘ü╪▒╪¼ ΓÇö ┘ê╪╣┘è┘å┘è ╪╣┘è┘å┘â
                </button>
                <button
                  onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
                >
                  ┘ä╪º ╪┤┘â╪▒╪º╪î ╪║╪º┘å╪«┘ä╪╡ ╪¿╪º┘ä┘â┘ê┘è┘å╪▓
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
                    <p className="font-cairo text-[13px] font-black text-[#2DD4BF]">╪╡╪¿╪▒ ╪╣┘ä┘ë ╪º┘ä╪Ñ╪┤┘ç╪º╪▒ΓÇª</p>
                    <p className="font-cairo text-[11px] font-semibold text-[#B8C4D8]">
                      ╪║╪º╪»┘è ╪¬╪»╪«┘ä ┘ä┘ä╪╖╪¿┘ä╪⌐ ┘à┘å ╪¿╪╣╪» {countdown} {countdown === 1 ? '╪½╪º┘å┘è╪⌐' : '╪½┘ê╪º┘å┘è'}
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
                <p className="font-cairo text-[14px] font-black text-emerald-300">┘â┘å╪¬╪ú┘â╪»┘ê ╪¿┘ä┘è ┘à╪º╪¬┘ü╪▒╪¼╪¬┘è╪┤ ┘ü ╪º┘ä╪Ñ╪┤┘ç╪º╪▒ ┘ê╪╣┘è┘å┘è┘â ┘à╪│╪»┘ê╪»┘è┘åΓÇª</p>
                <p className="font-cairo text-[12px] font-semibold text-emerald-100/70">╪¬┘é╪»╪▒ ╪¬╪╣┘è╪╖ ┘ä╪╡╪¡╪º╪¿┘â ╪¿╪º╪┤ ╪¬┘ê╪¼╪»┘ê ≡ƒ½í</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ GUEST AUTH SHEET (phone only) ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      {authSheetOpen && (
        <div className="fixed inset-0 z-[65] sm:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAuthSheetOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-[#2DD4BF]/20 bg-[#12294D] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_80px_rgba(0,0,0,.9)]">
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">╪º┘ä╪¬┘ç╪º┘ä┘è╪¿ ┘à╪¡╪¼┘ê╪▓┘è┘å ┘ä┘ä╪╣╪╢╪º╪í</p>
            </div>
            <h3 className="mt-4 font-lalezar text-2xl text-[#FFF7E8]">╪»╪«┘ê┘ä ┘ü┘è 5 ╪½┘ê╪º┘å┘è ╪¿╪º╪┤ ╪¬┘ü╪▒╪┤ ╪º┘ä╪╖╪¿┘ä╪⌐</h3>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
              ╪»╪«┘ä ┘ê┘ä╪º ╪╡╪º┘ê╪¿ ┘â┘ê┘å╪╖ ┘ü╪º╪¿┘ê╪▒ ΓÇö ┘ê╪╣┘å╪»┘â 100 ┘â┘ê┘è┘å ╪¿╪º╪┤ ╪¬╪¿╪»╪º ╪º┘ä╪┤┘ê┘ç╪⌐ ┘ü╪º╪¿┘ê╪▒ ≡ƒ¬Ö
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/login" className="bg-[#F5B942] text-[#0B1F3A] font-bold rounded-xl flex items-center justify-center gap-2 w-full py-3.5 text-[15px]">
                <LogIn className="h-5 w-5" /> ╪»╪«┘ê┘ä
              </Link>
              <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                <UserPlus className="h-5 w-5" /> ╪╡╪º┘ê╪¿ ┘â┘ê┘å╪╖ ΓÇö ┘ü╪º╪¿┘ê╪▒
              </Link>
            </div>
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="mt-3 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
            >
              ╪┤┘ê┘ü ╪º┘ä╪╖╪¿┘ä╪º╪¬ ΓÇö ┘à┘å ╪¿╪╣╪» ┘å╪»┘è╪▒ ╪º┘ä╪¡╪│╪º╪¿
            </button>
          </div>
        </div>
      )}

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ SETTINGS SHEET (phone only) ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[66] sm:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
          <div className="bounce-in absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-[#2DD4BF]/20 bg-[#12294D] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_80px_rgba(0,0,0,.9)]">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#2DD4BF]" />
              <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">╪º┘ä╪Ñ╪╣╪»╪º╪»╪º╪¬</p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {/* Coins */}
              {isAuthed && (
                <div className="flex items-center justify-between rounded-2xl border border-[#F5B942]/20 bg-[#F5B942]/10 px-4 py-3">
                  <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">╪º┘ä┘â┘ê┘è┘å╪▓ ╪»┘è╪º┘ä┘â</span>
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
                  ╪º┘ä╪╡┘ê╪¬
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
                  ╪º┘ä┘à┘ê╪│┘è┘é┘ë
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
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">╪¬╪¿╪»┘è┘ä ╪º┘ä╪│┘à┘è╪⌐</span>
                  </div>
                  {me?.username && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      ╪º╪│┘à ╪º┘ä┘â┘ê┘å╪╖ ╪º┘ä╪ú╪╡┘ä┘è: <span className="font-bold text-[#FFF7E8]">{me.username}</span>
                      {me.email ? ` (${me.email})` : ''}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) => { setNameDraft(e.target.value); setNameMsg(null); }}
                      maxLength={30}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      placeholder="╪º┘ä╪│┘à┘è╪⌐ ╪º┘ä╪¼╪»┘è╪»╪⌐ΓÇª"
                      className="w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-[#2DD4BF]/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void saveName()}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      className="bg-[#F5B942] text-[#0B1F3A] font-bold rounded-xl shrink-0 px-4 py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {nameBusy ? 'ΓÇª' : '╪¡┘ü╪╕'}
                    </button>
                  </div>
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#2DD4BF]/80">
                      <Clock className="h-3.5 w-3.5" />
                      ╪¬┘é╪»╪▒ ╪¬╪¿╪»┘ä ┘à┘å ╪¿╪╣╪» {new Date(me.nextNameChangeAt).toLocaleDateString('ar-MA')}
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
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">╪¬╪¿╪»┘è┘ä ╪º┘ä╪¿╪º╪│┘ê╪▒╪»</span>
                  </div>
                  {me?.hasPassword === false && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      ┘ç╪º╪» ╪º┘ä╪¡╪│╪º╪¿ ╪¬╪│╪¼┘ä ╪¿╪¼┘ê╪¼┘ä ΓÇö ╪º┘ä╪¿╪º╪│┘ê╪▒╪» ┘à╪º╪┤┘è ┘à╪▒╪¿┘ê╪╖ ╪¿┘è┘ç.
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-col gap-2">
                    <input
                      type="password"
                      value={pwDraft.cur}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, cur: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪º┘ä╪¡╪º┘ä┘è"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n1}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n1: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪º┘ä╪¼╪»┘è╪»"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n2}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n2: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="╪╣╪º┘ê╪» ╪º┘â╪¬╪¿ ╪º┘ä╪¿╪º╪│┘ê╪▒╪» ╪º┘ä╪¼╪»┘è╪»"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void savePassword()}
                      disabled={pwBusy || me?.hasPassword === false}
                      className="bg-[#F5B942] text-[#0B1F3A] font-bold rounded-xl py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {pwBusy ? 'ΓÇª' : '╪¿╪»┘ä ╪º┘ä╪¿╪º╪│┘ê╪▒╪»'}
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
                  <Link href="/login" className="bg-[#F5B942] text-[#0B1F3A] font-bold rounded-xl flex items-center justify-center gap-2 mt-1 w-full py-3.5 text-[15px]">
                    <LogIn className="h-5 w-5" /> ╪»╪«┘ê┘ä
                  </Link>
                  <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                    <UserPlus className="h-5 w-5" /> ╪╡╪º┘ê╪¿ ┘â┘ê┘å╪╖ ΓÇö ┘ü╪º╪¿┘ê╪▒
                  </Link>
                </>
              )}

              {/* Logout */}
              {isAuthed && (
                <button
                  onClick={() => { void handleLogout(); }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-950/20 py-3.5 font-cairo text-[13px] font-black text-red-300"
                >
                  <LogOut className="h-4 w-4" /> ╪«╪▒┘ê╪¼
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ TOAST ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
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
