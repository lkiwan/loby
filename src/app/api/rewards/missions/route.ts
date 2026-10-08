import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { ensureAssignments } from '@/lib/missions';
import { casablancaDay, casablancaDateAt } from '@/lib/time';

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

  const missionsList = assignments.map((a) => ({
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
  }));

  const startOfDay = casablancaDateAt(casablancaDay(), 0, 0, 0);
  const adEvents = await prisma.event.findMany({
    where: {
      userId,
      name: 'mission_claim',
      createdAt: { gte: startOfDay },
    },
    select: { props: true }
  });
  const adCount = adEvents.filter(e => (e.props as any)?.templateId === 'infinite-ad').length;

  if (adCount < 10) {
    missionsList.push({
      id: 'infinite-ad',
      kind: 'WATCH_N_ADS',
      titleAr: `تفرج ف إشهار و خذ 5 كوينز (${adCount}/10)`,
      target: 1,
      progress: 0,
      rewardCoins: 5,
      rewardXp: 0,
      periodKey: 'infinite',
      claimed: false,
      canClaim: true,
    });
  } else {
    missionsList.push({
      id: 'infinite-ad',
      kind: 'WATCH_N_ADS',
      titleAr: `تفرج ف إشهار و خذ 5 كوينز (10/10)`,
      target: 1,
      progress: 1,
      rewardCoins: 5,
      rewardXp: 0,
      periodKey: 'infinite',
      claimed: true,
      canClaim: false,
    });
  }

  return NextResponse.json({
    day: casablancaDay(),
    missions: missionsList,
  });
}