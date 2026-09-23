import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureSignupGrant, creditBalance, isDuplicate } from '@/lib/ledger';
import { getConfig } from '@/lib/config';
import { checkRate } from '@/lib/rateLimit';

const TEMP_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'fakeinbox.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'tempail.com', 'emailondeck.com', 'mintemail.com', 'spamgourmet.com',
  'findize.com',
];

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const PASSWORD_MIN = 6;

function isTempEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
}

function randomReferralCode(base: string): string {
  const clean = base.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'player';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown';

  try {
    const allowed = await checkRate('register', ip, 5, 3600);
    if (!allowed) {
      return NextResponse.json(
        { error: 'قويتي التسجيلات من هاد الجهاز. تسنى شوية وعاود.' },
        { status: 429 }
      );
    }

    let body: { username?: string; email?: string; password?: string; referralCode?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'طلب ماشي هو هداك.' }, { status: 400 });
    }

    const username = body.username?.trim().toLowerCase() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const referralCode = body.referralCode?.trim().toLowerCase() ?? '';

    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: 'السمية خاص يكون فيها بين 3 و 20 حرف: غير حروف صغيرة، أرقام، ولا _.' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'الإيميل خاصو يكون مكتوب مزيان (بحال name@example.com).' },
        { status: 400 }
      );
    }

    if (isTempEmail(email)) {
      return NextResponse.json({ error: 'الإيميلات المؤقتة ما خداماش معانا.' }, { status: 400 });
    }

    if (password.length < PASSWORD_MIN) {
      return NextResponse.json(
        { error: 'المودپاس خاص يكون فيه 6 حروف على الأقل.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: 'هاد السمية ديجا مديورة. جرب شي وحدة خرى.' }, { status: 409 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'هاد الإيميل ديجا مقيد. دخل للكونط ديالك من هنا.' }, { status: 409 });
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
      if (referrer?.id) referredById = referrer.id;
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          referralCode: ownCode,
          referredById,
        },
      });
    } catch (e) {
      if (isDuplicate(e)) {
        return NextResponse.json({ error: 'هاد السمية ولا الإيميل ديجا مستعملين.' }, { status: 409 });
      }
      throw e;
    }

    const cfg = await getConfig();
    await ensureSignupGrant(user.id, cfg.signupGrant as unknown as number);

    if (referredById) {
      const bonus = Number(cfg.referralBonus ?? 50);
      await creditBalance({
        userId: referredById,
        amount: bonus,
        reason: 'REFERRAL_BONUS',
        idempotencyKey: `referral-bonus:${referredById}:${user.id}`,
        refType: 'User',
        refId: user.id,
      });
    }

    await prisma.event.create({
      data: {
        name: 'signup',
        userId: user.id,
        props: { referred: Boolean(referredById), referrerId: referredById },
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        signupGrant: cfg.signupGrant as unknown as number,
        referred: Boolean(referredById),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'السيرفور طايح دابا. عاود جرب من بعد شوية.' }, { status: 500 });
  }
}