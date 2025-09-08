/**
 * Route Protection Configuration
 * Defines which routes require authentication and specific roles
 * Based on the original IT Inventory System's access control
 */

export interface RouteConfig {
  path: string;
  requireAuth: boolean;
  allowedRoles?: ('admin' | 'manager' | 'user')[];
  redirectTo?: string;
  description?: string;
}

/**
 * Route protection configuration matching original system permissions
 */
export const routeConfig: RouteConfig[] = [
  // Public routes (no authentication required)
  {
    path: '/login',
    requireAuth: false,
    description: 'Login page - public access',
  },
  {
    path: '/api/auth/login',
    requireAuth: false,
    description: 'Login API - public access',
  },
  {
    path: '/api/auth/refresh',
    requireAuth: false,
    description: 'Token refresh API - public access',
  },

  // Dashboard - All authenticated users
  {
    path: '/dashboard',
    requireAuth: true,
    allowedRoles: ['admin', 'manager', 'user'],
    description: 'Main dashboard - all authenticated users',
  },

  // Employee Management - Admin and Manager only
  {
    path: '/employees',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'],
    redirectTo: '/dashboard',
    description: 'Employee management - admin and manager only',
  },

  // Hardware Asset Management - Admin and Manager only
  {
    path: '/hardware',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'],
    redirectTo: '/dashboard',
    description: 'Hardware asset management - admin and manager only',
  },

  // Software Inventory - Admin and Manager only
  {
    path: '/software',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'],
    redirectTo: '/dashboard',
    description: 'Software inventory - admin and manager only',
  },

  // Asset Assignment - Admin and Manager only
  {
    path: '/assignments',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'],
    redirectTo: '/dashboard',
    description: 'Asset assignments - admin and manager only',
  },

  // User Management - Admin only
  {
    path: '/users',
    requireAuth: true,
    allowedRoles: ['admin'],
    redirectTo: '/dashboard',
    description: 'User management - admin only',
  },

  // API Routes Protection
  {
    path: '/api/employees',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'], // POST, PUT need manager+, DELETE needs admin
    description: 'Employee API - manager for create/edit, admin for delete',
  },
  {
    path: '/api/hardware',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'], // POST, PUT need manager+, DELETE needs admin
    description: 'Hardware API - manager for create/edit, admin for delete',
  },
  {
    path: '/api/software',
    requireAuth: true,
    allowedRoles: ['admin', 'manager'], // POST, PUT need manager+, DELETE needs admin
    description: 'Software API - manager for create/edit, admin for delete',
  },
  {
    path: '/api/assignments',
    requireAuth: true,
    allowedRoles: ['admin', 'manager', 'user'], // GET for all, POST/PUT need manager+
    description: 'Assignments API - view all, manage manager+',
  },
  {
    path: '/api/admin',
    requireAuth: true,
    allowedRoles: ['admin'],
    description: 'Admin APIs - admin only',
  },
];

/**
 * Get route configuration for a specific path
 */
export function getRouteConfig(path: string): RouteConfig | null {
  // Find exact match first
  const exactMatch = routeConfig.find(config => config.path === path);
  if (exactMatch) return exactMatch;

  // Find partial match (for nested routes)
  const partialMatch = routeConfig.find(config => 
    path.startsWith(config.path) && config.path !== '/'
  );
  return partialMatch || null;
}

/**
 * Check if a route requires authentication
 */
export function requiresAuthentication(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.requireAuth ?? true; // Default to requiring auth
}

/**
 * Check if a user role is allowed for a specific route
 */
export function isRoleAllowed(path: string, userRole: string): boolean {
  const config = getRouteConfig(path);
  
  if (!config) return false;
  if (!config.requireAuth) return true; // Public routes
  if (!config.allowedRoles) return true; // No role restriction
  
  return config.allowedRoles.includes(userRole as any);
}

/**
 * Get redirect URL for unauthorized access
 */
export function getRedirectUrl(path: string, isAuthenticated: boolean, userRole?: string): string | null {
  const config = getRouteConfig(path);
  
  // If route doesn't require auth, no redirect needed
  if (!requiresAuthentication(path)) {
    return null;
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return '/login';
  }
  
  // If user role is not allowed, redirect to specified page or dashboard
  if (userRole && !isRoleAllowed(path, userRole)) {
    return config?.redirectTo || '/dashboard';
  }
  
  return null;
}

/**
 * Check if current route is public (doesn't require authentication)
 */
export function isPublicRoute(path: string): boolean {
  return !requiresAuthentication(path);
}

/**
 * Check if current route is admin-only
 */
export function isAdminOnlyRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.allowedRoles?.length === 1 && config.allowedRoles[0] === 'admin';
}

/**
 * Check if current route allows managers
 */
export function allowsManagerRole(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.allowedRoles?.includes('manager') ?? false;
}

/**
 * Get user-friendly error message for route access denied
 */
export function getAccessDeniedMessage(path: string, userRole: string): string {
  const config = getRouteConfig(path);
  
  if (!config?.allowedRoles) {
    return '이 페이지에 접근할 권한이 없습니다.';
  }
  
  if (config.allowedRoles.includes('admin') && !config.allowedRoles.includes('manager')) {
    return '이 페이지는 관리자만 접근할 수 있습니다.';
  }
  
  if (config.allowedRoles.includes('manager') && !config.allowedRoles.includes('user')) {
    return '이 페이지는 관리자 또는 매니저만 접근할 수 있습니다.';
  }
  
  return '이 페이지에 접근할 권한이 없습니다.';
}

/**
 * Get all protected routes (for middleware configuration)
 */
export function getProtectedRoutes(): string[] {
  return routeConfig
    .filter(config => config.requireAuth)
    .map(config => config.path)
    .filter(path => !path.startsWith('/api')); // Exclude API routes
}

/**
 * Get all public routes (for middleware configuration)
 */
export function getPublicRoutes(): string[] {
  return routeConfig
    .filter(config => !config.requireAuth)
    .map(config => config.path)
    .filter(path => !path.startsWith('/api')); // Exclude API routes
}