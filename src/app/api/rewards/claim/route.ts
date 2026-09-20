import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { creditBalance, addXp } from '@/lib/ledger';
import { checkRate } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('claim', session.user.id, 20, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { assignmentId } = await req.json();
  if (!assignmentId) {
    return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 });
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
    return NextResponse.json({ error: 'Mission not complete' }, { status: 400 });
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