import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ensureAssignments } from '@/lib/missions';
import { casablancaDay } from '@/lib/time';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  await ensureAssignments(userId);

  const assignments = await prisma.missionAssignment.findMany({
    where: { userId, expiresAt: { gte: new Date() } },
    include: {
      template: {
        select: { kind: true, titleAr: true, target: true, rewardCoins: true, rewardXp: true },
      },
    },
    orderBy: [{ claimedAt: 'asc' }, { template: { rewardCoins: 'desc' } }],
  });

  return NextResponse.json({
    day: casablancaDay(),
    missions: assignments.map((a) => ({
      id: a.id,
      kind: a.template.kind,
      titleAr: a.template.titleAr,
      target: a.template.target,
      progress: a.progress,
      rewardCoins: a.template.rewardCoins,
      rewardXp: a.template.rewardXp ?? 0,
      periodKey: a.periodKey,
      claimed: Boolean(a.claimedAt),
      canClaim: a.progress >= a.template.target && !a.claimedAt,
    })),
  });
}