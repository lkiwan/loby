import Link from 'next/link';
import { requireAdminUser } from '@/lib/admin';
import { StarMark } from '@/components/Star';
import SignOutButton from '@/components/admin/AdminControls';
import UsersManager from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireAdminUser();

  return (
    <main className="min-h-dvh bg-[#0d0b08] px-4 py-6 text-[#f1e7d6] sm:px-6 lg:px-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StarMark size={36} />
          <div>
            <h1 className="font-grit text-lg uppercase tracking-wide">
              <span className="text-gold-sheen">PLAY</span><span className="text-[#7a9bd6]">M3ANA</span> — GESTION JOUEURS
            </h1>
            <p className="font-cairo text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-500">
              Profils · solde · rôles · statuts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="btn-chunk btn-ghost-hollow px-4 py-2 text-[12px]">
            ← Tableau de bord
          </Link>
          <SignOutButton />
        </div>
      </header>

      <UsersManager />
    </main>
  );
}