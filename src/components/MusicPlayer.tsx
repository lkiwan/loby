'use client';

import { useEffect, useRef, useState } from 'react';

/* ── D Bayati maqam · 110 BPM · Gaming × Darbouka × Kamanja ── */
const BPM  = 110;
const STEP = 60 / BPM / 4;
const BASS = [146.83,155.56,174.61,196.00,220.00,233.08,261.63,293.66];
const KAM  = [293.66,311.13,349.23,392.00,440.00,466.16,523.25,587.33];
const P_DOUM=[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0];
const P_TEK =[0,0,0,1,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,1];
const P_KA  =[0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,1];
const P_SAG =[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1];
const P_BASS=[0,-1,-1,-1,-1,2,-1,-1,3,-1,-1,-1,2,-1,-1,-1,4,-1,-1,-1,-1,3,-1,-1,2,-1,-1,-1,0,-1,-1,-1];
const P_KAM =[0,-1,-1,-1,2,-1,-1,-1,4,-1,-1,-1,3,-1,-1,-1,2,-1,-1,-1,1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1];

const LS_MUTED  = 'pm3_muted';
const LS_SPLASH = 'pm3_splash';

export default function MusicPlayer() {
  const [playing,    setPlaying]    = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashIn,   setSplashIn]   = useState(false);
  const [splashOut,  setSplashOut]  = useState(false);

  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef  = useRef<number>(0);
  const stepRef   = useRef(0);
  const nextRef   = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  /* ── Particle canvas ── */
  useEffect(() => {
    if (!showSplash || !canvasRef.current) return;
    const cv = canvasRef.current;
    const ctx2 = cv.getContext('2d')!;
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type P = { x:number; y:number; vx:number; vy:number; life:number; max:number; r:number; hue:number };
    const ps: P[] = [];
    let frame = 0;

    function spawn() {
      const x = cv.width * 0.5 + (Math.random() - 0.5) * cv.width * 0.9;
      ps.push({
        x, y: cv.height + 8,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(Math.random() * 2.5 + 1.2),
        life: 0, max: Math.random() * 90 + 70,
        r: Math.random() * 2.5 + 0.8,
        hue: Math.random() < 0.7 ? 42 : 22,
      });
    }

    function draw() {
      ctx2.clearRect(0, 0, cv.width, cv.height);
      if (frame % 2 === 0) spawn();
      if (frame % 7 === 0) spawn(); // burst second particle
      frame++;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.12;
        const a = (1 - p.life / p.max) * 0.85;
        // glow
        const grd = ctx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grd.addColorStop(0, `hsla(${p.hue},100%,65%,${a})`);
        grd.addColorStop(1, `hsla(${p.hue},100%,65%,0)`);
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx2.fillStyle = grd;
        ctx2.fill();
        // core dot
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2.fillStyle = `hsla(${p.hue},100%,85%,${a})`;
        ctx2.fill();
        if (p.life >= p.max) ps.splice(i, 1);
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [showSplash]);

  /* ── mount ── */
  useEffect(() => {
    const muted     = localStorage.getItem(LS_MUTED)   === '1';
    const seenSplash = localStorage.getItem(LS_SPLASH) === '1';
    if (!muted) {
      if (!seenSplash) {
        setShowSplash(true);
        requestAnimationFrame(() => setSplashIn(true));
      } else {
        const unlock = () => { startMusic(); rm(); };
        const rm = () => {
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
        };
        startMusic();
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock);
        return rm;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── audio ── */
  function buildCtx() {
    if (!ctxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      ctxRef.current = new AC() as AudioContext;
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = 0.55;
      masterRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }
  function startSequencer() {
    stepRef.current = 0;
    nextRef.current = ctxRef.current!.currentTime + 0.05;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, 25);
    setPlaying(true);
  }
  function startMusic() {
    buildCtx().resume().then(() => {
      if (ctxRef.current?.state === 'running') startSequencer();
    }).catch(() => {});
  }
  function stopMusic() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = 0; }
    masterRef.current?.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.25);
    setPlaying(false);
  }

  /* ── sound generators ── */
  function doum(t:number){const a=ctxRef.current!,m=masterRef.current!;const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(185,t);o.frequency.exponentialRampToValueAtTime(42,t+0.22);g.gain.setValueAtTime(1.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.24);o.connect(g);g.connect(m);o.start(t);o.stop(t+0.26);const s2=a.createOscillator(),g2=a.createGain();s2.frequency.setValueAtTime(50,t);s2.frequency.exponentialRampToValueAtTime(26,t+0.18);g2.gain.setValueAtTime(0.75,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.20);s2.connect(g2);g2.connect(m);s2.start(t);s2.stop(t+0.22);}
  function tek(t:number){const a=ctxRef.current!,m=masterRef.current!;const len=Math.ceil(a.sampleRate*0.045);const buf=a.createBuffer(1,len,a.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();src.buffer=buf;fl.type='bandpass';fl.frequency.value=5000;fl.Q.value=2;g.gain.setValueAtTime(0.9,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.045);src.connect(fl);fl.connect(g);g.connect(m);src.start(t);const o=a.createOscillator(),og=a.createGain();o.frequency.value=900;og.gain.setValueAtTime(0.25,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.02);o.connect(og);og.connect(m);o.start(t);o.stop(t+0.025);}
  function ka(t:number){const a=ctxRef.current!,m=masterRef.current!;const len=Math.ceil(a.sampleRate*0.028);const buf=a.createBuffer(1,len,a.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();src.buffer=buf;fl.type='highpass';fl.frequency.value=3800;g.gain.setValueAtTime(0.45,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.028);src.connect(fl);fl.connect(g);g.connect(m);src.start(t);}
  function sagat(t:number){const a=ctxRef.current!,m=masterRef.current!;[1760,2640,3520].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.055-i*0.014,t+0.002);g.gain.exponentialRampToValueAtTime(0.001,t+0.06+i*0.015);o.connect(g);g.connect(m);o.start(t);o.stop(t+0.09);});}
  function bass(freq:number,t:number){const a=ctxRef.current!,m=masterRef.current!;const o=a.createOscillator(),fl=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o.frequency.value=freq;fl.type='lowpass';fl.frequency.value=900;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.38,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+STEP*3.6);o.connect(fl);fl.connect(g);g.connect(m);o.start(t);o.stop(t+STEP*4);}
  function kamanja(freq:number,t:number){const a=ctxRef.current!,m=masterRef.current!;const dur=STEP*3.6;const o=a.createOscillator(),fl=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o.frequency.value=freq;const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=5.5;lg.gain.value=freq*0.011;lfo.connect(lg);lg.connect(o.frequency);fl.type='lowpass';fl.frequency.value=freq*3.2;fl.Q.value=1.1;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.22,t+0.1);g.gain.setValueAtTime(0.22,t+dur-0.08);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(fl);fl.connect(g);g.connect(m);lfo.start(t);o.start(t);lfo.stop(t+dur+0.05);o.stop(t+dur+0.05);}

  function tick(){const a=ctxRef.current;if(!a)return;const now=a.currentTime;while(nextRef.current<now+0.15){const s=stepRef.current,t=nextRef.current;if(P_DOUM[s])doum(t);if(P_TEK[s])tek(t);if(P_KA[s])ka(t);if(P_SAG[s])sagat(t);const bi=P_BASS[s];if(bi>=0)bass(BASS[bi],t);const ki=P_KAM[s];if(ki>=0)kamanja(KAM[ki],t);nextRef.current+=STEP;stepRef.current=(s+1)%32;}}

  function onSplashClick() {
    setSplashOut(true);
    setTimeout(() => { setShowSplash(false); setSplashOut(false); setSplashIn(false); }, 700);
    localStorage.setItem(LS_SPLASH, '1');
    startMusic();
  }

  function toggle() {
    if (playing) { localStorage.setItem(LS_MUTED,'1'); stopMusic(); }
    else {
      localStorage.removeItem(LS_MUTED);
      masterRef.current?.gain.cancelScheduledValues(0);
      masterRef.current?.gain.setValueAtTime(0.55, ctxRef.current!.currentTime);
      startSequencer();
    }
  }

  const splashOpacity = splashOut ? 0 : splashIn ? 1 : 0;
  const splashScale   = splashOut ? 1.04 : splashIn ? 1 : 0.97;

  return (
    <>
      {/* ══════════════ EPIC SPLASH SCREEN ══════════════ */}
      {showSplash && (
        <div
          onClick={onSplashClick}
          style={{
            position:'fixed', inset:0, zIndex:99999,
            cursor:'pointer', overflow:'hidden',
            background:'radial-gradient(ellipse at 50% 60%, #0a1628 0%, #040810 60%, #020408 100%)',
            opacity: splashOpacity,
            transform: `scale(${splashScale})`,
            transition: splashOut
              ? 'opacity 0.65s ease, transform 0.65s ease'
              : 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Particle canvas */}
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }} />

          {/* Scan line sweep */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            background:'linear-gradient(to bottom, transparent 50%, rgba(232,180,48,0.018) 50%)',
            backgroundSize:'100% 4px',
            animation:'scanScroll 8s linear infinite',
            zIndex:1,
          }} />

          {/* 4 corner brackets */}
          {(['tl','tr','bl','br'] as const).map(c => (
            <div key={c} style={{
              position:'absolute',
              top:    c.startsWith('t') ? 20 : undefined,
              bottom: c.startsWith('b') ? 20 : undefined,
              left:   c.endsWith('l')   ? 20 : undefined,
              right:  c.endsWith('r')   ? 20 : undefined,
              width:40, height:40,
              borderTop:    c.startsWith('t') ? '2px solid rgba(232,180,48,0.55)' : undefined,
              borderBottom: c.startsWith('b') ? '2px solid rgba(232,180,48,0.55)' : undefined,
              borderLeft:   c.endsWith('l')   ? '2px solid rgba(232,180,48,0.55)' : undefined,
              borderRight:  c.endsWith('r')   ? '2px solid rgba(232,180,48,0.55)' : undefined,
              animation:'cornerFade 2s ease-in-out infinite alternate',
              zIndex:2,
            }} />
          ))}

          {/* Center content */}
          <div style={{
            position:'relative', zIndex:3,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            height:'100%', gap:'0',
          }}>

            {/* Outer spinning ring */}
            <div style={{
              position:'relative',
              width:220, height:220,
              borderRadius:'50%',
              background:'conic-gradient(from 0deg, transparent 0%, rgba(232,180,48,0.9) 20%, rgba(194,52,26,0.7) 40%, transparent 55%, rgba(232,180,48,0.5) 75%, transparent 100%)',
              animation:'ringRotate 3s linear infinite',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 60px rgba(232,180,48,0.25)',
            }}>
              {/* Inner dark circle */}
              <div style={{
                width:206, height:206,
                borderRadius:'50%',
                background:'radial-gradient(circle at 50% 50%, #0d1c38 0%, #040810 70%)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:4,
              }}>
                {/* Logo */}
                <div style={{
                  fontFamily:'var(--font-grit),sans-serif',
                  fontSize:'22px', fontWeight:900,
                  color:'#E8B430',
                  letterSpacing:'0.08em',
                  textShadow:'0 0 20px rgba(232,180,48,0.9), 0 0 40px rgba(232,180,48,0.5)',
                  animation:'glitch 5s ease-in-out infinite',
                  lineHeight:1,
                }}>
                  PLAYM3ANA
                </div>
                {/* Divider */}
                <div style={{
                  width:100, height:1,
                  background:'linear-gradient(to right, transparent, rgba(232,180,48,0.7), transparent)',
                  margin:'6px 0',
                }} />
                {/* Arabic */}
                <div style={{
                  fontFamily:'var(--font-lalezar),sans-serif',
                  fontSize:'15px',
                  color:'rgba(245,231,206,0.85)',
                  letterSpacing:'0.04em',
                  textShadow:'0 0 12px rgba(232,180,48,0.5)',
                  animation:'arabicGlow 2.5s ease-in-out infinite alternate',
                }}>
                  بلاصة اللعب
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div style={{ height:40 }} />

            {/* Tap to enter CTA */}
            <div style={{
              display:'flex', flexDirection:'column',
              alignItems:'center', gap:6,
              animation:'ctaPulse 1.5s ease-in-out infinite alternate',
            }}>
              <div style={{
                padding:'14px 40px',
                border:'1.5px solid rgba(232,180,48,0.7)',
                borderRadius:'4px',
                background:'rgba(232,180,48,0.08)',
                boxShadow:'0 0 24px rgba(232,180,48,0.2), inset 0 0 20px rgba(232,180,48,0.05)',
                display:'flex', flexDirection:'column',
                alignItems:'center', gap:4,
              }}>
                <span style={{
                  fontFamily:'var(--font-cairo),sans-serif',
                  fontSize:'22px', fontWeight:800,
                  color:'#E8B430',
                  letterSpacing:'0.06em',
                  textShadow:'0 0 16px rgba(232,180,48,0.8)',
                }}>
                  اضغط للدخول
                </span>
                <span style={{
                  fontFamily:'var(--font-grit),sans-serif',
                  fontSize:'11px', fontWeight:400,
                  color:'rgba(232,180,48,0.5)',
                  letterSpacing:'0.25em',
                  textTransform:'uppercase',
                }}>
                  tap anywhere to enter
                </span>
              </div>

              {/* Animated dots */}
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:6, height:6, borderRadius:'50%',
                    background:'rgba(232,180,48,0.6)',
                    animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes ringRotate  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes glitch {
              0%,85%,100% {
                text-shadow: 0 0 20px rgba(232,180,48,0.9), 0 0 40px rgba(232,180,48,0.5);
                transform: translate(0);
              }
              86% { transform: translate(-3px,0); text-shadow: 3px 0 rgba(255,20,60,0.8), -3px 0 rgba(0,220,255,0.8); }
              87% { transform: translate(3px,0);  text-shadow: -3px 0 rgba(255,20,60,0.8), 3px 0 rgba(0,220,255,0.8); }
              88% { transform: translate(0,-2px); clip-path: inset(30% 0 40% 0); }
              89% { transform: translate(-2px,0); clip-path: inset(60% 0 10% 0); }
              90% { transform: translate(0); clip-path: none; text-shadow: 0 0 20px rgba(232,180,48,0.9), 0 0 40px rgba(232,180,48,0.5); }
            }
            @keyframes arabicGlow {
              from { text-shadow: 0 0 8px rgba(232,180,48,0.3);  color: rgba(245,231,206,0.7); }
              to   { text-shadow: 0 0 18px rgba(232,180,48,0.8); color: rgba(245,231,206,1);   }
            }
            @keyframes ctaPulse {
              from { transform: scale(1);    opacity: 0.85; }
              to   { transform: scale(1.03); opacity: 1;    }
            }
            @keyframes dotBounce {
              0%,100% { transform: translateY(0);    opacity: 0.4; }
              50%      { transform: translateY(-6px); opacity: 1;   }
            }
            @keyframes cornerFade {
              from { opacity: 0.3; }
              to   { opacity: 0.9; }
            }
            @keyframes scanScroll {
              from { background-position: 0 0; }
              to   { background-position: 0 100vh; }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════ MUTE / UNMUTE BUTTON ══════════════ */}
      {!showSplash && (
        <button
          onClick={toggle}
          aria-label={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          style={{
            position:'fixed', bottom:'80px', left:'16px', zIndex:9999,
            display:'flex', alignItems:'center', gap:'6px',
            padding:'8px 14px', borderRadius:'999px',
            border: playing ? '1px solid rgba(232,180,48,0.55)' : '1px solid rgba(232,180,48,0.22)',
            background: playing
              ? 'linear-gradient(135deg,rgba(232,180,48,0.20),rgba(194,52,26,0.16))'
              : 'rgba(6,8,16,0.88)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            color: playing ? '#E8B430' : 'rgba(245,231,206,0.60)',
            fontSize:'13px', fontFamily:'var(--font-cairo),sans-serif', fontWeight:600,
            cursor:'pointer',
            boxShadow: playing
              ? '0 0 16px rgba(232,180,48,0.28),0 3px 10px rgba(0,0,0,0.55)'
              : '0 3px 8px rgba(0,0,0,0.45)',
            transition:'background 0.3s,color 0.3s,border-color 0.3s,box-shadow 0.3s',
            userSelect:'none', WebkitTapHighlightColor:'transparent',
          }}
        >
          <span style={{ fontSize:'16px', display:'inline-block', animation: playing ? 'mBounce 0.7s ease-in-out infinite alternate' : 'none' }}>
            {playing ? '🎵' : '🔇'}
          </span>
          <span style={{ fontSize:'12px' }}>{playing ? 'موسيقى' : 'صامت'}</span>
          <span style={{
            width:'7px', height:'7px', borderRadius:'50%',
            background: playing ? '#E8B430' : 'rgba(245,231,206,0.28)',
            boxShadow: playing ? '0 0 7px #E8B430' : 'none',
            flexShrink:0, transition:'background 0.3s,box-shadow 0.3s',
          }} />
          <style>{`@keyframes mBounce{from{transform:scale(1) rotate(-4deg)}to{transform:scale(1.18) rotate(4deg)}}`}</style>
        </button>
      )}
    </>
  );
}
