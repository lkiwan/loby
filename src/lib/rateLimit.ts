import { redis } from '@/lib/redis';

export async function checkRate(scope: string, userId: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (limit <= 0) return true;
  try {
    const key = `rl:${scope}:${userId}`;
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds, 'NX');
    const results = (await multi.exec()) as Array<[null, number | Error]>;
    const count = results?.[0]?.[1];
    if (typeof count !== 'number') return true;
    return count <= limit;
  } catch {
    return true;
  }
}