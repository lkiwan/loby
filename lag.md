## Why Android lags / iPhone fine
- 33ms setInterval syncLiquid on page.tsx:459 reads offsetWidth/getBoundingClientRect (~30 forced layouts/s, even idle)
- backdrop-filter blur on header+badges (sticky blur re-renders; Android GPU bad)
- blur(40px) + infinite animated filtered layers (drip/glow/pulse/marqueeRtl, 11 infinite animations, 1510 DOM)
- third-party ad scripts (bauval.org) injected on load
- 46MB images; card sizes fetch large variants

## Zero-frontend fixes (no UI changes)
- next.config.ts: images.formats: ['image/webp'], deviceSizes tuned, qualities, minimumCacheTTL
- compress public/images to WebP/optimized
- defer ad scripts to idle/interaction (code edit but purely timing)

But these are for later
