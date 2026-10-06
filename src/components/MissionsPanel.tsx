'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Target, Check, Loader2, Zap, Coins, Play, Trophy } from 'lucide-react';
import { Sounds } from '@/lib/sounds';
import AdNativeBanner from '@/components/AdNativeBanner';

type Mission = {
  id: string;
  kind: string;
  titleAr: string;
  target: number;
  progress: number;
  rewardCoins: number;
  rewardXp: number;
  claimed: boolean;
  canClaim: boolean;
};

export default function MissionsPanel({
  onClose,
  onClaim,
}: {
  onClose: () => void;
  onClaim?: (coins: number) => void;
}) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [adTarget, setAdTarget] = useState<Mission | null>(null);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adClaiming, setAdClaiming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards/missions');
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchMissions(); }, [fetchMissions]);

  useEffect(() => {
    const onFocus = () => void fetchMissions();
    window.addEventListener('focus', onFocus);
    const t = setInterval(() => void fetchMissions(), 8000);
    return () => { window.removeEventListener('focus', onFocus); clearInterval(t); };
  }, [fetchMissions]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const openAdClaim = (m: Mission) => {
    setAdTarget(m);
    setAdCountdown(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAdClaim = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAdTarget(null);
    setAdCountdown(5);
  };

  const confirmClaim = async () => {
    if (!adTarget) return;
    setAdClaiming(true);
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: adTarget.id, adWatched: true }),
      });
      if (res.ok) {
        Sounds.claim();
        const coins = adTarget.rewardCoins;
        cancelAdClaim();
        await fetchMissions();
        onClaim?.(coins);
      }
    } finally {
      setAdClaiming(false);
    }
  };

  const done  = missions.filter(m => m.claimed).length;
  const total = missions.length;
  const totalPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="bounce-in relative w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#09101F', border: '1px solid rgba(232,180,48,0.22)' }}
      >
        {/* Gold top accent */}
        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,transparent,#E8B430,transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: 'rgba(232,180,48,0.12)', border: '1px solid rgba(232,180,48,0.22)' }}>
              <Target className="h-4.5 w-4.5" style={{ color: '#E8B430' }} />
            </div>
            <div>
              <h2 className="font-lalezar text-[18px] text-white leading-none">المهام اليومية</h2>
              {total > 0 && (
                <p className="mt-0.5 font-cairo text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {done} من {total} مكتملة
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/40 transition hover:border-red-500/30 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Overall progress bar */}
        {total > 0 && (
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-cairo text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.28)' }}>التقدم اليومي</span>
              <span className="font-grit text-[11px]" style={{ color: '#E8B430' }}>{totalPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${totalPct}%`,
                  background: totalPct === 100
                    ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                    : 'linear-gradient(90deg,#E8B430,#F5CC6B)',
                  boxShadow: totalPct > 0 ? '0 0 8px rgba(232,180,48,0.4)' : undefined,
                }}
              />
            </div>
          </div>
        )}

        {/* Body — missions list OR ad-claim view */}
        <div className="max-h-[55dvh] overflow-y-auto">
          {adTarget ? (
            /* ── Ad-claim view ── */
            <div className="p-5">
              <button
                onClick={cancelAdClaim}
                className="flex items-center gap-1.5 mb-4 font-cairo text-[11px] font-bold transition"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <X className="h-3.5 w-3.5" /> رجع للمهام
              </button>

              {/* Mission summary */}
              <div
                className="flex items-start gap-3 rounded-xl p-3.5 mb-4"
                style={{ background: 'rgba(232,180,48,0.06)', border: '1px solid rgba(232,180,48,0.16)' }}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(232,180,48,0.12)' }}>
                  <Target className="h-4 w-4" style={{ color: '#E8B430' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-lalezar text-[16px] text-white leading-none mb-1">{adTarget.titleAr}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Coins className="h-3 w-3 text-amber-400" />
                      <span className="font-cairo text-[12px] font-black text-amber-400">+{adTarget.rewardCoins}</span>
                    </div>
                    {adTarget.rewardXp > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Zap className="h-3 w-3 text-purple-400" />
                        <span className="font-cairo text-[11px] text-purple-400">+{adTarget.rewardXp} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <AdNativeBanner />

              {/* Countdown / claim */}
              {adCountdown > 0 ? (
                <div className="mt-4 flex items-center justify-center gap-3 rounded-xl py-4" style={{ background: 'rgba(232,180,48,0.05)', border: '1px solid rgba(232,180,48,0.14)' }}>
                  <span className="font-grit text-[30px] leading-none" style={{ color: '#E8B430' }}>{adCountdown}</span>
                  <div>
                    <p className="font-cairo text-[12px] font-black" style={{ color: '#E8B430' }}>صبر على الإشهار</p>
                    <p className="font-cairo text-[10px] text-white/28">المكافأة كتجي من بعد</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={confirmClaim}
                  disabled={adClaiming}
                  className="mt-4 w-full py-3.5 rounded-xl font-cairo font-black text-[14px] flex items-center justify-center gap-2 transition active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#F5CC6B,#E8B430)', color: '#060810' }}
                >
                  {adClaiming
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><Coins className="h-4 w-4" /> احصل على +{adTarget.rewardCoins} 🪙</>
                  }
                </button>
              )}
            </div>

          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#E8B430' }} />
            </div>

          ) : missions.length === 0 ? (
            <div className="py-12 text-center px-5">
              <p className="text-4xl mb-3">🏖️</p>
              <p className="font-cairo text-[14px] font-bold text-white/40">ما كاين حتى مهمة دابا</p>
              <p className="mt-1 font-cairo text-[11px] text-white/22">ارجع بكرة كتتجدد المهام 🌙</p>
            </div>

          ) : (
            <div className="p-4 flex flex-col gap-2.5">
              {missions.map((m) => {
                const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className="rounded-[14px] overflow-hidden transition-all"
                    style={{
                      background: m.claimed
                        ? 'rgba(34,197,94,0.04)'
                        : m.canClaim
                        ? 'rgba(232,180,48,0.06)'
                        : 'rgba(255,255,255,0.02)',
                      border: m.claimed
                        ? '1px solid rgba(34,197,94,0.14)'
                        : m.canClaim
                        ? '1px solid rgba(232,180,48,0.25)'
                        : '1px solid rgba(255,255,255,0.06)',
                      opacity: m.claimed ? 0.55 : 1,
                    }}
                  >
                    {/* Card top accent for claimable */}
                    {m.canClaim && !m.claimed && (
                      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg,transparent,#E8B430,transparent)' }} />
                    )}

                    <div className="p-3.5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <p className="flex-1 font-cairo text-[13px] font-bold leading-snug" style={{ color: m.claimed ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.88)' }}>
                          {m.titleAr}
                        </p>
                        {/* Remaining badge */}
                        {!m.claimed && !m.canClaim && m.target > m.progress && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 font-cairo text-[9.5px] font-black tabular-nums"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}
                          >
                            باقي {m.target - m.progress}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="h-[3px] rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: m.claimed
                              ? '#22c55e'
                              : m.canClaim
                              ? '#E8B430'
                              : 'linear-gradient(90deg,rgba(0,217,255,0.6),rgba(168,85,247,0.6))',
                            boxShadow: m.canClaim && !m.claimed ? '0 0 6px rgba(232,180,48,0.45)' : undefined,
                          }}
                        />
                      </div>

                      {/* Bottom row: reward + CTA */}
                      <div className="flex items-center justify-between">
                        {/* Rewards */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <Coins className="h-3 w-3 text-amber-400" />
                            <span className="font-cairo text-[11px] font-black text-amber-400">+{m.rewardCoins}</span>
                          </div>
                          {m.rewardXp > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Zap className="h-3 w-3 text-purple-400" />
                              <span className="font-cairo text-[10px] text-purple-400">+{m.rewardXp}</span>
                            </div>
                          )}
                          <span className="font-grit text-[9.5px] tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
                            {m.progress}/{m.target}
                          </span>
                        </div>

                        {/* CTA */}
                        {m.claimed ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span className="font-cairo text-[10px] font-black">تم ✓</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAdClaim(m)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-cairo text-[11px] font-black transition hover:brightness-110 active:scale-95"
                            style={{
                              background: m.canClaim ? 'rgba(232,180,48,0.15)' : 'rgba(255,255,255,0.05)',
                              border: m.canClaim ? '1px solid rgba(232,180,48,0.38)' : '1px solid rgba(255,255,255,0.1)',
                              color: m.canClaim ? '#E8B430' : 'rgba(255,255,255,0.45)',
                            }}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            تفرج وخذ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!adTarget && (
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="font-cairo text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              تتجدد كل يوم بالفجر 🌙
            </p>
            {done === total && total > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-cairo text-[10px] font-black text-amber-400">كملتي كل المهام!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
