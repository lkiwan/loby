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
        if (typeof remainingCoins === "number")
          await update({ coins: remainingCoins });
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
            if (typeof payload.newBalance === "number")
              await update({ coins: payload.newBalance });
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

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#060810]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E8B430]" />
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
          <div
            className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full font-cairo text-[10px] font-black"
            style={{
              background: "rgba(194,52,26,0.25)",
              border: "1px solid rgba(194,52,26,0.5)",
              color: "#FF7A5E",
              backdropFilter: "blur(4px)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
            LIVE GAMING
          </div>

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
          STATS — 3 community numbers
      ══════════════════════════════════════════ */}
      <div
        className="grid grid-cols-3"
        style={{
          background: "rgba(6,8,16,0.98)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {[
          { emoji: "🎮", num: "+50", label: "لعبة مختلفة", color: "#E8B430" },
          { emoji: "🏆", num: "+100K", label: "لاعب نشيط", color: "#10A07A" },
          {
            emoji: "⭐",
            num: "4.8",
            label: "تقييم المستخدمين",
            color: "#F5CC6B",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-1 py-4"
            style={{
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            <span className="text-[18px]">{s.emoji}</span>
            <p
              className="font-lalezar text-[16px] leading-none"
              style={{ color: s.color }}
            >
              {s.num}
            </p>
            <p
              className="font-cairo text-[8.5px] font-semibold text-center px-2 leading-tight"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          أبواب المدينة — GAME DOORS (mobile carousel)
      ══════════════════════════════════════════ */}
      <section id="most-played" className="pt-5 pb-4 sm:hidden">
        <div className="flex items-center justify-between px-4 mb-4">
          <a
            href="#most-played"
            className="font-cairo text-[11px] font-bold"
            style={{ color: "rgba(255,255,255,0.3)" }}
          ></a>
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
