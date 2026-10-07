'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback, Suspense } from 'react';
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
  'ðŸ”¥ Ø§Ù„ØµØ¯Ø§Ø¹ Ø¯ Ø§Ù„Ø­ÙˆÙ…Ø© ÙƒØ§ÙŠÙ† Ù…Ù† Ø¨ÙƒØ±ÙŠ',
  'ðŸ‡²ðŸ‡¦ ØªØ­Ø¯Ø§Ùˆ Ø¨Ø¹Ø¶ÙŠØ§ØªÙƒÙ… Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø©',
  'ðŸ•¹ï¸ ÙƒÙ„Ø´ÙŠ Ø¨Ø§Ù„Ø¯Ø§Ø±Ø¬Ø© â€” Ø­ØªÙ‰ Ø§Ù„ÙƒØ¯ÙˆØ¨ ÙˆØ§Ù„Ù…Ø¹Ø§ÙˆØ¯Ø©',
  'ðŸŽ² ØªÙŠÙ„ÙŠÙÙˆÙ† ÙˆØ§Ø­Ø¯ = Ø¨Ø²Ø§Ù Ø¯ Ø§Ù„Ø´ÙˆÙ‡Ø©',
  'ðŸ¤« ÙˆØ§Ø­Ø¯ ÙÙŠÙƒÙ… ÙƒÙŠÙƒØ¯Ø¨ â€” Ù…Ø±Ø­Ø¨Ø§ Ø¨ÙŠÙƒ ÙØ§Ù„Ø­ÙˆÙ…Ø©',
  'ðŸ’° ØªÙØ±Ø¬ ÙØ¥Ø´Ù‡Ø§Ø± â€” Ù…Ø§Ø´ÙŠ Ø®Ø³Ø§Ø±Ø©ØŒ Ù‡Ø§Ø¯Ø§ ØªÙƒØªÙŠÙƒ',
  'ðŸ’” Ø§Ù„Ù„ÙŠÙ„Ø© ØªÙˆÙ„ÙŠ Ø¬Ø±ÙŠÙ…Ø© ÙØ§Ù„Ø·Ø¨Ù„Ø©ØŒ ÙˆØ§Ù„Ø¬ÙŠØ±Ø§Ù† Ø´Ø§Ù‡Ø¯ÙŠÙ†',
];

const TITLE_WORDS_1 = ['ÙØ¶Ø­', 'ØµØ§Ø­Ø¨Ùƒ'];
const TITLE_WORDS_2 = ['Ù‚Ø¨Ù„', 'Ù…Ø§', 'ÙŠÙØ¶Ø­Ùƒ'];

/* â”€â”€ Bottom tab bar item styles â”€â”€ */
/* `relative` keeps the buttons painted above the absolutely-positioned liquid pill.
   Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â†” Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ share ONE fixed box (same padding + label weight in both
   states â€” only colors swap), so the pill lerps between two static boxes and
   cannot jump when the active label flips at the scroll midpoint. */
const NAV_TAB_PRIMARY = 'relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full transition active:scale-95';
const NAV_TAB_IDLE = 'relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition hover:bg-white/[0.06] active:scale-95';
const NAV_TAB_ACTIVE_STYLE: React.CSSProperties = { background: 'rgba(194,52,26,0.9)', boxShadow: '0 2px 14px rgba(194,52,26,0.5)' };

/* â”€â”€ Liquid indicator (shared pill for Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â†” Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨) â”€â”€
   The pill's POSITION has no transition at all: it is re-lerped from scroll
   progress on every scroll frame, so it flows in real time with the finger.
   These constants only tune the decorative squash/stretch morph on the inner
   blob while the pill travels. */
