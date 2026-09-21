'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Loader2, LogOut } from 'lucide-react';

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <button onClick={handle} disabled={busy} className="btn-chunk btn-blood px-4 py-2 text-[12px]">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      Déconnexion
    </button>
  );
}