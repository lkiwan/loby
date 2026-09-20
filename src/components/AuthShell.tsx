'use client';

import React from 'react';
import Link from 'next/link';
import { StarMark } from '@/components/Star';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="scene relative min-h-dvh bg-[#05050d] text-[#f4efe6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#141b3a_0%,transparent_55%)]" />
        <div className="orb orb-1 -left-28 -top-28 h-80 w-80 bg-amber-600/25" />
        <div className="orb orb-2 -bottom-32 -right-24 h-96 w-96 bg-[#0EA5E9]/15" />
        <div className="orb orb-3 left-1/3 top-1/2 h-64 w-64 bg-[#10B981]/10" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="anim-fadeup mb-6 flex items-center gap-2.5">
          <StarMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="font-grit text-base uppercase tracking-tight">
              <span className="text-gold-sheen">DARJA</span>{' '}
              <span className="text-neutral-100">ARCADE</span>
            </span>
            <span className="mt-0.5 font-cairo text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-500">
              ساحة اللعب
            </span>
          </span>
        </Link>
        {children}
      </div>
    </div>
  );
}

export function AuthCardShell({
  children,
  accent = 'amber',
}: {
  children: React.ReactNode;
  accent?: 'amber' | 'teal';
}) {
  return (
    <div className="anim-fadeup d1 relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl sm:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent !== 'teal' ? '#f2b23d' : '#3fba9a' }}
      />
      {children}
    </div>
  );
}