'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Check, Loader2, Coins, X, Target, ChevronDown } from 'lucide-react';
import AdNativeBanner from '@/components/AdNativeBanner';

type Mission = {
  id: string;
  titleAr: string;
  target: number;
  progress: number;
  rewardCoins: number;
  claimed: boolean;
  canClaim: boolean;
};

export default function DailyMissionButtons({ onClaim }: { onClaim?: (coins: number) => void }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [adTarget, setAdTarget] = useState<Mission | null>(null);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adClaiming, setAdClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards/missions');
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions ?? []);
      }
    } catch {}
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void fetchMissions(); }, [fetchMissions]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startAd = (m: Mission) => {
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

  const cancelAd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAdTarget(null);
    setAdCountdown(5);
  };

  const claimAfterAd = async () => {
    if (!adTarget) return;
    setAdClaiming(true);
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: adTarget.id, adWatched: true }),
      });
      if (res.ok) {
        const id = adTarget.id;
        const reward = adTarget.rewardCoins;
        cancelAd();
        onClaim?.(reward);
        setJustClaimed(prev => new Set([...prev, id]));
        setTimeout(() => {
          setJustClaimed(prev => { const s = new Set(prev); s.delete(id); return s; });
          void fetchMissions();
        }, 2000);
      }
    } finally {
      setAdClaiming(false);
    }
  };

  if (!missions.length) return null;

  const claimedCount   = missions.filter(m => m.claimed).length;
  const pendingCount   = missions.filter(m => !m.claimed).length;
  const totalPct       = Math.round((claimedCount / missions.length) * 100);

  return (
    <>
      {/* ── Floating widget — bottom-left (end = physical left in RTL) ──
          Bottom offset = safe-area + 78px, which clears the fixed bottom tab
          nav (≈58px chrome + its own safe-area padding) with margin to spare,
          and z-[55] paints above the nav's z-50 if anything ever overlaps. */}
      <div className="fixed end-3 bottom-[calc(env(safe-area-inset-bottom)_+_78px)] sm:bottom-6 z-[55] flex flex-col items-end gap-2">

        {/* Expanded panel — opens UPWARD from the toggle, scrollable if tall */}
        {expanded && (
          <div
            className="w-[214px] max-h-[min(58dvh,440px)] rounded-2xl overflow-hidden overflow-y-auto"
            style={{ background: '#09101F', border: '1px solid rgba(232,180,48,0.22)', boxShadow: '0 12px 40px rgba(0,0,0,0.65)' }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ background: 'rgba(232,180,48,0.06)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="grid h-5 w-5 place-items-center rounded-md" style={{ background: 'rgba(232,180,48,0.15)' }}>
                  <Target className="h-3 w-3" style={{ color: '#E8B430' }} />
                </div>
                <span className="font-lalezar text-[14px] text-white leading-none">مهام اليوم</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-cairo text-[10px] font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {claimedCount}/{missions.length}
                </span>
                <button
                  onClick={() => setExpanded(false)}
                  className="grid h-5 w-5 place-items-center rounded-full transition hover:bg-white/10"
                >
                  <X className="h-3 w-3 text-white/35" />
                </button>
              </div>
            </div>

            {/* Overall progress track */}
            <div className="h-[3px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${totalPct}%`, background: 'linear-gradient(90deg,#E8B430,#F5CC6B)' }}
              />
            </div>

            {/* Mission rows */}
            {missions.slice(0, 4).map((m, i) => {
              const pct   = Math.min(100, Math.round((m.progress / m.target) * 100));
              const flash = justClaimed.has(m.id);
              return (
                <div
                  key={m.id}
                  className="px-3 py-2.5"
                  style={{
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                    background: flash ? 'rgba(34,197,94,0.06)' : undefined,
                    opacity: m.claimed && !flash ? 0.48 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {/* Title */}
                  <p
                    className="font-cairo text-[11.5px] font-bold leading-tight mb-2 truncate"
                    style={{ color: m.claimed ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.84)' }}
                  >
                    {m.titleAr}
                  </p>

                  {/* Progress bar */}
                  <div className="h-[3px] rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: flash || m.claimed
                          ? '#22c55e'
                          : m.canClaim
                          ? '#E8B430'
                          : 'linear-gradient(90deg,rgba(0,217,255,0.65),rgba(168,85,247,0.65))',
                        boxShadow: m.canClaim && !m.claimed ? '0 0 6px rgba(232,180,48,0.45)' : undefined,
                      }}
                    />
                  </div>

                  {/* Reward row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="h-2.5 w-2.5 text-amber-400" />
                      <span className="font-cairo text-[10px] font-black text-amber-400">+{m.rewardCoins}</span>
                      {!m.claimed && !flash && (
                        <span className="font-grit text-[9px] tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {m.progress}/{m.target}
                        </span>
                      )}
                    </div>

                    {flash ? (
                      <span className="flex items-center gap-0.5 font-cairo text-[10px] font-black text-emerald-400">
                        <Check className="h-2.5 w-2.5" /> تم ✓
                      </span>
                    ) : m.claimed ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <button
                        onClick={() => startAd(m)}
                        className="flex items-center gap-0.5 rounded-md px-2 py-1 font-cairo text-[10px] font-black transition active:scale-95"
                        style={{
                          background: m.canClaim ? 'rgba(232,180,48,0.18)' : 'rgba(255,255,255,0.06)',
                          border: m.canClaim ? '1px solid rgba(232,180,48,0.4)' : '1px solid rgba(255,255,255,0.12)',
                          color: m.canClaim ? '#E8B430' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                        تفرج وخذ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Panel footer */}
            <div
              className="px-3 py-2 text-center"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}
            >
              <p className="font-cairo text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                تتجدد كل يوم بالفجر 🌙
              </p>
            </div>
          </div>
        )}

        {/* Toggle pill */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-cairo text-[11px] font-black transition-all active:scale-95 backdrop-blur-sm"
          style={{
            background: pendingCount > 0 ? 'rgba(232,180,48,0.18)' : 'rgba(6,8,16,0.88)',
            border: pendingCount > 0 ? '1px solid rgba(232,180,48,0.45)' : '1px solid rgba(255,255,255,0.12)',
            color: pendingCount > 0 ? '#E8B430' : 'rgba(255,255,255,0.45)',
            boxShadow: pendingCount > 0 ? '0 2px 10px rgba(232,180,48,0.2)' : undefined,
          }}
        >
          <Target className="h-3 w-3" />
          مهام اليوم
          {pendingCount > 0 && (
            <span
              className="grid place-items-center rounded-full font-black text-[8px]"
              style={{ background: '#E8B430', color: '#060810', width: 14, height: 14 }}
            >
              {pendingCount}
            </span>
          )}
          <ChevronDown
            className="h-3 w-3 transition-transform"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </div>

      {/* ── Ad-claim overlay ── */}
      {adTarget && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={cancelAd} />
          <div
            className="bounce-in relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: '#0D1828', border: '1px solid rgba(232,180,48,0.25)' }}
          >
            {/* Ad modal header strip */}
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,transparent,#E8B430,transparent)' }} />

            <div className="p-5">
              <button
                onClick={cancelAd}
                className="absolute start-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/40 transition hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Mission info */}
              <div className="flex items-center gap-2 mb-3 mt-1">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(232,180,48,0.12)', border: '1px solid rgba(232,180,48,0.22)' }}>
                  <Target className="h-4 w-4" style={{ color: '#E8B430' }} />
                </div>
                <div>
                  <p className="font-cairo text-[10px] font-bold text-white/35">مهمة اليوم</p>
                  <h3 className="font-lalezar text-[17px] text-white leading-none">{adTarget.titleAr}</h3>
                </div>
              </div>

              {/* Reward badge */}
              <div className="flex items-center gap-1.5 mb-4 rounded-xl px-3 py-2" style={{ background: 'rgba(232,180,48,0.07)', border: '1px solid rgba(232,180,48,0.15)' }}>
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-cairo text-[13px] font-black text-amber-400">+{adTarget.rewardCoins} كوين بعد الإشهار</span>
              </div>

              <AdNativeBanner />

              {adCountdown > 0 ? (
                <div className="mt-4 flex items-center justify-center gap-3 rounded-xl py-3.5" style={{ background: 'rgba(232,180,48,0.05)', border: '1px solid rgba(232,180,48,0.14)' }}>
                  <span className="font-grit text-[28px] leading-none" style={{ color: '#E8B430' }}>{adCountdown}</span>
                  <div>
                    <p className="font-cairo text-[12px] font-black" style={{ color: '#E8B430' }}>صبر على الإشهار</p>
                    <p className="font-cairo text-[10px] text-white/30">المكافأة كتجي من بعد</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={claimAfterAd}
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

              <button onClick={cancelAd} className="mt-2 w-full py-1.5 text-center font-cairo text-[11px] text-white/22 transition hover:text-white/50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
