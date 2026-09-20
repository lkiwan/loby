import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StarMark } from '@/components/Star';

export default function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scene min-h-dvh bg-[#0d0b08] text-[#f1e7d6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-6%,rgba(242,178,61,.14),transparent_42%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(0,0,0,.85),transparent_58%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-[#6b542e]/40 bg-[#171210]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#c9a45c]/40 bg-[#221a10] transition hover:border-amber-400/60"
            title="رجع للساحة"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <StarMark size={26} />
          <span className="font-grit text-[0.9rem] uppercase tracking-tight text-[#f1e7d6]">
            <span className="text-gold-sheen">DARJA</span> ARCADE
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <h1 className="font-lalezar text-4xl text-[#f5eddc] sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 font-cairo text-[13px] font-semibold text-[#a08a63]">{subtitle}</p>
        )}
        <div className="cork mt-8 rounded-2xl p-6 sm:p-8">
          <div className="space-y-5 font-cairo text-[14px] font-semibold leading-relaxed text-[#d8c39a]">
            {children}
          </div>
        </div>

        <p className="mt-6 text-center font-cairo text-[11px] font-bold text-[#7a6a4d]">
          DARJA ARCADE — مصنوعة بـ ❤️ فالمغرب 🇲🇦
        </p>
      </main>
    </div>
  );
}