const LIQUID_SCROLL_MS = 520; /* scroll flip: slow, visibly flowing */
const LIQUID_CLICK_MS = 210;  /* tap: quick hop */
const LIQUID_SCROLL_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';   /* fluid ease-in-out */
const LIQUID_CLICK_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'; /* snappy ease-out */
const LIQUID_ARM_MS = 800;    /* no morph while the page load / scroll restore settles */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* â”€â”€ Coin burst particles on button click â”€â”€ */
function spawnCoins(x: number, y: number) {
  const container = document.body;
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'coin-float';
    el.textContent = 'ðŸª™';
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

/* â”€â”€ Launch overlay component â”€â”€ */
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
          ÙƒÙ†ÙˆØ¬Ø¯Ùˆ Ø§Ù„Ø·Ø¨Ù„Ø©â€¦
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

  /* â”€â”€ Settings: name + password â”€â”€ */
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

  /* â”€â”€ Bottom tab bar: scroll targets + active tab tracking â”€â”€ */
  /* The pill position never waits for this state: it follows scroll progress
     continuously. `activeTab` only drives aria-current / the active label,
     which flips at the midpoint (progress 0.5) of the scroll range. */
  const [activeTab, setActiveTab] = useState<'home' | 'games'>('home');

  /* Reduced motion: snap the page instantly, so the pill snaps with it. */
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  const scrollToGames = () =>
    document.getElementById('most-played')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });

  /* â”€â”€ Liquid indicator: ONE shared pill that flows between Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â†” Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ â”€â”€
     Source of truth = scroll progress p âˆˆ [0,1]: 0 = page top, 1 = the games
     section snapped to the viewport top (exactly where a tab click lands).
     Every scroll frame re-lerps the pill's box between the two button boxes,
     so the liquid physically flows toward Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ while the user scrolls and
     arrives exactly when the section does â€” zero perceived delay. */
  const navRef = useRef<HTMLElement>(null);
  const homeTabRef = useRef<HTMLButtonElement>(null);
  const gamesTabRef = useRef<HTMLButtonElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);
  const liquidBlobRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<'home' | 'games'>('home');
  const liquidTrigger = useRef<'scroll' | 'click'>('scroll');
  const liquidClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const morphArmed = useRef(false);

  const readProgress = useCallback(() => {
    /* The click target and the mapping target are the same element; fall back
       to the desktop section, then to the maximum scroll, if neither is laid
       out (loading screen / hidden at the current breakpoint). */
    const mobile = document.getElementById('most-played');
    const desktop = document.getElementById('games-section');
    const target = mobile?.offsetHeight ? mobile : desktop?.offsetHeight ? desktop : null;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const end = target
      ? Math.min(target.getBoundingClientRect().top + window.scrollY, maxScroll)
      : maxScroll;
    if (end <= 1) return window.scrollY > 0 ? 1 : 0;
    return Math.min(1, Math.max(0, window.scrollY / end));
  }, []);

  /* Writes the pill's box for a progress value. Deliberately NO CSS transition:
     the scroll itself is the animation, so there is nothing to catch up with.
     offset* are layout boxes (immune to the buttons' active:scale-95 mid-press)
     and translateX takes physical px, so RTL needs no sign flip. */
  const placeLiquid = useCallback((progress: number) => {
    const liquid = liquidRef.current;
    const home = homeTabRef.current;
    const games = gamesTabRef.current;
    if (!liquid || !home || !games) return;
    if (home.offsetWidth === 0 || games.offsetWidth === 0) return; /* bar is hidden at sm+ */
    const lerp = (a: number, b: number) => a + (b - a) * progress;
    /* Same-value writes are skipped: the fallback tick below re-runs this while
       idle, and there is no reason to dirty the style with identical strings. */
    const write = (prop: 'width' | 'height' | 'top' | 'transform', value: string) => {
      if (liquid.style[prop] !== value) liquid.style[prop] = value;
    };
    write('width', `${lerp(home.offsetWidth, games.offsetWidth)}px`);
    write('height', `${lerp(home.offsetHeight, games.offsetHeight)}px`);
    write('top', `${lerp(home.offsetTop, games.offsetTop)}px`);
    write('transform', `translateX(${lerp(home.offsetLeft, games.offsetLeft)}px)`);
  }, []);

  /* rAF-throttled sync: one pill write + the label flip per scroll frame. */
  const syncLiquid = useCallback(() => {
    const progress = readProgress();
    placeLiquid(progress);
    const next = progress >= 0.5 ? 'games' : 'home';
    if (next !== activeTabRef.current) {
      activeTabRef.current = next;
      setActiveTab(next);
    }
  }, [readProgress, placeLiquid]);

  /* Mount: seat the pill BEFORE the browser paints â€” a fresh top load shows it
     on Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© with no animation and no flash, while a restored mid-page
     scroll resolves instantly (0ms) to the position/tab it belongs to.
     Listeners + one early rAF reconcile the label and catch any scroll the
     browser restores after this effect, plus resizes and webfont swaps. */
  useLayoutEffect(() => {
    if (status === 'loading') return;
    let rafId = 0;
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        syncLiquid();
      });
    };

    placeLiquid(readProgress());
    morphArmed.current = false;
    const armTimer = window.setTimeout(() => { morphArmed.current = true; }, LIQUID_ARM_MS);
    schedule();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    /* Fallback tick: scroll events are coalesced (and rAF stalls) whenever the
       renderer suspends frames â€” background/occluded/headless tabs â€” which can
       leave the pill behind an already-moved scroll position. A cheap synchronous
       sync keeps the DOM correct even with nothing painting; on an active tab the
       scroll path above still delivers the same-frame, zero-delay updates. */
    const fallbackId = window.setInterval(() => syncLiquid(), 33);
    document.fonts.ready.then(schedule).catch(() => {});
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.clearInterval(fallbackId);
      if (rafId) cancelAnimationFrame(rafId);
      window.clearTimeout(armTimer);
      if (liquidClickTimer.current) {
        clearTimeout(liquidClickTimer.current);
        liquidClickTimer.current = null;
      }
    };
  }, [status, placeLiquid, readProgress, syncLiquid]);

  /* Midpoint flip: the active/idle classes just swapped the two buttons'
     boxes, so re-seat the pill on the new geometry (continuous position stays
     the source of truth) and play the squash/stretch morph â€” decoration only.
     The morph is suppressed during the load/restore window so a refresh never
     animates the first paint, and under prefers-reduced-motion it never runs. */
  useEffect(() => {
    if (status === 'loading') return;
    activeTabRef.current = activeTab;
    placeLiquid(readProgress());
    const clicked = liquidTrigger.current === 'click';
    liquidTrigger.current = 'scroll';
    if (!morphArmed.current) return;
    const blob = liquidBlobRef.current;
    if (!blob || prefersReducedMotion()) return;
    const duration = clicked ? LIQUID_CLICK_MS : LIQUID_SCROLL_MS;
    const ease = clicked ? LIQUID_CLICK_EASE : LIQUID_SCROLL_EASE;
    blob.style.animation = 'none';
    void blob.offsetWidth; /* restart the keyframes */
    blob.style.animation = `navLiquidMorph ${duration}ms ${ease}`;
  }, [activeTab, status, placeLiquid, readProgress]);

  /* A tap on the already-active tab never flips activeTab â€” drop the fast
     timing shortly after so a later scroll still flows at the slow pace. */
  const markLiquidClick = () => {
    liquidTrigger.current = 'click';
    if (liquidClickTimer.current) clearTimeout(liquidClickTimer.current);
    liquidClickTimer.current = setTimeout(() => { liquidTrigger.current = 'scroll'; }, LIQUID_CLICK_MS + 700);
  };

  const goHome = () => { markLiquidClick(); scrollToTop(); };
  const goGames = () => { markLiquidClick(); scrollToGames(); };

  const saveName = async () => {
    const v = nameDraft.trim().replace(/\s+/g, ' ');
    if (v.length < 2 || v.length > 30) {
      setNameMsg({ kind: 'err', text: 'Ø§Ù„Ø³Ù…ÙŠØ© Ø®Ø§Øµ ØªÙƒÙˆÙ† Ø¨ÙŠÙ† 2 Ùˆ 30 Ø­Ø±Ù.' });
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
        setNameMsg({ kind: 'ok', text: 'ØªØ¨Ø¯Ù„Ø§Øª Ø§Ù„Ø³Ù…ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­. ØºØ§Ø¯ÙŠ ØªØ¨Ø¯Ù„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù…Ù† Ø¨Ø¹Ø¯ 7 Ø£ÙŠØ§Ù….' });
      } else {
        setNameMsg({ kind: 'err', text: data.error || 'ØµØ§Ø¨ Ù…Ø´ÙƒÙ„. Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨.' });
      }
    } catch {
      setNameMsg({ kind: 'err', text: 'ØµØ§Ø¨ Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø®Ø§Ø¯Ù…. Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨.' });
    }
    setNameBusy(false);
  };

  const savePassword = async () => {
    if (pwDraft.n1.length < 6) {
      setPwMsg({ kind: 'err', text: 'Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ø®Ø§Øµ ÙŠÙƒÙˆÙ† ÙÙŠÙ‡ 6 Ø­Ø±ÙˆÙ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.' });
      return;
    }
    if (pwDraft.n1 !== pwDraft.n2) {
      setPwMsg({ kind: 'err', text: 'Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ù…Ø§Ø´ÙŠ ÙƒÙŠÙ ÙƒÙŠÙ ÙØ§Ù„ØªØ£ÙƒÙŠØ¯.' });
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
        setPwMsg({ kind: 'ok', text: 'ØªØ¨Ø¯Ù„ Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø¨Ù†Ø¬Ø§Ø­.' });
      } else {
        setPwMsg({ kind: 'err', text: data.error || 'ØµØ§Ø¨ Ù…Ø´ÙƒÙ„. Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨.' });
      }
    } catch {
      setPwMsg({ kind: 'err', text: 'ØµØ§Ø¨ Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø®Ø§Ø¯Ù…. Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨.' });
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
          showToast('ok', `ÙƒØ§Ø¯Ùˆ Ø¯ Ø§Ù„ÙŠÙˆÙ…: +${data.reward} ðŸª™ (Ù†Ù‡Ø§Ø±${data.streak ?? 1})`);
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
          showToast('ok', `Ù…Ø±Ø­Ø¨Ø§ Ø¨Ùƒ! Ø¹Ù†Ø¯Ùƒ ${data.coins} ðŸª™`);
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
      showToast('error', `Ù…Ø§Ø¹Ù†Ø¯ÙƒØ´ ÙƒÙˆÙŠÙ†Ø² ÙƒØ§ÙÙŠÙŠÙ† â€” ØªÙØ±Ø¬ ÙØ¥Ø´Ù‡Ø§Ø± Ø¨Ø§Ø´ ØªØ²ÙŠØ¯Ù‡Ù… ðŸ” (${coins}/${game.cost})`);
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
        showToast('error', err.error ?? 'Ø§Ù„Ù„Ø¹Ø¨Ø© Ù…Ø§Ø®Ø¯Ù…Ø§ØªØ´ØŒ Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨');
      }
    } catch {
      setLaunching(null);
      showToast('error', 'Ù…Ø´ÙƒÙ„ ÙØ§Ù„ÙƒÙˆÙ†ÙŠÙƒØ³ÙŠÙˆÙ† â€” Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨');
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
        showToast('error', 'Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨ Ù…Ù† Ø¨Ø¹Ø¯ Ø´ÙˆÙŠØ©');
        return;
      }
      if (!startRes.ok) {
        setAdModalOpen(false);
        showToast('error', 'Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø¥Ø´Ù‡Ø§Ø± â€” Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨');
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
            if (!r.ok) { setAdModalOpen(false); showToast('error', 'Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø¥Ø´Ù‡Ø§Ø± â€” Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨'); return; }
            const payload = (await r.json()) as { redirectUrl?: string; newBalance?: number; awarded?: number };
            if (payload.redirectUrl) {
              rememberPayMethod('ad');
              const game = GAMES.find((g) => g.id === gameId);
              if (game) setLaunching(game);
              router.replace(payload.redirectUrl);
              return;
            }
            if (typeof payload.newBalance === 'number') await update({ coins: payload.newBalance });
            showToast('ok', `+${payload.awarded ?? 0} ÙƒÙˆÙŠÙ†Ø² ÙƒØ§Ø¯Ùˆ! ðŸŽ`);
            setAdModalOpen(false);
          } catch {
            setAdModalOpen(false);
            showToast('error', 'Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø¥Ø´Ù‡Ø§Ø± â€” Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨');
          }
        })();
      }, 1000);
    } catch {
      setAdModalOpen(false);
      showToast('error', 'Ù…Ø´ÙƒÙ„ ÙØ§Ù„Ø¥Ø´Ù‡Ø§Ø± â€” Ø¹Ø§ÙˆØ¯ Ø¬Ø±Ø¨');
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
          <p className="font-lalezar text-2xl text-[#F5E7CE] text-glow-gold">ÙƒÙ†ÙˆØ¬Ø¯Ùˆ Ø§Ù„ÙƒØ±Ø§Ø³Ø§â€¦</p>
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HEADER â€” sticky dark bar
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* RTL: first child â†’ visual RIGHT, last child â†’ visual LEFT */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-[54px]"
        style={{ background: 'rgba(6,8,16,0.55)', backdropFilter: 'blur(16px) saturate(160%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* FIRST â†’ visual RIGHT */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="h-8 w-8 grid place-items-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-white/42" /> : <Volume2 className="h-3.5 w-3.5 text-white/42" />}
          </button>
          <button
            onClick={toggleMusic}
            title={musicMuted ? 'ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰' : 'Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰'}
            className="h-8 w-8 grid place-items-center rounded-full transition-all"
            style={{
              background: musicMuted ? 'rgba(255,255,255,0.05)' : 'rgba(232,180,48,0.12)',
              border: musicMuted ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(232,180,48,0.35)',
            }}
          >
            <Music className="h-3.5 w-3.5" style={{ color: musicMuted ? 'rgba(255,255,255,0.35)' : '#E8B430' }} />
          </button>
        </div>

        {/* CENTER/NEAR LEFT: Logo â€” moved a little to the left, next to menu button */}
        <div className="flex items-center gap-2.5"><Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-playm3ana-new.png" alt="PlayM3ana" width={34} height={28} className="h-7 w-auto object-contain" />
          <span className="font-cairo font-black text-[15px] tracking-tight">
            <span className="text-white">PLAY</span>
            <span style={{ color: '#E8B430' }}>M3ANA</span>
          </span>
        </Link>

        {/* LAST â†’ visual LEFT: hamburger */}
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
        </div>
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

      {/* Level pill â€” mirrored on start side (visual right in RTL) */}
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO â€” image complÃ¨te + contenu superposÃ©
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative w-full" style={{ background: '#060810' }}>

        {/* IMAGE â€” aspect ratio exact 1672/941, object-contain = photo complÃ¨te visible */}
        <div className="relative w-full" style={{ aspectRatio: '1672 / 941' }}>
          <Image
            src="/images/moroccan-hero-full.png"
            alt="PLAYM3ANA â€” Ø³Ø§Ø­Ø© Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ©"
            fill
            className="object-contain object-center"
            priority
            sizes="100vw"
          />
        </div>

        {/* GRADIENT OVERLAY â€” fondu du bas vers le haut, couvre ~55% infÃ©rieur */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '62%',
            background: 'linear-gradient(to top, #060810 0%, #060810 28%, rgba(6,8,16,0.85) 55%, rgba(6,8,16,0.3) 80%, transparent 100%)',
          }}
        />

        {/* CONTENU â€” superposÃ© en bas de l'image */}
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
            <span className="text-white">Ø§Ù„Ù„Ø¹Ø¨ ÙƒÙŠØ²ÙŠØ¯</span><br />
            <span style={{
              background: 'linear-gradient(135deg,#F5CC6B 0%,#E8B430 45%,#C2341A 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>Ø§Ù„Ø­Ù„Ø§ Ù…Ø¹ ØµØ­Ø§Ø¨Ùƒ</span>
          </h1>

          <div className="flex items-center gap-2.5">
            <a
              href="#most-played"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] font-cairo font-black text-[14px]"
              style={{ background: 'rgba(194,52,26,0.95)', border: '1px solid rgba(220,80,40,0.55)', color: 'white', boxShadow: '0 4px 20px rgba(194,52,26,0.6)' }}
            >
              <Gamepad2 className="h-4 w-4" />
              Ù„Ø¹Ø¨ Ø¯Ø§ÙŠØ§
            </a>
            {!isAuthed && (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-[14px] font-cairo font-black text-[12px]"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
              >
                ØµØ§ÙˆØ¨ ÙƒÙˆÙ†Ø·
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          LIVE TICKER â€” activity strip
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div
        className="relative overflow-hidden py-2.5"
        style={{ background: 'rgba(194,52,26,0.1)', borderTop: '1px solid rgba(194,52,26,0.22)', borderBottom: '1px solid rgba(194,52,26,0.12)' }}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 z-10" style={{ background: 'linear-gradient(to left, #060810, transparent)' }} />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 z-10" style={{ background: 'linear-gradient(to right, #060810, transparent)' }} />
        <div
          className="ticker-marquee flex w-max whitespace-nowrap"
          style={{ animation: 'marqueeRtl 28s linear infinite', willChange: 'transform' }}
        >
          {[0, 1].map((g) => (
            <div key={g} className="flex shrink-0 gap-8 pe-8" aria-hidden={g === 1 ? true : undefined}>
              {TICKER_ITEMS.map((item, i) => (
                <span key={`${g}-${i}`} className="font-cairo text-[11px] font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.52)' }}>
                  {item}
                  <span className="mx-4" style={{ color: 'rgba(232,180,48,0.45)' }}>â—†</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          STATS â€” 3 community numbers
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div
        className="grid grid-cols-3"
        style={{ background: 'rgba(6,8,16,0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {[
          { emoji: 'ðŸŽ®', num: '+50',   label: 'Ù„Ø¹Ø¨Ø© Ù…Ø®ØªÙ„ÙØ©',     color: '#E8B430' },
          { emoji: 'ðŸ†', num: '+100K', label: 'Ù„Ø§Ø¹Ø¨ Ù†Ø´ÙŠØ·',        color: '#10A07A' },
          { emoji: 'â­', num: '4.8',   label: 'ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', color: '#F5CC6B' },
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          Ø£Ø¨ÙˆØ§Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© â€” GAME DOORS (mobile carousel)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="most-played" className="pt-5 pb-4 sm:hidden">
        <div className="flex items-center justify-between px-4 mb-4">
          <a href="#most-played" className="font-cairo text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„
          </a>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: '#E8B430', opacity: 0.65 }} />
            <h2 className="font-lalezar text-[19px] text-white">Ø£Ø¨ÙˆØ§Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©</h2>
            <div className="w-2 h-2 rotate-45 flex-shrink-0" style={{ background: '#E8B430', opacity: 0.65 }} />
          </div>
        </div>

        <div className="flex items-start overflow-x-auto gap-3 pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {GAMES.map((game, i) => {
            const rankBg  = ['#E8B430','#A855F7','#C2341A','#EF4444','#10A07A'][i];
            const rankClr = i === 0 ? '#060810' : '#fff';
            return (
              /* Wrapper ~1.3 cartes visibles par Ã©cran :
                 76.92% (= 100 / 1.3) de la largeur utile du strip âˆ’ le gap (gap-3 = 12px)
                 â†’ visible / (carte + gap) â‰ˆ 1.3 sur mobile ; le strip est masquÃ© dÃ¨s sm: */
              <div key={game.id} className="snap-center shrink-0 relative w-[calc(76.92%_-_12px)]">
                <GameCard
                  game={game}
                  coins={coins}
                  isBusy={busyId === game.id}
                  loadingAction={busyAction}
                  onPlay={(e) => playWithCoins(game.id, e)}
                  onWatchAd={() => watchAdToPlay(game.id)}
                />
                {/* Rank badge superposÃ© sur la card */}
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
          <h2 className="font-lalezar text-[22px] text-white">Ø£Ø¨ÙˆØ§Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©</h2>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(232,180,48,0.3),transparent)' }} />
        </div>
        <div className="grid items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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



      {/* â•â•â•â•â•â• MISSIONS â€” floating buttons (DailyMissionButtons, bottom-left) â•â•â•â•â•â• */}

      {/* â•â•â•â•â•â• GUEST CTA â•â•â•â•â•â• */}
      {!isAuthed && (
        <section className="px-4 pb-4">
          <div
            className="rounded-[20px] p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(232,180,48,0.1) 0%,rgba(6,8,16,0.95) 100%)', border: '1px solid rgba(232,180,48,0.22)' }}
          >
            <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[20px]"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(232,180,48,0.7),#E8B430,rgba(232,180,48,0.7),transparent)' }} />
            <p className="font-lalezar text-[19px] text-white mb-1">Ø¯Ø®Ù„ ÙˆØ¨Ø¯Ø§ ØªÙ„Ø¹Ø¨ Ù…Ø¬Ø§Ù†Ø§Ù‹ ðŸŽ®</p>
            <p className="font-cairo text-[11px] text-white/38 mb-4">Ø¹Ù†Ø¯Ùƒ 100 ÙƒÙˆÙŠÙ† Ø¨Ø§Ø´ ØªØ¨Ø¯Ø§ Ø§Ù„Ø´ÙˆÙ‡Ø©</p>
            <div className="flex gap-2.5">
              <Link
                href="/register"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{ background: 'linear-gradient(135deg,#F5CC6B,#E8B430)', color: '#060810' }}
              >
                ØµØ§ÙˆØ¨ ÙƒÙˆÙ†Ø·
              </Link>
              <Link
                href="/login"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
              >
                Ø¯Ø®ÙˆÙ„
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â• REFERRAL â•â•â•â•â•â• */}
      {isAuthed && xpData?.referralCode && (
        <section className="px-4 pb-4">
          <div className="rounded-[18px] p-4" style={{ background: 'rgba(232,180,48,0.06)', border: '1px solid rgba(232,180,48,0.18)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" style={{ color: '#E8B430' }} />
              <span className="font-lalezar text-[17px]" style={{ color: '#E8B430' }}>Ø¹Ø±Ø¶ Ø¹Ù„Ù‰ ØµØ§Ø­Ø¨Ùƒ</span>
            </div>
            <p className="font-cairo text-[11px] text-white/42 mb-3">Ø¨Ø§Ø±Ø·Ø§Ø¬ÙŠ Ø§Ù„ÙƒÙˆØ¯ â€” Ø¨Ø¬ÙˆØ¬ ØºØ§ØªØ±Ø¨Ø­Ùˆ ÙƒÙˆÙŠÙ†Ø² ÙØ§Ø¨ÙˆØ± ðŸŽ</p>
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
                {referralCopied ? 'ØªÙ…!' : 'ÙƒÙˆÙ¾ÙŠ'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Ad + Footer */}
      <div className="px-4 pb-4"><AdBanner /></div>
      <div className="px-4"><LobbyFooter isAuthed={isAuthed} username={session?.user?.username} /></div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BOTTOM NAV â€” 4 tabs, mobile only
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* RTL: first DOM child â†’ visual RIGHT */}
      <nav
        ref={navRef}
        aria-label="Ø§Ù„ØªÙ†Ù‚Ù„ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ"
        className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:hidden"
        style={{ background: '#060810', borderTop: '1px solid rgba(232,180,48,0.1)' }}
      >
        {/* Liquid pill â€” the single active highlight shared by Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â†” Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨.
            Sits behind the buttons; position/size are written from JS on every
            scroll frame with NO transition (scroll = animation), and the inner
            blob carries the color + the squash/stretch morph while travelling. */}
        <div
          ref={liquidRef}
          data-nav-liquid
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
          style={{ willChange: 'transform, width, height' }}
        >
          <div ref={liquidBlobRef} className="nav-liquid-blob absolute inset-0 rounded-full" style={NAV_TAB_ACTIVE_STYLE} />
        </div>
        {/* Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â€” visual RIGHT (DOM first in RTL) */}
        <button
          ref={homeTabRef}
          onClick={goHome}
          aria-label="Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©"
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`${NAV_TAB_PRIMARY}${activeTab === 'home' ? '' : ' hover:bg-white/[0.06]'}`}
        >
          <Home className={`h-[22px] w-[22px] ${activeTab === 'home' ? 'text-white' : 'text-white/35'}`} />
          <span className={`font-cairo text-[10px] font-black ${activeTab === 'home' ? 'text-white' : 'text-white/35'}`}>Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</span>
        </button>
        {/* Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨ â€” ÙŠÙ‡Ø¨Ø· Ù„Ù‚Ø³Ù… #most-played */}
        <button
          ref={gamesTabRef}
          onClick={goGames}
          aria-label="Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨"
          aria-current={activeTab === 'games' ? 'page' : undefined}
          className={`${NAV_TAB_PRIMARY}${activeTab === 'games' ? '' : ' hover:bg-white/[0.06]'}`}
        >
          <Gamepad2 className={`h-[22px] w-[22px] ${activeTab === 'games' ? 'text-white' : 'text-white/35'}`} />
          <span className={`font-cairo text-[10px] font-black ${activeTab === 'games' ? 'text-white' : 'text-white/35'}`}>Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨</span>
        </button>
        {/* Ø§Ù„ØµØ­Ø§Ø¨ â€” ÙŠÙØªØ­ Ù„ÙˆØ­Ø© Ø§Ù„ØµØ­Ø§Ø¨ (Ø£Ùˆ ÙˆØ±Ù‚Ø© Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ø¶ÙŠÙˆÙ) */}
        <button onClick={openFriends} aria-label="Ø§Ù„ØµØ­Ø§Ø¨" className={NAV_TAB_IDLE}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="13" y="4" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="3" y="13" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
            <rect x="13" y="13" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.33)" />
          </svg>
          <span className="font-cairo text-[10px] text-white/35">Ø§Ù„ØµØ­Ø§Ø¨</span>
        </button>
        {/* Ø­Ø³Ø§Ø¨ÙŠ â€” visual LEFT (DOM last in RTL) */}
        <button onClick={openSettings} aria-label="Ø­Ø³Ø§Ø¨ÙŠ" className={NAV_TAB_IDLE}>
          <User className="h-[22px] w-[22px] text-white/35" />
          <span className="font-cairo text-[10px] text-white/35">Ø­Ø³Ø§Ø¨ÙŠ</span>
        </button>
      </nav>

      {/* Missions Panel */}
      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => {
            void update();
            setMissionsOpen(false);
            showToast('ok', `Ù…Ø¨Ø±ÙˆÙƒ! Ø±Ø¨Ø­ØªÙŠ +${reward} ðŸª™ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù‡Ù…Ø© ðŸŽ¯`);
          }}
        />
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• FRIENDS PANEL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {friendsOpen && (
        <FriendsPanel onClose={() => setFriendsOpen(false)} />
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DAILY MISSION FLOATING BUTTONS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {isAuthed && <DailyMissionButtons />}

      {/* Music auto-start hint â€” fades in/out once via CSS animation */}
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
            <span className="font-cairo text-[10.5px] font-bold">Ø§Ù„Ù…Ø³Ù‘ Ø£Ùˆ Ø§Ø¶ØºØ· Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ ðŸŽµ</span>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• AD MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">Ø¥Ø´Ù‡Ø§Ø± Ø¨Ø§Ø´ ØªÙ„Ø¹Ø¨</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-[#FFF7E8]">Ø«ÙˆØ§Ù†ÙŠ Ù…Ù† ÙˆÙ‚ØªÙƒ Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„Ù„ÙŠÙ„Ø© ÙƒØ§Ù…Ù„Ø©</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
                  Ø´Ø§Ù‡Ø¯ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ÙˆØºØ§Ø¯ÙŠ Ù†ÙØªØ­ Ù„ÙŠÙƒ Ø§Ù„Ø·Ø§ÙˆÙ„Ø© <b className="text-[#F5B942]">ÙØ§Ø¨ÙˆØ±</b> â€” Ù…Ø§Ø´ÙŠ Ù‡Ø²ÙŠÙ…Ø©ØŒ Ù‡Ø°Ø§ ØªÙƒØªÙŠÙƒ ðŸ˜…
                </p>
                <button onClick={startRewardedAd} className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> ØªÙØ±Ø¬ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø´Ù‡Ø§Ø± â€” ÙˆØ¹ÙŠÙ†ÙŠ Ø¹ÙŠÙ†Ùƒ
                </button>
                <button
                  onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
                >
                  Ù„Ø§ Ø´ÙƒØ±Ø§ØŒ ØºØ§Ù†Ø®Ù„Øµ Ø¨Ø§Ù„ÙƒÙˆÙŠÙ†Ø²
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
                    <p className="font-cairo text-[13px] font-black text-[#2DD4BF]">ØµØ¨Ø± Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø´Ù‡Ø§Ø±â€¦</p>
                    <p className="font-cairo text-[11px] font-semibold text-[#B8C4D8]">
                      ØºØ§Ø¯ÙŠ ØªØ¯Ø®Ù„ Ù„Ù„Ø·Ø¨Ù„Ø© Ù…Ù† Ø¨Ø¹Ø¯ {countdown} {countdown === 1 ? 'Ø«Ø§Ù†ÙŠØ©' : 'Ø«ÙˆØ§Ù†ÙŠ'}
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
                <p className="font-cairo text-[14px] font-black text-emerald-300">ÙƒÙ†ØªØ£ÙƒØ¯Ùˆ Ø¨Ù„ÙŠ Ù…Ø§ØªÙØ±Ø¬ØªÙŠØ´ Ù Ø§Ù„Ø¥Ø´Ù‡Ø§Ø± ÙˆØ¹ÙŠÙ†ÙŠÙƒ Ù…Ø³Ø¯ÙˆØ¯ÙŠÙ†â€¦</p>
                <p className="font-cairo text-[12px] font-semibold text-emerald-100/70">ØªÙ‚Ø¯Ø± ØªØ¹ÙŠØ· Ù„ØµØ­Ø§Ø¨Ùƒ Ø¨Ø§Ø´ ØªÙˆØ¬Ø¯Ùˆ ðŸ«¡</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• GUEST AUTH SHEET â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">Ø§Ù„ØªÙ‡Ø§Ù„ÙŠØ¨ Ù…Ø­Ø¬ÙˆØ²ÙŠÙ† Ù„Ù„Ø¹Ø¶Ø§Ø¡</p>
            </div>
            <h3 className="mt-4 font-lalezar text-2xl text-[#FFF7E8]">Ø¯Ø®ÙˆÙ„ ÙÙŠ 5 Ø«ÙˆØ§Ù†ÙŠ Ø¨Ø§Ø´ ØªÙØ±Ø´ Ø§Ù„Ø·Ø¨Ù„Ø©</h3>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
              Ø¯Ø®Ù„ ÙˆÙ„Ø§ ØµØ§ÙˆØ¨ ÙƒÙˆÙ†Ø· ÙØ§Ø¨ÙˆØ± â€” ÙˆØ¹Ù†Ø¯Ùƒ 100 ÙƒÙˆÙŠÙ† Ø¨Ø§Ø´ ØªØ¨Ø¯Ø§ Ø§Ù„Ø´ÙˆÙ‡Ø© ÙØ§Ø¨ÙˆØ± ðŸª™
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/login" className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 w-full py-3.5 text-[15px]">
                <LogIn className="h-5 w-5" /> Ø¯Ø®ÙˆÙ„
              </Link>
              <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                <UserPlus className="h-5 w-5" /> ØµØ§ÙˆØ¨ ÙƒÙˆÙ†Ø· â€” ÙØ§Ø¨ÙˆØ±
              </Link>
            </div>
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="mt-3 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
            >
              Ø´ÙˆÙ Ø§Ù„Ø·Ø¨Ù„Ø§Øª â€” Ù…Ù† Ø¨Ø¹Ø¯ Ù†Ø¯ÙŠØ± Ø§Ù„Ø­Ø³Ø§Ø¨
            </button>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• SETTINGS SHEET â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
              <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {/* Coins */}
              {isAuthed && (
                <div className="flex items-center justify-between rounded-2xl border border-[#F5B942]/20 bg-[#F5B942]/10 px-4 py-3">
                  <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">Ø§Ù„ÙƒÙˆÙŠÙ†Ø² Ø¯ÙŠØ§Ù„Ùƒ</span>
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
                  Ø§Ù„ØµÙˆØª
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
                  Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰
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
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ø³Ù…ÙŠØ©</span>
                  </div>
                  {me?.username && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      Ø§Ø³Ù… Ø§Ù„ÙƒÙˆÙ†Ø· Ø§Ù„Ø£ØµÙ„ÙŠ: <span className="font-bold text-[#FFF7E8]">{me.username}</span>
                      {me.email ? ` (${me.email})` : ''}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) => { setNameDraft(e.target.value); setNameMsg(null); }}
                      maxLength={30}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      placeholder="Ø§Ù„Ø³Ù…ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©â€¦"
                      className="w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-[#2DD4BF]/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void saveName()}
                      disabled={nameBusy || (me?.canChangeName === false)}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl shrink-0 px-4 py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {nameBusy ? 'â€¦' : 'Ø­ÙØ¸'}
                    </button>
                  </div>
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#2DD4BF]/80">
                      <Clock className="h-3.5 w-3.5" />
                      ØªÙ‚Ø¯Ø± ØªØ¨Ø¯Ù„ Ù…Ù† Ø¨Ø¹Ø¯ {new Date(me.nextNameChangeAt).toLocaleDateString('ar-MA')}
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
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯</span>
                  </div>
                  {me?.hasPassword === false && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      Ù‡Ø§Ø¯ Ø§Ù„Ø­Ø³Ø§Ø¨ ØªØ³Ø¬Ù„ Ø¨Ø¬ÙˆØ¬Ù„ â€” Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ù…Ø§Ø´ÙŠ Ù…Ø±Ø¨ÙˆØ· Ø¨ÙŠÙ‡.
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-col gap-2">
                    <input
                      type="password"
                      value={pwDraft.cur}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, cur: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø§Ù„Ø­Ø§Ù„ÙŠ"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n1}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n1: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n2}
                      onChange={(e) => { setPwDraft((p) => ({ ...p, n2: e.target.value })); setPwMsg(null); }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="Ø¹Ø§ÙˆØ¯ Ø§ÙƒØªØ¨ Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void savePassword()}
                      disabled={pwBusy || me?.hasPassword === false}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {pwBusy ? 'â€¦' : 'Ø¨Ø¯Ù„ Ø§Ù„Ø¨Ø§Ø³ÙˆØ±Ø¯'}
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
                    <LogIn className="h-5 w-5" /> Ø¯Ø®ÙˆÙ„
                  </Link>
                  <Link href="/register" className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]">
                    <UserPlus className="h-5 w-5" /> ØµØ§ÙˆØ¨ ÙƒÙˆÙ†Ø· â€” ÙØ§Ø¨ÙˆØ±
                  </Link>
                </>
              )}

              {/* Logout */}
              {isAuthed && (
                <button
                  onClick={() => { void handleLogout(); }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-950/20 py-3.5 font-cairo text-[13px] font-black text-red-300"
                >
                  <LogOut className="h-4 w-4" /> Ø®Ø±ÙˆØ¬
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TOAST â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
