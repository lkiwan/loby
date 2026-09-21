import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Guard for admin pages. Redirects to the admin login if the visitor is
 * anonymous, and away to /login if the session does not belong to an
 * active ADMIN account. Returns the admin user when authorized.
 */
export async function requireAdminUser() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/admin/login');
  }
  return admin;
}

/**
 * Returns the authenticated ADMIN user or null. Used by API routes to gate
 * admin-only operations (role + ACTIVE status are checked against the DB).
 */
export async function getAdminUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== 'ACTIVE' || user.role !== 'ADMIN') return null;

  return user;
}