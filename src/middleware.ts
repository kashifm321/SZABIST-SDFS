import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || 'default-secret-key-for-local-development-only';
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Middleware] Target Path: ${path}`);

  // Static Files: Ensure the middleware completely ignores /_next, /api, and images.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Exceptions for public portals: Do NOT redirect if user is going to our public landing page or login pages
  const isPublicRoute = path === '/login' || path === '/register' || path === '/' || path === '/change-password';
  if (isPublicRoute && !path.startsWith('/change-password')) {
    console.log(`[Middleware] On public route ${path}, skipping redirects.`);
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session')?.value;
  let sessionPayload = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, getJwtSecretKey());
      sessionPayload = payload;
      console.log(`[Middleware] Session Decoded, Role: ${sessionPayload.role}`);
    } catch (error) {
      console.error('[Middleware] JWT Decode Error:', error);
      const response = NextResponse.redirect(new URL('/login', request.nextUrl));
      response.cookies.delete('session');
      return response;
    }
  }

  // If no token is found and the user is NOT on /login, only then redirect to /login.
  if (!sessionPayload) {
    console.log('[Middleware] No token found, redirecting to /login');
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Check Role: Only redirect to a dashboard AFTER verifying the user's role from the token.
  const role = sessionPayload.role as string;
  const mustChangePassword = sessionPayload.mustChangePassword as boolean;

  // Force password change if flag is set (allow access to /change-password route)
  if (mustChangePassword && path !== '/change-password') {
    console.log('[Middleware] Force password change detected, redirecting to /change-password');
    return NextResponse.redirect(new URL('/change-password', request.nextUrl));
  }

  // If already on /change-password but password is changed, move to dashboard
  if (path === '/change-password' && !mustChangePassword) {
    return redirectBasedOnRole(role, request);
  }
  
  if (path.startsWith('/admin') && role !== 'ADMIN') {
     console.log('[Middleware] Admin unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }
  if (path.startsWith('/teacher') && role !== 'TEACHER') {
     console.log('[Middleware] Teacher unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }
  if (path.startsWith('/student') && role !== 'STUDENT') {
     console.log('[Middleware] Student unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }

  // If authenticated user visits the root path, direct them to their dashboard
  if (path === '/') {
    return redirectBasedOnRole(role, request);
  }

  console.log('[Middleware] Proceeding normally');
  return NextResponse.next();
}

function redirectBasedOnRole(role: string, request: NextRequest) {
  if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.nextUrl));
  if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.nextUrl));
  if (role === 'STUDENT') return NextResponse.redirect(new URL('/student', request.nextUrl));
  
  const response = NextResponse.redirect(new URL('/login', request.nextUrl));
  response.cookies.delete('session');
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
