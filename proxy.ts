import { adminAuth, adminFirestore } from "@/config/FirebaseAdminConfig";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      
      // Check if user is admin
      const userDoc = await adminFirestore.collection('users').doc(decodedClaims.uid).get();
      const userData = userDoc.data();
      
      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
