'use client';

const AD_ID = '1c683dcc9ce0949ba6de06ca95a8f98c';

export default function AdNativeBanner() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
          .ad-container { min-height: 90px; }
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
      className="overflow-hidden rounded-xl"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', minHeight: 90 }}
    >
      <p className="px-3 pt-2 text-end font-cairo text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
        إعلان
      </p>
      <iframe
        srcDoc={html}
        width="100%"
        height="100"
        style={{ border: 'none', overflow: 'hidden', display: 'block' }}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      />
    </div>
  );
}
