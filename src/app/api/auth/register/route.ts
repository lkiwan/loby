import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureSignupGrant } from '@/lib/ledger';
import { getConfig } from '@/lib/config';

const TEMP_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'fakeinbox.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'tempail.com', 'emailondeck.com', 'mintemail.com', 'spamgourmet.com',
];

function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
}

function isGmail(email: string): boolean {
  return email.toLowerCase().endsWith('@gmail.com');
}

function randomReferralCode(base: string): string {
  const clean = base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'player';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const { username, email, password, referralCode } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing username, email, or password' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isGmail(normalizedEmail)) {
      return NextResponse.json({ error: 'Gmail فقط مسموح (@gmail.com)' }, { status: 400 });
    }

    if (isTempEmail(normalizedEmail)) {
      return NextResponse.json({ error: 'الإيميلات المؤقتة ممنوعة' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
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
        email: normalizedEmail,
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
      { success: true, user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}