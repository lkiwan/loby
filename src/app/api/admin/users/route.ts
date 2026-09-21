import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

const userSelect = {
  id: true,
  username: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  coins: true,
  tickets: true,
  xp: true,
  level: true,
  referralCode: true,
  createdAt: true,
  lastSeenAt: true,
  _count: { select: { sessions: true, devices: true, adImpressions: true } },
  accounts: { select: { provider: true } },
} as const;

export type AdminUserRow = {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: 'PLAYER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'FROZEN' | 'BANNED';
  coins: number;
  tickets: number;
  xp: number;
  level: number;
  referralCode: string | null;
  createdAt: Date;
  lastSeenAt: Date | null;
  _count: { sessions: number; devices: number; adImpressions: number };
  accounts: { provider: string }[];
};

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: userSelect,
  });

  return NextResponse.json({ users });
}