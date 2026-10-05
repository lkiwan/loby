'use client';

import { Lock, Zap } from 'lucide-react';
import { COMING_SOON } from '@/lib/games';

export default function ComingSoon() {
  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="section-label">قريبا فالحومة</div>
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1 font-grit text-[9px] uppercase tracking-wider text-cyan-400/70">
          <Zap className="h-3 w-3" /> Coming soon
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COMING_SOON.map((g, i) => (
          <div
            key={g.id}
            className={`card-entrance stagger-${(i % 4) + 1} group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#07101f] to-[#060c1a] p-5`}
          >
            {/* Subtle glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(242,178,61,.06), transparent 70%)' }} />

            {/* Coming soon badge */}
            <div className="absolute end-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-950/50 px-2.5 py-1 backdrop-blur-sm">
              <Lock className="h-2.5 w-2.5 text-amber-400/70" />
              <span className="font-grit text-[9px] uppercase tracking-wider text-amber-400/70">قريبا</span>
            </div>

            <div className="flex items-start gap-4">
              {/* Emoji with dark pill */}
              <div className="relative shrink-0 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <span className="text-3xl">{g.emoji}</span>
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="font-grit text-[9px] uppercase tracking-wider text-neutral-600">{g.latinTitle}</p>
                <h3 className="font-lalezar text-xl leading-tight text-neutral-300 transition group-hover:text-neutral-100">{g.darijaTitle}</h3>
                <span className="mt-1.5 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 font-cairo text-[10px] font-bold text-neutral-500">
                  {g.tag}
                </span>
                <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed text-neutral-600 transition group-hover:text-neutral-500">
                  {g.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
