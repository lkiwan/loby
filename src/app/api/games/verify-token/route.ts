import { NextResponse } from 'next/server';
import { verifyAndBurnToken } from '@/lib/redis';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, error: 'No token' }, { status: 400 });
  }

  try {
    const result = await verifyAndBurnToken(token);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 });
  }
}
