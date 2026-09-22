'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, Target, Check, Loader2, Zap, Coins } from 'lucide-react';

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
  const [claiming, setClaiming] = useState<string | null>(null);

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

  const claimMission = async (id: string, coins: number) => {
    setClaiming(id);
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: id }),
      });
      if (res.ok) {
        await fetchMissions();
        onClaim?.(coins);
      }
    } finally {
      setClaiming(null);
    }
  };

  const done = missions.filter((m) => m.claimed).length;
  const total = missions.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bounce-in relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-cyan-400/20 bg-[#060c1a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full border border-cyan-400/30 bg-cyan-950/30">
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-lalezar text-lg text-neutral-100 leading-none">المهام اليومية</h2>
              {total > 0 && (
                <p className="mt-0.5 font-cairo text-[11px] text-neutral-500">
                  {done}/{total} مكتملة
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-neutral-400 transition hover:border-red-500/30 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar for overall */}
        {total > 0 && (
          <div className="h-0.5 bg-white/[0.05]">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${Math.round((done / total) * 100)}%`,
                background: 'linear-gradient(90deg, #00d9ff, #a855f7)',
              }}
            />
          </div>
        )}

        {/* Body */}
        <div className="max-h-[60dvh] overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : missions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl mb-3">🏖️</p>
              <p className="font-cairo text-sm text-neutral-500">ما كاين حتى مهمة دابا</p>
              <p className="mt-1 font-cairo text-[11px] text-neutral-600">ارجع بكرة كتتجدد المهام 🌙</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {missions.map((m) => {
                const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 transition-all ${
                      m.claimed
                        ? 'border-emerald-500/15 bg-emerald-950/10 opacity-55'
                        : m.canClaim
                        ? 'border-amber-400/30 bg-amber-950/15'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-cairo text-[13px] font-bold text-neutral-200">
                          {m.titleAr}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: m.claimed
                                  ? '#22c55e'
                                  : m.canClaim
                                  ? '#f2b23d'
                                  : 'linear-gradient(90deg,#00d9ff,#a855f7)',
                                boxShadow: m.canClaim
                                  ? '0 0 8px rgba(242,178,61,.5)'
                                  : undefined,
                              }}
                            />
                          </div>
                          <span className="font-grit text-[10px] text-neutral-600 shrink-0 tabular-nums">
                            {m.progress}/{m.target}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-amber-400" />
                          <span className="font-cairo text-[12px] font-black text-amber-400">
                            +{m.rewardCoins}
                          </span>
                        </div>
                        {m.rewardXp > 0 && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-purple-400" />
                            <span className="font-cairo text-[10px] text-purple-400">+{m.rewardXp} XP</span>
                          </div>
                        )}
                        {m.claimed ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span className="font-cairo text-[10px] font-bold">تم</span>
                          </div>
                        ) : m.canClaim ? (
                          <button
                            onClick={() => claimMission(m.id, m.rewardCoins)}
                            disabled={claiming === m.id}
                            className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 font-cairo text-[11px] font-black text-amber-300 transition hover:bg-amber-400/20 active:scale-95"
                          >
                            {claiming === m.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            احصل
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.04] px-5 py-3">
          <p className="text-center font-cairo text-[11px] text-neutral-600">
            المهام كتتجدد كل يوم بالفجر 🌙
          </p>
        </div>
      </div>
    </div>
  );
}
