'use client';

import { Lock } from 'lucide-react';
import { COMING_SOON } from '@/lib/games';

export default function ComingSoon() {
  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="section-label">قريبا فالحومة</div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {COMING_SOON.map((g, i) => (
          <div
            key={g.id}
            className={`card-entrance stagger-${(i % 4) + 1} relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060c1a] p-5 opacity-75`}
          >
            {/* Coming soon badge */}
            <div className="absolute start-3 top-3 flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-950/40 px-2.5 py-1">
              <Lock className="h-2.5 w-2.5 text-amber-400" />
              <span className="font-grit text-[9px] uppercase tracking-wider text-amber-400">قريبا</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-grit text-[10px] uppercase tracking-wider text-neutral-600">{g.latinTitle}</p>
                <h3 className="font-lalezar text-xl text-neutral-300 leading-tight">{g.darijaTitle}</h3>
                <span className="mt-1 inline-block rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-cairo text-[10px] font-bold text-neutral-500">
                  {g.tag}
                </span>
                <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed text-neutral-600">{g.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}