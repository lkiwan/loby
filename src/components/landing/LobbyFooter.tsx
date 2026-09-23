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
    <footer className="mt-24 flex flex-col items-center gap-2 border-t border-white/[0.05] pt-8 text-center">
      <StarMark size={24} />
      <p className="font-cairo text-[11.5px] font-bold text-[#a08a63]">
        PLAYM3ANA — ألعاب د القصارة بالدارجة، فتيليفون واحد، والحومة كاملة شاهدة 🔥
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-cairo text-[10.5px] font-bold text-[#7a6a4d]">
        <Link href="/leaderboard" className="transition hover:text-amber-300">الكلاسمون</Link>
        {isAuthed && <><span>•</span><Link href={`/profile/${username}`} className="transition hover:text-amber-300">الپروفيل ديالي</Link></>}
        <span>•</span>
        <Link href="/privacy" className="transition hover:text-amber-300">سياسة الخصوصية</Link>
        <span>•</span>
        <Link href="/terms" className="transition hover:text-amber-300">شروط الاستخدام</Link>
        <span>•</span>
        <Link href="/contact" className="transition hover:text-amber-300">تواصل معانا</Link>
      </div>
      <p className="mt-1 font-cairo text-[10px] font-semibold text-[#7a6a4d]">
        مصاوبة بـ ❤️ وشوية د الكسكس فالمغرب 🇲🇦 — أي صداقة خيبها اللعب هاد الليلة، الله يرحمها 🙏
      </p>
    </footer>
  );
}