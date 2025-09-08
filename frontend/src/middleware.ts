import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/employees', 
  '/hardware',
  '/software',
  '/assignments',
  '/users',
];

// Public routes that don't require authentication (for future use)
// const publicRoutes = [
//   '/login',
//   '/api/auth/login',
// ];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for token in localStorage via request headers (set by client-side)
  // Since middleware runs on server-side, we'll rely on client-side protection
  // and use this middleware mainly for public/private route management
  const token = request.cookies.get('auth-token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // For protected routes, let the client-side AuthContext handle authentication
  // This middleware mainly handles redirects for root path and login page
  
  // If accessing root path
  if (pathname === '/' || pathname === '') {
    // Always redirect to login by default - client will redirect to dashboard if authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For API routes, don't interfere
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

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