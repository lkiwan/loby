import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { Game, UnlockMethod } from '@prisma/client';

export function signSessionToken(sessionId: string, userId: string, gameId: string, exp: number, secret: string): string {
  const payload = `${sessionId}.${userId}.${gameId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifySessionToken(
  jwt: string,
  secret: string
): { valid: boolean; sessionId?: string; userId?: string; gameId?: string; exp?: number } {
  try {
    const decoded = Buffer.from(jwt, 'base64url').toString('utf8');
    const parts = decoded.split('.');
    if (parts.length !== 4) return { valid: false };
    const [sessionId, userId, gameId, expStr] = parts;
    const exp = Number(expStr);
    const expected = crypto.createHmac('sha256', secret).update(`${sessionId}.${userId}.${gameId}.${exp}`).digest('hex');
    if (typeof exp !== 'number' || Number.isNaN(exp) || exp < Date.now() / 1000) return { valid: false };
    if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts[3], 'hex'))) return { valid: false };
    return { valid: true, sessionId, userId, gameId, exp };
  } catch {
    return { valid: false };
  }
}

export function signScore(sessionId: string, score: number, nonce: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`${sessionId}|${score}|${nonce}`).digest('hex');
}

export async function createPlaySession(userId: string, game: Game, method: UnlockMethod, coinsSpent = 0): Promise<string> {
  const session = await prisma.playSession.create({
    data: {
      userId,
      gameId: game.id,
      unlockMethod: method,
      coinsSpent,
      clientNonce: crypto.randomUUID(),
    },
  });
  return session.id;
}