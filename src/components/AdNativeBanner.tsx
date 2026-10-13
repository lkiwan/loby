'use client';

const AD_ID = '1c683dcc9ce0949ba6de06ca95a8f98c';

interface AdNativeBannerProps {
  height?: number;
  className?: string;
}

export default function AdNativeBanner({ height = 260, className = '' }: AdNativeBannerProps) {
  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 4px;
            overflow: hidden;
            background: transparent;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          #container-${AD_ID} {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div id="container-${AD_ID}"></div>
        <script async data-cfasync="false" src="https://bauval.org/21/${AD_ID}"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`overflow-hidden rounded-2xl w-full relative ${className}`}
      style={{
        border: '1px solid rgba(232, 180, 48, 0.2)',
        background: 'rgba(8, 14, 28, 0.75)',
        minHeight: height,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="absolute top-2 start-3 z-10 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-sm border border-white/5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="font-cairo text-[9px] font-bold text-amber-300/80">إشهار ممول</span>
      </div>
      <iframe
        srcDoc={html}
        width="100%"
        height={height}
        style={{ border: 'none', overflow: 'hidden', display: 'block' }}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        title="Sponsored Ad"
      />
    </div>
  );
}
