'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Eye, EyeOff, Loader2, Lock, LogIn, User, Mail } from 'lucide-react';
import AuthShell, { AuthCardShell } from '@/components/AuthShell';

const googleSvg = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'account_exists') {
      setError('هذا الإيميل مسجل بحساب بكلمة سر. دخل بكلمة السر ديالك أو سجّل بحساب آخر.');
    } else if (err === 'gmail_only') {
      setError('Gmail فقط مسموح للدخول بـ Google. جرب بحساب Gmail آخر أو دخل بكلمة السر.');
    } else if (err === 'CredentialsSignin') {
      setError('الاسم أو كلمة السر غلطين 😬');
    } else if (err) {
      setError(err);
    }
  }, [searchParams]);

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

  const handleGoogleLogin = () => {
    setError(null);
    signIn('google', { callbackUrl: '/' });
  };

  return (
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
          أو
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-chunk btn-ghost-hollow mt-1 w-full py-3.5 text-[15px] flex items-center justify-center gap-2.5"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : googleSvg}
        <span className="font-cairo font-semibold">تابع بـ Google (Gmail فقط)</span>
      </button>

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
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthCardShell><div className="anim-pulse h-64" /></AuthCardShell>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}