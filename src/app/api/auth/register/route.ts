import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureSignupGrant } from '@/lib/ledger';
import { getConfig } from '@/lib/config';

function randomReferralCode(base: string): string {
  const clean = base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'player';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const { username, password, referralCode } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let ownCode = randomReferralCode(username);
    let codeTaken = true;
    while (codeTaken) {
      const clash = await prisma.user.findUnique({ where: { referralCode: ownCode } });
      if (!clash) {
        codeTaken = false;
      } else {
        ownCode = randomReferralCode(username);
      }
    }

    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer && referrer.id) referredById = referrer.id;
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        coins: 0,
        referralCode: ownCode,
        referredById,
      },
    });

    const cfg = await getConfig();
    await ensureSignupGrant(user.id, cfg.signupGrant as unknown as number);

    await prisma.event.create({
      data: {
        name: 'signup',
        userId: user.id,
        props: { referred: Boolean(referredById) },
      },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, username: user.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}