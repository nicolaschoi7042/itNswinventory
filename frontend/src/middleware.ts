import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { 
  requiresAuthentication,
  isRoleAllowed,
  getRedirectUrl,
  isPublicRoute,
  getAccessDeniedMessage,
  getPublicRoutes,
  getProtectedRoutes
} from '@/lib/route-protection';

// Get route configurations dynamically
const protectedRoutes = getProtectedRoutes();
const publicRoutes = getPublicRoutes();

// API routes that don't need middleware processing
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/refresh',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip processing for public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Skip processing for static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get token from cookies (more reliable for SSR)
  const authCookie = request.cookies.get('inventory_token');
  const token = authCookie?.value;
  
  let isValidToken = false;
  let userRole: string | undefined;
  
  // Verify token if it exists
  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        isValidToken = true;
        userRole = payload.role;
      }
    } catch (error) {
      console.log('Middleware: Invalid token detected');
      isValidToken = false;
    }
  }

  // Redirect logic for root path
  if (pathname === '/' || pathname === '') {
    if (isValidToken) {
      // Authenticated user accessing root - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Unauthenticated user accessing root - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check route protection using the configuration system
  const needsAuth = requiresAuthentication(pathname);
  const isPublic = isPublicRoute(pathname);

  // Handle public routes (like /login)
  if (isPublic || !needsAuth) {
    if (isValidToken && pathname === '/login') {
      // Authenticated user trying to access login - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // Handle protected routes
  if (needsAuth) {
    // Check authentication
    if (!isValidToken) {
      // Unauthenticated user trying to access protected route - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (userRole && !isRoleAllowed(pathname, userRole)) {
      // User doesn't have required role - redirect with error message
      const redirectUrl = getRedirectUrl(pathname, true, userRole);
      if (redirectUrl) {
        const redirectTo = new URL(redirectUrl, request.url);
        redirectTo.searchParams.set('error', 'access_denied');
        redirectTo.searchParams.set('message', encodeURIComponent(
          getAccessDeniedMessage(pathname, userRole)
        ));
        return NextResponse.redirect(redirectTo);
      }
    }

    // User has valid authentication and role - allow access
    return NextResponse.next();
  }

  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};