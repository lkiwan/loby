'use client';

import Image from 'next/image';
import { COMING_SOON } from '@/lib/games';
import { SolarLock } from '@/components/SolarIcon';

/* Store Posters "soon" cards: clean TEXT-FREE poster + HTML titles,
   SOON tag with the Solar lock. All copy/data comes from COMING_SOON
   in src/lib/games.ts — nothing new is promised here. */
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
            className={`card-entrance stagger-${(i % 4) + 1} relative overflow-hidden rounded-[20px] opacity-90`}
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            {/* Poster — text-free master, title rendered as HTML */}
            <div className="relative" style={{ aspectRatio: '16/10' }}>
              {g.poster ? (
                <Image
                  src={g.poster}
                  alt={g.darijaTitle}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: '50% 30%' }}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-5xl" style={{ background: 'var(--panel2)' }}>
                  {g.emoji}
                </div>
              )}
              <div className="cut-notch" />
              {/* SOON tag */}
              <span
                className="absolute start-3 top-3 z-[3] flex items-center gap-1.5 rounded-full px-2.5 py-[5px] font-cairo text-[10px] font-black"
                style={{
                  background: 'rgba(7,7,13,0.72)',
                  border: '1px solid rgba(198,245,66,0.45)',
                  color: 'var(--lime)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <SolarLock className="h-3 w-3" />
                قريبا
              </span>
              {/* Bottom fade + titles */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 pt-10"
                style={{
                  background:
                    'linear-gradient(to top, rgba(7,7,13,0.92) 0%, rgba(7,7,13,0.55) 55%, transparent 100%)',
                }}
              >
                <p className="font-nunito text-[10px] font-black uppercase tracking-[1.5px]" style={{ color: 'var(--dim)' }}>
                  {g.latinTitle}
                </p>
                <h3 className="font-lalezar text-[22px] leading-tight text-white">{g.darijaTitle}</h3>
              </div>
            </div>
            {/* Tag + description (real copy) */}
            <div className="p-4 pt-3">
              <span
                className="inline-block rounded-full px-2 py-0.5 font-cairo text-[10px] font-bold"
                style={{
                  border: '1px solid var(--line)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--dim)',
                }}
              >
                {g.tag}
              </span>
              <p className="mt-2 font-cairo text-[12px] font-semibold leading-relaxed" style={{ color: 'var(--dim)' }}>
                {g.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
