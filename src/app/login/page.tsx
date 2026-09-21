'use client';

import { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Eye, EyeOff, Loader2, Lock, LogIn, User } from 'lucide-react';
import AuthShell, { AuthCardShell } from '@/components/AuthShell';
import GoogleIcon from '@/components/GoogleIcon';

function authErrorText(code: string | null): string | null {
  if (!code) return null;
  switch (code) {
    case 'account_exists':
      return 'هذا الإيميل مسجل بحساب بكلمة سر. دخل بكلمة السر ديالك أو سجّل بحساب آخر.';
    case 'gmail_only':
      return 'Gmail فقط مسموح للدخول بـ Google. جرب بحساب Gmail آخر أو دخل بكلمة السر.';
    case 'CredentialsSignin':
    case 'invalid_credentials':
    case 'invalid_password':
      return 'الاسم أو كلمة السر غلطين 😬';
    case 'account_banned':
      return 'هذا الحساب موقوف. تواصل مع الدعم.';
    case 'account_frozen':
      return 'هذا الحساب متجمد مؤقتاً. جرب من بعد شوية.';
    case 'OAuthAccountNotLinked':
      return 'هذا الإيميل مربوط بحساب آخر. دخل بكلمة السر أو جرب حساب Gmail آخر.';
    case 'redirect_uri_mismatch':
      return 'مشكل في إعدادات Google. جرب من بعد شوية.';
    default:
      return code;
  }
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = manualError ?? authErrorText(searchParams.get('error'));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setManualError(null);
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      username: username.trim(),
      password,
    });
    setLoading(false);

    if (res?.error) {
      setManualError(authErrorText(res.error));
    } else {
      const session = await getSession();
      router.replace(session?.user?.role === 'ADMIN' ? '/admin' : '/');
    }
  };

  const handleGoogleLogin = () => {
    setManualError(null);
    signIn('google', { callbackUrl: '/auth/callback' });
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
            onChange={(e) => setUsername(e.target.value.trim())}
            className="field pl-11"
            placeholder="الاسم أو Gmail ديالك"
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
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
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