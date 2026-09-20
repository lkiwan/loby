import { prisma } from '@/lib/prisma';
import type { Currency, LedgerReason, Prisma } from '@prisma/client';

export class InsufficientCoinsError extends Error {
  balance: number;
  required: number;
  constructor(balance: number, required: number) {
    super('Insufficient coins');
    this.balance = balance;
    this.required = required;
  }
}

export class InsufficientTicketsError extends Error {
  balance: number;
  required: number;
  constructor(balance: number, required: number) {
    super('Insufficient tickets');
    this.balance = balance;
    this.required = required;
  }
}

const balanceField = (currency: Currency): 'coins' | 'tickets' =>
  currency === 'COINS' ? 'coins' : 'tickets';

export const isDuplicate = (e: unknown): boolean =>
  (e as Prisma.PrismaClientKnownRequestError)?.code === 'P2002';

export async function ensureSignupGrant(userId: string, grantAmount: number): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const existing = await prisma.ledgerEntry.findUnique({
    where: { idempotencyKey: `signup-grant:${userId}` },
  });
  if (existing) return;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.ledgerEntry.create({
        data: {
          userId,
          currency: 'COINS',
          delta: grantAmount,
          balanceAfter: user.coins + grantAmount,
          reason: 'SIGNUP_GRANT',
          idempotencyKey: `signup-grant:${userId}`,
        },
      });
      await tx.user.update({ where: { id: userId }, data: { coins: { increment: grantAmount } } });
    });
  } catch (e) {
    if (!isDuplicate(e)) throw e;
  }
}

export async function backfillLedger(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.coins <= 0) return;
  const existing = await prisma.ledgerEntry.findUnique({
    where: { idempotencyKey: `signup-grant:${userId}` },
  });
  if (existing) return;
  try {
    await prisma.ledgerEntry.create({
      data: {
        userId,
        currency: 'COINS',
        delta: user.coins,
        balanceAfter: user.coins,
        reason: 'SIGNUP_GRANT',
        idempotencyKey: `signup-grant:${userId}`,
      },
    });
  } catch (e) {
    if (!isDuplicate(e)) throw e;
  }
}

export type BalanceParams = {
  userId: string;
  amount: number;
  reason: LedgerReason;
  idempotencyKey: string;
  currency?: Currency;
  refType?: string | null;
  refId?: string | null;
};

export async function spendBalance(params: BalanceParams) {
  const { userId, amount, reason, idempotencyKey, currency = 'COINS', refType = null, refId = null } = params;

  const existing = await prisma.ledgerEntry.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  const field = balanceField(currency);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const balance = user[field];
    if (balance < amount) {
      if (currency === 'COINS') throw new InsufficientCoinsError(balance, amount);
      throw new InsufficientTicketsError(balance, amount);
    }
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        currency,
        delta: -amount,
        balanceAfter: balance - amount,
        reason,
        refType,
        refId,
        idempotencyKey,
      },
    });
    const res = await tx.user.updateMany({
      where: { id: userId, [field]: { gte: amount } },
      data: { [field]: { decrement: amount } },
    });
    if (res.count !== 1) {
      throw new InsufficientCoinsError(balance, amount);
    }
    return entry;
  });
}

export async function creditBalance(params: BalanceParams) {
  const { userId, amount, reason, idempotencyKey, currency = 'COINS', refType = null, refId = null } = params;

  const existing = await prisma.ledgerEntry.findUnique({ where: { idempotencyKey } });
  if (existing) return existing;

  const field = balanceField(currency);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const balance = user[field];
    const entry = await tx.ledgerEntry.create({
      data: {
        userId,
        currency,
        delta: amount,
        balanceAfter: balance + amount,
        reason,
        refType,
        refId,
        idempotencyKey,
      },
    });
    await tx.user.update({ where: { id: userId }, data: { [field]: { increment: amount } } });
    return entry;
  });
}

export async function addXp(userId: string, amount: number, sessionId?: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const xp = user.xp + amount;
    let level = 1;
    while (xpForLevel(level + 1) <= xp) level += 1;

    await tx.user.update({ where: { id: userId }, data: { xp, level } });

    if (level > user.level) {
      const grant = 50 * level;
      const key = `levelup:${userId}:${level}`;
      const granted = await tx.ledgerEntry.findUnique({ where: { idempotencyKey: key } });
      if (!granted) {
        await tx.ledgerEntry.create({
          data: {
            userId,
            currency: 'COINS',
            delta: grant,
            balanceAfter: user.coins + grant,
            reason: 'LEVEL_UP',
            refType: 'PlaySession',
            refId: sessionId,
            idempotencyKey: key,
          },
        });
        await tx.user.update({ where: { id: userId }, data: { coins: { increment: grant } } });
      }
    }

    return { xp, level };
  });
}

export function xpForLevel(n: number): number {
  return Math.floor(100 * Math.pow(n, 1.4));
}

export const levelFromXp = (xp: number): number => {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  return level;
};