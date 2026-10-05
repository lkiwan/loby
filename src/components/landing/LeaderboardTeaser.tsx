'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function LeaderboardTeaser() {
  return (
    <section className="mt-14">
      <div className="overflow-hidden rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-950/15 via-[#060c1a] to-[#060c1a] p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-start">
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <Trophy className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(242,178,61,.5)]" />
              <span className="font-lalezar text-xl text-amber-300">طوپ اللعابة</span>
            </div>
            <p className="font-cairo text-[13px] font-semibold text-neutral-400">
              واش نتا فالكلاسمون؟ شوف بلاصتك مع أحسن اللعابة 👑
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="btn-chunk btn-amber shrink-0 px-6 py-3 text-[13px]"
          >
            <Trophy className="h-4 w-4" />
            شوف الكلاسمون
          </Link>
        </div>
      </div>
    </section>
  );
}