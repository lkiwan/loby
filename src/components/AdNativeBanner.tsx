'use client';

import { useEffect, useRef, useState } from 'react';

const AD_ID = '1c683dcc9ce0949ba6de06ca95a8f98c';

export default function AdNativeBanner() {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const injected    = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (injected.current || !wrapperRef.current) return;
    injected.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = `https://bauval.org/21/${AD_ID}`;
    script.onload  = () => setLoaded(true);
    script.onerror = () => { injected.current = false; };
    wrapperRef.current.appendChild(script);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', minHeight: 90 }}
    >
      <p className="px-3 pt-2 text-end font-cairo text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
        إعلان
      </p>
      <div ref={wrapperRef}>
        <div id={`container-${AD_ID}`} />
      </div>
      {/* Placeholder shown until ad content fills the space */}
      {!loaded && (
        <div className="flex items-center justify-center pb-4 pt-1">
          <span className="font-cairo text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>
            جاري تحميل الإشهار…
          </span>
        </div>
      )}
    </div>
  );
}
