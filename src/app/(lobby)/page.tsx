"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoadingPage from "@/components/LoadingPage";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Gamepad2,
  Loader2,
  LogIn,
  LogOut,
  Play,
  Settings,
  ShieldCheck,
  UserPlus,
  Volume2,
  VolumeX,
  X,
  Zap,
  Home,
  User,
  Music,
} from "lucide-react";
import { StarMark } from "@/components/Star";
import GameCard from "@/components/GameCard";
import GameIcon from "@/components/GameIcon";
import GuestNotice from "@/components/landing/GuestNotice";
import ComingSoon from "@/components/landing/ComingSoon";
import LobbyFooter from "@/components/landing/LobbyFooter";
import { GAMES, type Game } from "@/lib/games";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";
import { rememberPayMethod } from "@/lib/payMethod";
import { clearSessionRoster } from "@/lib/roster";
import { trackDevice } from "@/lib/device";
import {
  Sounds,
  isMuted,
  setMuted,
} from "@/lib/sounds";
import dynamic from "next/dynamic";

const MissionsPanel = dynamic(() => import("@/components/MissionsPanel"), {
  ssr: false,
});
const FriendsPanel = dynamic(() => import("@/components/FriendsPanel"), {
  ssr: false,
});
const DailyMissionButtons = dynamic(
  () => import("@/components/DailyMissionButtons"),
  { ssr: false },
);

const TICKER_ITEMS = [
  "🔥 الصداع د الحومة كاين من بكري",
  "🇲🇦 تحداو بعضياتكم بالدارجة",
  "🕹️ كلشي بالدارجة — حتى الكدوب والمعاودة",
  "🎲 تيليفون واحد = بزاف د الشوهة",
  "🤫 واحد فيكم كيكدب — مرحبا بيك فالحومة",
  "💰 تفرج فإشهار — ماشي خسارة، هادا تكتيك",
  "💔 الليلة تولي جريمة فالطبلة، والجيران شاهدين",
];

const TITLE_WORDS_1 = ["فضح", "صاحبك"];
const TITLE_WORDS_2 = ["قبل", "ما", "يفضحك"];

/* ── Bottom tab bar item styles ── */
/* `relative` keeps the buttons painted above the absolutely-positioned liquid pill.
   الرئيسية ↔ الألعاب share ONE fixed box (same padding + label weight in both
   states — only colors swap), so the pill lerps between two static boxes and
   cannot jump when the active label flips at the scroll midpoint. */
const NAV_TAB_PRIMARY =
  "relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full transition active:scale-95";
const NAV_TAB_IDLE =
  "relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition hover:bg-white/[0.06] active:scale-95";
const NAV_TAB_ACTIVE_STYLE: React.CSSProperties = {
  background: "rgba(194,52,26,0.9)",
  boxShadow: "0 2px 14px rgba(194,52,26,0.5)",
};

/* ── Liquid indicator (shared pill for الرئيسية ↔ الألعاب) ──
   The pill's POSITION has no transition at all: it is re-lerped from scroll
   progress on every scroll frame, so it flows in real time with the finger.
   These constants only tune the decorative squash/stretch morph on the inner
   blob while the pill travels. */
const LIQUID_SCROLL_MS = 520; /* scroll flip: slow, visibly flowing */
const LIQUID_CLICK_MS = 210; /* tap: quick hop */
const LIQUID_SCROLL_EASE =
  "cubic-bezier(0.65, 0, 0.35, 1)"; /* fluid ease-in-out */
const LIQUID_CLICK_EASE =
  "cubic-bezier(0.22, 0.61, 0.36, 1)"; /* snappy ease-out */
