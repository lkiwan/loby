import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { checkRate } from '@/lib/rateLimit';

function hashIp(ip: string): string {
  const salt = process.env.NEXTAUTH_SECRET || 'darja-arcade-device-salt';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkRate('device_track', session.user.id, 10, 60))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { fingerprint } = await req.json();
  if (typeof fingerprint !== 'string' || fingerprint.length < 8 || fingerprint.length > 128) {
    return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 });
  }

  const userId = session.user.id;
  const ipHash = hashIp(clientIp(req));
  const userAgent = req.headers.get('user-agent')?.slice(0, 512) ?? null;

  try {
    await prisma.device.upsert({
      where: { userId_fingerprint: { userId, fingerprint } },
      update: { ipHash, userAgent },
      create: { userId, fingerprint, ipHash, userAgent },
    });
  } catch {
    // device tracking is best-effort; never block the user
  }

  return NextResponse.json({ ok: true });
}
