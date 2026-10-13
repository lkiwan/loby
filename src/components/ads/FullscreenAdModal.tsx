'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Loader2, Sparkles, Trophy, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import AdNativeBanner from '@/components/AdNativeBanner';
import AdBanner from '@/components/AdBanner';
import { Game, GAMES } from '@/lib/games';

export interface AdCompletePayload {
  redirectUrl?: string;
  newBalance?: number;
  awarded?: number;
}

interface FullscreenAdModalProps {
  isOpen: boolean;
  gameId: string | null;
  onClose: () => void;
  onComplete: (payload: AdCompletePayload) => void;
  placement?: 'unlock' | 'continue' | 'daily_bonus' | 'double_reward';
}

export default function FullscreenAdModal({
  isOpen,
  gameId,
  onClose,
  onComplete,
  placement = 'unlock',
}: FullscreenAdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [completedPayload, setCompletedPayload] = useState<AdCompletePayload | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const verifyingRef = useRef(false);

  const game = GAMES.find((g) => g.id === gameId);
  const accent = game?.starAccent || '#E8B430';

  // Cleanup timers on unmount or close
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Complete the ad verification with the server
  const verifyAndComplete = useCallback(async (activeNonce: string) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);

    try {
      const res = await fetch('/api/ads/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': activeNonce,
        },
        body: JSON.stringify({ nonce: activeNonce }),
      });

      if (!res.ok) {
        throw new Error('Verification failed');
      }

      const payload: AdCompletePayload = await res.json();
      setCompletedPayload(payload);
      setCanSkip(true);
      setIsVerifying(false);
    } catch {
      setIsVerifying(false);
      setErrorMessage('مشكل فالتحقق من الإشهار — عاود جرب');
      setCanSkip(true); // Don't trap the user
    }
  }, []);

  // Handle entering the game or claiming reward
  const handleClaimAndEnter = useCallback(() => {
    cleanup();
    if (completedPayload) {
      onComplete(completedPayload);
    } else if (nonce && !verifyingRef.current) {
      // If user tapped before auto-verify finished
      void verifyAndComplete(nonce).then(() => {
        if (completedPayload) onComplete(completedPayload);
        else onClose();
      });
    } else {
      onClose();
    }
  }, [cleanup, completedPayload, nonce, onComplete, onClose, verifyAndComplete]);

  // Start the ad session when modal opens
  useEffect(() => {
    if (!isOpen || !gameId) {
      cleanup();
      setCountdown(5);
      setCanSkip(false);
      setIsVerifying(false);
      setErrorMessage(null);
      setNonce(null);
      setCompletedPayload(null);
      verifyingRef.current = false;
      return;
    }

    let isMounted = true;
    setCountdown(5);
    setCanSkip(false);
    setIsVerifying(false);
    setErrorMessage(null);
    verifyingRef.current = false;

    // 1. Start Ad Session
    void (async () => {
      try {
        const startRes = await fetch('/api/ads/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placement, gameId }),
        });

        if (!startRes.ok) {
          if (!isMounted) return;
          if (startRes.status === 429) {
            setErrorMessage('عاود جرب من بعد شوية');
          } else {
            setErrorMessage('مشكل فبدء الإشهار');
          }
          setCanSkip(true);
          return;
        }

        const data: { nonce: string } = await startRes.json();
        if (!isMounted) return;
        setNonce(data.nonce);

        // 2. Start Countdown (5 seconds)
        let remaining = 5;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          if (!isMounted) return;
          setCountdown(remaining);

          if (remaining <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setCanSkip(true);
            // Verify with server once 5 seconds finish
            void verifyAndComplete(data.nonce);
          }
        }, 1000);
      } catch {
        if (!isMounted) return;
        setErrorMessage('مشكل فالكونيكسيون');
        setCanSkip(true);
      }
    })();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [isOpen, gameId, placement, cleanup, verifyAndComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.max(0, ((5 - countdown) / 5) * 100));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#030713] text-white">
      {/* ── Ambient Radial Glow matching game accent ── */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px]"
        style={{ background: '#2DD4BF' }}
      />

      {/* ══════════════════════════════════════════
          TOP BAR: Sponsored Badge + X Button
      ══════════════════════════════════════════ */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3 border-b border-white/5 bg-black/40 backdrop-blur-md">
        {/* Sponsored Badge */}
        <div className="flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-cairo text-[11px] font-black tracking-wider text-amber-300">
            إعلان ممول • AD
          </span>
        </div>

        {/* Action Button: Countdown vs. Active Skip/Close */}
        <div className="flex items-center gap-2">
          {!canSkip ? (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 shadow-inner backdrop-blur-md">
              <span className="font-cairo text-[12px] font-bold text-neutral-300">
                تخطي بعد
              </span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-400/20 font-lalezar text-[15px] text-amber-300 border border-amber-400/30">
                {countdown}
              </span>
            </div>
          ) : (
            <button
              onClick={handleClaimAndEnter}
              disabled={isVerifying}
              className="group flex items-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-500/30 to-emerald-400/20 px-4 py-2 text-white shadow-[0_0_24px_rgba(52,211,153,0.35)] backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              aria-label="تخطي ودخول اللعبة"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
                  <span className="font-cairo text-[12.5px] font-black text-emerald-200">
                    جاري التفعيل...
                  </span>
                </>
              ) : (
                <>
                  <span className="font-cairo text-[13px] font-black text-emerald-300">
                    تخطي ودخول اللعبة
                  </span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400 text-black font-black text-xs group-hover:rotate-90 transition-transform">
                    ✕
                  </span>
                </>
              )}
            </button>
          )}

          {/* Emergency close button */}
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="خروج"
            aria-label="خروج"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          CENTER STAGE: Ad Display (High eCPM)
      ══════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-3">
          {/* Header text */}
          <div className="text-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-cairo text-[11px] font-bold"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
            >
              <Sparkles className="h-3 w-3" />
              هدية اللعب بالمجان
            </span>
            <h2 className="mt-1.5 font-lalezar text-xl sm:text-2xl text-white">
              ثواني قليلة وندخلو للطاولة! 🎮
            </h2>
          </div>

          {/* Adsterra Native Responsive Frame (260px) */}
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#060B18]">
            <AdNativeBanner height={260} />
          </div>

          {/* Bottom 320x50 Banner for double monetization */}
          <div className="w-full flex justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40 py-1">
            <AdBanner className="flex justify-center overflow-hidden" />
          </div>

          {/* Error notice if occurred */}
          {errorMessage && (
            <p className="font-cairo text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
              {errorMessage}
            </p>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════
          BOTTOM BAR: Game Info + Progress Bar + CTA
      ══════════════════════════════════════════ */}
      <footer className="relative z-10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/5 bg-[#040815]/90 backdrop-blur-md">
        <div className="max-w-md mx-auto flex flex-col gap-2.5">
          {/* Game summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-lalezar text-xl shadow-md border"
                style={{
                  background: `${accent}18`,
                  borderColor: `${accent}40`,
                }}
              >
                {game?.emoji || '🎲'}
              </div>
              <div>
                <p className="font-lalezar text-[17px] text-white leading-tight">
                  {game?.darijaTitle || 'اللعبة'}
                </p>
                <p className="font-cairo text-[11px] font-semibold text-neutral-400">
                  {canSkip
                    ? '🎉 تم فتح اللعبة! اضغط على الزر للدخول'
                    : `صبر على الإشهار... باقا ${countdown} ثواني ⏳`}
                </p>
              </div>
            </div>

            {/* Direct Play button when ready */}
            {canSkip && (
              <button
                onClick={handleClaimAndEnter}
                disabled={isVerifying}
                className="btn-chunk btn-amber px-4 py-2 text-[12.5px] rounded-xl flex items-center gap-1.5 shadow-[0_0_16px_rgba(232,180,48,0.35)]"
              >
                لعب دابا
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            )}
          </div>

          {/* Progress Bar (5s filling smoothly) */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(234,179,8,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

