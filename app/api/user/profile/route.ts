import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/utils/serverAuth';

export async function GET(request: NextRequest) {
  const authResult = await verifySession(request);
  
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  return NextResponse.json({
    success: true,
    user: {
      uid: authResult.userData?.uid,
      email: authResult.userData?.email,
      role: authResult.userData?.role,
      createdAt: authResult.userData?.createdAt
    }
  });
}