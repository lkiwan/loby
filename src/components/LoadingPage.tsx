import React from 'react';
import Image from 'next/image';

interface LoadingPageProps {
  title?: string;
  description?: string;
  status?: string;
  fullScreen?: boolean;
  titleClassName?: string;
}

export default function LoadingPage({
  title = "كنوجدو الكراسا…",
  description = "",
  status = "",
  fullScreen = true,
  titleClassName = "font-lalezar text-2xl text-[#F5E7CE] text-glow-gold",
}: LoadingPageProps) {
  return (
    <main className={"loading-page " + (fullScreen ? "loading-page--fullscreen" : "")}>
      <section
        className="loading-card"
        role="status"
        aria-live="polite"
        aria-label="Loading page"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center mb-2">
            <Image
              src="/icons/image.png"
              alt="PlayM3ana"
              width={112}
              height={112}
              className="h-28 w-28 object-contain"
            />
          </div>

          <div className="loading-spinner" aria-hidden="true">
            <div id="square1"></div>
            <div id="square2"></div>
            <div id="square3"></div>
            <div id="square4"></div>
            <div id="square5"></div>
          </div>

          {title && <h1 className={titleClassName}>{title}</h1>}
          
          {description && (
            <p className="font-cairo text-[14px]">
              {description}
            </p>
          )}

          {status && (
            <span className="loading-status font-cairo">
              {status}
            </span>
          )}
        </div>
      </section>
    </main>
  );
}