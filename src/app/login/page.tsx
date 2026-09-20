'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Eye, EyeOff, Loader2, Lock, LogIn, User } from 'lucide-react';
import AuthShell, { AuthCardShell } from '@/components/AuthShell';

export default function LoginPage() {
  const [username, setUsername] = useState('');
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

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    setLoading(false);

    if (res?.error) {
      setError(res.error === 'CredentialsSignin' ? 'الاسم أو كلمة السر غلطين 😬' : res.error);
    } else {
      router.push('/');
    }
  };

  return (
    <AuthShell>
      <AuthCardShell>
        <div className="text-center">
          <h1 className="font-lalezar text-3xl text-neutral-50">مرحبا بعودتك 👋</h1>
          <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-400">
            دخل باش تلقى عملاتك وتهز الطاولة منين حسبتي.
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
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field pl-11"
              placeholder="الاسم ديالك"
              autoComplete="username"
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
              placeholder="كلمة السر"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-200"
              aria-label={showPw ? 'خفي كلمة السر' : 'وري كلمة السر'}
            >
              {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-chunk btn-amber mt-1 w-full py-3.5 text-[15px]">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            دخول
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-cairo text-[11px] font-bold uppercase tracking-widest text-neutral-600">
            جديد؟
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Link
          href="/register"
          className="btn-chunk btn-ghost-hollow mt-4 w-full py-3 text-[14px]"
        >
          أنشئ حسابك — مجاني
        </Link>

        <p className="mt-4 text-center font-cairo text-[12px] font-semibold text-neutral-500">
          بلا حساب؟ <Link href="/" className="text-amber-400 hover:underline">شوف الطاولات أولاً</Link>
        </p>
      </AuthCardShell>
    </AuthShell>
  );
}