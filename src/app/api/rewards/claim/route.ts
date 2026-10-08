import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';
import { creditBalance, addXp } from '@/lib/ledger';
import { checkRate } from '@/lib/rateLimit';
import { bumpMission } from '@/lib/missions';
import { casablancaDay, casablancaDateAt } from '@/lib/time';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('claim', session.user.id, 20, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { assignmentId, adWatched } = await req.json();
  if (!assignmentId) {
    return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 });
  }

  if (assignmentId === 'infinite-ad') {
    if (!adWatched) {
      return NextResponse.json({ error: 'Mission not complete' }, { status: 400 });
    }
    
    const startOfDay = casablancaDateAt(casablancaDay(), 0, 0, 0);
    const adEvents = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        name: 'mission_claim',
        createdAt: { gte: startOfDay },
      },
      select: { props: true }
    });
    
    const adCount = adEvents.filter(e => (e.props as any)?.templateId === 'infinite-ad').length;
    if (adCount >= 10) {
      return NextResponse.json({ error: 'Daily ad limit reached' }, { status: 400 });
    }

    await creditBalance({
      userId: session.user.id,
      amount: 5,
      reason: 'AD_REWARD',
      idempotencyKey: `infinite-ad:${session.user.id}:${Date.now()}`,
      refType: 'AdImpression',
      refId: `infinite-${Date.now()}`,
    });
    
    await prisma.event.create({
      data: {
        name: 'mission_claim',
        userId: session.user.id,
        props: { templateId: 'infinite-ad', kind: 'WATCH_N_ADS' },
      },
    });
    return NextResponse.json({ success: true, rewardCoins: 5 });
  }

  const assignment = await prisma.missionAssignment.findUnique({
    where: { id: assignmentId },
    include: { template: true },
  });

  if (!assignment || assignment.userId !== session.user.id) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }

  if (assignment.claimedAt) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
  }

  if (assignment.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Mission expired' }, { status: 400 });
  }

  if (assignment.progress < assignment.template.target) {
    if (!adWatched) {
      return NextResponse.json({ error: 'Mission not complete' }, { status: 400 });
    }
    // Ad-watch path: bump WATCH_N_ADS missions normally; force-complete everything else
    await bumpMission(assignment.userId, 'WATCH_N_ADS', 1);
    await prisma.missionAssignment.update({
      where: { id: assignment.id },
      data: { progress: assignment.template.target },
    });
  }

  const key = `mission:${assignment.userId}:${assignment.templateId}:${assignment.periodKey}`;

  if (assignment.template.rewardCoins > 0) {
    await creditBalance({
      userId: assignment.userId,
      amount: assignment.template.rewardCoins,
      reason: 'MISSION_REWARD',
      idempotencyKey: key,
      refType: 'MissionAssignment',
      refId: assignment.id,
    });
  }
  if (assignment.template.rewardXp > 0) {
    await addXp(assignment.userId, assignment.template.rewardXp, assignment.id);
  }

  await prisma.missionAssignment.update({
    where: { id: assignment.id },
    data: { claimedAt: new Date() },
  });

  await prisma.event.create({
    data: {
      name: 'mission_claim',
      userId: assignment.userId,
      props: { templateId: assignment.templateId, kind: assignment.template.kind },
    },
  });

  return NextResponse.json({ success: true, rewardCoins: assignment.template.rewardCoins });
}