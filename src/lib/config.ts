import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

const DEFAULTS = {
  signupGrant: 100,
  checkinLadder: [25, 35, 50, 75, 100, 150, 250],
  adRewardCoins: 25,
  adDailyCap: 6,
  giftFeePct: 10,
  referralBonus: 50,
  freeFirstPlayDaily: true,
  missionDailyCount: 3,
  missionWeeklyCount: 1,
  xpBase: 10,
  xpCap: 50,
} as const;

export type AppConfig = typeof DEFAULTS;

let memoryCache: { at: number; cfg: AppConfig } | null = null;

export async function loadConfig(): Promise<AppConfig> {
  const merged: AppConfig = { ...DEFAULTS };
  try {
    const rows = await prisma.remoteConfig.findMany();
    for (const row of rows) {
      if (row.key in merged) {
        (merged as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return merged;
  } catch {
    return merged;
  }
}

export async function getConfig(): Promise<AppConfig> {
  if (memoryCache && Date.now() - memoryCache.at < 10_000) return memoryCache.cfg;
  try {
    const cached = await redis.get('cfg:remote');
    if (cached) {
      const cfg = JSON.parse(cached) as AppConfig;
      memoryCache = { at: Date.now(), cfg };
      return cfg;
    }
  } catch {
    // redis is optional for config
  }
  const cfg = await loadConfig();
  memoryCache = { at: Date.now(), cfg };
  try {
    await redis.set('cfg:remote', JSON.stringify(cfg), 'EX', 60);
  } catch {
    // ignore
  }
  return cfg;
}