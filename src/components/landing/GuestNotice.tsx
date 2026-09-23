'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';

export default function GuestNotice() {
  return (
    <div className="mt-5 hidden overflow-hidden rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 backdrop-blur-sm sm:block">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
            <Coins className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="font-cairo text-[13px] font-bold text-[#e8d5a3]">
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