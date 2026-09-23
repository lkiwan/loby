import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { casablancaDay, casablancaWeek, casablancaDateAt, shiftCasablanca } from '@/lib/time';
import type { MissionKind, Prisma } from '@prisma/client';

async function weightedPick<T extends { id: string; weight: number }>(items: T[]): Promise<T | null> {
  if (items.length === 0) return null;
  const total = items.reduce((s, i) => s + Math.max(1, i.weight), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(1, item.weight);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export async function ensureAssignments(userId: string): Promise<number> {
  const cfg = await getConfig();
  const dailyKey = casablancaDay();
  const weeklyKey = casablancaWeek();

  const existing = await prisma.missionAssignment.findMany({
    where: { userId, periodKey: { in: [dailyKey, weeklyKey] } },
  });

  const hasDaily = existing.some((a) => a.periodKey === dailyKey);
  const hasWeekly = existing.some((a) => a.periodKey === weeklyKey);

  let created = 0;

  if (!hasDaily) {
    const templates = await prisma.missionTemplate.findMany({ where: { isActive: true, cadence: 'DAILY' } });
    const picks: string[] = [];
    const pool = [...templates];
    for (let i = 0; i < cfg.missionDailyCount; i += 1) {
      const pick = await weightedPick(pool);
      if (!pick) break;
      picks.push(pick.id);
      pool.splice(pool.indexOf(pick), 1);
    }
    const data: Prisma.MissionAssignmentCreateManyInput[] = picks.map((templateId) => ({
      userId,
      templateId,
      periodKey: dailyKey,
      expiresAt: casablancaDateAt(dailyKey, 23, 59, 59),
    }));
    if (data.length > 0) {
      await prisma.missionAssignment.createMany({ data, skipDuplicates: true });
      created += data.length;
    }
  }

  if (!hasWeekly) {
    const templates = await prisma.missionTemplate.findMany({ where: { isActive: true, cadence: 'WEEKLY' } });
    const picks: string[] = [];
    const pool = [...templates];
    for (let i = 0; i < cfg.missionWeeklyCount; i += 1) {
      const pick = await weightedPick(pool);
      if (!pick) break;
      picks.push(pick.id);
      pool.splice(pool.indexOf(pick), 1);
    }
    const data: Prisma.MissionAssignmentCreateManyInput[] = picks.map((templateId) => ({
      userId,
      templateId,
      periodKey: weeklyKey,
      expiresAt: casablancaDateAt(shiftCasablanca(weeklyKey, 7), 0, 0, 0),
    }));
    if (data.length > 0) {
      await prisma.missionAssignment.createMany({ data, skipDuplicates: true });
      created += data.length;
    }
  }

  return created;
}

export async function bumpMission(userId: string, kind: MissionKind, step = 1, gameId?: string): Promise<void> {
  const todayKeys = [casablancaDay(), casablancaWeek()];
  const assignments = await prisma.missionAssignment.findMany({
    where: {
      userId,
      periodKey: { in: todayKeys },
      claimedAt: null,
      template: { kind, isActive: true },
    },
    include: { template: true },
  });
  for (const a of assignments) {
    if (a.template.gameId && a.template.gameId !== gameId) continue;
    await prisma.missionAssignment.update({
      where: { id: a.id },
      data: { progress: { increment: step } },
    });
  }
}

/* Counts a played game against both generic and per-game missions.
   Called whenever a play session is created (unlock), so progress is
   written to the DB on every game the player actually opens. */
export async function bumpGamesPlayed(userId: string, gameId: string): Promise<void> {
  await Promise.all([
    bumpMission(userId, 'PLAY_N_GAMES', 1, gameId).catch(() => {}),
    bumpMission(userId, 'PLAY_SPECIFIC_GAME', 1, gameId).catch(() => {}),
  ]);
}