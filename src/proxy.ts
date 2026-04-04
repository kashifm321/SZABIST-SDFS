import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || 'default-secret-key-for-local-development-only';
  return new TextEncoder().encode(secret);
};

// Next.js 16 Proxy Convention
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Proxy] Target Path: ${path}`);

  // 1. Static Files: Ensure the proxy completely ignores /_next, /api, and images.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Public Routes: Skip all authentication and redirect logic for these paths to avoid loops.
  const isPublicRoute = path === '/login' || path === '/register' || path === '/' || path === '/change-password';
  if (isPublicRoute && path !== '/') {
    console.log(`[Proxy] On public route ${path}, skipping further checks.`);
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session')?.value;
  let sessionPayload = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, getJwtSecretKey());
      sessionPayload = payload;
      console.log(`[Proxy] Session Decoded, Role: ${sessionPayload.role}`);
    } catch (error) {
      console.error('[Proxy] JWT Decode Error:', error);
      // Already handled by deletion and redirect, but ONLY if not on login already to prevent loops.
      if (path === '/login') return NextResponse.next();
      
      const response = NextResponse.redirect(new URL('/login', request.nextUrl));
      response.cookies.delete('session');
      return response;
    }
  }

  // 3. Authorization Checks:
  if (!sessionPayload) {
    console.log('[Proxy] No token found, checking if on public route.');
    if (isPublicRoute) return NextResponse.next();
    
    console.log('[Proxy] Redirecting to /login from unauthorized path.');
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  const role = sessionPayload.role as string;
  const mustChangePassword = sessionPayload.mustChangePassword as boolean;

  // Force password change if flag is set (allow access to /change-password route)
  if (mustChangePassword && path !== '/change-password') {
    console.log('[Proxy] Force password change detected, redirecting to /change-password');
    return NextResponse.redirect(new URL('/change-password', request.nextUrl));
  }

  // If already on /change-password but password is changed, move to dashboard
  if (path === '/change-password' && !mustChangePassword) {
    return redirectBasedOnRole(role, request);
  }
  
  if (path.startsWith('/admin') && role !== 'ADMIN') {
     console.log('[Proxy] Admin unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }
  if (path.startsWith('/teacher') && role !== 'TEACHER') {
     console.log('[Proxy] Teacher unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }
  if (path.startsWith('/student') && role !== 'STUDENT') {
     console.log('[Proxy] Student unauthorized, redirecting to correct dashboard');
     return redirectBasedOnRole(role, request);
  }

  // If authenticated user visits the root path, direct them to their dashboard
  if (path === '/') {
    return redirectBasedOnRole(role, request);
  }

  console.log('[Proxy] Proceeding normally');
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
