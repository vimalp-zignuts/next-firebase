import { adminAuth, adminFirestore } from '@/config/FirebaseAdminConfig';
import { NextRequest } from 'next/server';

export async function verifySession(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return { error: 'No session found', status: 401 };
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);

    const userDoc = await adminFirestore.collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();

    return {
      user: decodedClaims,
      userData,
      isAdmin: userData?.role === 'admin'
    };
  } catch (error) {
    return { error: 'Invalid session', status: 401 };
  }
}