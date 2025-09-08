import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { findUserByUsername } from '@/lib/database';
import { JWTPayload } from '@/lib/jwt';

/**
 * Get current user information
 */
async function getCurrentUser(_request: NextRequest, user: JWTPayload) {
  try {
    // Get fresh user data from database
    const dbUser = await findUserByUsername(user.username);
    
    if (!dbUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        full_name: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
        is_active: dbUser.is_active,
        last_login: dbUser.last_login,
        ldap: user.ldap
      }
    });

  } catch (error: any) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Apply authentication middleware
export const GET = withAuth(getCurrentUser);

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}