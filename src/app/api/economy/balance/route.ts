import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { backfillLedger, levelFromXp } from '@/lib/ledger';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await backfillLedger(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const level = user.xp > 0 ? levelFromXp(user.xp) : user.level;

  return NextResponse.json({
    coins: user.coins,
    tickets: user.tickets,
    xp: user.xp,
    level,
    streak: user.streakCount,
    longestStreak: user.longestStreak,
    referralCode: user.referralCode,
  });
}