'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Eye, EyeOff, Loader2, Lock, ShieldCheck, Mail } from 'lucide-react';
import AuthShell, { AuthCardShell } from '@/components/AuthShell';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username: email.trim(),
        password,
      });

      if (res?.error) {
        setLoading(false);
        setError('Email ou mot de passe incorrect.');
        return;
      }

      const session = await getSession();
      const isAdmin = session?.user?.role === 'ADMIN';

      if (!isAdmin) {
        await signOut({ redirect: false });
        setLoading(false);
        setError('Ce compte n’a pas les droits administrateur.');
        return;
      }

      router.replace('/admin');
    } catch {
      setLoading(false);
      setError('Erreur réseau — réessayez.');
    }
  };

  return (
    <AuthShell>
      <AuthCardShell>
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#c9a45c]/40 bg-[#221a10]">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="font-lalezar text-3xl text-neutral-50">Espace Admin</h1>
          <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-400">
            Accès réservé — email et mot de passe administrateur.
          </p>
        </div>

        {error && (
          <div className="anim-shake mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/60 px-3.5 py-3 font-cairo text-[13px] font-bold text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field pl-11"
              placeholder="admin@exemple.com"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pl-11 pr-12"
              placeholder="Mot de passe"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-200"
              aria-label={showPw ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-chunk btn-amber mt-1 w-full py-3.5 text-[15px]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
            Connexion Admin
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 block text-center font-cairo text-[12px] font-semibold text-neutral-500 transition hover:text-amber-400"
        >
          ← Retour à la salle
        </Link>
      </AuthCardShell>
    </AuthShell>
  );
}