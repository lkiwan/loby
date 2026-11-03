'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Link from 'next/link';

/* Post-Google landing (redesign port of auth-callback-store): Store shell
   with a loading state while the session resolves, and an error state if
   the session fetch itself fails. Redirect logic unchanged. */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    getSession().then((session) => {
      const play = qs.get('play');
      router.replace(play
        ? `/?play=${play}&method=${qs.get('method') === 'ad' ? 'ad' : 'coins'}`
        : session?.user?.role === 'ADMIN' ? '/admin' : '/');
    }).catch(() => setFailed(true));
  }, [router]);

  return (
    <div className="relative grid min-h-dvh place-items-center text-white" style={{ background: 'var(--bg)' }}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_85%_0%,rgba(124,58,237,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_100%,rgba(225,29,72,0.1),transparent_55%)]" />
      </div>

      <div className="anim-fadeup relative z-10 flex w-full max-w-[340px] flex-col items-center px-6 text-center">
        <span className="font-cairo text-[17px] font-black tracking-[2px]" dir="ltr">
          PLAY<span style={{ color: 'var(--lime)' }}>M3ANA</span>
        </span>

        {failed ? (
          <>
            <div className="anim-pop mt-8 grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-[#F43F5E]/60 bg-[#F43F5E]/10 font-cairo text-[30px] font-black text-[#FF8FA3]" style={{ boxShadow: '0 0 32px rgba(244,63,94,0.25)' }}>
              !
            </div>
            <h1 className="mt-5 font-lalezar text-[24px] text-white">الدخول ما كملش</h1>
            <p className="mt-2 font-cairo text-[13px] font-semibold leading-relaxed" style={{ color: 'var(--dim)' }}>
              وقع مشكل ملي كنا كندخلوك. عاود جرب.
            </p>
            <Link href="/login" className="btn-lime mt-6 w-full py-3.5 font-cairo text-[14.5px]">
              عاود جرب
            </Link>
            <Link href="/register" className="btn-store-ghost mt-2.5 w-full py-3.5 font-cairo text-[14px]">
              صاوب كونط
            </Link>
          </>
        ) : (
          <>
            <div
              className="mt-8 h-12 w-12 animate-spin rounded-full border-[3px] border-t-transparent"
              style={{ borderColor: 'rgba(198,245,66,0.25)', borderTopColor: 'transparent' }}
            />
            <h1 className="mt-6 font-lalezar text-[22px] text-white">كنسجلو الدخول ديالك…</h1>
            <p className="mt-1.5 font-cairo text-[12.5px] font-semibold" style={{ color: 'var(--dim)' }}>
              ثواني وغادي تدخل للساحة.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
