'use client';

import { useEffect, useRef } from 'react';

const AD_ID = '1c683dcc9ce0949ba6de06ca95a8f98c';

export default function AdNativeBanner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !wrapperRef.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = `https://bauval.org/21/${AD_ID}`;
    script.onerror = () => { injected.current = false; };
    wrapperRef.current.appendChild(script);
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <p className="px-3 pt-2 text-end font-cairo text-[9px] font-bold text-neutral-600">إعلان</p>
      <div ref={wrapperRef}>
        <div id={`container-${AD_ID}`} />
      </div>
    </div>
  );
}
