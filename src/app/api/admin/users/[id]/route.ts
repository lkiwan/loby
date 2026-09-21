import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import type { Currency, LedgerReason } from '@prisma/client';

const ROLES = ['PLAYER', 'MODERATOR', 'ADMIN'] as const;
const STATUSES = ['ACTIVE', 'FROZEN', 'BANNED'] as const;
type Role = (typeof ROLES)[number];
type UserStatus = (typeof STATUSES)[number];

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_ ]{3,30}$/;

type UpdateBody = {
  username?: string;
  email?: string | null;
  phone?: string | null;
  role?: Role;
  status?: UserStatus;
  coins?: number;
  tickets?: number;
  password?: string;
};

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/admin/users/[id]'>) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as UpdateBody;

  const data: Record<string, unknown> = {};

  if (body.username !== undefined) {
    if (typeof body.username !== 'string' || !USERNAME_RE.test(body.username)) {
      return NextResponse.json({ error: 'Nom d’utilisateur invalide (3-20: minuscules, chiffres, _).' }, { status: 400 });
    }
    data.username = body.username;
  }
  if (body.email !== undefined) {
    const email = body.email ? body.email.toLowerCase().trim() : null;
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
    }
    data.email = email;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone ? body.phone.trim() : null;
  }
  if (body.role !== undefined) {
    if (!ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
    }
    data.role = body.role;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe trop court (6+).' }, { status: 400 });
    }
    data.password = await bcrypt.hash(body.password, 10);
  }

  const coins = body.coins === undefined ? undefined : Number(body.coins);
  const tickets = body.tickets === undefined ? undefined : Number(body.tickets);
  if (coins !== undefined && (!Number.isInteger(coins) || coins < 0)) {
    return NextResponse.json({ error: 'Coins invalides.' }, { status: 400 });
  }
  if (tickets !== undefined && (!Number.isInteger(tickets) || tickets < 0)) {
    return NextResponse.json({ error: 'Tickets invalides.' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const adjustments: { currency: Currency; delta: number; balanceAfter: number }[] = [];
      if (coins !== undefined && coins !== target.coins) {
        adjustments.push({ currency: 'COINS', delta: coins - target.coins, balanceAfter: coins });
      }
      if (tickets !== undefined && tickets !== target.tickets) {
        adjustments.push({ currency: 'TICKETS', delta: tickets - target.tickets, balanceAfter: tickets });
      }

      for (const adj of adjustments) {
        const reason: LedgerReason = adj.delta >= 0 ? 'ADMIN_GRANT' : 'ADMIN_CLAWBACK';
        await tx.ledgerEntry.create({
          data: {
            userId: target.id,
            currency: adj.currency,
            delta: adj.delta,
            balanceAfter: adj.balanceAfter,
            reason,
            idempotencyKey: `admin-adj:${target.id}:${adj.currency}:${crypto.randomUUID()}`,
          },
        });
      }

      if (coins !== undefined) data.coins = coins;
      if (tickets !== undefined) data.tickets = tickets;

      if (Object.keys(data).length > 0) {
        await tx.user.update({ where: { id: target.id }, data });
      }
    });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ error: 'Email, pseudo ou téléphone déjà utilisé par un autre compte.' }, { status: 409 });
    }
    console.error('Admin user update failed:', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }

  await prisma.event.create({
    data: {
      name: 'admin_user_update',
      userId: admin.id,
      props: { targetUserId: target.id, changed: Object.keys(data) },
    },
  });

  const updated = await prisma.user.findUnique({ where: { id: target.id } });
  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/admin/users/[id]'>) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (id === admin.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userItem.deleteMany({ where: { userId: id } });
      await tx.missionAssignment.deleteMany({ where: { userId: id } });
      await tx.adImpression.deleteMany({ where: { userId: id } });
      await tx.playSession.deleteMany({ where: { userId: id } });
      await tx.device.deleteMany({ where: { userId: id } });
      await tx.ledgerEntry.deleteMany({ where: { userId: id } });
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.user.updateMany({ where: { referredById: id }, data: { referredById: null } });
      await tx.user.delete({ where: { id } });
    });
  } catch (e) {
    console.error('Admin user delete failed:', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }

  await prisma.event.create({
    data: {
      name: 'admin_user_delete',
      userId: admin.id,
      props: { targetUserId: id, targetUsername: target.username },
    },
  });

  return NextResponse.json({ ok: true });
}