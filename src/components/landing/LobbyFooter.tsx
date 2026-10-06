'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarMark } from '@/components/Star';

export default function LobbyFooter({
  isAuthed,
  username,
}: {
  isAuthed: boolean;
  username?: string | null;
}) {
  return (
    <footer className="riad-footer">
      {/* Logo + tagline */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo-playm3ana-new.png"
            alt="PLAYM3ANA"
            width={40}
            height={32}
            style={{ width: 'auto', height: '32px' }}
            className="object-contain"
          />
          <span className="font-cairo text-[15px] font-black lowercase tracking-tight">
            <span style={{ color: '#D8A62A' }}>play</span>
            <span style={{ color: 'rgba(245,231,206,0.7)' }}>m3ana</span>
          </span>
        </div>
        <p className="font-cairo text-[12px] font-semibold text-white/35 max-w-[280px] leading-relaxed">
          ألعاب د القصارة بالدارجة فتيليفون واحد — والحومة كاملة شاهدة 🔥
        </p>
      </div>

      {/* Zellige diamond divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(216,166,42,0.25))' }} />
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'rgba(216,166,42,0.5)' }} />
          <StarMark size={16} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: 'rgba(216,166,42,0.5)' }} />
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(216,166,42,0.25), transparent)' }} />
      </div>

      {/* Navigation links */}
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-4">
        <Link
          href="/leaderboard"
          className="font-cairo text-[12px] font-bold text-white/40 transition hover:text-[#D8A62A]"
        >
          الكلاسمون
        </Link>
        {isAuthed && username && (
          <Link
            href={`/profile/${username}`}
            className="font-cairo text-[12px] font-bold text-white/40 transition hover:text-[#D8A62A]"
          >
            الپروفيل
          </Link>
        )}
        <Link
          href="/privacy"
          className="font-cairo text-[12px] font-bold text-white/40 transition hover:text-[#D8A62A]"
        >
          الخصوصية
        </Link>
        <Link
          href="/terms"
          className="font-cairo text-[12px] font-bold text-white/40 transition hover:text-[#D8A62A]"
        >
          الشروط
        </Link>
        <Link
          href="/contact"
          className="font-cairo text-[12px] font-bold text-white/40 transition hover:text-[#D8A62A]"
        >
          تواصل معانا
        </Link>
      </nav>

      {/* Footer bottom */}
      <p className="text-center font-cairo text-[11px] font-semibold text-white/22 mt-2 pb-1">
        مصاوبة بـ ❤️ وشوية د الكسكس فالمغرب 🇲🇦
      </p>
    </footer>
  );
}
