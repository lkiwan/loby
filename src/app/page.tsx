'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Flame,
  Gamepad2,
  Loader2,
  LogIn,
  LogOut,
  Play,
  Users,
  X,
} from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameCard from '@/components/GameCard';
import { GAMES } from '@/lib/games';

const TICKER_ITEMS = [
  '🕹️ ساحة اللعب 100% بالدارجة',
  '🎲 كتر من لعبة — تيليفون واحد',
  '💀 الليلة كاين اللي غادي يتصفى',
  '🕵️ بصح، شكون المحتال؟',
  '💰 زيد العملات ديالك عن طريق الإعلانات',
  '🔥 صلاح ديال الحومة كاين من بكري',
  '🇲🇦 قاومو بيناتكو، بالدارجة',
];

export default function LobbyPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'coins' | 'ad' | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<'idle' | 'watching' | 'verifying'>('idle');
  const [toast, setToast] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  const showToast = (kind: 'error' | 'ok', text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3200);
  };

  const requireAuth = (): boolean => {
    if (status === 'authenticated') return true;
    router.push('/login');
    return false;
  };

  const playWithCoins = async (gameId: string) => {
    if (!requireAuth()) return;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;

    const coins = session?.user?.coins ?? 0;
    if (coins < game.cost) {
      showToast('error', `ماعندكش كفاية عملات — كترهم باشر الإعلان 🔁 (${coins}/${game.cost})`);
      return;
    }

    setBusyId(gameId);
    setBusyAction('coins');

    try {
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, paymentMethod: 'coins' }),
      });

      if (res.ok) {
        const { redirectUrl, remainingCoins } = await res.json();
        if (typeof remainingCoins === 'number') {
          await update({ coins: remainingCoins });
        }
        router.replace(redirectUrl);
      } else {
        const errText = await res.json().catch(() => ({}));
        showToast('error', errText.error ?? 'ما نجحش اللعب، وجرب مرة أخرى');
      }
    } catch {
      showToast('error', 'مشكل فالأنترنيت — جرب مرة أخرى');
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const watchAdToPlay = (gameId: string) => {
    if (!requireAuth()) return;
    setSelectedGame(gameId);
    setAdStatus('idle');
    setAdModalOpen(true);
  };

  const simulateAdWatch = () => {
    setAdStatus('watching');
    window.setTimeout(() => {
      setAdStatus('verifying');
      verifyAdCompletion();
    }, 5000);
  };

  const verifyAdCompletion = async () => {
    if (!selectedGame) return;
    let attempts = 0;
    const maxAttempts = 10;

    const poll = window.setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch('/api/games/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: selectedGame, paymentMethod: 'ad' }),
        });

        if (res.status === 200) {
          window.clearInterval(poll);
          const { redirectUrl } = await res.json();
          router.replace(redirectUrl);
          return;
        }
        if (attempts >= maxAttempts) {
          window.clearInterval(poll);
          showToast('error', 'ما توفقش التحقق من الإعلان. جرب مرة أخرى.');
          setAdModalOpen(false);
        }
      } catch {
        window.clearInterval(poll);
        showToast('error', 'مشكل فالتحقق — جرب مرة أخرى');
        setAdModalOpen(false);
      }
    }, 2000);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  /* ── authenticated loading screen ─────────────────────── */
  if (status === 'loading') {
    return (
      <div className="scene bg-[#05050d] text-white">
        <div className="orb orb-1 -left-24 -top-24 h-72 w-72 bg-amber-500/20" />
        <div className="orb orb-2 -bottom-24 -right-24 h-80 w-80 bg-emerald-500/10" />
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5">
          <StarMark size={56} />
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <p className="font-lalezar text-xl text-neutral-200">كنهزرو الطاولا…</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="scene min-h-dvh bg-[#05050d] text-[#f4efe6]">
      {/* ── ambient background ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#141b3a_0%,transparent_55%)]" />
        <div className="orb orb-1 -left-28 -top-28 h-80 w-80 bg-amber-600/25" />
        <div className="orb orb-2 -bottom-32 -right-24 h-96 w-96 bg-[#DC2626]/20" />
        <div className="orb orb-3 top-1/3 right-0 h-64 w-64 bg-teal-600/10" />
        <div className="absolute inset-0 opacity-[0.35] [background:repeating-linear-gradient(90deg,rgba(255,255,255,.025)_0_1px,transparent_1px_96px)]" />
      </div>

      {/* ── header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <StarMark size={32} />
            <span className="flex flex-col leading-none">
              <span className="font-grit text-[0.95rem] uppercase tracking-tight">
                <span className="text-gold-sheen">DARJA</span> ARCADE
              </span>
              <span className="mt-0.5 font-cairo text-[9px] font-bold tracking-[0.35em] text-neutral-500 uppercase">
                ساحة اللعب
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthed ? (
              <>
                <div className="flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="font-cairo text-sm font-black text-amber-300 tabular-nums">
                    {coins}
                  </span>
                </div>
                <span className="hidden max-w-[8rem] truncate font-cairo text-sm font-bold text-neutral-300 sm:block">
                  {session?.user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-neutral-400 transition hover:border-red-500/40 hover:text-red-400"
                  title="خروج"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-chunk btn-amber px-4 py-2 text-[13px]"
              >
                <LogIn className="h-4 w-4" />
                دخول
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 sm:pt-12">
        {/* ── hero ──────────────────────────────────────── */}
        <section className="text-center sm:text-left">
          <p className="anim-fadeup d1 flex items-center justify-center gap-2 font-cairo text-[11px] font-black uppercase tracking-[0.35em] text-neutral-500 sm:justify-start">
            <span className="h-px w-8 bg-current" />
            party games بالدارجة
            <span className="h-px w-8 bg-current" />
          </p>

          <h1 className="anim-fadeup d2 mt-3 font-lalezar text-[clamp(3rem,14vw,5.5rem)] leading-[0.95]">
            يلا
            <span className="text-gold-sheen mx-1">نلعبو</span>
            !🎲
          </h1>

          <p className="anim-fadeup d3 mx-auto mt-4 max-w-md font-cairo text-[15px] font-semibold leading-relaxed text-neutral-400 sm:mx-0">
            كل لعبة غادي تخدموها على <b className="text-neutral-200">تيليفون واحد</b> مع الصحاب.
            اختار الطاولة، حط عملاتك، وابدأ الحومة.
          </p>

          <div className="anim-fadeup d4 mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            {[
              { ico: <Gamepad2 className="h-4 w-4" />, label: `${GAMES.length} لوعات` },
              { ico: <Users className="h-4 w-4" />, label: '3–15 لاعبين' },
              { ico: <Flame className="h-4 w-4" />, label: '100% دارجة' },
              { ico: <Clock className="h-4 w-4" />, label: 'ثواني باش تبدا' },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-cairo text-[12px] font-bold text-neutral-300"
              >
                <span className="text-amber-400">{f.ico}</span>
                {f.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── ticker marquee ────────────────────────────── */}
        <div className="ticker anim-fadeup d5 mt-8 py-2.5">
          <div className="ticker-track">
            {[...Array(2)].map((_, loop) => (
              <span
                key={loop}
                className="flex shrink-0 items-center gap-6 px-6 font-cairo text-[13px] font-black text-neutral-300"
              >
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="flex items-center gap-6">
                    <span className="text-amber-400">✦</span>
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── guest notice ──────────────────────────────── */}
        {!isAuthed && (
          <div className="anim-fadeup mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-transparent to-emerald-500/10 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="font-cairo text-[13px] font-bold text-neutral-300">
                عندك حس فوالي باش تجمع العملات وتلعب الإعلانات.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/login"
                className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]"
              >
                دخول
              </Link>
              <Link href="/register" className="btn-chunk btn-amber px-4 py-2 text-[12px]">
                سجل دلوقتي
              </Link>
            </div>
          </div>
        )}

        {/* ── games grid ────────────────────────────────── */}
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-grit text-lg uppercase tracking-wide text-neutral-100">
                الطاولات
              </h2>
              <p className="font-cairo text-[12.5px] font-semibold text-neutral-500">
                اختار واحدة، والعملات هي الغاز ديالها.
              </p>
            </div>
            <span className="hidden items-center gap-1 font-cairo text-[12px] font-bold text-neutral-500 sm:flex">
              <ChevronRight className="h-4 w-4 text-amber-400" />
              بدا ب MAFIA
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {GAMES.map((game, i) => (
              <div key={game.id} className={`anim-fadeup d${i + 1}`}>
                <GameCard
                  game={game}
                  coins={coins}
                  isBusy={busyId === game.id}
                  loadingAction={busyAction}
                  onPlay={() => playWithCoins(game.id)}
                  onWatchAd={() => watchAdToPlay(game.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── footer strip ──────────────────────────────── */}
        <footer className="mt-14 flex flex-col items-center gap-1.5 border-t border-white/5 pt-6 text-center">
          <StarMark size={24} />
          <p className="font-cairo text-[12px] font-bold text-neutral-500">
            DARJA ARCADE — لعبات جماعية بالدارجة، كتحبو على تيليفون واحد.
          </p>
          <p className="font-cairo text-[10px] font-semibold text-neutral-600">
            Made with ❤️ in Morocco
          </p>
        </footer>
      </main>

      {/* ── ad modal ────────────────────────────────────── */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="anim-pop relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b16] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-neutral-400 transition hover:text-white"
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black tracking-wide text-neutral-300">
                AD BREAK — كتر العملات مجانا
              </p>
            </div>

            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-neutral-100">اعطينا ثواني ديالك</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-neutral-400">
                  شاهد إعلان قصير وغادي تفتح ليك الطاولة
                  <b className="text-amber-300"> مجانا </b>
                  — العملات كيبداو كيتسلكو.
                </p>

                <button
                  onClick={simulateAdWatch}
                  className="btn-chunk btn-amber group mt-6 w-full py-4 text-[15px]"
                >
                  <Play className="h-5 w-5" />
                  باشر الإعلان
                </button>
                <button
                  onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-neutral-500 transition hover:text-neutral-300"
                >
                  لخير، ثمن بالعملات
                </button>
              </>
            )}

            {adStatus === 'watching' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-6 py-9">
                <div className="relative grid h-16 w-16 place-items-center">
                  <span className="glow-pulse absolute inset-0 rounded-full bg-amber-400/30 blur-xl" />
                  <Loader2 className="relative h-9 w-9 animate-spin text-amber-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-amber-200">كيتلعب الإعلان…</p>
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">
                  لا تقلب الصفحة باش تلقى المكافأة.
                </p>
              </div>
            )}

            {adStatus === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">
                  كنخاصم المكافأة مع السرڤر…
                </p>
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">
                  ثواني على ما تتفتح ليك الطاولة.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── toast ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div
            className={`anim-pop flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.kind === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-200'
                : 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
            }`}
          >
            {toast.kind === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Check className="h-4 w-4 shrink-0" />
            )}
            <span className="font-cairo text-[13px] font-bold">{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}