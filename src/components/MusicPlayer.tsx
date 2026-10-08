'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const startedRef = useRef(false);

  const startAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || startedRef.current) return;
    startedRef.current = true;
    audio.volume = 0.25;
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => { startedRef.current = false; });
  }, []);

  // Auto-start on first user interaction anywhere on the page
  useEffect(() => {
    const onInteract = () => {
      startAudio();
      document.removeEventListener('click', onInteract);
      document.removeEventListener('touchstart', onInteract);
    };
    document.addEventListener('click', onInteract, { passive: true });
    document.addEventListener('touchstart', onInteract, { passive: true });
    return () => {
      document.removeEventListener('click', onInteract);
      document.removeEventListener('touchstart', onInteract);
    };
  }, [startAudio]);

  // Show button after 1.5s so it doesn't flash on initial load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (!startedRef.current) {
      startAudio();
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      {/* Arabic Trap Gaming — No Copyright 2022 */}
      <audio
        ref={audioRef}
        src="https://archive.org/download/powerful-arabic-trap-genesis-no-copyright-music-2022/Powerful%20Arabic%20Trap%20%28Genesis%29%20%20No%20Copyright%20Music%20%202022.m4a"
        loop
        preload="none"
        onCanPlay={() => setReady(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { startedRef.current = false; }}
      />

      <button
        onClick={toggle}
        aria-label={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
        title={playing ? 'إيقاف' : 'تشغيل'}
        style={{
          position: 'fixed',
          bottom: '72px',
          left: '16px',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid rgba(232,180,48,0.35)',
          background: playing
            ? 'linear-gradient(135deg,rgba(232,180,48,0.18),rgba(194,52,26,0.14))'
            : 'rgba(6,8,16,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: playing ? '#E8B430' : 'rgba(245,231,206,0.6)',
          fontSize: '13px',
          fontFamily: 'var(--font-cairo), sans-serif',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: playing
            ? '0 0 14px rgba(232,180,48,0.25), 0 3px 8px rgba(0,0,0,0.5)'
            : '0 3px 8px rgba(0,0,0,0.4)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.3s, color 0.3s, box-shadow 0.3s',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          style={{
            fontSize: '15px',
            display: 'inline-block',
            animation: playing ? 'musicBounce 0.8s ease-in-out infinite alternate' : 'none',
          }}
        >
          {playing ? '🎵' : '🎶'}
        </span>
        <span style={{ fontSize: '12px', letterSpacing: '0.01em' }}>
          {playing ? 'موسيقى' : 'موسيقى'}
        </span>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: playing ? '#E8B430' : 'rgba(245,231,206,0.25)',
            boxShadow: playing ? '0 0 6px #E8B430' : 'none',
            flexShrink: 0,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        />
        <style>{`
          @keyframes musicBounce {
            from { transform: scale(1) rotate(-5deg); }
            to   { transform: scale(1.15) rotate(5deg); }
          }
        `}</style>
      </button>
    </>
  );
}
