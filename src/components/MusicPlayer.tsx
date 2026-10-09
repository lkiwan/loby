'use client';

import { useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

/* ── D Bayati maqam · 110 BPM · Gaming × Darbouka × Kamanja ── */
const BPM  = 110;
const STEP = 60 / BPM / 4;
const BASS = [146.83,155.56,174.61,196.00,220.00,233.08,261.63,293.66];
const KAM  = [293.66,311.13,349.23,392.00,440.00,466.16,523.25,587.33];
const P_DOUM=[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0];
const P_TEK =[0,0,0,1,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,1];
const P_KA  =[0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,1];
const P_SAG =[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1];
const P_BASS=[0,-1,-1,-1,-1,2,-1,-1,3,-1,-1,-1,2,-1,-1,-1,4,-1,-1,-1,-1,3,-1,-1,2,-1,-1,-1,0,-1,-1,-1];
const P_KAM =[0,-1,-1,-1,2,-1,-1,-1,4,-1,-1,-1,3,-1,-1,-1,2,-1,-1,-1,1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1];

const LS_MUTED  = 'pm3_muted';

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const check = () => {
      const el = document.getElementById('music-portal');
      if (el !== portalTarget) setPortalTarget(el);
    };
    const t = setInterval(check, 1000);
    check();
    return () => clearInterval(t);
  }, [portalTarget]);

  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef  = useRef<number>(0);
  const stepRef   = useRef(0);
  const nextRef   = useRef(0);

  /* ── mount ── */
  useEffect(() => {
    const muted = localStorage.getItem(LS_MUTED) === '1';
    if (!muted) {
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

  function toggle() {
    if (playing) { localStorage.setItem(LS_MUTED,'1'); stopMusic(); }
    else {
      localStorage.removeItem(LS_MUTED);
      masterRef.current?.gain.cancelScheduledValues(0);
      masterRef.current?.gain.setValueAtTime(0.55, ctxRef.current!.currentTime);
      startSequencer();
    }
  }

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pm3_music_state', { detail: playing }));
  }, [playing]);

  useEffect(() => {
    const handleToggle = () => toggle();
    const handleReq = () => {
      window.dispatchEvent(new CustomEvent('pm3_music_state', { detail: playing }));
    };
    window.addEventListener('pm3_music_toggle', handleToggle);
    window.addEventListener('pm3_music_req', handleReq);
    return () => {
      window.removeEventListener('pm3_music_toggle', handleToggle);
      window.removeEventListener('pm3_music_req', handleReq);
    };
  }, [playing]);

  return (
    <>
      {/* ══════════════ MUTE / UNMUTE BUTTON ══════════════ */}
      {portalTarget ? createPortal(
        <button
          onClick={toggle}
          aria-label={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          style={{
            position:'relative', zIndex:40,
            display:'flex', alignItems:'center', gap:'6px',
            padding:'6px 12px', borderRadius:'999px',
            border: playing ? '1px solid rgba(232,180,48,0.55)' : '1px solid rgba(232,180,48,0.22)',
            background: playing
              ? 'linear-gradient(135deg,rgba(232,180,48,0.20),rgba(194,52,26,0.16))'
              : 'rgba(6,8,16,0.88)',
            backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            color: playing ? '#E8B430' : 'rgba(245,231,206,0.60)',
            fontSize:'12px', fontFamily:'var(--font-cairo),sans-serif', fontWeight:600,
            cursor:'pointer',
            boxShadow: playing
              ? '0 0 16px rgba(232,180,48,0.28),0 3px 10px rgba(0,0,0,0.55)'
              : '0 3px 8px rgba(0,0,0,0.45)',
            transition:'background 0.3s,color 0.3s,border-color 0.3s,box-shadow 0.3s',
            userSelect:'none', WebkitTapHighlightColor:'transparent',
          }}
        >
          <span style={{ fontSize:'14px', display:'inline-block', animation: playing ? 'mBounce 0.7s ease-in-out infinite alternate' : 'none' }}>
            {playing ? '🎵' : '🔇'}
          </span>
          <span style={{ fontSize:'11px' }}>{playing ? 'موسيقى' : 'صامت'}</span>
          <span style={{
            width:'6px', height:'6px', borderRadius:'50%',
            background: playing ? '#E8B430' : 'rgba(245,231,206,0.28)',
            boxShadow: playing ? '0 0 7px #E8B430' : 'none',
            flexShrink:0, transition:'background 0.3s,box-shadow 0.3s',
          }} />
          <style>{`@keyframes mBounce{from{transform:scale(1) rotate(-4deg)}to{transform:scale(1.18) rotate(4deg)}}`}</style>
        </button>,
        portalTarget
      ) : (
        <button
          onClick={toggle}
          aria-label={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          style={{
            position:'fixed', top:'10px', right:'58px', zIndex:40,
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
