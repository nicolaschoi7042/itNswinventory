import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createToken, extractTokenFromHeader } from '@/lib/jwt';
import { findUserByUsername, isUserActive } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    // Verify current token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // Check if user still exists and is active
    const user = await findUserByUsername(payload.username);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const userActive = await isUserActive(user.id);
    if (!userActive) {
      return NextResponse.json(
        { error: '비활성화된 계정입니다.' },
        { status: 401 }
      );
    }

    // Create new token with updated expiration
    const newToken = await createToken({
      id: user.id,
      username: user.username,
      role: user.role,
      ldap: payload.ldap,
    });

    return NextResponse.json({
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        ldap: payload.ldap,
      },
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
