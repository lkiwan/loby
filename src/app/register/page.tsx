'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import AuthShell, { AuthCardShell } from '@/components/AuthShell';
import GoogleIcon from '@/components/GoogleIcon';

const TEMP_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'fakeinbox.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'tempail.com', 'emailondeck.com', 'mintemail.com', 'spamgourmet.com',
];

function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
}

function isGmail(email: string): boolean {
  return email.toLowerCase().endsWith('@gmail.com');
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError('الاسم خاصو يكون 3 حتى 20 حرف: حروف صغيرة، أرقام أو _ فقط.');
      return;
    }
    if (!isGmail(email)) {
      setError('Gmail فقط مسموح (@gmail.com).');
      return;
    }
    if (isTempEmail(email)) {
      setError('الإيميلات المؤقتة ممنوعة.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة السر خاصها تكون على الأقل 6 حروف.');
      return;
    }
    if (password !== confirm) {
      setError('كلمة السر والتأكيد ما تساواش.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        referralCode: referralCode.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'ما نجحش التسجيل، جرب مرة أخرى.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    const signInRes = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    if (!signInRes?.error) {
      window.setTimeout(() => router.push('/'), 1200);
    } else {
      window.setTimeout(() => router.push('/login'), 1200);
    }
  };

  const handleGoogleRegister = () => {
    if (loading) return;
    setError(null);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <AuthShell>
      <AuthCardShell accent="teal">
        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="anim-pop grid h-16 w-16 place-items-center rounded-full border-2 border-emerald-400/40 bg-emerald-400/10">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>
            <h1 className="mt-5 font-lalezar text-3xl text-neutral-50">تم التسجيل! 🎉</h1>
            <p className="mt-2 max-w-[16rem] font-cairo text-[13px] font-semibold leading-relaxed text-neutral-400">
              كنديرو دخول تلقائي… كنرحّلو للرئيسية.
            </p>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full w-full origin-left rounded-full bg-emerald-400/70"
                style={{ animation: 'fillBar 2.2s ease-out forwards' }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-cairo text-[11px] font-black text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                + عملات هدية على السجيل
              </span>
              <h1 className="font-lalezar text-3xl text-neutral-50">أنشئ حسابك</h1>
              <p className="mt-1.5 font-cairo text-[13px] font-semibold text-neutral-400">
                ثانية وحدة … وغادي نبداو الحومة.
              </p>
            </div>

            {error && (
              <div className="anim-shake mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/60 px-3.5 py-3 font-cairo text-[13px] font-bold text-red-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                {error}
              </div>
            )}

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleRegister}>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="field field-teal pl-11"
                  placeholder="الاسم ديالك (3-20 حرف)"
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="field field-teal pl-11"
                  placeholder="Gmail فقط (example@gmail.com)"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field field-teal pl-11 pr-12"
                  placeholder="كلمة السر (6+ حروف)"
                  autoComplete="new-password"
                  minLength={6}
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

              <div className="relative">
                <Check className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="field field-teal pl-11"
                  placeholder="أكد كلمة السر"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div className="relative">
                <Gift className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="field field-teal pl-11"
                  placeholder="كود الدعوة (اختياري)"
                  autoComplete="off"
                  maxLength={32}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-chunk btn-teal mt-1 w-full py-3.5 text-[15px]">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                سجيل
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
              onClick={handleGoogleRegister}
              disabled={loading}
              className="btn-chunk btn-ghost-hollow mt-1 w-full py-3.5 text-[15px] flex items-center justify-center gap-2.5"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              <span className="font-cairo font-semibold">سجّل بـ Google (Gmail فقط)</span>
            </button>

            <p className="mt-5 text-center font-cairo text-[12.5px] font-semibold text-neutral-500">
              عندك أصلاً حساب؟{' '}
              <Link href="/login" className="text-emerald-300 hover:underline">
                دخل من هنا
              </Link>
            </p>
          </>
        )}
      </AuthCardShell>
    </AuthShell>
  );
}
