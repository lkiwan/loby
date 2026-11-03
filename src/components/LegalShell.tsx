import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LobbyFooter from '@/components/landing/LobbyFooter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

/* Store legal shell (redesign port of contact/privacy/terms-store):
   square back button + wordmark top bar, gold Darija title, update line,
   dim intro, one panel card per section (pages pass .legal-card blocks),
   legal links row with the current page in lime. Text content unchanged. */
const LEGAL_LINKS = [
  { href: '/privacy', title: 'سياسة الخصوصية' },
  { href: '/terms', title: 'شروط الاستخدام' },
  { href: '/contact', title: 'تواصل معانا' },
];

export default async function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div className="relative min-h-dvh text-white" style={{ background: 'var(--bg)' }}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_85%_0%,rgba(124,58,237,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_10%_100%,rgba(225,29,72,0.07),transparent_55%)]" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-5 sm:px-6">
        <Link
          href="/"
          className="grid h-10 w-10 place-items-center rounded-[13px] border transition active:scale-95"
          style={{ background: 'var(--panel2)', borderColor: 'var(--line)', color: '#EDEDF2' }}
          title="ارجع للساحة"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="font-cairo text-[13px] font-black tracking-[1.5px]" dir="ltr" style={{ color: 'var(--dim)' }}>
          PLAY<span style={{ color: 'var(--lime)' }}>M3ANA</span>
        </span>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <h1 className="font-cairo text-[22px] font-black" style={{ color: 'var(--gold)' }}>{title}</h1>
        {subtitle && (
          <p className="mt-1.5 font-cairo text-[12px] font-semibold" style={{ color: 'var(--dim)' }}>{subtitle}</p>
        )}
        <div className="legal-body mt-6 flex flex-col gap-3.5 font-cairo text-[14px] font-semibold leading-[1.8]" style={{ color: '#CFCFE0' }}>
          {children}
        </div>

        {/* Legal links row (preview .links — current page in lime) */}
        <nav className="mt-8 flex items-center justify-center gap-6 font-cairo text-[13px] font-black">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition hover:opacity-80"
              style={{ color: l.title === title ? 'var(--lime)' : 'var(--dim)' }}
            >
              {l.title}
            </Link>
          ))}
        </nav>

        <div className="mt-12">
          <LobbyFooter isAuthed={!!session?.user} username={session?.user?.username} />
        </div>
      </main>
    </div>
  );
}
