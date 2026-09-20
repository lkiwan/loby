'use client';

const STORAGE_KEY = 'darja:deviceFingerprint';

/**
 * Stable, non-identifying device fingerprint used for multi-account detection.
 * Deliberately coarse: it cannot single out a person, only a device profile.
 */
async function computeFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'server';

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const parts = [
    navigator.userAgent,
    navigator.language,
    `${navigator.hardwareConcurrency ?? 0}`,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset(),
  ].join('|');

  const data = new TextEncoder().encode(parts);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const fp = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  sessionStorage.setItem(STORAGE_KEY, fp);
  return fp;
}

export async function trackDevice(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const fingerprint = await computeFingerprint();
    await fetch('/api/devices/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    });
  } catch {
    // best-effort
  }
}
