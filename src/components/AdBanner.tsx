'use client';

import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    (window as unknown as Record<string, unknown>).atOptions = {
      key: 'eaa6732a15007a4754a40910a05209c0',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement('script');
    script.src = 'https://bauval.org/22/eaa6732a15007a4754a40910a05209c0';
    script.async = true;
    script.onerror = () => { injected.current = false; };
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="my-6 flex justify-center overflow-hidden">
      <div
        ref={containerRef}
        aria-label="إشهار"
        style={{ width: 320, height: 50, overflow: 'hidden', flexShrink: 0 }}
      />
    </div>
  );
}
