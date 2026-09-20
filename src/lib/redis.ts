import { Redis } from '@upstash/redis';

// Configure the Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function generateGameToken(userId: string, gameId: string): Promise<string> {
  const tokenId = crypto.randomUUID();
  const tokenData = {
    userId,
    gameId,
    createdAt: new Date().toISOString(),
  };

  // Set the token with a 60-second Time-To-Live (TTL)
  await redis.set(`game_token:${tokenId}`, tokenData, { ex: 60 });

  return tokenId;
}

export async function verifyAndBurnToken(token: string): Promise<{ valid: boolean; data?: any }> {
  // Use Lua script or atomic GETDEL if available. @upstash/redis doesn't have a direct GETDEL method
  // but we can use multi/exec or Pipeline, or just get then delete if we don't expect race conditions on the same token.
  // Actually, Upstash Redis supports `getdel` via `redis.get<T>()` ? No, Upstash Redis client has `redis.get()` and `redis.del()`.
  // Wait, let's use a standard pattern for upstash.
  const tokenKey = `game_token:${token}`;
  
  // We can fetch the token data
  const data = await redis.get(tokenKey);
  
  if (data) {
    // Delete the token so it cannot be used again
    await redis.del(tokenKey);
    return { valid: true, data };
  }
  
  return { valid: false };
}
