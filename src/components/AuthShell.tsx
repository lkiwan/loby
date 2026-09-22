'use client';

import React from 'react';
import Link from 'next/link';
import { StarMark } from '@/components/Star';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="scene relative min-h-dvh bg-[#0d0b08] text-[#f1e7d6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-6%,rgba(242,178,61,.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(193,74,41,.10),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(0,0,0,.85),transparent_58%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="anim-fadeup mb-6 flex items-center gap-2.5">
          <StarMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="font-grit text-base uppercase tracking-tight">
              <span className="text-gold-sheen">DARJA</span>{' '}
              <span className="text-neutral-100">ARCADE</span>
            </span>
            <span className="mt-0.5 font-cairo text-[9px] font-bold text-neutral-500">
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
    <div className="anim-fadeup d1 relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-[#6b542e]/40 bg-[#1a140e] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.85)] sm:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: accent !== 'teal' ? '#f2b23d' : '#3fba9a' }}
      />
      {children}
    </div>
  );
}