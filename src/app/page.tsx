'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, Check, ChevronDown, Clock, Coins,
  Flame, Gamepad2, Loader2, LogIn, LogOut,
  Play, ShieldCheck, Users, Video, X, Zap,
} from 'lucide-react';
import { StarMark } from '@/components/Star';
import GameCard from '@/components/GameCard';
import { GAMES } from '@/lib/games';
import { useRewardedAd } from '@/lib/useRewardedAd';
import { trackDevice } from '@/lib/device';
import dynamic from 'next/dynamic';

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false });

const TICKER_ITEMS = [
  '🕹️ ساحة اللعب 100% بالدارجة',
  '🎲 كتر من لعبة — تيليفون واحد',
  '💀 الليلة كاين اللي غادي يتصفى',
  '🕵️ بصح، شكون المحتال؟',
  '💰 زيد العملات ديالك عن طريق الإعلانات',
  '🔥 صلاح ديال الحومة كاين من بكري',
  '🇲🇦 قاومو بيناتكو، بالدارجة',
];

const TITLE_CHARS_1 = Array.from('يلا');
const TITLE_CHARS_2 = Array.from('نلعبو!');

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
  const { show: showRewardedAd } = useRewardedAd();

  const showToast = (kind: 'error' | 'ok', text: string) => {
    setToast({ kind, text });
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

  const playWithCoins = async (gameId: string) => {
    if (!requireAuth()) return;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) return;
    const coins = session?.user?.coins ?? 0;
    if (coins < game.cost) {
      showToast('error', `ماعندكش كفاية عملات — كترهم باشر الإعلان 🔁 (${coins}/${game.cost})`);
      return;
    }
    setBusyId(gameId); setBusyAction('coins');
    try {
      const res = await fetch('/api/games/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ gameId, paymentMethod: 'coins' }),
      });
      if (res.ok) {
        const { redirectUrl, remainingCoins } = await res.json();
        if (typeof remainingCoins === 'number') await update({ coins: remainingCoins });
        router.replace(redirectUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error ?? 'ما نجحش اللعب، وجرب مرة أخرى');
      }
    } catch { showToast('error', 'مشكل فالأنترنيت — جرب مرة أخرى'); }
    finally { setBusyId(null); setBusyAction(null); }
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
      if (result.payload.redirectUrl) { setAdStatus('verifying'); router.replace(result.payload.redirectUrl); return; }
      if (typeof result.payload.newBalance === 'number') await update({ coins: result.payload.newBalance });
      showToast('ok', `+${result.payload.awarded ?? 0} عملات مكافأة! 🎁`);
      setAdModalOpen(false); return;
    }
    setAdModalOpen(false);
    const msgs: Record<string, string> = {
      no_fill: 'ما كتبانش إعلان في هاد اللحظة — جرب بالعملات',
      capped: 'وصلتي للحد اليومي ديال الإعلانات (6)',
      dismissed: 'خليط الإعلان قبل ما يكمل — جرب مرة أخرى',
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
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#0a0805] overflow-hidden">
        <div className="pointer-events-none fixed inset-0">
          <StarField />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <StarMark size={60} />
          <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
          <p className="font-lalezar text-2xl text-[#e8d9c0] text-glow-amber">كنهزرو الطاولا…</p>
        </div>
      </div>
    );
  }

  const isAuthed = status === 'authenticated';
  const coins = session?.user?.coins ?? 0;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#0a0805] text-[#f1e7d6]">

      {/* ═══════════════ BACKGROUND ═══════════════ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <StarField />
        {/* Orbs */}
        <div className="orb-drift absolute left-1/2 top-[-100px] h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[160px]" />
        <div className="absolute right-[-80px] top-[-60px] h-[500px] w-[500px] rounded-full bg-red-700/6 blur-[120px]" style={{ animationDelay: '5s' }} />
        <div className="absolute bottom-[-100px] left-[-50px] h-[550px] w-[550px] rounded-full bg-violet-900/5 blur-[140px]" />
        {/* Deep vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_30%,rgba(5,4,2,.85)_100%)]" />
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
              <span className="font-grit text-[0.95rem] uppercase tracking-tight transition-colors group-hover:text-amber-300">
                <span className="text-gold-sheen">DARJA</span> ARCADE
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 font-cairo text-[9px] font-black uppercase tracking-[0.28em] text-[#a08a63]">
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
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-scene relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-12 pt-8 text-center">

        {/* Badge */}
        <div className="badge-arcade anim-fadeup d1">
          <span className="live-dot" />
          PARTY GAMES 100% DARJA
        </div>

        {/* Animated title */}
        <div className="mt-7 select-none">
          {/* Row 1 */}
          <p className="font-lalezar leading-none" style={{ fontSize: 'clamp(3rem,13vw,5.5rem)' }}>
            {TITLE_CHARS_1.map((c, i) => (
              <span
                key={i}
                className="letter-in text-[#ede0c6] text-glow-white"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                {c}
              </span>
            ))}
          </p>
          {/* Row 2 — neon gold */}
          <p className="neon-sign font-lalezar leading-none" style={{ fontSize: 'clamp(4.5rem,20vw,9rem)' }}>
            {TITLE_CHARS_2.map((c, i) => (
              <span
                key={i}
                className="letter-in text-gold-sheen"
                style={{ animationDelay: `${0.35 + i * 0.07}s` }}
              >
                {c}
              </span>
            ))}
          </p>
        </div>

        {/* Wavy underline */}
        <svg viewBox="0 0 340 20" className="anim-fadeup d3 mx-auto mt-1 h-5 w-[280px] sm:w-[340px] text-amber-400/70" aria-hidden>
          <path d="M5 13 c35-10 65-10 100-2 s40 9 80 1 s50-9 110-1 s30 7 40 2"
            fill="none" stroke="currentColor" strokeWidth="4.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Subtitle */}
        <p className="anim-fadeup d3 mx-auto mt-6 max-w-[420px] font-cairo text-[15.5px] font-semibold leading-relaxed text-[#b8a888]">
          تيليفون واحد = جولة كاملة.{' '}
          <span className="font-black text-[#f0deb4]">اختار طاولتك</span> وخلي الحومة تبدا.
        </p>

        {/* Stats */}
        <div className="anim-fadeup d4 mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { ico: <Gamepad2 className="h-5 w-5 text-amber-400" />, val: `${GAMES.length}`, label: 'ألعاب' },
            { ico: <Users className="h-5 w-5 text-sky-400" />,      val: '15',              label: 'لاعب max' },
            { ico: <Flame className="h-5 w-5 text-red-400" />,      val: '100%',            label: 'دارجة' },
            { ico: <Clock className="h-5 w-5 text-emerald-400" />,  val: '0s',              label: 'تحميل' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              {s.ico}
              <span className="font-lalezar text-xl leading-none text-[#f5eddc]">{s.val}</span>
              <span className="font-cairo text-[10px] font-black uppercase tracking-wider text-neutral-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA for guests */}
        {!isAuthed && (
          <div className="anim-fadeup d5 mt-10 flex flex-wrap items-center justify-center gap-3">
            <div className="cta-glow">
              <Link href="/register" className="btn-arcade relative z-10 inline-flex items-center gap-2.5 px-9 py-4 text-[16px] font-black">
                <Zap className="h-5 w-5" />
                ابدا المتعة مجانا
              </Link>
            </div>
            <Link href="/login" className="btn-chunk btn-ghost-hollow inline-flex items-center gap-2 px-6 py-4 text-[14px]">
              <LogIn className="h-4 w-4" /> عندي حساب
            </Link>
          </div>
        )}

        {/* Authenticated welcome */}
        {isAuthed && (
          <div className="anim-fadeup d5 mt-8 flex items-center gap-3">
            <div className="relative">
              <div className="sonar-ring text-amber-400" />
              <div className="sonar-ring sonar-ring-2 text-amber-400" />
              <div className="coin-counter relative z-10">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-lalezar text-lg">{coins}</span>
                <span className="font-cairo text-[11px] font-black text-amber-300/70"> كولة</span>
              </div>
            </div>
            <p className="font-cairo text-[13px] font-bold text-neutral-400">
              مرحبا، <span className="text-amber-300">{session?.user?.username}</span>!
            </p>
          </div>
        )}

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-hint">
          <ChevronDown className="h-6 w-6 text-amber-400/40" />
        </div>
      </section>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))] sm:px-6">

        {/* LED Ticker */}
        <div className="led-strip py-2.5">
          <div className="led-strip-track">
            {[...Array(2)].map((_, l) => (
              <span key={l} className="flex shrink-0 items-center gap-5 px-6 font-cairo text-[12.5px] font-black text-amber-300/60">
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="flex items-center gap-5">
                    <span className="text-amber-500/45">◆</span>{item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Guest notice */}
        {!isAuthed && (
          <div className="mt-5 overflow-hidden rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-amber-400/30 bg-amber-400/10">
                  <Coins className="h-5 w-5 text-amber-400" />
                </div>
                <p className="font-cairo text-[13px] font-bold text-[#e8d5a3]">
                  سجل باش تجمع العملات وتلعب بالإعلانات مجانا.
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
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <div className="section-label">الطاولات الليلة</div>
            <h2 className="font-lalezar text-[clamp(2.2rem,8vw,3.5rem)] leading-none text-[#f5eddc] text-glow-amber">
              اختار طاولتك
            </h2>
            <p className="font-cairo text-[13.5px] font-semibold text-[#d8c39a]/55">
              العملات هي الغاز — إعلان واحد = دخول مجاني
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {GAMES.map((game, i) => (
              <div
                key={game.id}
                className={`anim-fadeup d${i + 1} ${i % 2 ? 'lg:mt-6' : ''}`}
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
        </section>

        {/* ── FOOTER ── */}
        <footer className="mt-24 flex flex-col items-center gap-2 border-t border-white/[0.05] pt-8 text-center">
          <StarMark size={24} />
          <p className="font-cairo text-[11.5px] font-bold text-[#a08a63]">
            DARJA ARCADE — لعبات جماعية بالدارجة، كتحبو على تيليفون واحد.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-cairo text-[10.5px] font-bold text-[#7a6a4d]">
            <Link href="/privacy" className="transition hover:text-amber-300">سياسة الخصوصية</Link>
            <span>•</span>
            <Link href="/terms" className="transition hover:text-amber-300">شروط الاستخدام</Link>
            <span>•</span>
            <Link href="/contact" className="transition hover:text-amber-300">تواصل معنا</Link>
          </div>
          <p className="mt-1 font-cairo text-[10px] font-semibold text-[#7a6a4d]">
            مصنوعة بـ ❤️ وشوية كسكس في المغرب 🇲🇦
          </p>
        </footer>
      </main>

      {/* ═══════════════ AD MODAL ═══════════════ */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setAdModalOpen(false)} />
          <div className="anim-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/20 bg-[#0f0d0a] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,.95)]">
            <button onClick={() => setAdModalOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-neutral-400 transition hover:text-white"
              aria-label="close">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <StarMark size={26} />
              <p className="font-cairo text-[13px] font-black tracking-wide text-neutral-300">AD BREAK — كتر العملات مجانا</p>
            </div>
            {adStatus === 'idle' && (
              <>
                <h3 className="mt-5 font-lalezar text-2xl text-neutral-100">اعطينا ثواني ديالك</h3>
                <p className="mt-1.5 font-cairo text-[13px] font-semibold leading-relaxed text-neutral-400">
                  شاهد إعلان قصير وغادي تفتح ليك الطاولة <b className="text-amber-300">مجانا</b> — العملات كيبداو كيتسلكو.
                </p>
                <button onClick={startRewardedAd} className="btn-chunk btn-amber group mt-6 w-full py-4 text-[15px]">
                  <Play className="h-5 w-5" /> باشر الإعلان
                </button>
                <button onClick={() => setAdModalOpen(false)}
                  className="mt-2.5 w-full py-2 text-center font-cairo text-[12.5px] font-bold text-neutral-500 transition hover:text-neutral-300">
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
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">لا تقلب الصفحة باش تلقى المكافأة.</p>
              </div>
            )}
            {adStatus === 'verifying' && (
              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-6 py-9">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="font-cairo text-[14px] font-black text-emerald-300">كنخاصم المكافأة مع السرڤر…</p>
                <p className="font-cairo text-[12px] font-semibold text-neutral-400">ثواني على ما تتفتح ليك الطاولة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TOAST ═══════════════ */}
      {toast && (
        <div className="fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div className={`anim-pop flex items-center gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
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
