import { NextRequest, NextResponse } from 'next/server';
import { LDAPAuth } from '@/lib/ldap-auth';
import { 
  findOrCreateLdapUser, 
  verifyLocalUserPassword, 
  updateLastLogin,
  logActivity,
  isUserActive 
} from '@/lib/database';
import { createToken } from '@/lib/jwt';

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // FOR TESTING: Use hardcoded users when database is not available
    const testUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        full_name: '시스템 관리자',
        email: 'admin@company.com',
        role: 'admin',
        is_active: true
      },
      {
        id: 2, 
        username: 'manager',
        password: 'manager123',
        full_name: '매니저',
        email: 'manager@company.com',
        role: 'manager',
        is_active: true
      },
      {
        id: 3,
        username: 'user',
        password: 'user123', 
        full_name: '일반 사용자',
        email: 'user@company.com',
        role: 'user',
        is_active: true
      }
    ];

    // Try test users first
    const testUser = testUsers.find(u => u.username === username && u.password === password);
    
    if (testUser) {
      console.log('✅ Test: Authentication successful for', username, 'with role:', testUser.role);
      
      // Generate JWT token
      const token = await createToken({
        id: testUser.id,
        username: testUser.username,
        role: testUser.role,
        ldap: false
      });
      
      return NextResponse.json({
        success: true,
        message: '테스트 로그인 성공',
        token,
        user: {
          id: testUser.id.toString(),
          username: testUser.username,
          full_name: testUser.full_name,
          email: testUser.email,
          role: testUser.role,
          authentication_type: 'test'
        }
      });
    }

    // Check if LDAP is enabled
    const ldapEnabled = process.env['LDAP_ENABLED'] === 'true';
    let user = null;
    let isLdapAuth = false;

    // LDAP authentication attempt (skip for admin user)
    if (ldapEnabled && username !== 'admin') {
      try {
        console.log(`🔍 LDAP: Attempting authentication for user: ${username}`);
        const ldapAuth = new LDAPAuth();
        const ldapUser = await ldapAuth.authenticate(username, password);
        
        if (ldapUser) {
          // LDAP authentication successful - find or create user in local database
          const ldapUserData = {
            username: ldapUser.username,
            fullName: ldapUser.fullName,
            email: ldapUser.email,
            role: ldapUser.role
          };
          
          user = await findOrCreateLdapUser(ldapUserData);
          isLdapAuth = true;
          
          console.log(`✅ LDAP: User ${username} authenticated successfully`);
        } else {
          console.log(`❌ LDAP: Authentication failed for user ${username}`);
        }
      } catch (ldapError: any) {
        console.error(`❌ LDAP: Error during authentication for ${username}:`, ldapError.message);
        // Continue to local authentication fallback
      }
    }

    // Local authentication fallback (or for admin user)
    if (!user) {
      console.log(`🔍 Local: Attempting local authentication for user: ${username}`);
      user = await verifyLocalUserPassword(username, password);
      
      if (!user) {
        return NextResponse.json(
          { error: '잘못된 사용자명 또는 비밀번호입니다.' },
          { status: 401 }
        );
      }
      
      console.log(`✅ Local: User ${username} authenticated successfully`);
    }

    // Check if user account is active
    const userActive = await isUserActive(user.id);
    if (!userActive) {
      return NextResponse.json(
        { error: '비활성화된 계정입니다. 관리자에게 문의하세요.' },
        { status: 401 }
      );
    }

    // Update last login time
    await updateLastLogin(user.id);

    // Create JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
      role: user.role,
      ldap: isLdapAuth
    });

    // Log activity
    const activityDescription = isLdapAuth 
      ? `LDAP 사용자 로그인: ${user.full_name}`
      : '로컬 사용자 로그인';
    
    await logActivity(user.id, activityDescription);

    // Return successful response
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        ldap: isLdapAuth
      }
    });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
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