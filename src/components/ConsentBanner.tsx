'use client';

import { useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

const STORAGE_KEY = 'darja:consentAccepted';

const emptySubscribe = () => () => {};

export default function ConsentBanner() {
  const stored = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );

  const [dismissed, setDismissed] = useState(false);
  const visible = !dismissed && stored === null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t-2 border-[#6b542e]/50 bg-[#171210]/98 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <p className="flex-1 font-cairo text-[12.5px] font-semibold leading-relaxed text-[#c9b795]">
          كنستعملو الكوكيز والإعلانات باش نخدمو اللعبة مجانية ونحسنوها ليك. فاللعب، كتعتبر موافق على
          <Link href="/privacy" className="mx-1 text-amber-300 underline-offset-2 hover:underline">
            سياسة الخصوصية
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={accept}
            className="btn-chunk btn-amber flex items-center gap-1.5 px-4 py-2 text-[12px]"
          >
            <Check className="h-4 w-4" />
            موافق
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#6b542e]/50 text-neutral-400 transition hover:text-white"
            aria-label="غلق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
