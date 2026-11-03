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
      return 'هاد الإيميل ديجا مقيد بمودپاس. دخل بالمودپاس ديالك ولا صاوب كونط ب إيميل آخر.';
    case 'gmail_only':
      return 'غير Gmail لي خدام باش تدخل بـ Google. جرب شي Gmail آخر ولا دخل بالمودپاس.';
    case 'CredentialsSignin':
    case 'invalid_credentials':
    case 'invalid_password':
      return 'السمية ولا المودپاس غالطين 😬';
    case 'account_banned':
      return 'هاد الكونط مبلوكي. هضر مع الدعم.';
    case 'account_frozen':
      return 'هاد الكونط مسدود دابا. عاود جرب من بعد.';
    case 'OAuthAccountNotLinked':
      return 'هاد الإيميل مربوط بكونط آخر. دخل بالمودپاس ولا جرب شي Gmail آخر.';
    case 'redirect_uri_mismatch':
      return 'مشكل فإعدادات Google. عاود جرب من بعد.';
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
  const play = searchParams.get('play');

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
      const play = searchParams.get('play');
      const method = searchParams.get('method');
      router.replace(play
        ? `/?play=${play}&method=${method === 'ad' ? 'ad' : 'coins'}`
        : session?.user?.role === 'ADMIN' ? '/admin' : '/');
    }
  };

  const handleGoogleLogin = () => {
    setManualError(null);
    const play = searchParams.get('play');
    signIn('google', {
      callbackUrl: play
        ? `/auth/callback?play=${play}&method=${searchParams.get('method') === 'ad' ? 'ad' : 'coins'}`
        : '/auth/callback',
    });
  };

  return (
    <>
      {/* Head (preview: wordmark head above the card) */}
      <div className="anim-fadeup mb-6 text-center">
        <h1 className="font-lalezar text-[26px] leading-snug text-white">مرحبا بك عاوتاني 👋</h1>
        <p className="mt-1.5 font-cairo text-[13px] font-semibold" style={{ color: 'var(--dim)' }}>
          دخل باش تلقى الكوينز ديالك وتكمل منين حبستي.
        </p>
      </div>

      <AuthCardShell>
        {play && (
          <div
            className="mb-5 rounded-xl px-3.5 py-3 text-center font-cairo text-[12.5px] font-bold"
            style={{ border: '1.5px dashed rgba(255,201,60,0.45)', background: 'rgba(255,201,60,0.07)', color: '#FFD97A' }}
          >
            ملي تدخل غادي ترجع للطبلة لي خترتي 🎮
          </div>
        )}

        {/* Google first (preview order) — Gmail only */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-google w-full py-3.5 text-[15px]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          <span className="font-cairo font-semibold">كمّل بـ Google (غير Gmail)</span>
        </button>
        <p className="mt-2.5 text-center font-cairo text-[11.5px] font-semibold" style={{ color: 'var(--dim)' }}>
          غير Gmail لي خدام باش تدخل بـ Google
        </p>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
          <span className="font-cairo text-[11px] font-black" style={{ color: 'var(--dim)' }}>
            ولا
          </span>
          <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
        </div>

        {error && (
          <div className="store-msg store-msg-err anim-shake mb-5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF8FA3]" />
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div>
            <label className="store-label" htmlFor="login-username">السمية ولا Gmail ديالك</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                className="store-field pl-11"
                placeholder="السمية ولا Gmail ديالك"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="store-label" htmlFor="login-password">المودپاس</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="store-field pl-11 pr-14"
                placeholder="المودپاس"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[11px] transition"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--dim)' }}
                aria-label={showPw ? 'خبي المودپاس' : 'بيّن المودپاس'}
              >
                {showPw ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-lime mt-1 w-full py-[15px] font-cairo text-[15px]">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            دخل
          </button>
        </form>

        <p className="mt-6 text-center font-cairo text-[12.5px] font-semibold" style={{ color: 'var(--dim)' }}>
          جديد معانا؟{' '}
          <Link href="/register" className="font-black hover:underline" style={{ color: 'var(--lime)' }}>
            صاوب كونط — فابور
          </Link>
        </p>
      </AuthCardShell>

      <p className="anim-fadeup d2 mt-5 text-center font-cairo text-[12px] font-semibold" style={{ color: 'var(--dim)' }}>
        بلا حساب؟ <Link href="/" className="font-black hover:underline" style={{ color: 'var(--lime)' }}>شوف الطبلات هوما اللولين</Link>
      </p>
    </>
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
