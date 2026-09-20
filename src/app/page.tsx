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
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
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
      <div className="scene bg-[#0d0b08] text-[#f1e7d6]">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="lamp -top-28 left-1/2 h-72 w-[32rem] -translate-x-1/2 bg-amber-500/15" />
        </div>
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5">
          <StarMark size={56} />
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            <p className="font-lalezar text-xl text-[#e8d9c0]">كنهزرو الطاولا…</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="scene min-h-dvh bg-[#0d0b08] text-[#f1e7d6]">
      {/* ── café-night wall: a warm lamp overhead, faint embers, vignette ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-6%,rgba(242,178,61,.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(193,74,41,.10),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(0,0,0,.85),transparent_58%)]" />
      </div>

      {/* ── header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#6b542e]/40 bg-[#171210]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <StarMark size={32} />
            <span className="flex flex-col leading-none">
              <span className="font-grit text-[0.95rem] uppercase tracking-tight text-[#f1e7d6]">
                <span className="text-gold-sheen">DARJA</span> ARCADE
              </span>
              <span className="mt-0.5 font-cairo text-[9px] font-bold tracking-[0.35em] text-[#a08a63] uppercase">
                ساحة اللعب
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthed ? (
              <>
                <div className="coin-disc px-3 py-1.5">
                  <Coins className="h-4 w-4" />
                  <span className="font-cairo text-sm font-black tabular-nums">
                    {coins}
                  </span>
                </div>
                <span className="hidden max-w-[8rem] truncate font-cairo text-sm font-bold text-[#d8c39a] sm:block">
                  {session?.user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#c9a45c]/40 bg-[#221a10] text-[#f1e7d6] transition hover:border-red-500/50 hover:text-red-400"
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
        <section className="relative text-center sm:text-left">
          <div className="anim-fadeup d1 flex items-center justify-center gap-2 sm:justify-start">
            <span className="font-cairo text-[11px] font-black uppercase tracking-[0.35em] text-[#a08a63]">
              party games بالدارجة
            </span>
            <svg
              viewBox="0 0 120 16"
              className="h-3.5 w-28 text-[#b83a22]"
              aria-hidden
            >
              <path
                d="M4 10c14-7 26-7 38-1s26 6 40 0 22-8 34-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="anim-fadeup d2 mt-3 font-lalezar text-[clamp(3rem,14vw,5.5rem)] leading-[0.95] text-[#f5eddc]">
            يلا
            <span className="text-gold-sheen mx-1">نلعبو</span>
            !🎲
          </h1>

          {/* hand-drawn marker underline */}
          <svg
            viewBox="0 0 240 20"
            className="anim-fadeup d3 mx-auto mt-1 h-4 w-64 text-[#e9a23b] sm:mx-0 sm:w-72"
            aria-hidden
          >
            <path
              d="M6 12c28-8 52-8 78-2s40 7 66 1 52-7 84-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>

          <div className="anim-fadeup d4 relative mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            <p className="max-w-md font-cairo text-[15px] font-semibold leading-relaxed text-[#c9b795]">
              كل لعبة غادي تخدموها على <b className="text-[#f5eddc]">تيليفون واحد</b> مع
              الصحاب. اختار الطاولة، حط عملاتك، وابدأ الحومة.
            </p>

            {/* little pinned note */}
            <span className="note absolute -right-2 -top-6 hidden rotate-3 rounded-md px-2.5 py-1 font-lalezar text-[13px] sm:block">
              هنا الطاولة ديالك 😄
            </span>
          </div>

          <div className="anim-fadeup d5 mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {[
              { ico: <Gamepad2 className="h-4 w-4" />, label: `${GAMES.length} لوعات` },
              { ico: <Users className="h-4 w-4" />, label: '3–15 لاعبين' },
              { ico: <Flame className="h-4 w-4" />, label: '100% دارجة' },
              { ico: <Clock className="h-4 w-4" />, label: 'ثواني باش تبدا' },
            ].map((f, i) => (
              <span
                key={f.label}
                className={`tag-chip tag-hole font-cairo text-[12px] font-bold ${
                  i % 2 ? '-rotate-1' : 'rotate-1'
                }`}
              >
                <span className="text-[#b83a22]">{f.ico}</span>
                {f.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── hazard-tape marquee ───────────────────────── */}
        <div className="hazard anim-fadeup d6 mt-8 rounded-lg py-2.5">
          <div className="ticker-track">
            {[...Array(2)].map((_, loop) => (
              <span
                key={loop}
                className="flex shrink-0 items-center gap-6 px-6 font-cairo text-[13px] font-black text-[#221a10]"
              >
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="flex items-center gap-6">
                    <span className="text-[#b3271e]">★</span>
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* ── guest notice: sticky note ─────────────────── */}
        {!isAuthed && (
          <div className="note anim-fadeup relative mt-6 flex rotate-[-1deg] flex-col items-center justify-between gap-3 rounded-lg p-4 sm:flex-row sm:p-5">
            <div className="flex items-center gap-3">
              <span className="coin-disc px-2.5 py-1">
                <Coins className="h-5 w-5" />
              </span>
              <p className="font-cairo text-[13px] font-bold text-[#221a10]">
                عندك حس فوالي باش تجمع العملات وتلعب الإعلانات.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/login"
                className="btn-chunk btn-ink px-4 py-2 text-[12px]"
              >
                دخول
              </Link>
              <Link href="/register" className="btn-chunk btn-amber px-4 py-2 text-[12px]">
                سجل دلوقتي
              </Link>
            </div>
          </div>
        )}

        {/* ── games board ───────────────────────────────── */}
        <section className="mt-10">
          <div className="cork relative overflow-hidden rounded-2xl p-5 sm:p-8 lg:p-10">
            <div className="mb-7 flex items-end justify-between gap-3">
              <div>
                <h2 className="relative inline-block font-grit text-2xl uppercase tracking-wide text-[#f5eddc]">
                  الطاولات
                  <svg
                    viewBox="0 0 120 16"
                    className="absolute -bottom-2 left-0 h-3 w-full text-[#e9a23b]"
                    aria-hidden
                  >
                    <path
                      d="M4 10c14-7 26-7 38-1s26 6 40 0 22-8 34-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </h2>
                <p className="mt-4 font-cairo text-[12.5px] font-semibold text-[#d8c39a]">
                  اختار واحدة، والعملات هي الغاز ديالها.
                </p>
              </div>
              <span className="hidden items-center gap-1 font-cairo text-[12px] font-bold text-[#eeddb4] sm:flex">
                <ChevronRight className="h-4 w-4 text-[#e9a23b]" />
                بدا ب MAFIA
              </span>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {GAMES.map((game, i) => (
                <div
                  key={game.id}
                  className={`anim-fadeup d${i + 1} ${
                    i % 2 ? 'lg:mt-5' : 'lg:mt-0'
                  }`}
                  style={{ rotate: ['-1.3deg', '1.1deg', '-1deg', '1.3deg'][i] }}
                >
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

            {/* corner nails */}
            <span className="pointer-events-none absolute left-3 top-3 h-2 w-2 rounded-full bg-[#171210] ring-2 ring-[#2a1d10]/70" />
            <span className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full bg-[#171210] ring-2 ring-[#2a1d10]/70" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-2 w-2 rounded-full bg-[#171210] ring-2 ring-[#2a1d10]/70" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-2 w-2 rounded-full bg-[#171210] ring-2 ring-[#2a1d10]/70" />
          </div>
        </section>

        {/* ── footer strip ──────────────────────────────── */}
        <footer className="mt-16 flex flex-col items-center gap-1.5 border-t-2 border-[#6b542e]/30 pt-6 text-center">
          <StarMark size={24} />
          <p className="font-cairo text-[12px] font-bold text-[#a08a63]">
            DARJA ARCADE — لعبات جماعية بالدارجة، كتحبو على تيليفون واحد.
          </p>
          <p className="font-cairo text-[10px] font-semibold text-[#7a6a4d]">
            مصنوعة بـ ❤️ وشوية كسكس في المغرب 🇲🇦
          </p>
        </footer>
      </main>

      {/* ── ad modal ────────────────────────────────────── */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="anim-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-[#6b542e]/50 bg-[#171210] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
            <button
              onClick={() => setAdModalOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#6b542e]/50 text-neutral-400 transition hover:text-white"
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