const LIQUID_ARM_MS = 800; /* no morph while the page load / scroll restore settles */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Coin burst particles on button click ── */
function spawnCoins(x: number, y: number) {
  const container = document.body;
  for (let i = 0; i < 7; i++) {
    const el = document.createElement("div");
    el.className = "coin-float";
    el.textContent = "🪙";
    el.style.left = `${x - 12}px`;
    el.style.top = `${y - 12}px`;
    const angle = (Math.PI * 2 * i) / 7;
    const dist = 55 + Math.random() * 40;
    el.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--ty", `${Math.sin(angle) * dist - 60}px`);
    el.style.setProperty("--rot", `${-180 + Math.random() * 360}deg`);
    el.style.animationDelay = `${i * 0.045}s`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}

function LobbyContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"coins" | "ad" | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<"idle" | "watching" | "verifying">(
    "idle",
  );
  const [countdown, setCountdown] = useState(5);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toast, setToast] = useState<{
    kind: "error" | "ok";
    text: string;
  } | null>(null);
  const [coinPop, setCoinPop] = useState(false);

  const [cardsVisible, setCardsVisible] = useState(true);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [xpData, setXpData] = useState<{
    xp: number;
    level: number;
    gamesPlayed: number;
    streak: number;
    referralCode?: string;
  } | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setMusicPlaying(e.detail);
    window.addEventListener('pm3_music_state', handler);
    window.dispatchEvent(new CustomEvent('pm3_music_req'));
    return () => window.removeEventListener('pm3_music_state', handler);
  }, []);

  /* ── Settings: name + password ── */
  const [me, setMe] = useState<{
    username?: string | null;
    displayName?: string | null;
    email?: string | null;
    hasPassword?: boolean;
    nextNameChangeAt?: string | null;
    canChangeName?: boolean;
  } | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [pwDraft, setPwDraft] = useState({ cur: "", n1: "", n2: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
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
        setNameDraft(data.displayName ?? "");
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
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 640px)").matches
      ) {
        router.push("/login");
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

  /* ── Bottom tab bar: scroll targets + active tab tracking ── */
  /* The pill position never waits for this state: it follows scroll progress
     continuously. `activeTab` only drives aria-current / the active label,
     which flips at the midpoint (progress 0.5) of the scroll range. */
  const [activeTab, setActiveTab] = useState<"home" | "games">("home");

  /* Reduced motion: snap the page instantly, so the pill snaps with it. */
  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

  const scrollToGames = () =>
    document.getElementById("most-played")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });

  /* ── Liquid indicator: ONE shared pill that flows between الرئيسية ↔ الألعاب ──
     Source of truth = scroll progress p ∈ [0,1]: 0 = page top, 1 = the games
     section snapped to the viewport top (exactly where a tab click lands).
     Every scroll frame re-lerps the pill's box between the two button boxes,
     so the liquid physically flows toward الألعاب while the user scrolls and
     arrives exactly when the section does — zero perceived delay. */
  const navRef = useRef<HTMLElement>(null);
  const homeTabRef = useRef<HTMLButtonElement>(null);
  const gamesTabRef = useRef<HTMLButtonElement>(null);
  const liquidRef = useRef<HTMLDivElement>(null);
  const liquidBlobRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<"home" | "games">("home");
  const liquidTrigger = useRef<"scroll" | "click">("scroll");
  const liquidClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const morphArmed = useRef(false);

  const cachedLayoutRef = useRef<{
    end: number;
    home: { w: number; h: number; t: number; l: number };
    games: { w: number; h: number; t: number; l: number };
  } | null>(null);

  const updateCachedLayout = useCallback(() => {
    const mobile = document.getElementById("most-played");
    const desktop = document.getElementById("games-section");
    const target = mobile?.offsetHeight
      ? mobile
      : desktop?.offsetHeight
        ? desktop
        : null;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const end = target
      ? Math.min(target.getBoundingClientRect().top + window.scrollY, maxScroll)
      : maxScroll;

    const home = homeTabRef.current;
    const games = gamesTabRef.current;
    if (home && games) {
      cachedLayoutRef.current = {
        end,
        home: {
          w: home.offsetWidth,
          h: home.offsetHeight,
          t: home.offsetTop,
          l: home.offsetLeft,
        },
        games: {
          w: games.offsetWidth,
          h: games.offsetHeight,
          t: games.offsetTop,
          l: games.offsetLeft,
        },
      };
    }
  }, []);

  const readProgress = useCallback(() => {
    if (!cachedLayoutRef.current) updateCachedLayout();
    const end = cachedLayoutRef.current?.end ?? 1;
    if (end <= 1) return window.scrollY > 0 ? 1 : 0;
    return Math.min(1, Math.max(0, window.scrollY / end));
  }, [updateCachedLayout]);

  /* Writes the pill's box for a progress value. Deliberately NO CSS transition:
     the scroll itself is the animation, so there is nothing to catch up with.
     offset* are layout boxes (immune to the buttons' active:scale-95 mid-press)
     and translateX takes physical px, so RTL needs no sign flip. */
  const placeLiquid = useCallback((progress: number) => {
    const liquid = liquidRef.current;
    const layout = cachedLayoutRef.current;
    if (!liquid || !layout) return;
    const { home, games } = layout;
    if (home.w === 0 || games.w === 0) return; /* bar is hidden at sm+ */
    const lerp = (a: number, b: number) => a + (b - a) * progress;
    /* Same-value writes are skipped: the fallback tick below re-runs this while
       idle, and there is no reason to dirty the style with identical strings. */
    const write = (
      prop: "width" | "height" | "top" | "transform",
      value: string,
    ) => {
      if (liquid.style[prop] !== value) liquid.style[prop] = value;
    };
    write("width", `${lerp(home.w, games.w)}px`);
    write("height", `${lerp(home.h, games.h)}px`);
    write("top", `${lerp(home.t, games.t)}px`);
    write("transform", `translateX(${lerp(home.l, games.l)}px)`);
  }, []);

  /* rAF-throttled sync: one pill write + the label flip per scroll frame. */
  const syncLiquid = useCallback(() => {
    const progress = readProgress();
    placeLiquid(progress);
    const next = progress >= 0.5 ? "games" : "home";
    if (next !== activeTabRef.current) {
      activeTabRef.current = next;
      setActiveTab(next);
    }
  }, [readProgress, placeLiquid]);

  /* Mount: seat the pill BEFORE the browser paints — a fresh top load shows it
     on الرئيسية with no animation and no flash, while a restored mid-page
     scroll resolves instantly (0ms) to the position/tab it belongs to.
     Listeners + one early rAF reconcile the label and catch any scroll the
     browser restores after this effect, plus resizes and webfont swaps. */
  useLayoutEffect(() => {
    if (status === "loading") return;
    updateCachedLayout();
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
    const armTimer = window.setTimeout(() => {
      morphArmed.current = true;
    }, LIQUID_ARM_MS);
    schedule();

    const handleResize = () => {
      updateCachedLayout();
      schedule();
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", handleResize);
    /* Fallback tick: scroll events are coalesced (and rAF stalls) whenever the
       renderer suspends frames — background/occluded/headless tabs — which can
       leave the pill behind an already-moved scroll position. A cheap synchronous
       sync keeps the DOM correct even with nothing painting; on an active tab the
       scroll path above still delivers the same-frame, zero-delay updates. */
    const fallbackId = window.setInterval(() => syncLiquid(), 33);
    const handleFontsReady = () => {
      updateCachedLayout();
      schedule();
    };
    document.fonts.ready.then(handleFontsReady).catch(() => {});
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", handleResize);
      window.clearInterval(fallbackId);
      if (rafId) cancelAnimationFrame(rafId);
      window.clearTimeout(armTimer);
      if (liquidClickTimer.current) {
        clearTimeout(liquidClickTimer.current);
        liquidClickTimer.current = null;
      }
    };
  }, [status, placeLiquid, readProgress, syncLiquid, updateCachedLayout]);

  /* Midpoint flip: the active/idle classes just swapped the two buttons'
     boxes, so re-seat the pill on the new geometry (continuous position stays
     the source of truth) and play the squash/stretch morph — decoration only.
     The morph is suppressed during the load/restore window so a refresh never
     animates the first paint, and under prefers-reduced-motion it never runs. */
  useEffect(() => {
    if (status === "loading") return;
    activeTabRef.current = activeTab;
    placeLiquid(readProgress());
    const clicked = liquidTrigger.current === "click";
    liquidTrigger.current = "scroll";
    if (!morphArmed.current) return;
    const blob = liquidBlobRef.current;
    if (!blob || prefersReducedMotion()) return;
    const duration = clicked ? LIQUID_CLICK_MS : LIQUID_SCROLL_MS;
    const ease = clicked ? LIQUID_CLICK_EASE : LIQUID_SCROLL_EASE;
    blob.style.animation = "none";
    void blob.offsetWidth; /* restart the keyframes */
    blob.style.animation = `navLiquidMorph ${duration}ms ${ease}`;
  }, [activeTab, status, placeLiquid, readProgress]);

  /* A tap on the already-active tab never flips activeTab — drop the fast
     timing shortly after so a later scroll still flows at the slow pace. */
  const markLiquidClick = () => {
    liquidTrigger.current = "click";
    if (liquidClickTimer.current) clearTimeout(liquidClickTimer.current);
    liquidClickTimer.current = setTimeout(() => {
      liquidTrigger.current = "scroll";
    }, LIQUID_CLICK_MS + 700);
  };

  const goHome = () => {
    markLiquidClick();
    scrollToTop();
  };
  const goGames = () => {
    markLiquidClick();
    scrollToGames();
  };

  const saveName = async () => {
    const v = nameDraft.trim().replace(/\s+/g, " ");
    if (v.length < 2 || v.length > 30) {
      setNameMsg({ kind: "err", text: "السمية خاص تكون بين 2 و 30 حرف." });
      return;
    }
    setNameBusy(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/me/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: v }),
      });
      const data = (await res.json()) as {
        displayName?: string;
        nextNameChangeAt?: string;
        error?: string;
      };
      if (res.ok && data.displayName) {
        await update({ displayName: data.displayName });
        setMe((prev) =>
          prev
            ? {
                ...prev,
                displayName: data.displayName,
                nextNameChangeAt: data.nextNameChangeAt ?? null,
                canChangeName: false,
              }
            : prev,
        );
        setNameMsg({
          kind: "ok",
          text: "تبدلات السمية بنجاح. غادي تبدل مرة أخرى من بعد 7 أيام.",
        });
      } else {
        setNameMsg({ kind: "err", text: data.error || "صاب مشكل. عاود جرب." });
      }
    } catch {
      setNameMsg({ kind: "err", text: "صاب مشكل فالخادم. عاود جرب." });
    }
    setNameBusy(false);
  };

  const savePassword = async () => {
    if (pwDraft.n1.length < 6) {
      setPwMsg({
        kind: "err",
        text: "الباسورد الجديد خاص يكون فيه 6 حروف على الأقل.",
      });
      return;
    }
    if (pwDraft.n1 !== pwDraft.n2) {
      setPwMsg({ kind: "err", text: "الباسورد الجديد ماشي كيف كيف فالتأكيد." });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwDraft.cur,
          newPassword: pwDraft.n1,
          confirmPassword: pwDraft.n2,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setPwDraft({ cur: "", n1: "", n2: "" });
        setPwMsg({ kind: "ok", text: "تبدل الباسورد بنجاح." });
      } else {
        setPwMsg({ kind: "err", text: data.error || "صاب مشكل. عاود جرب." });
      }
    } catch {
      setPwMsg({ kind: "err", text: "صاب مشكل فالخادم. عاود جرب." });
    }
    setPwBusy(false);
  };
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) Sounds.click();
  };

  useEffect(() => {
    if (!adModalOpen && adTimerRef.current) {
      clearInterval(adTimerRef.current);
      adTimerRef.current = null;
      setAdStatus("idle");
    }
  }, [adModalOpen]);

  useEffect(() => {
    GAMES.forEach((g) => {
      router.prefetch(`/games/${g.id}`);
      fetch(`/game-files/${g.id}/index.html`, {
        priority: "low",
      } as RequestInit).catch(() => {});
    });
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/economy/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setXpData(data);
      });
  }, [status]);

  const showToast = (kind: "error" | "ok", text: string) => {
    setToast({ kind, text });
    if (kind === "ok") Sounds.ok();
    else Sounds.error();
    window.setTimeout(() => setToast(null), 3200);
  };

  const autoClaimed = useRef(false);
  useEffect(() => {
    if (status !== "authenticated" || autoClaimed.current) return;
    autoClaimed.current = true;
    void trackDevice();
    (async () => {
      try {
        const res = await fetch("/api/rewards/checkin", { method: "POST" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          claimed?: boolean;
          reward?: number;
          streak?: number;
        };
        if (data.claimed && typeof data.reward === "number") {
          setOptimisticCoins((prev) => (prev ?? coins) + data.reward!);
          await update();
          setCoinPop(true);
          setTimeout(() => setCoinPop(false), 600);
          Sounds.checkin();
          showToast(
            "ok",
            `كادو د اليوم: +${data.reward} 🪙 (نهار${data.streak ?? 1})`,
          );
        }
      } catch {
        /* best-effort */
      }
    })();
  }, [status, update]);

  useEffect(() => {
    if (status !== "authenticated" || searchParams.get("from") !== "game")
      return;
    router.replace("/");
    (async () => {
      try {
        const res = await fetch("/api/economy/balance");
        if (!res.ok) return;
        const data = (await res.json()) as { coins?: number };
        if (typeof data.coins === "number") {
          setOptimisticCoins(data.coins);
          await update({ coins: data.coins });
          setCoinPop(true);
          setTimeout(() => setCoinPop(false), 600);
          showToast("ok", `مرحبا بك! عندك ${data.coins} 🪙`);
        }
      } catch {
        await update();
      }
    })();
  }, [status, searchParams, router, update]);

  const requireAuth = (gameId: string, method: "coins" | "ad") => {
    if (status === "authenticated") return true;
    const intent = `?play=${gameId}&method=${method}`;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 640px)").matches
    ) {
      router.push(`/login${intent}`);
    } else {
      router.replace(intent, { scroll: false });
      setAuthSheetOpen(true);
    }
    return false;
  };

  const playWithCoins = async (gameId: string, e?: React.MouseEvent) => {
    if (!requireAuth(gameId, "coins")) return;
    rememberPayMethod("coins");
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    const coins = session?.user?.coins ?? 0;
    if (coins < game.cost) {
      showToast(
        "error",
        `ماعندكش كوينز كافيين — تفرج فإشهار باش تزيدهم 🔁 (${coins}/${game.cost})`,
      );
      return;
    }

    if (e) spawnCoins(e.clientX, e.clientY);
    Sounds.coin();

    setBusyId(gameId);
    setBusyAction("coins");

    try {
      const res = await fetch("/api/games/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ gameId, paymentMethod: "coins" }),
      });
      if (res.ok) {
        const { redirectUrl, remainingCoins } = await res.json();
        if (typeof remainingCoins === "number") {
          setOptimisticCoins(remainingCoins);
          await update({ coins: remainingCoins });
        }
        Sounds.launch();
        router.replace(redirectUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("error", err.error ?? "اللعبة ماخدماتش، عاود جرب");
      }
    } catch {
      showToast("error", "مشكل فالكونيكسيون — عاود جرب");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const watchAdToPlay = (gameId: string) => {
    setSelectedGame(gameId);
    setAdStatus("idle");
    setAdModalOpen(true);
  };

  const playAdDirectly = async (gameId: string) => {
    setSelectedGame(gameId);
    setAdStatus("watching");
    setAdModalOpen(true);
    await startRewardedAd(gameId);
  };

  const startRewardedAd = async (directGameId?: string) => {
    const gameId = directGameId || selectedGame;
    if (!gameId) return;
    try {
      const startRes = await fetch("/api/ads/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placement: "unlock", gameId }),
      });
      if (startRes.status === 429) {
        setAdModalOpen(false);
        showToast("error", "عاود جرب من بعد شوية");
        return;
      }
      if (!startRes.ok) {
        setAdModalOpen(false);
        showToast("error", "مشكل فالإشهار — عاود جرب");
        return;
      }
      const { nonce } = (await startRes.json()) as { nonce: string };
      setAdStatus("watching");
      setCountdown(5);
      let remaining = 5;
      adTimerRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining > 0) return;
        if (adTimerRef.current) {
          clearInterval(adTimerRef.current);
          adTimerRef.current = null;
        }
        setAdStatus("verifying");
        void (async () => {
          try {
            const r = await fetch("/api/ads/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": nonce,
              },
              body: JSON.stringify({ nonce }),
            });
            if (!r.ok) {
              setAdModalOpen(false);
              showToast("error", "مشكل فالإشهار — عاود جرب");
              return;
            }
            const payload = (await r.json()) as {
              redirectUrl?: string;
              newBalance?: number;
              awarded?: number;
            };
            if (payload.redirectUrl) {
              rememberPayMethod("ad");
              const game = GAMES.find((g) => g.id === gameId);

              router.replace(payload.redirectUrl);
              return;
            }
            if (typeof payload.newBalance === "number") {
              setOptimisticCoins(payload.newBalance);
              await update({ coins: payload.newBalance });
            }
            showToast("ok", `+${payload.awarded ?? 0} كوينز كادو! 🎁`);
            setAdModalOpen(false);
          } catch {
            setAdModalOpen(false);
            showToast("error", "مشكل فالإشهار — عاود جرب");
          }
        })();
      }, 1000);
    } catch {
      setAdModalOpen(false);
      showToast("error", "مشكل فالإشهار — عاود جرب");
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const resumedPlay = useRef(false);
  useEffect(() => {
    if (status !== "authenticated" || resumedPlay.current) return;
    const gameId = searchParams.get("play");
    const method = searchParams.get("method");
    if (!gameId || !GAMES.some((g) => g.id === gameId)) return;
    if (method !== "coins" && method !== "ad") return;
    resumedPlay.current = true;
    router.replace("/", { scroll: false });
    if (method === "coins") void playWithCoins(gameId);
    else watchAdToPlay(gameId);
  }, [status, searchParams, router]);

  const isAuthed = status === "authenticated";
  const sessionCoins = session?.user?.coins ?? 0;
  const [optimisticCoins, setOptimisticCoins] = useState<number | null>(null);
  const coins = optimisticCoins ?? sessionCoins;

  useEffect(() => {
    if (sessionCoins !== undefined) {
      // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setOptimisticCoins(sessionCoins);
    }
  }, [sessionCoins]);

  const [initError, setInitError] = useState(false);
  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => setInitError(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (status === "loading") {
    if (initError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#060810] text-white">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="font-cairo text-lg">وقع مشكل فالاتصال</p>
          <button 
            onClick={() => window.location.reload()} 
            className="rounded-xl bg-[#E8B430] px-6 py-2.5 font-cairo font-black text-[#060810] transition hover:brightness-110 active:scale-95"
          >
            عاود جرب
          </button>
        </div>
      );
    }

    return (
      <div id="game-loading" className="game-loading" role="status" aria-live="polite">
        <img className="game-loading__logo" src="data:image/webp;base64,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" alt="PlayM3ana logo" />
        <div className="pencil-loader" aria-hidden="true">
          <div className="pencil-loader__pencil"></div>
          <div className="pencil-loader__stroke"></div>
        </div>
        <div className="game-loading__name">PLAYM3ANA</div>
        <div className="game-loading__message">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-dvh overflow-x-hidden bg-[#060810] text-white"
      style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}
    >
      {/* ══════════════════════════════════════════
          HEADER — sticky dark bar
      ══════════════════════════════════════════ */}
      {/* RTL: first child → visual RIGHT, last child → visual LEFT */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-[54px]"
        style={{
          background: "rgba(6,8,16,0.55)",
          backdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* FIRST → visual RIGHT */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="h-8 w-8 grid place-items-center rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5 text-white/42" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-white/42" />
            )}
          </button>
          <div id="music-portal"></div>
        </div>

        {/* LAST → visual LEFT: Logo + hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icons/image.png"
              alt="PlayM3ana"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <span className="font-cairo font-black text-[15px] tracking-tight">
              <span className="text-white">PLAY</span>
              <span style={{ color: "rgb(232, 180, 48)" }}>M3ANA</span>
            </span>
          </Link>

          <button
            onClick={openSettings}
            className="h-9 w-9 grid place-items-center rounded-xl transition hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <svg
              width="17"
              height="13"
              viewBox="0 0 17 13"
              fill="none"
              aria-hidden="true"
            >
              <rect
                width="17"
                height="2.2"
                rx="1.1"
                fill="rgba(255,255,255,0.8)"
              />
              <rect
                y="5.4"
                width="11"
                height="2.2"
                rx="1.1"
                fill="rgba(255,255,255,0.8)"
              />
              <rect
                y="10.8"
                width="17"
                height="2.2"
                rx="1.1"
                fill="rgba(255,255,255,0.8)"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Coins pill */}
      {isAuthed && (
        <div
          className={`fixed end-4 top-[62px] z-[55] flex select-none items-center gap-1.5 rounded-full border px-3 py-1 font-cairo text-[13px] font-black tabular-nums pointer-events-none backdrop-blur-sm ${coinPop ? "coin-pop" : ""}`}
          style={{
            borderColor: "rgba(232,180,48,0.35)",
            background: "rgba(6,8,16,0.95)",
            color: "#E8B430",
            boxShadow: "0 0 14px rgba(232,180,48,0.25)",
          }}
        >
          <Coins className="h-3.5 w-3.5" />
          {coins}
        </div>
      )}

      {/* Level pill — mirrored on start side (visual right in RTL) */}
      {isAuthed && xpData && (
        <div
          className="fixed start-4 top-[62px] z-[55] flex select-none items-center gap-1.5 rounded-full border px-3 py-1 pointer-events-none backdrop-blur-sm"
          style={{
            borderColor: "rgba(232,180,48,0.25)",
            background: "rgba(6,8,16,0.95)",
            boxShadow: "0 0 10px rgba(232,180,48,0.15)",
          }}
        >
          <span className="font-grit text-[12px]" style={{ color: "#E8B430" }}>
            LV.{xpData.level}
          </span>
          <div
            className="w-16 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, ((xpData.xp % Math.floor(100 * Math.pow(xpData.level, 1.4))) / Math.max(1, Math.floor(100 * Math.pow(xpData.level, 1.4)))) * 100)}%`,
                background: "linear-gradient(90deg,#E8B430,#F5CC6B)",
              }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO — image complète + contenu superposé
      ══════════════════════════════════════════ */}
      <section className="relative w-full" style={{ background: "#060810" }}>
        {/* IMAGE — aspect ratio exact 1672/941, object-contain = photo complète visible */}
        <div className="relative w-full" style={{ aspectRatio: "1672 / 941" }}>
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
            height: "62%",
            background:
              "linear-gradient(to top, #060810 0%, #060810 28%, rgba(6,8,16,0.85) 55%, rgba(6,8,16,0.3) 80%, transparent 100%)",
          }}
        />

        {/* CONTENU — superposé en bas de l'image */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 flex flex-col gap-3">
          {/* LIVE badge */}
          <h1
            className="font-lalezar leading-[1.08]"
            style={{
              fontSize: "clamp(1.75rem,7.5vw,2.4rem)",
              textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            }}
          >
            <span className="text-white">اللعب كيزيد</span>
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg,#F5CC6B 0%,#E8B430 45%,#C2341A 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              يحلا مع صحابك
            </span>
          </h1>

          <div className="flex items-center gap-2.5">
            <a
              href="#most-played"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] font-cairo font-black text-[14px]"
              style={{
                background: "rgba(194,52,26,0.95)",
                border: "1px solid rgba(220,80,40,0.55)",
                color: "white",
                boxShadow: "0 4px 20px rgba(194,52,26,0.6)",
              }}
            >
              <Gamepad2 className="h-4 w-4" />
              لعب دابا
            </a>
            {!isAuthed && (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-[14px] font-cairo font-black text-[12px]"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                }}
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
        style={{
          background: "rgba(194,52,26,0.1)",
          borderTop: "1px solid rgba(194,52,26,0.22)",
          borderBottom: "1px solid rgba(194,52,26,0.12)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-14 z-10"
          style={{
            background: "linear-gradient(to left, #060810, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-14 z-10"
          style={{
            background: "linear-gradient(to right, #060810, transparent)",
          }}
        />
        <div
          className="ticker-marquee flex w-max whitespace-nowrap"
          style={{
            animation: "marqueeRtl 28s linear infinite",
            willChange: "transform",
          }}
        >
          {[0, 1].map((g) => (
            <div
              key={g}
              className="flex shrink-0 gap-8 pe-8"
              aria-hidden={g === 1 ? true : undefined}
            >
              {TICKER_ITEMS.map((item, i) => (
                <span
                  key={`${g}-${i}`}
                  className="font-cairo text-[11px] font-bold shrink-0"
                  style={{ color: "rgba(255,255,255,0.52)" }}
                >
                  {item}
                  <span
                    className="mx-4"
                    style={{ color: "rgba(232,180,48,0.45)" }}
                  >
                    ◆
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          AMBIANCE MAROCAINE — 3 cartes culturelles
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden px-3 py-2.5"
        style={{
          background: "#060810",
          borderBottom: "1px solid rgba(232,180,48,0.14)",
        }}
      >
        {/* Zellige tile pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 3L37 20L20 37L3 20Z' fill='none' stroke='rgba(232,180,48,0.06)' stroke-width='1'/%3E%3Cpath d='M20 10L30 20L20 30L10 20Z' fill='none' stroke='rgba(232,180,48,0.04)' stroke-width='0.8'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative grid grid-cols-3 gap-2">
          {[
            {
              iconBig: "🤪",
              iconSmall: "🎮",
              rotBig: "-12deg",
              rotSmall: "15deg",
              title: "لعب بالدارجة",
              sub: "كلشي مفهوم",
              color: "#E8B430",
              gradFrom: "rgba(232,180,48,0.13)",
            },
            {
              iconBig: "😤",
              iconSmall: "👊",
              rotBig: "8deg",
              rotSmall: "-14deg",
              title: "مع صحابك",
              sub: "فتيليفون واحد",
              color: "#10A07A",
              gradFrom: "rgba(16,160,122,0.13)",
            },
            {
              iconBig: "🦁",
              iconSmall: "🇲🇦",
              rotBig: "-10deg",
              rotSmall: "12deg",
              title: "100% مغربي",
              sub: "من القلب",
              color: "#C2341A",
              gradFrom: "rgba(194,52,26,0.13)",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center gap-1.5 rounded-[18px] py-3 overflow-hidden"
              style={{
                background: `linear-gradient(150deg, ${card.gradFrom} 0%, rgba(6,8,16,0.85) 100%)`,
                border: `1px solid ${card.color}28`,
                boxShadow: `0 4px 24px ${card.color}12, inset 0 1px 0 ${card.color}18`,
              }}
            >
              {/* Top luminous bar */}
              <div
                className="absolute top-0 inset-x-0 h-[2.5px] rounded-t-[18px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                  boxShadow: `0 0 10px ${card.color}`,
                }}
              />

              {/* Bottom-right zellige diamond */}
              <div
                className="absolute bottom-2.5 end-2.5 w-2 h-2 rotate-45 opacity-25"
                style={{ background: card.color }}
              />
              {/* Top-left zellige diamond */}
              <div
                className="absolute top-3 start-2.5 w-1.5 h-1.5 rotate-45 opacity-20"
                style={{ background: card.color }}
              />

              {/* Icons — crazy duo */}
              <div className="relative flex items-center justify-center" style={{ width: 54, height: 50 }}>
                {/* Outer pulse ring */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    border: `1px solid ${card.color}35`,
                    boxShadow: `0 0 16px ${card.color}25`,
                  }}
                />
                {/* Inner glow */}
                <div
                  className="absolute inset-[7px] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${card.color}20 0%, transparent 80%)`,
                  }}
                />
                {/* Big emoji — offset left + rotated */}
                <span
                  className="absolute text-[30px] leading-none select-none"
                  style={{
                    transform: `rotate(${card.rotBig}) translate(-8px, -2px)`,
                    filter: `drop-shadow(0 2px 6px ${card.color}50)`,
                  }}
                >
                  {card.iconBig}
                </span>
                {/* Small emoji — offset right bottom + counter-rotated */}
                <span
                  className="absolute text-[18px] leading-none select-none"
                  style={{
                    transform: `rotate(${card.rotSmall}) translate(14px, 10px)`,
                    filter: `drop-shadow(0 1px 4px rgba(0,0,0,0.8))`,
                  }}
                >
                  {card.iconSmall}
                </span>
              </div>

              {/* Title */}
              <p
                className="font-lalezar text-[13px] leading-none text-center"
                style={{
                  color: card.color,
                  textShadow: `0 0 12px ${card.color}60`,
                }}
              >
                {card.title}
              </p>

              {/* Subtitle */}
              <p
                className="font-cairo text-[8.5px] font-bold text-center px-2 leading-tight"
                style={{ color: "rgba(255,255,255,0.32)" }}
              >
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          أبواب المدينة — GAME DOORS (mobile carousel)
      ══════════════════════════════════════════ */}
      <section id="most-played" className="pt-5 pb-4 sm:hidden">
        <div className="flex items-center justify-start px-4 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rotate-45 flex-shrink-0"
              style={{ background: "#E8B430", opacity: 0.65 }}
            />
            <h2 className="font-lalezar text-[19px] text-white">
              أبواب المدينة
            </h2>
            <div
              className="w-2 h-2 rotate-45 flex-shrink-0"
              style={{ background: "#E8B430", opacity: 0.65 }}
            />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {GAMES.map((game, i) => {
            const rankBg = [
              "#E8B430",
              "#A855F7",
              "#C2341A",
              "#EF4444",
              "#10A07A",
            ][i];
            const rankClr = i === 0 ? "#060810" : "#fff";
            return (
              /* Wrapper ~1.3 cartes visibles par écran :
                 76.92% (= 100 / 1.3) de la largeur utile du strip − le gap (gap-3 = 12px)
                 → visible / (carte + gap) ≈ 1.3 sur mobile ; le strip est masqué dès sm: */
              <div
                key={game.id}
                className="snap-center shrink-0 relative w-[calc(76.92%_-_12px)]"
              >
                <GameCard
                  game={game}
                  coins={coins}
                  isBusy={busyId === game.id}
                  loadingAction={busyAction}
                  onPlay={(e) => playWithCoins(game.id, e)}
                  onWatchAd={() => watchAdToPlay(game.id)}
                  onDirectAd={() => playAdDirectly(game.id)}
                />
                {/* Rank badge superposé sur la card */}
                <div
                  className="absolute top-3 end-3 z-20 h-6 w-6 rounded-full grid place-items-center font-cairo text-[10px] font-black pointer-events-none"
                  style={{
                    background: rankBg,
                    color: rankClr,
                    boxShadow: `0 2px 8px ${rankBg}70`,
                  }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Desktop: full game cards grid */}
      <section
        id="games-section"
        className="hidden sm:block px-6 pb-8 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-2.5 h-2.5 rotate-45 flex-shrink-0"
            style={{ background: "#E8B430", opacity: 0.7 }}
          />
          <h2 className="font-lalezar text-[22px] text-white">أبواب المدينة</h2>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg,rgba(232,180,48,0.3),transparent)",
            }}
          />
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
              onDirectAd={() => playAdDirectly(game.id)}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES — filter by type
      ══════════════════════════════════════════ */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {(
            [
              {
                id: "g",
                icon: "👥",
                label: "الألعاب الجماعية",
                bg: "rgba(72,42,155,0.85)",
                border: "rgba(105,65,210,0.55)",
                color: "#C4A8FF",
              },
              {
                id: "d",
                icon: "🎨",
                label: "الكتف مع الرسم",
                bg: "rgba(12,75,95,0.85)",
                border: "rgba(40,175,200,0.55)",
                color: "#6DE6F5",
              },
              {
                id: "m",
                icon: "🧠",
                label: "ألعاب ذكاء",
                bg: "rgba(8,68,42,0.85)",
                border: "rgba(22,165,95,0.55)",
                color: "#4DDD9A",
              },
              {
                id: "s",
                icon: "⚡",
                label: "ألعاب سريعة",
                bg: "rgba(80,52,4,0.85)",
                border: "rgba(235,175,35,0.55)",
                color: "#F5D060",
              },
              {
                id: "f",
                icon: "⚽",
                label: "كرة القدم",
                bg: "rgba(6,58,28,0.85)",
                border: "rgba(30,190,88,0.55)",
                color: "#86EFAC",
              },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              className="shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-[14px] min-w-[68px] transition-transform hover:scale-105 active:scale-95"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
            >
              <span className="text-[22px] leading-none">{cat.icon}</span>
              <span
                className="font-cairo text-[8.5px] font-black text-center"
                style={{ color: cat.color, whiteSpace: "nowrap" }}
              >
                {cat.label}
              </span>
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
            style={{
              background:
                "linear-gradient(135deg,rgba(232,180,48,0.1) 0%,rgba(6,8,16,0.95) 100%)",
              border: "1px solid rgba(232,180,48,0.22)",
            }}
          >
            <div
              className="absolute top-0 inset-x-0 h-[3px] rounded-t-[20px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(232,180,48,0.7),#E8B430,rgba(232,180,48,0.7),transparent)",
              }}
            />
            <p className="font-lalezar text-[19px] text-white mb-1">
              دخل وبدا تلعب مجاناً 🎮
            </p>
            <p className="font-cairo text-[11px] text-white/38 mb-4">
              عندك 100 كوين باش تبدا الشوهة
            </p>
            <div className="flex gap-2.5">
              <Link
                href="/register"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{
                  background: "linear-gradient(135deg,#F5CC6B,#E8B430)",
                  color: "#060810",
                }}
              >
                صاوب كونط
              </Link>
              <Link
                href="/login"
                className="flex-1 py-3 rounded-[14px] font-cairo font-black text-[14px] text-center"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "white",
                }}
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
          <div
            className="rounded-[18px] p-4"
            style={{
              background: "rgba(232,180,48,0.06)",
              border: "1px solid rgba(232,180,48,0.18)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" style={{ color: "#E8B430" }} />
              <span
                className="font-lalezar text-[17px]"
                style={{ color: "#E8B430" }}
              >
                عرض على صاحبك
              </span>
            </div>
            <p className="font-cairo text-[11px] text-white/42 mb-3">
              بارطاجي الكود — بجوج غاتربحو كوينز فابور 🎁
            </p>
            <div className="flex items-center gap-2.5">
              <code
                className="flex-1 rounded-xl px-3 py-2.5 font-mono text-[13px] tracking-widest text-white"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(232,180,48,0.18)",
                }}
              >
                {xpData.referralCode}
              </code>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(xpData!.referralCode!);
                  setReferralCopied(true);
                  setTimeout(() => setReferralCopied(false), 2200);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-cairo text-[12px] font-black"
                style={{
                  background: "rgba(232,180,48,0.12)",
                  border: "1px solid rgba(232,180,48,0.28)",
                  color: "#E8B430",
                }}
              >
                {referralCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {referralCopied ? "تم!" : "كوپي"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Ad + Footer */}
      <div className="px-4 pb-4">
        <AdBanner />
      </div>
      <div className="px-4">
        <LobbyFooter isAuthed={isAuthed} username={session?.user?.username} />
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM NAV — 4 tabs, mobile only
      ══════════════════════════════════════════ */}
      {/* RTL: first DOM child → visual RIGHT */}
      <nav
        ref={navRef}
        aria-label="التنقل الرئيسي"
        className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-around pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:hidden"
        style={{
          background: "#060810",
          borderTop: "1px solid rgba(232,180,48,0.1)",
        }}
      >
        {/* Liquid pill — the single active highlight shared by الرئيسية ↔ الألعاب.
            Sits behind the buttons; position/size are written from JS on every
            scroll frame with NO transition (scroll = animation), and the inner
            blob carries the color + the squash/stretch morph while travelling. */}
        <div
          ref={liquidRef}
          data-nav-liquid
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
          style={{ willChange: "transform, width, height" }}
        >
          <div
            ref={liquidBlobRef}
            className="nav-liquid-blob absolute inset-0 rounded-full"
            style={NAV_TAB_ACTIVE_STYLE}
          />
        </div>
        {/* الرئيسية — visual RIGHT (DOM first in RTL) */}
        <button
          ref={homeTabRef}
          onClick={goHome}
          aria-label="الرئيسية"
          aria-current={activeTab === "home" ? "page" : undefined}
          className={`${NAV_TAB_PRIMARY}${activeTab === "home" ? "" : " hover:bg-white/[0.06]"}`}
        >
          <Home
            className={`h-[22px] w-[22px] ${activeTab === "home" ? "text-white" : "text-white/35"}`}
          />
          <span
            className={`font-cairo text-[10px] font-black ${activeTab === "home" ? "text-white" : "text-white/35"}`}
          >
            الرئيسية
          </span>
        </button>
        {/* الألعاب — يهبط لقسم #most-played */}
        <button
          ref={gamesTabRef}
          onClick={goGames}
          aria-label="الألعاب"
          aria-current={activeTab === "games" ? "page" : undefined}
          className={`${NAV_TAB_PRIMARY}${activeTab === "games" ? "" : " hover:bg-white/[0.06]"}`}
        >
          <Gamepad2
            className={`h-[22px] w-[22px] ${activeTab === "games" ? "text-white" : "text-white/35"}`}
          />
          <span
            className={`font-cairo text-[10px] font-black ${activeTab === "games" ? "text-white" : "text-white/35"}`}
          >
            الألعاب
          </span>
        </button>
        {/* الصحاب — يفتح لوحة الصحاب (أو ورقة الدخول للضيوف) */}
        <button
          onClick={openFriends}
          aria-label="الصحاب"
          className={NAV_TAB_IDLE}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="4"
              width="6"
              height="6"
              rx="1.5"
              fill="rgba(255,255,255,0.33)"
            />
            <rect
              x="13"
              y="4"
              width="6"
              height="6"
              rx="1.5"
              fill="rgba(255,255,255,0.33)"
            />
            <rect
              x="3"
              y="13"
              width="6"
              height="6"
              rx="1.5"
              fill="rgba(255,255,255,0.33)"
            />
            <rect
              x="13"
              y="13"
              width="6"
              height="6"
              rx="1.5"
              fill="rgba(255,255,255,0.33)"
            />
          </svg>
          <span className="font-cairo text-[10px] text-white/35">الصحاب</span>
        </button>
        {/* حسابي — visual LEFT (DOM last in RTL) */}
        <button
          onClick={openSettings}
          aria-label="حسابي"
          className={NAV_TAB_IDLE}
        >
          <User className="h-[22px] w-[22px] text-white/35" />
          <span className="font-cairo text-[10px] text-white/35">حسابي</span>
        </button>
      </nav>

      {/* Missions Panel */}
      {missionsOpen && (
        <MissionsPanel
          onClose={() => setMissionsOpen(false)}
          onClaim={(reward) => {
            setOptimisticCoins((prev) => (prev ?? coins) + reward);
            void update();
            setMissionsOpen(false);
            showToast("ok", `مبروك! ربحتي +${reward} 🪙 على المهمة 🎯`);
          }}
        />
      )}

      {/* ═══════════════ FRIENDS PANEL ═══════════════ */}
      {friendsOpen && <FriendsPanel onClose={() => setFriendsOpen(false)} />}

      {/* ═══════════════ DAILY MISSION FLOATING BUTTONS ═══════════════ */}
      {isAuthed && (
        <DailyMissionButtons
          onClaim={(reward) => {
            setOptimisticCoins((prev) => (prev ?? coins) + reward);
            void update();
            setCoinPop(true);
            setTimeout(() => setCoinPop(false), 600);
            showToast("ok", `مبروك! ربحتي +${reward} 🪙 على المهمة 🎯`);
          }}
        />
      )}


      {/* ═══════════════ AD MODAL ═══════════════ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setAdModalOpen(false)}
          />
          <div
            className="bounce-in relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-xl"
            style={{
              background: "#0D1828",
              border: "1px solid rgba(232,180,48,0.2)",
            }}
          >
            <button
              type="button"
              onClick={() => setAdModalOpen(false)}
              className="absolute start-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">
                إشهار باش تلعب
              </p>
            </div>
            {adStatus === "idle" && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-[#FFF7E8]">
                  ثواني من وقتك مقابل الليلة كاملة
                </h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
                  شاهد الإعلان وغادي نفتح ليك الطاولة{" "}
                  <b className="text-[#F5B942]">فابور</b> — ماشي هزيمة، هذا
                  تكتيك 😅
                </p>
                <button
                  type="button"
                  onClick={() => startRewardedAd()}
                  className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 mt-6 w-full py-4 text-[15px]"
                >
                  <Play className="h-5 w-5" /> تفرج فالإشهار — وعيني عينك
                </button>
                {isAuthed ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      setAdModalOpen(false);
                      if (selectedGame) playWithCoins(selectedGame, e);
                    }}
                    className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
                  >
                    لا شكرا، غانخلص بالكوينز
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAdModalOpen(false);
                      setAuthSheetOpen(true);
                    }}
                    className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-[#B8C4D8] transition hover:text-[#FFF7E8]"
                  >
                    صاوب كونط — العب بالكوينز 🪙
                  </button>
                )}
              </>
            )}
            {adStatus === "watching" && (
              <div className="mt-4 flex flex-col gap-3">
                <AdNativeBanner />
                <div className="flex items-center gap-3 rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 px-4 py-4">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <span className="glow-pulse absolute inset-0 rounded-full bg-[#2DD4BF]/25 blur-xl" />
                    <span className="relative font-lalezar text-2xl text-[#2DD4BF]">
                      {countdown}
                    </span>
                  </div>
                  <div>
                    <p className="font-cairo text-[13px] font-black text-[#2DD4BF]">
                      صبر على الإشهار…
                    </p>
                    <p className="font-cairo text-[11px] font-semibold text-[#B8C4D8]">
                      غادي تدخل للطبلة من بعد {countdown}{" "}
                      {countdown === 1 ? "ثانية" : "ثواني"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {adStatus === "verifying" && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">
                  كنتأكدو بلي ماتفرجتيش ف الإشهار وعينيك مسدودين…
                </p>
                <p className="font-cairo text-[12px] font-semibold text-emerald-100/70">
                  تقدر تعيط لصحابك باش توجدو 🫡
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ GUEST AUTH SHEET ═══════════════ */}
      {authSheetOpen && (
        <div className="fixed inset-0 z-[65] sm:flex sm:items-center sm:justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setAuthSheetOpen(false)}
          />
          <div
            className="bounce-in absolute inset-x-0 bottom-0 rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:relative sm:inset-auto sm:rounded-2xl sm:pb-6 sm:w-full sm:max-w-[440px] shadow-[0_-20px_80px_rgba(0,0,0,.9)]"
            style={{
              background: "#0D1828",
              border: "1px solid rgba(232,180,48,0.2)",
            }}
          >
            <button
              onClick={() => setAuthSheetOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black text-[#FFF7E8]">
                التهاليب محجوزين للعضاء
              </p>
            </div>
            <h3 className="mt-4 font-lalezar text-2xl text-[#FFF7E8]">
              دخول في 5 ثواني باش تفرش الطبلة
            </h3>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-[#B8C4D8]">
              دخل ولا صاوب كونط فابور — وعندك 100 كوين باش تبدا الشوهة فابور 🪙
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 w-full py-3.5 text-[15px]"
              >
                <LogIn className="h-5 w-5" /> دخول
              </Link>
              <Link
                href="/register"
                className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]"
              >
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
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />
          <div
            className="bounce-in absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:relative sm:inset-auto sm:rounded-2xl sm:pb-6 sm:w-full sm:max-w-[500px] sm:max-h-[85dvh] shadow-[0_-20px_80px_rgba(0,0,0,.9)]"
            style={{
              background: "#0D1828",
              border: "1px solid rgba(232,180,48,0.2)",
            }}
          >
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#2DD4BF]" />
              <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">
                الإعدادات
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {/* Coins */}
              {isAuthed && (
                <div className="flex items-center justify-between rounded-2xl border border-[#F5B942]/20 bg-[#F5B942]/10 px-4 py-3">
                  <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">
                    الكوينز ديالك
                  </span>
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
                  {muted ? (
                    <VolumeX className="h-4 w-4 text-[#B8C4D8]" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-[#2DD4BF]" />
                  )}
                  الصوت
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${muted ? "bg-white/10" : "bg-[#2DD4BF]/40"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${muted ? "start-0.5" : "start-[1.375rem]"}`}
                  />
                </span>
              </button>

              {/* Music toggle */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('pm3_music_toggle'))}
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5"
              >
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8]">
                  {!musicPlaying ? (
                    <VolumeX className="h-4 w-4 text-[#B8C4D8]" />
                  ) : (
                    <Music className="h-4 w-4 text-[#2DD4BF]" />
                  )}
                  الموسيقى
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${!musicPlaying ? "bg-white/10" : "bg-[#2DD4BF]/40"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${!musicPlaying ? "start-0.5" : "start-[1.375rem]"}`}
                  />
                </span>
              </button>


              {/* Change name */}
              {isAuthed && (
                <div className="rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/10 px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="h-4 w-4 shrink-0 text-[#2DD4BF]" />
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">
                      تبديل السمية
                    </span>
                  </div>
                  {me?.username && (
                    <p className="mt-1.5 font-cairo text-[11px] text-[#B8C4D8]">
                      اسم الكونط الأصلي:{" "}
                      <span className="font-bold text-[#FFF7E8]">
                        {me.username}
                      </span>
                      {me.email ? ` (${me.email})` : ""}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) => {
                        setNameDraft(e.target.value);
                        setNameMsg(null);
                      }}
                      maxLength={30}
                      disabled={nameBusy || me?.canChangeName === false}
                      placeholder="السمية الجديدة…"
                      className="w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-[#2DD4BF]/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void saveName()}
                      disabled={nameBusy || me?.canChangeName === false}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl shrink-0 px-4 py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {nameBusy ? "…" : "حفظ"}
                    </button>
                  </div>
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11px] font-bold text-[#2DD4BF]/80">
                      <Clock className="h-3.5 w-3.5" />
                      تقدر تبدل من بعد{" "}
                      {new Date(me.nextNameChangeAt).toLocaleDateString(
                        "ar-MA",
                      )}
                    </p>
                  )}
                  {nameMsg && (
                    <p
                      className={`mt-2 font-cairo text-[11px] font-bold ${nameMsg.kind === "ok" ? "text-emerald-300" : "text-red-300"}`}
                    >
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
                    <span className="font-cairo text-[13px] font-bold text-[#FFF7E8]">
                      تبديل الباسورد
                    </span>
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
                      onChange={(e) => {
                        setPwDraft((p) => ({ ...p, cur: e.target.value }));
                        setPwMsg(null);
                      }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="الباسورد الحالي"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n1}
                      onChange={(e) => {
                        setPwDraft((p) => ({ ...p, n1: e.target.value }));
                        setPwMsg(null);
                      }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="الباسورد الجديد"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <input
                      type="password"
                      value={pwDraft.n2}
                      onChange={(e) => {
                        setPwDraft((p) => ({ ...p, n2: e.target.value }));
                        setPwMsg(null);
                      }}
                      disabled={pwBusy || me?.hasPassword === false}
                      placeholder="عاود اكتب الباسورد الجديد"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8] placeholder:text-white/40 outline-none transition focus:border-emerald-400/50 disabled:opacity-40"
                    />
                    <button
                      onClick={() => void savePassword()}
                      disabled={pwBusy || me?.hasPassword === false}
                      className="bg-[#E8B430] text-[#060810] font-bold rounded-xl py-2.5 text-[12px] disabled:opacity-40"
                    >
                      {pwBusy ? "…" : "بدل الباسورد"}
                    </button>
                  </div>
                  {pwMsg && (
                    <p
                      className={`mt-2 font-cairo text-[11px] font-bold ${pwMsg.kind === "ok" ? "text-emerald-300" : "text-red-300"}`}
                    >
                      {pwMsg.text}
                    </p>
                  )}
                </div>
              )}

              {/* Guest CTA */}
              {!isAuthed && (
                <>
                  <Link
                    href="/login"
                    className="bg-[#E8B430] text-[#060810] font-bold rounded-xl flex items-center justify-center gap-2 mt-1 w-full py-3.5 text-[15px]"
                  >
                    <LogIn className="h-5 w-5" /> دخول
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white/10 text-[#FFF7E8] font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 w-full py-3.5 text-[14px]"
                  >
                    <UserPlus className="h-5 w-5" /> صاوب كونط — فابور
                  </Link>
                </>
              )}

              {/* Logout */}
              {isAuthed && (
                <button
                  onClick={() => {
                    void handleLogout();
                  }}
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
          <div
            className={`bounce-in flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.kind === "error"
                ? "border-red-500/30 bg-red-950/80 text-red-200"
                : "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
            }`}
          >
            {toast.kind === "error" ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Check className="h-4 w-4 shrink-0" />
            )}
            <span className="font-cairo text-[13px] font-bold">
              {toast.text}
            </span>
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

// Trigger HMR
