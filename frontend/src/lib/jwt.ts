import * as jose from 'jose';

export interface JWTPayload {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
  ldap: boolean;
}

/**
 * Get JWT secret as Uint8Array for jose library
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return new TextEncoder().encode(secret);
}

/**
 * Create JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = getJWTSecret();
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('3h')
    .sign(secret);
  
  return jwt;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * Check if user has manager role or higher
 */
export function isManagerOrHigher(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'manager';
}