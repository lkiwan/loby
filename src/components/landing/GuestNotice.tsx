'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';

export default function GuestNotice() {
  return (
    <div className="mt-5 hidden overflow-hidden rounded-xl border border-[rgba(198,245,66,0.22)] bg-[rgba(198,245,66,0.05)] p-4 backdrop-blur-sm sm:block">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(198,245,66,0.3)] bg-[rgba(198,245,66,0.1)]">
            <Coins className="h-5 w-5 text-[var(--lime)]" />
          </div>
          <p className="font-cairo text-[13px] font-bold text-[#EDEDF2]">
            تقيد باش تفرش الخاين د الحومة قبل مايسالي الليل — والدخلة فابور طبعا 🕵️
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/login" className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]">دخول</Link>
          <Link href="/register" className="btn-chunk btn-amber px-4 py-2 text-[12px]">تقيد دابا</Link>
        </div>
      </div>
    </div>
  );
}