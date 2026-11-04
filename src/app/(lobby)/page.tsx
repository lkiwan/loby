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
import {
  SolarCalendarCheck,
  SolarClipboardCheck,
  SolarClock,
  SolarCompass,
  SolarGamepad,
  SolarGear,
  SolarLock,
  SolarStar,
  SolarTv,
  SolarUsersGroup,
} from "@/components/SolarIcon";
import GuestNotice from "@/components/landing/GuestNotice";
import ComingSoon from "@/components/landing/ComingSoon";
import LobbyFooter from "@/components/landing/LobbyFooter";
import { GAMES, COMING_SOON, type Game } from "@/lib/games";
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

/* ── Daily check-in ladder (Store Posters check-in card) ──
   Mirrors the server defaults in src/lib/config.ts (checkinLadder);
   the streak itself comes from /api/economy/balance. */
const CHECKIN_LADDER = [25, 35, 50, 75, 100, 150, 250];

/* Casablanca calendar day (YYYY-MM-DD) — mirrors the server's day boundary
   in src/lib/time.ts; used to remember the daily-free-play state per day. */
const casablancaToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());

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
  /* Daily free play (P1): no endpoint reports whether today's FREE_DAILY
     play is spent — the unlock API is the source of truth. The client
     remembers the server's answer per account + Casablanca day and
     re-learns it from the free attempt itself (see playWithFree). */
  const [freePlayUsed, setFreePlayUsed] = useState(false);
  const freePlayKey = `pm3_free_daily:${session?.user?.username ?? ""}`;
  const markFreePlayUsed = () => {
    setFreePlayUsed(true);
    try {
      localStorage.setItem(freePlayKey, casablancaToday());
    } catch {
      /* storage disabled — the server still enforces the rule */
    }
  };
  useEffect(() => {
    if (status !== "authenticated") return;
    try {
      setFreePlayUsed(
        localStorage.getItem(freePlayKey) === casablancaToday(),
      );
    } catch {
      /* storage disabled */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.username]);
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
  /* Games-section category tabs (preview behaviour): filter the
     already-loaded GAMES / COMING_SOON lists client-side. */
  const [gameFilter, setGameFilter] = useState<"all" | "play" | "soon">("all");
  /* Claimable-mission count for the missions-teaser pill — same
     /api/rewards/missions payload MissionsPanel already reads. */
  const [missionsReady, setMissionsReady] = useState(0);
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

  /* ── Bottom tab bar: scroll targets + active tab tracking ──
     Store Posters nav: Explore / Games / Friends / Profile. Only
     Explore ↔ Games have an active state; it flips at the midpoint of
     the scroll range to the games section (same rule the old liquid
     pill used — the pill itself is dropped with the new bar). */
  const [activeTab, setActiveTab] = useState<"home" | "games">("home");

  /* Reduced motion: snap the page instantly. */
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

  const goHome = () => scrollToTop();
  const goGames = () => scrollToGames();

  useEffect(() => {
    if (status === "loading") return;
    let rafId = 0;
    const sync = () => {
      const mobile = document.getElementById("most-played");
      const desktop = document.getElementById("games-section");
      const target = mobile?.offsetHeight
        ? mobile
        : desktop?.offsetHeight
          ? desktop
          : null;
      const end = target
        ? target.getBoundingClientRect().top + window.scrollY
        : 0;
      setActiveTab(end > 0 && window.scrollY >= end / 2 ? "games" : "home");
    };
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        sync();
      });
    };
    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [status]);

  /* Profile tab: real profile route when authed; guests get the same
     treatment as the Friends tab (auth sheet on mobile, /login on
     desktop). */
  const openProfile = () => {
    const username = session?.user?.username;
    if (!isAuthed || !username) {
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
    router.push(`/profile/${username}`);
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

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/rewards/missions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.missions ?? []) as {
          canClaim?: boolean;
          claimed?: boolean;
        }[];
        setMissionsReady(
          list.filter((m) => m.canClaim && !m.claimed).length,
        );
      })
      .catch(() => {});
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

  /* P1 — the day's free play: POST the unlock API's 'free' branch. If the
     server says it is already spent, learn it (the cards flip to their
     truthful coins/ad state) and say so — never charge on a "free" tap. */
  const playWithFree = async (gameId: string) => {
    if (!requireAuth(gameId, "coins")) return;
    /* Replay memory only knows 'coins' | 'ad': after a free entry the daily
       free play is spent, so host Play Again correctly replays as coins. */
    rememberPayMethod("coins");
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;

    setBusyId(gameId);
    setBusyAction("coins");

    try {
      const res = await fetch("/api/games/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({ gameId, paymentMethod: "free" }),
      });
      if (res.ok) {
        const { redirectUrl } = await res.json();
        markFreePlayUsed();
        Sounds.launch();
        router.replace(redirectUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        if (
          res.status === 400 &&
          typeof err.error === "string" &&
          err.error.includes("Free play already used")
        ) {
          markFreePlayUsed();
          showToast(
            "error",
            "اللعب الفابور ديال اليوم تسالات — تقدر تلعب بالكوينز ولا تفرج فإشهار",
          );
        } else {
          showToast("error", err.error ?? "اللعبة ماخدماتش، عاود جرب");
        }
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

  /* P1/P8 — state-aware card primary (audit §3, games section). The label is
     the truth about the tap, and the button never disables for balance:
       guest                → ad route (guests play via the ad flow)
       free play unspent    → «العب فابور», the unlock API's 'free' branch
       free spent, solvent  → «Play», the coins unlock (as before)
       free spent, broke    → «العب بإشهار — فابور», the ad flow, watching */
  type PrimaryMode = "free" | "coins" | "ad";
  const primaryModeFor = (game: Game): PrimaryMode => {
    if (!isAuthed) return "ad";
    if (!freePlayUsed) return "free";
    return coins >= game.cost ? "coins" : "ad";
  };
  const primaryLabelFor = (game: Game, short = false): string => {
    const mode = primaryModeFor(game);
    if (mode === "free") return "العب فابور";
    // the narrow grid button cannot fit the full ad label — short form there;
    // the wide featured button carries the full «العب بإشهار — فابور»
    if (mode === "ad") return short ? "العب بإشهار" : "العب بإشهار — فابور";
    return "Play";
  };
  const playPrimary = (game: Game, e?: React.MouseEvent) => {
    const mode = primaryModeFor(game);
    if (mode === "free") void playWithFree(game.id);
    else if (mode === "coins") void playWithCoins(game.id, e);
    else playAdDirectly(game.id);
  };

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
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--bg)] text-white">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="font-cairo text-lg">وقع مشكل فالاتصال</p>
          <button 
            onClick={() => window.location.reload()} 
            className="rounded-xl px-6 py-2.5 font-cairo font-black transition hover:brightness-110 active:scale-95" style={{ background: "var(--lime)", color: "#131803" }}
          >
            عاود جرب
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-[var(--bg)]" aria-hidden="true" />
    );
  }

  return (
    <div
      className="relative min-h-dvh overflow-x-hidden bg-[var(--bg)] text-white"
      style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}
    >
      {/* ══════════════════════════════════════════
          HEADER — sticky dark bar
      ══════════════════════════════════════════ */}
      {/* RTL: first child → visual RIGHT, last child → visual LEFT */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "rgba(7,7,13,0.78)",
          backdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {/* FIRST → visual RIGHT: PLAYM3ANA wordmark (preview header).
              Sound + music controls live in the settings sheet below —
              the header keeps only the preview's elements. */}
          <div className="flex min-w-0 items-center gap-1.5">
            <Link href="/" className="flex shrink-0 items-center gap-1.5">
              <span className="whitespace-nowrap font-nunito text-[17px] font-black tracking-[0.3px]">
                <span className="text-white">PLAY</span>
                <span style={{ color: "var(--lime)" }}>M3ANA</span>
              </span>
            </Link>
          </div>

          {/* LAST → visual LEFT: LV pill · coins pill · settings · avatar */}
          <div className="flex items-center gap-1.5">
            {isAuthed && xpData && (
              <div
                className="flex min-w-[50px] flex-col gap-[3px] rounded-full px-2 py-[5px] max-[380px]:min-w-[44px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--line)",
                }}
              >
                <span className="font-nunito text-[10.5px] font-black leading-none tracking-[0.5px] text-white">
                  LV {xpData.level}
                </span>
                <div
                  className="h-1 overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.13)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((xpData.xp % Math.floor(100 * Math.pow(xpData.level, 1.4))) / Math.max(1, Math.floor(100 * Math.pow(xpData.level, 1.4)))) * 100)}%`,
                      background: "var(--lime)",
                    }}
                  />
                </div>
              </div>
            )}
            {isAuthed && (
              <div
                className={`flex select-none items-center gap-1.5 rounded-full px-2.5 py-[5px] font-nunito text-[13.5px] font-black tabular-nums ${coinPop ? "coin-pop" : ""}`}
                style={{
                  background: "rgba(255,201,60,0.10)",
                  border: "1px solid rgba(255,201,60,0.27)",
                  color: "var(--gold)",
                }}
              >
                <span
                  className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[10.5px]"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 30%, #FFF3C4, #FFC53D 60%, #E8A00C)",
                    color: "#7A5200",
                  }}
                  aria-hidden="true"
                >
                  ★
                </span>
                {coins}
              </div>
            )}
            <button
              onClick={openSettings}
              aria-label="الإعدادات"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
              style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
                color: "#fff",
              }}
            >
              <SolarGear className="h-[19px] w-[19px]" />
            </button>
            {isAuthed && session?.user?.username && (
              <Link
                href={`/profile/${session.user.username}`}
                aria-label="الپروفيل"
                className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full font-cairo text-[15px] font-black text-white"
                style={{
                  background: "var(--panel2)",
                  border: "2px solid var(--lime)",
                }}
              >
                {session.user.username.trim()[0]?.toUpperCase() ?? "؟"}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          DAILY CHECK-IN — automatic on load; this card only
          presents the ladder + current streak (claim logic and the
          "+N coins" toast stay exactly as they were).
          MISSIONS TEASER — opens the real MissionsPanel.
      ══════════════════════════════════════════ */}
      {isAuthed && xpData && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <div
            className="rounded-[18px] p-[13px_14px]"
            style={{
              background:
                "linear-gradient(92deg, rgba(198,245,66,0.10), rgba(198,245,66,0.02))",
              border: "1px solid rgba(198,245,66,0.24)",
            }}
          >
            <div className="flex items-center gap-[9px]">
              <SolarCalendarCheck
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--lime)" }}
              />
              <b className="font-cairo text-[14.5px] font-black text-white">
                كادو د اليوم
              </b>
              {xpData.streak > 0 && (
                <span
                  className="ms-auto font-cairo text-[11.5px] font-extrabold"
                  style={{ color: "var(--gold)" }}
                >
                  🔥 {xpData.streak}
                </span>
              )}
            </div>
            <div className="mt-[11px] flex gap-[5px]">
              {CHECKIN_LADDER.map((reward, idx) => {
                const dayNum = idx + 1;
                const todayPos =
                  xpData.streak > 0 ? ((xpData.streak - 1) % 7) + 1 : 1;
                const done = xpData.streak > 0 && dayNum < todayPos;
                const today = dayNum === todayPos;
                return (
                  <div
                    key={dayNum}
                    className="flex-1 rounded-[11px] px-0.5 py-[7px] text-center"
                    style={{
                      background: done
                        ? "rgba(198,245,66,0.14)"
                        : today
                          ? "rgba(255,201,60,0.10)"
                          : "rgba(255,255,255,0.04)",
                      border: today
                        ? "1.5px solid var(--gold)"
                        : done
                          ? "1px solid rgba(198,245,66,0.35)"
                          : "1px solid var(--line)",
                    }}
                  >
                    <span
                      className="block font-cairo text-[9px] font-bold"
                      style={{ color: "var(--dim)" }}
                    >
                      نهار {dayNum}
                    </span>
                    <span
                      className="mt-0.5 block font-nunito text-[12.5px] font-black tabular-nums"
                      style={{
                        color: done || today ? "var(--lime)" : "#fff",
                      }}
                    >
                      {done ? "✓" : `+${reward}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMissionsOpen(true)}
            className="mt-3 flex w-full items-center gap-3 rounded-[16px] px-[13px] py-[11px] text-start transition active:scale-[0.99]"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <SolarClipboardCheck className="h-6 w-6 shrink-0" style={{ color: "var(--lime)" }} />
            <span className="min-w-0 flex-1">
              <b className="block font-cairo text-[13.5px] font-black leading-snug text-white">
                المهام اليومية
              </b>
              <span
                className="block font-cairo text-[11px] font-bold leading-snug"
                style={{ color: "var(--dim)" }}
              >
                تتجدد كل يوم بالفجر 🌙
              </span>
            </span>
            {missionsReady > 0 && (
              <span
                className="shrink-0 rounded-full px-2.5 py-[5px] font-cairo text-[11px] font-black"
                style={{
                  background: "rgba(198,245,66,0.14)",
                  border: "1px solid rgba(198,245,66,0.4)",
                  color: "var(--lime)",
                }}
              >
                {missionsReady} مكافآت
              </span>
            )}
          </button>
        </section>
      )}

      {/* ══════ GUEST CTA ══════ */}
      {!isAuthed && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <div
            className="rounded-[20px] p-5 relative overflow-hidden"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <div
              className="absolute top-0 inset-x-0 h-[3px] rounded-t-[20px]"
              style={{
                background:
                  "linear-gradient(90deg,transparent,rgba(198,245,66,0.7),#C6F542,rgba(198,245,66,0.7),transparent)",
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
                  background: "var(--lime)",
                  color: "#131803",
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

      {/* ══════════════════════════════════════════
          GAMES — Store Posters section: category tabs filter the
          already-loaded lists client-side; FEATURED Mafia wide card;
          2-column poster grid; Coming Soon poster cards in the grid.
          All play/ad handlers are the original ones.
      ══════════════════════════════════════════ */}
      <section
        id="most-played"
        className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pt-5 sm:px-6"
      >
        {/* Section head — the game's real games heading + counts */}
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-lalezar text-[21px] leading-none text-white">
            أبواب المدينة
          </h2>
          <span
            className="font-cairo text-[11.5px] font-bold"
            style={{ color: "var(--dim)" }}
          >
            {GAMES.length} ألعاب · {COMING_SOON.length} قريبا
          </span>
        </div>

        {/* Category tabs — All / Playable / Coming soon */}
        <div
          className="mt-2 flex gap-5"
          style={{ borderBottom: "1px solid var(--line)" }}
          role="tablist"
          aria-label="تصنيفات الألعاب"
        >
          {(
            [
              { id: "all", label: "الكل" },
              { id: "play", label: "متوفرة" },
              { id: "soon", label: "قريبا" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={gameFilter === tab.id}
              onClick={() => setGameFilter(tab.id)}
              className="relative pb-2 pt-1 font-cairo text-[13.5px] font-black transition"
              style={{
                color: gameFilter === tab.id ? "#fff" : "var(--dim)",
              }}
            >
              {tab.label}
              {gameFilter === tab.id && (
                <span
                  className="absolute inset-x-0 -bottom-px h-[3px] rounded-full"
                  style={{ background: "var(--lime)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* FEATURED — Mafia wide card (hidden by the "soon" filter) */}
        {gameFilter !== "soon" &&
          (() => {
            const mafia = GAMES.find((g) => g.isMafia) ?? GAMES[0];
            const busy = busyId === mafia.id;
            return (
              <article
                className="relative mt-4 overflow-hidden rounded-[22px] border"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--line)",
                }}
              >
                {/* Art — poster click runs the same direct-ad flow as the grid cards */}
                <div
                  className="relative h-[250px] cursor-pointer min-[420px]:h-[296px] lg:h-[340px]"
                  onClick={() => playAdDirectly(mafia.id)}
                >
                  {mafia.poster || mafia.keyArt || mafia.logo ? (
                    <Image
                      src={mafia.poster || mafia.keyArt || mafia.logo!}
                      alt={mafia.darijaTitle}
                      fill
                      priority
                      sizes="(max-width: 1152px) 100vw, 1152px"
                      className="object-cover"
                      style={{ objectPosition: "50% 22%" }}
                    />
                  ) : (
                    <div
                      className="grid h-full w-full place-items-center text-6xl"
                      style={{ background: "var(--panel2)" }}
                    >
                      {mafia.emoji}
                    </div>
                  )}
                  {/* Diagonal-cut corner (44px, preview featured) */}
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0"
                    style={{
                      width: 44,
                      height: 44,
                      background: "var(--bg)",
                      clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                    }}
                  />
                  {/* Top-left stack: price pill + FEATURED tag (as on GameCard) */}
                  <div className="absolute left-3 top-3 z-[3] flex flex-col items-start gap-1.5">
                    <span
                      className="inline-flex items-center gap-[5px] rounded-full py-1 pe-2.5 ps-1 font-nunito text-[12.5px] font-black"
                      style={{
                        background: "rgba(0,0,0,0.7)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "var(--lime)",
                      }}
                    >
                      <span
                        className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px]"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 30%, #FFF3C4, #FFC53D 60%, #E8A00C)",
                          color: "#7A5200",
                        }}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                      {mafia.cost}
                    </span>
                    <span
                      className="inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 font-nunito text-[10px] font-black uppercase tracking-[0.6px] text-white"
                      style={{
                        background: "rgba(0,0,0,0.65)",
                        border: "1px solid rgba(255,255,255,0.18)",
                      }}
                    >
                      <SolarStar
                        className="h-[11px] w-[11px] shrink-0"
                        style={{ color: "var(--gold)" }}
                      />
                      Featured
                    </span>
                  </div>
                </div>

                {/* Info — title, ONE meta line (the game's own data), Play / Free */}
                <div style={{ padding: "14px 16px 16px" }}>
                  <h3 className="font-nunito text-[20px] font-black uppercase leading-[1.1] tracking-[0.3px] text-white">
                    {mafia.latinTitle}
                  </h3>
                  <div
                    className="mt-1.5 flex flex-wrap items-center gap-x-[6px] gap-y-1 font-cairo text-[12.5px] font-bold"
                    style={{ color: "var(--dim)" }}
                  >
                    <span>
                      {mafia.emoji} {mafia.tag}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <SolarUsersGroup className="h-[13px] w-[13px] shrink-0" />
                      {mafia.players} لاعبين
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <SolarClock className="h-[13px] w-[13px] shrink-0" />
                      {mafia.duration}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{mafia.tagline}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => playPrimary(mafia, e)}
                      disabled={busy}
                      className="flex h-[42px] flex-1 items-center justify-center gap-[5px] whitespace-nowrap rounded-[12px] font-nunito text-[14px] font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
                      style={{ background: "var(--lime)", color: "#131803" }}
                    >
                      {busy && busyAction === "coins" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        primaryLabelFor(mafia)
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => watchAdToPlay(mafia.id)}
                      disabled={busy}
                      className="flex h-[42px] flex-1 items-center justify-center gap-[5px] whitespace-nowrap rounded-[12px] font-nunito text-[14px] font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        color: "#fff",
                      }}
                    >
                      {busy && busyAction === "ad" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <SolarTv className="h-[15px] w-[15px] shrink-0" />
                          Free
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })()}

        {/* Grid — playable GameCards (Mafia lives in the featured card)
            + Coming Soon poster cards, filtered by the tabs */}
        <div className="mt-4 grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {gameFilter !== "soon" &&
            GAMES.filter((g) => !g.isMafia).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                coins={coins}
                isBusy={busyId === game.id}
                loadingAction={busyAction}
                onPlay={(e) => playPrimary(game, e)}
                primaryLabel={primaryLabelFor(game, true)}
                onWatchAd={() => watchAdToPlay(game.id)}
                onDirectAd={() => playAdDirectly(game.id)}
              />
            ))}
          {gameFilter !== "play" &&
            COMING_SOON.map((g) => (
              <article
                key={g.id}
                className="relative aspect-[3/4.05] overflow-hidden rounded-[20px] border"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--line)",
                }}
              >
                {g.poster ? (
                  <Image
                    src={g.poster}
                    alt={g.darijaTitle}
                    fill
                    sizes="(max-width:640px) 50vw, 25vw"
                    className="object-cover"
                    style={{ objectPosition: "50% 30%" }}
                  />
                ) : (
                  <div
                    className="grid h-full w-full place-items-center text-5xl"
                    style={{ background: "var(--panel2)" }}
                  >
                    {g.emoji}
                  </div>
                )}
                <div className="cut-notch z-[2]" aria-hidden="true" />
                {/* SOON tag */}
                <span
                  className="absolute left-2.5 top-2.5 z-[3] inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 font-cairo text-[10.5px] font-black"
                  style={{
                    background: "rgba(7,7,13,0.72)",
                    border: "1px solid rgba(198,245,66,0.45)",
                    color: "var(--lime)",
                  }}
                >
                  <SolarLock className="h-3 w-3 shrink-0" />
                  قريبا
                </span>
                {/* Centred lock (preview soon-card treatment) */}
                <div className="absolute inset-0 z-[1] grid place-items-center">
                  <span
                    className="grid h-[46px] w-[46px] place-items-center rounded-full"
                    style={{
                      background: "rgba(7,7,13,0.55)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <SolarLock className="h-5 w-5 text-white" />
                  </span>
                </div>
                {/* Bottom fade + titles */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[66%]"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.95))",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 z-[2] p-[11px]">
                  <h3
                    className="font-nunito text-[17.5px] font-black uppercase leading-[1.08] tracking-[0.3px] text-white"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)",
                    }}
                  >
                    {g.latinTitle}
                  </h3>
                  <p
                    className="mt-1 font-cairo text-[11.5px] font-bold"
                    style={{ color: "var(--dim)" }}
                  >
                    {g.tag}
                  </p>
                </div>
              </article>
            ))}
        </div>
      </section>

      {/* ══════ MISSIONS — floating buttons (DailyMissionButtons, bottom-left) ══════ */}


      {/* ══════ REFERRAL ══════ */}
      {isAuthed && xpData?.referralCode && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-4 pt-2 sm:px-6">
          <div
            className="rounded-[18px] p-4"
            style={{
              background:
                "linear-gradient(92deg, rgba(255,201,60,0.11), rgba(255,201,60,0.02))",
              border: "1px solid rgba(255,201,60,0.24)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" style={{ color: "#FFC93C" }} />
              <span
                className="font-lalezar text-[17px]"
                style={{ color: "#FFC93C" }}
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
                  border: "1.5px dashed rgba(255,201,60,0.4)",
                  color: "var(--gold)",
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
                  background: "var(--gold)",
                  border: "1px solid transparent",
                  color: "#3A2A00",
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
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <AdBanner />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <LobbyFooter isAuthed={isAuthed} username={session?.user?.username} />
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM NAV — Store Posters: Explore / Games / Friends / Profile
      ══════════════════════════════════════════ */}
      {/* RTL: first DOM child → visual RIGHT */}
      <nav
        aria-label="التنقل الرئيسي"
        className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
        style={{
          background: "rgba(12,12,20,0.95)",
          borderTop: "1px solid var(--line)",
          backdropFilter: "blur(12px)",
          padding: "8px 10px calc(9px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex">
          {/* الرئيسية — Explore */}
          <button
            onClick={goHome}
            aria-label="الرئيسية"
            aria-current={activeTab === "home" ? "page" : undefined}
            className="flex-1 py-[5px] text-center transition active:scale-95"
            style={{ color: activeTab === "home" ? "var(--lime)" : "var(--dim)" }}
          >
            <SolarCompass className="mx-auto mb-0.5 block h-[22px] w-[22px]" />
            <span className="font-cairo text-[10.5px] font-extrabold">الرئيسية</span>
          </button>
          {/* الألعاب — Games */}
          <button
            onClick={goGames}
            aria-label="الألعاب"
            aria-current={activeTab === "games" ? "page" : undefined}
            className="flex-1 py-[5px] text-center transition active:scale-95"
            style={{ color: activeTab === "games" ? "var(--lime)" : "var(--dim)" }}
          >
            <SolarGamepad className="mx-auto mb-0.5 block h-[22px] w-[22px]" />
            <span className="font-cairo text-[10.5px] font-extrabold">الألعاب</span>
          </button>
          {/* الصحاب — Friends (opens the real FriendsPanel) */}
          <button
            onClick={openFriends}
            aria-label="الصحاب"
            className="flex-1 py-[5px] text-center transition active:scale-95"
            style={{ color: "var(--dim)" }}
          >
            <SolarUsersGroup className="mx-auto mb-0.5 block h-[22px] w-[22px]" />
            <span className="font-cairo text-[10.5px] font-extrabold">الصحاب</span>
          </button>
          {/* الپروفيل — Profile (real profile route) */}
          <button
            onClick={openProfile}
            aria-label="الپروفيل"
            className="flex-1 py-[5px] text-center transition active:scale-95"
            style={{ color: "var(--dim)" }}
          >
            <span
              className="mx-auto mb-0.5 grid h-6 w-6 place-items-center rounded-full font-cairo text-[11px] font-black"
              style={
                isAuthed && session?.user?.username
                  ? {
                      background: "var(--panel2)",
                      border: "1.5px solid var(--lime)",
                      color: "#fff",
                    }
                  : {
                      background: "var(--panel2)",
                      border: "1.5px solid var(--line)",
                      color: "var(--dim)",
                    }
              }
            >
              {isAuthed && session?.user?.username
                ? (session.user.username.trim()[0]?.toUpperCase() ?? "؟")
                : "؟"}
            </span>
            <span className="font-cairo text-[10.5px] font-extrabold">الپروفيل</span>
          </button>
        </div>
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
          onOpenAll={() => setMissionsOpen(true)}
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
            className="bounce-in relative z-10 w-full max-w-[380px] overflow-hidden rounded-[24px] p-6 text-center shadow-xl"
            style={{
              background: "var(--panel2)",
              border: "1px solid var(--line)",
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
            <div className="flex items-center justify-center gap-2">
              <StarMark size={22} />
              <p className="font-cairo text-[12px] font-black" style={{ color: "var(--dim)" }}>
                إشهار باش تلعب
              </p>
            </div>
            {adStatus === "idle" && (
              <>
                <h3 className="mt-4 font-lalezar text-[22px] text-[#FFF7E8]">
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
                  className="btn-lime mt-6 w-full py-4 font-cairo text-[15px]"
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
                <div className="flex items-center gap-3 rounded-2xl border border-[rgba(198,245,66,0.2)] bg-[rgba(198,245,66,0.05)] px-4 py-4">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                    <span className="glow-pulse absolute inset-0 rounded-full bg-[rgba(198,245,66,0.25)] blur-xl" />
                    <span className="relative font-lalezar text-2xl text-[var(--lime)]">
                      {countdown}
                    </span>
                  </div>
                  <div>
                    <p className="font-cairo text-[13px] font-black text-[var(--lime)]">
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
              <div className="mt-6 flex flex-col items-center gap-4 px-2 py-6">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-[3px]"
                  style={{ borderColor: 'rgba(198,245,66,0.25)', borderTopColor: 'var(--lime)' }}
                />
                <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">
                  كنتأكدو بلي ماتفرجتيش ف الإشهار وعينيك مسدودين…
                </p>
                <p className="font-cairo text-[12px] font-semibold text-[#B8C4D8]">
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
            className="bounce-in absolute inset-x-0 bottom-0 rounded-t-[26px] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:relative sm:inset-auto sm:rounded-[24px] sm:pb-6 sm:pt-6 sm:w-full sm:max-w-[440px] shadow-[0_-20px_80px_rgba(0,0,0,.9)]"
            style={{
              background: "var(--panel2)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="sheet-grab sm:hidden" />
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
                className="btn-lime w-full py-3.5 font-cairo text-[15px]"
              >
                <LogIn className="h-5 w-5" /> دخول
              </Link>
              <Link
                href="/register"
                className="btn-store-ghost w-full py-3.5 font-cairo text-[14px]"
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
            className="bounce-in absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[26px] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:relative sm:inset-auto sm:rounded-[24px] sm:pb-6 sm:pt-6 sm:w-full sm:max-w-[500px] sm:max-h-[85dvh] shadow-[0_-20px_80px_rgba(0,0,0,.9)]"
            style={{
              background: "var(--panel2)",
              border: "1px solid var(--line)",
            }}
          >
            <div className="sheet-grab sm:hidden" />
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute end-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#B8C4D8] transition hover:border-red-500/40 hover:text-red-400"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center justify-between pe-12">
              <div className="flex items-center gap-2">
                <SolarGear className="h-5 w-5" style={{ color: "var(--lime)" }} />
                <p className="font-cairo text-[14px] font-black text-[#FFF7E8]">
                  الإعدادات
                </p>
              </div>
              <Link
                href={session?.user?.username ? `/profile/${session.user.username}` : "/profile/walidomar"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cairo text-[12px] font-black transition-all hover:scale-105 active:scale-95" style={{ background: "var(--panel)", border: "1px solid rgba(198,245,66,0.4)", color: "var(--lime)", boxShadow: "0 0 14px rgba(198,245,66,0.18)" }}
              >
                <User className="h-3.5 w-3.5" style={{ color: "var(--lime)" }} />
                <span>الپروفيل</span>
              </Link>
            </div>

            <div className="mt-2 flex flex-col">
              {/* Coins — flat settings row (preview .srow) */}
              {isAuthed && (
                <div className="flex items-center justify-between py-3.5">
                  <span className="flex items-center gap-2.5 font-cairo text-[13.5px] font-bold text-[#FFF7E8]">
                    <Coins className="h-4.5 w-4.5 text-[#FFC93C]" />
                    الكوينز ديالك
                  </span>
                  <span className="font-cairo text-[15px] font-black tabular-nums text-[#FFC93C]">
                    {coins}
                  </span>
                </div>
              )}

              {/* Sound toggle */}
              <button
                onClick={toggleMute}
                className="flex w-full items-center justify-between border-t border-white/[0.07] py-3.5"
              >
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8]">
                  {muted ? (
                    <VolumeX className="h-4 w-4 text-[#B8C4D8]" />
                  ) : (
                    <Volume2 className="h-4 w-4" style={{ color: "var(--lime)" }} />
                  )}
                  الصوت
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${muted ? "bg-white/10" : "bg-[rgba(198,245,66,0.45)]"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${muted ? "start-0.5" : "start-[1.375rem]"}`}
                  />
                </span>
              </button>

              {/* Music toggle */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('pm3_music_toggle'))}
                className="flex w-full items-center justify-between border-t border-white/[0.07] py-3.5"
              >
                <span className="flex items-center gap-2.5 font-cairo text-[13px] font-bold text-[#FFF7E8]">
                  {!musicPlaying ? (
                    <VolumeX className="h-4 w-4 text-[#B8C4D8]" />
                  ) : (
                    <Music className="h-4 w-4" style={{ color: "var(--lime)" }} />
                  )}
                  الموسيقى
                </span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${!musicPlaying ? "bg-white/10" : "bg-[rgba(198,245,66,0.45)]"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${!musicPlaying ? "start-0.5" : "start-[1.375rem]"}`}
                  />
                </span>
              </button>


              {/* Change name — preview section: label, account line, field, note, save */}
              {isAuthed && (
                <div>
                  <p className="ssec font-cairo">تبديل السمية</p>
                  {me?.username && (
                    <p className="mt-1 font-cairo text-[11.5px] font-semibold" style={{ color: "var(--dim)" }}>
                      اسم الكونط الأصلي:{" "}
                      <span className="font-bold text-[#FFF7E8]">
                        {me.username}
                      </span>
                      {me.email ? ` (${me.email})` : ""}
                    </p>
                  )}
                  <input
                    value={nameDraft}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                      setNameMsg(null);
                    }}
                    maxLength={30}
                    disabled={nameBusy || me?.canChangeName === false}
                    placeholder="السمية الجديدة…"
                    className="store-field mt-2.5 font-cairo text-[13.5px]"
                  />
                  {me?.canChangeName === false && me?.nextNameChangeAt && (
                    <p className="mt-2 flex items-center gap-1.5 font-cairo text-[11.5px] font-bold" style={{ color: "var(--gold)" }}>
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
                  <button
                    onClick={() => void saveName()}
                    disabled={nameBusy || me?.canChangeName === false}
                    className="btn-lime mt-2.5 w-full py-3 font-cairo text-[13px]"
                  >
                    {nameBusy ? "…" : "حفظ"}
                  </button>
                </div>
              )}

              {/* Change password — preview section: label, fields, Google note, save */}
              {isAuthed && (
                <div>
                  <p className="ssec font-cairo">تبديل الباسورد</p>
                  {me?.hasPassword === false && (
                    <p className="mt-1 font-cairo text-[11.5px] font-bold leading-relaxed" style={{ color: "var(--gold)" }}>
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
                      className="store-field font-cairo text-[13.5px]"
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
                      className="store-field font-cairo text-[13.5px]"
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
                      className="store-field font-cairo text-[13.5px]"
                    />
                  </div>
                  {pwMsg && (
                    <p
                      className={`mt-2 font-cairo text-[11px] font-bold ${pwMsg.kind === "ok" ? "text-emerald-300" : "text-red-300"}`}
                    >
                      {pwMsg.text}
                    </p>
                  )}
                  <button
                    onClick={() => void savePassword()}
                    disabled={pwBusy || me?.hasPassword === false}
                    className="btn-lime mt-2.5 w-full py-3 font-cairo text-[13px]"
                  >
                    {pwBusy ? "…" : "بدل الباسورد"}
                  </button>
                </div>
              )}

              {/* Guest CTA */}
              {!isAuthed && (
                <div className="mt-4 flex flex-col gap-2.5">
                  <Link
                    href="/login"
                    className="btn-lime w-full py-3.5 font-cairo text-[15px]"
                  >
                    <LogIn className="h-5 w-5" /> دخول
                  </Link>
                  <Link
                    href="/register"
                    className="btn-store-ghost w-full py-3.5 font-cairo text-[14px]"
                  >
                    <UserPlus className="h-5 w-5" /> صاوب كونط — فابور
                  </Link>
                </div>
              )}

              {/* Logout — preview .logout block */}
              {isAuthed && (
                <button
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-[13px] font-cairo text-[14px] font-black"
                  style={{ background: 'rgba(255,107,87,0.09)', border: '1px solid rgba(255,107,87,0.27)', color: '#FFA294' }}
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
