import Redis from 'ioredis';

// Configure the ioredis client
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function generateGameToken(userId: string, gameId: string): Promise<string> {
  const tokenId = crypto.randomUUID();
  const tokenData = JSON.stringify({
    userId,
    gameId,
    createdAt: new Date().toISOString(),
  });

  // Set the token with a 60-second Time-To-Live (TTL) using standard EX seconds
  await redis.set(`game_token:${tokenId}`, tokenData, 'EX', 60);

  return tokenId;
}

export async function verifyAndBurnToken(token: string): Promise<{ valid: boolean; data?: any }> {
  const tokenKey = `game_token:${token}`;
  
  // Fetch the token data
  const data = await redis.get(tokenKey);
  
  if (data) {
    // Delete the token so it cannot be used again
    await redis.del(tokenKey);
    return { valid: true, data: JSON.parse(data) };
  }
  
  return { valid: false };
}
