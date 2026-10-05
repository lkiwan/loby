'use client';

import Link from 'next/link';
import { StarMark } from '@/components/Star';

export default function LobbyFooter({
  isAuthed,
  username,
}: {
  isAuthed: boolean;
  username?: string | null;
}) {
  return (
    <footer className="mt-20 flex flex-col items-center gap-3 pt-8 text-center">
      {/* Neon divider */}
      <div className="neon-divider mb-2 w-full max-w-xs" />

      <StarMark size={26} />

      <p className="font-grit text-[13px] uppercase tracking-widest text-neutral-700">
        <span className="text-gold-sheen">PLAY</span>M3ANA
      </p>

      <p className="font-cairo text-[11.5px] font-bold text-[#a08a63] max-w-[260px] leading-relaxed">
        ألعاب د القصارة بالدارجة — تيليفون واحد، والحومة كاملة شاهدة 🔥
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-cairo text-[10.5px] font-bold text-[#7a6a4d]">
        <Link href="/leaderboard" className="transition hover:text-amber-300">الكلاسمون</Link>
        {isAuthed && (
          <>
            <span className="text-[#3a3228]">•</span>
            <Link href={`/profile/${username}`} className="transition hover:text-amber-300">الپروفيل ديالي</Link>
          </>
        )}
        <span className="text-[#3a3228]">•</span>
        <Link href="/privacy" className="transition hover:text-amber-300">سياسة الخصوصية</Link>
        <span className="text-[#3a3228]">•</span>
        <Link href="/terms" className="transition hover:text-amber-300">شروط الاستخدام</Link>
        <span className="text-[#3a3228]">•</span>
        <Link href="/contact" className="transition hover:text-amber-300">تواصل معانا</Link>
      </div>

      <p className="mt-1 font-cairo text-[10px] font-semibold text-[#5a4e3c]">
        مصاوبة بـ ❤️ وشوية د الكسكس فالمغرب 🇲🇦 — أي صداقة خيبها اللعب هاد الليلة، الله يرحمها 🙏
      </p>
    </footer>
  );
}
