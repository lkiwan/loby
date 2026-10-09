'use client';

import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';

const MusicPlayer = dynamic(() => import('@/components/MusicPlayer'), { ssr: false });

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <MusicPlayer />
    </SessionProvider>
  );
}
