'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      router.replace(session?.user?.role === 'ADMIN' ? '/admin' : '/');
    });
  }, [router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-[#0d0b08]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/50 border-t-transparent" />
    </div>
  );
}