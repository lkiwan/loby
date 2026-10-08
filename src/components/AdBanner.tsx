'use client';

export default function AdBanner({ className = "my-6 flex justify-center overflow-hidden" }: { className?: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>body { margin: 0; padding: 0; overflow: hidden; }</style>
      </head>
      <body>
        <script>
          window.atOptions = {
            key: 'eaa6732a15007a4754a40910a05209c0',
            format: 'iframe',
            height: 50,
            width: 320,
            params: {}
          };
        </script>
        <script src="https://bauval.org/22/eaa6732a15007a4754a40910a05209c0"></script>
      </body>
    </html>
  `;

  return (
    <div className={className}>
      <iframe
        srcDoc={html}
        width="320"
        height="50"
        style={{ border: 'none', overflow: 'hidden' }}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      />
    </div>
  );
}
