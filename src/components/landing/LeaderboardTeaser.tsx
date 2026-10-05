'use client';

import Link from 'next/link';
import { Trophy, Flame, ChevronLeft } from 'lucide-react';

export default function LeaderboardTeaser() {
  return (
    <section className="mt-12">
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-950/20 via-[#060c1a] to-[#050a18] p-6 sm:p-7">

        {/* Ambient glow top-right */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(242,178,61,.35), transparent 65%)' }} />
        <div className="pointer-events-none absolute -left-8 -bottom-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,.25), transparent 65%)' }} />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-start">
            {/* Trophy icon with pulse */}
            <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-amber-400/30 bg-amber-950/40">
              <div className="sonar-ring text-amber-400 absolute inset-0" />
              <Trophy className="relative z-10 h-7 w-7 text-amber-400 drop-shadow-[0_0_12px_rgba(242,178,61,.7)]" />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-center gap-2 sm:justify-start">
                <span className="font-lalezar text-2xl text-amber-300 text-glow-amber">طوپ اللعابة</span>
                <Flame className="h-4 w-4 text-red-400" />
              </div>
              <p className="font-cairo text-[13px] font-semibold text-neutral-400 max-w-[280px]">
                واش نتا فالكلاسمون؟ شوف بلاصتك مع أحسن اللعابة 👑
              </p>
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="btn-chunk btn-amber shrink-0 items-center gap-2 px-6 py-3 text-[13px] inline-flex"
          >
            <Trophy className="h-4 w-4" />
            شوف الكلاسمون
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180 opacity-60" />
          </Link>
        </div>
      </div>
    </section>
  );
}
