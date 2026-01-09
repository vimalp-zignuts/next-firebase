import { adminAuth, adminFirestore } from '@/config/FirebaseAdminConfig';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Get or create user in Firestore
    const userDoc = await adminFirestore.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await adminFirestore.collection('users').doc(decodedToken.uid).set({
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: 'user',
        createdAt: new Date()
      });
    }

    const userData = userDoc.data() || { role: 'user' };

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000, // 5 days
    });

    const response = NextResponse.json({
      success: true,
      user: { uid: decodedToken.uid, email: decodedToken.email, role: userData.role }
    });

    // Set session cookie
    response.cookies.set('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 5,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Authentication failed'
    }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return response;
}