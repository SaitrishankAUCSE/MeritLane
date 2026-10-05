import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('ml_session')?.value;

  // If the user has a session cookie and tries to access the landing page,
  // instantly redirect them to the dashboard router.
  if (request.nextUrl.pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Prevent logged-out users from accessing protected routes
  // (Optional, but since we are just solving the landing page flash, we can just handle '/' for now)
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
