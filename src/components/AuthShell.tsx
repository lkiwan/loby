'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarMark } from '@/components/Star';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-[#07111F] text-white">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(216,166,42,0.09),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(109,60,207,0.07),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(199,91,57,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        {/* Logo */}
        <Link href="/" className="anim-fadeup mb-6 flex items-center">
          <Image src="/icons/image.png" alt="PlayM3ana" width={96} height={96} className="h-24 w-24 object-contain" />
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
  const accentColor = accent === 'teal' ? '#1aad84' : '#D8A62A';
  const accentRgb   = accent === 'teal' ? '26,173,132' : '216,166,42';

  return (
    <div
      className="anim-fadeup d1 relative w-full max-w-sm overflow-hidden rounded-[22px] p-6 sm:p-7"
      style={{
        background: 'rgba(9,22,40,0.97)',
        border: `1px solid rgba(${accentRgb},0.22)`,
        boxShadow: `0 0 0 1px rgba(${accentRgb},0.08), 0 30px 80px -20px rgba(0,0,0,0.9), 0 0 60px rgba(${accentRgb},0.06)`,
      }}
    >
      {/* Top arch bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[22px]"
        style={{ background: `linear-gradient(90deg,transparent,rgba(${accentRgb},0.7),${accentColor},rgba(${accentRgb},0.7),transparent)`, boxShadow: `0 0 16px rgba(${accentRgb},0.5)` }} />
      {/* Corner glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-25 blur-3xl"
        style={{ background: accentColor }} />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full opacity-15 blur-3xl"
        style={{ background: '#6D3CCF' }} />
      {children}
    </div>
  );
}
