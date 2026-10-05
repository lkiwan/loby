'use client';

import React from 'react';
import Link from 'next/link';
import { StarMark } from '@/components/Star';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="scene relative min-h-dvh bg-[#080b14] text-[#f0ece6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* V2 ambient orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-6%,rgba(245,200,66,.16),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_14%,rgba(0,229,255,.10),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_80%,rgba(155,89,248,.09),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(0,0,0,.92),transparent_58%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,1) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="anim-fadeup mb-6 flex items-center gap-2.5 transition hover:opacity-80">
          <StarMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="font-grit text-base uppercase tracking-tight">
              <span className="text-gold-sheen">PLAY</span>{' '}
              <span className="text-[#7ab0e8]">M3ANA</span>
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
    <div
      className="anim-fadeup d1 relative w-full max-w-sm overflow-hidden rounded-2xl border p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.95)] sm:p-7"
      style={{
        background: 'linear-gradient(160deg,#101828 0%,#0c1420 100%)',
        borderColor: 'rgba(0,229,255,0.12)',
        boxShadow: '0 0 0 1px rgba(0,229,255,0.07), 0 30px 80px -30px rgba(0,0,0,.95)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-35 blur-3xl"
        style={{ background: accent !== 'teal' ? '#f5c842' : '#3fca9a' }}
      />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 rounded-full opacity-20 blur-3xl bg-[#00e5ff]" />
      {children}
    </div>
  );
}
