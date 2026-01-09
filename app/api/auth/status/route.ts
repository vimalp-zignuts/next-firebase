import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await verifySession(request);

  if (authResult.error) {
    return NextResponse.json({ isAuthenticated: false });
  }

  return NextResponse.json({
    isAuthenticated: true,
    isAdmin: authResult.isAdmin
  });
}