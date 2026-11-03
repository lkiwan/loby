'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/* Store shell (redesign port): near-black bg + purple/red glows, phone
   column, square back button, PLAYM3ANA wordmark. Replaces the old navy
   shell + logo image. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh text-white" style={{ background: 'var(--bg)' }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_85%_0%,rgba(124,58,237,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_100%,rgba(225,29,72,0.1),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(198,245,66,0.05),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 py-6">
        {/* Top row: back button + wordmark */}
        <div className="anim-fadeup flex items-center justify-between">
          <Link
            href="/"
            aria-label="رجع للساحة"
            className="grid h-[42px] w-[42px] place-items-center rounded-[13px] border transition active:scale-95"
            style={{ background: 'var(--panel2)', borderColor: 'var(--line)', color: '#EDEDF2' }}
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <span className="font-cairo text-[15px] font-black tracking-[2px]" dir="ltr">
            PLAY<span style={{ color: 'var(--lime)' }}>M3ANA</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Store card: panel bg, hairline border, radius 22, diagonal cut corner
   (clip-path via .cut-corner + a bg triangle notch on top). The `accent`
   prop is kept for call-site compatibility — both auth pages now use the
   single lime Store system. */
export function AuthCardShell({
  children,
}: {
  children: React.ReactNode;
  accent?: 'amber' | 'teal';
}) {
  return (
    <div className="anim-fadeup d1 relative w-full">
      <div
        className="cut-corner relative w-full p-5 pt-6"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.9)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
