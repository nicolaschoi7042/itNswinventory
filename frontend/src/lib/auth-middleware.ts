import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  extractTokenFromHeader,
  hasRole,
  JWTPayload,
} from './jwt';

// Note: This is kept for future reference but not currently used
// due to NextRequest structure limitations
export interface AuthenticatedRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware for API routes
 */
export async function authenticateToken(
  request: NextRequest
): Promise<{ success: boolean; user?: JWTPayload; error?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader || '');

  if (!token) {
    return { success: false, error: '접근 토큰이 필요합니다.' };
  }

  const user = await verifyToken(token);
  if (!user) {
    return { success: false, error: '유효하지 않은 토큰입니다.' };
  }

  return { success: true, user };
}

/**
 * Authorization middleware - check if user has required roles
 */
export function authorize(requiredRoles: string[]) {
  return (user: JWTPayload): { success: boolean; error?: string } => {
    if (!hasRole(user.role, requiredRoles)) {
      return { success: false, error: '권한이 없습니다.' };
    }
    return { success: true };
  };
}

/**
 * Combined authentication and authorization middleware
 */
export async function authenticateAndAuthorize(
  request: NextRequest,
  requiredRoles: string[] = []
): Promise<{ success: boolean; user?: JWTPayload; error?: string }> {
  // First authenticate
  const authResult = await authenticateToken(request);
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  // Then authorize if roles are specified
  if (requiredRoles.length > 0) {
    const authzResult = authorize(requiredRoles)(authResult.user);
    if (!authzResult.success) {
      return authzResult;
    }
  }

  return authResult;
}

/**
 * Create error response for authentication/authorization failures
 */
export function createAuthErrorResponse(
  error: string,
  status: number = 401
): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Wrapper for API route handlers that require authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  requiredRoles: string[] = []
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateAndAuthorize(request, requiredRoles);

    if (!authResult.success || !authResult.user) {
      const status = authResult.error?.includes('권한이 없습니다') ? 403 : 401;
      return createAuthErrorResponse(authResult.error || '인증 실패', status);
    }

    return handler(request, authResult.user);
  };
}
