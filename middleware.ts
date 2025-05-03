import { verifySession } from '@/lib/firebase/services';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/(dashboard.*)',
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'
  ]
};

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  const isValid = await verifySession(sessionToken);
  
  if (!isValid && pathname.startsWith('/dashboard')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  return NextResponse.next();
}