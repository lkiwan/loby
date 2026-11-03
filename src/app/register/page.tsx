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

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

const TEMP_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'fakeinbox.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'tempail.com', 'emailondeck.com', 'mintemail.com', 'spamgourmet.com',
  'findize.com',
];

function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
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
      setError('السمية خاص يكون فيها بين 3 و 20 حرف: غير حروف صغيرة، أرقام ولا _.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('الإيميل ضروري وخاصو يكون مكتوب مزيان (بحال name@example.com).');
      return;
    }
    if (isTempEmail(email)) {
      setError('الإيميلات المؤقتة ماخداماش. دير إيميل حقيقي.');
      return;
    }
    if (password.length < 6) {
      setError('المودپاس خاص يكون فيه 6 حروف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError('المودپاس والتأكيد ديالو ماشي بحال بحال.');
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
      setError(data.error || 'التسجيل ما دازش، عاود جرب.');
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
      {success ? (
        <AuthCardShell>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="anim-pop grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-emerald-400/50 bg-emerald-400/10" style={{ boxShadow: '0 0 32px rgba(52,211,153,0.25)' }}>
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>
            <h1 className="mt-5 font-lalezar text-[26px] text-white">تقيدتي بنجاح! 🎉</h1>
            <p className="mt-2 max-w-[16rem] font-cairo text-[13px] font-semibold leading-relaxed" style={{ color: 'var(--dim)' }}>
              كندخلوك... غادي نحولوك للصفحة الرئيسية.
            </p>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full w-full origin-left rounded-full bg-emerald-400/70"
                style={{ animation: 'fillBar 2.2s ease-out forwards' }}
              />
            </div>
          </div>
        </AuthCardShell>
      ) : (
        <>
          {/* Head */}
          <div className="anim-fadeup mb-6 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-cairo text-[11px] font-black text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              + كوينز كادو مع التسجيل
            </span>
            <h1 className="font-lalezar text-[26px] leading-snug text-white">صاوب كونط</h1>
            <p className="mt-1.5 font-cairo text-[13px] font-semibold" style={{ color: 'var(--dim)' }}>
              ثانية وحدة... وغنبداو الحومة.
            </p>
          </div>

          <AuthCardShell>
            {/* Google first (preview order) — Gmail only */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="btn-google w-full py-3.5 text-[15px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              <span className="font-cairo font-semibold">تقيد بـ Google (غير Gmail)</span>
            </button>
            <p className="mt-2.5 text-center font-cairo text-[11.5px] font-semibold" style={{ color: 'var(--dim)' }}>
              غير Gmail لي خدام باش تتقيد بـ Google
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

            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
              <div>
                <label className="store-label" htmlFor="reg-username">السمية ديالك</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
                  <input
                    id="reg-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="store-field pl-11"
                    placeholder="السمية ديالك (3-20 حرف)"
                    autoComplete="username"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                </div>
                <p className="store-hint">السمية خاص يكون فيها بين 3 و 20 حرف: غير حروف صغيرة، أرقام ولا _.</p>
              </div>

              <div>
                <label className="store-label" htmlFor="reg-email">الإيميل ديالك</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="store-field pl-11"
                    placeholder="الإيميل ديالك (ضروري)"
                    autoComplete="email"
                    required
                  />
                </div>
                <p className="store-hint">الإيميلات المؤقتة ماخداماش. دير إيميل حقيقي.</p>
              </div>

              <div>
                <label className="store-label" htmlFor="reg-password">المودپاس</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="store-field pl-11 pr-14"
                    placeholder="المودپاس (6+ حروف)"
                    autoComplete="new-password"
                    minLength={6}
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
                <p className="store-hint">المودپاس خاص يكون فيه 6 حروف على الأقل.</p>
              </div>

              <div>
                <label className="store-label" htmlFor="reg-confirm">عاود المودپاس</label>
                <div className="relative">
                  <Check className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
                  <input
                    id="reg-confirm"
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="store-field pl-11"
                    placeholder="عاود المودپاس"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="store-label" htmlFor="reg-referral">كود الدعوة (إيلا عندك)</label>
                <div className="relative">
                  <Gift className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: '#62627A' }} />
                  <input
                    id="reg-referral"
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="store-field pl-11"
                    placeholder="كود الدعوة (إيلا عندك)"
                    autoComplete="off"
                    maxLength={32}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-lime mt-1 w-full py-[15px] font-cairo text-[15px]">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                تقيد
              </button>
            </form>

            <p className="mt-6 text-center font-cairo text-[12.5px] font-semibold" style={{ color: 'var(--dim)' }}>
              ديجا عندك كونط؟{' '}
              <Link href="/login" className="font-black hover:underline" style={{ color: 'var(--lime)' }}>
                دخل من هنا
              </Link>
            </p>
          </AuthCardShell>
        </>
      )}
    </AuthShell>
  );
}
