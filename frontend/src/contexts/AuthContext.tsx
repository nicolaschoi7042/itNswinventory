'use client';

// Authentication Context for managing authentication state across the app
// Based on the original IT Inventory System's authentication flow

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  getSessionData, 
  setSessionData, 
  clearSession, 
  isAuthenticated as checkAuthenticated,
  isTokenExpiringSoon,
  hasAdminRole as checkAdminRole,
  hasManagerRole as checkManagerRole,
  canCreateRecords as checkCanCreateRecords,
  canDeleteRecords as checkCanDeleteRecords,
  getAuthHeader,
  type SessionUser
} from '@/lib/session-storage';
import { syncTokenToCookies, clearTokenEverywhere, initializeSessionSync } from '@/lib/session-sync';
import { type LoginRequest } from '@/types/api';

interface AuthContextType {
  // Authentication state
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Authentication actions
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Permission helpers
  hasRole: (role: 'admin' | 'manager' | 'user') => boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  canCreateRecords: boolean;
  canEditRecords: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...');
        
        // Initialize session synchronization
        const cleanupSync = initializeSessionSync();
        
        // Check if user has valid session
        if (checkAuthenticated()) {
          const sessionData = getSessionData();
          if (sessionData) {
            setUser(sessionData.user);
            console.log('✅ Found valid session for user:', sessionData.user.username);
            
            // Sync token to cookies for middleware access
            syncTokenToCookies();
            
            // Check if token needs refresh
            if (isTokenExpiringSoon()) {
              console.log('🔄 Token expiring soon, attempting refresh...');
              await refreshTokenSilently();
            }
          }
        } else {
          console.log('❌ No valid session found');
          clearTokenEverywhere();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokenEverywhere();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      if (isTokenExpiringSoon()) {
        console.log('🔄 Auto-refreshing token...');
        refreshTokenSilently();
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Silent token refresh helper
  const refreshTokenSilently = useCallback(async () => {
    try {
      const success = await refreshToken();
      if (!success) {
        console.log('❌ Silent token refresh failed, logging out');
        await logout();
      }
    } catch (error) {
      console.error('Silent token refresh error:', error);
      await logout();
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login for user:', credentials.username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        console.log('✅ Login successful for user:', data.user.username);
        
        // Store session data
        setSessionData({
          token: data.token,
          user: data.user
        });
        
        // Sync to cookies for middleware access
        syncTokenToCookies();
        
        setUser(data.user);
        
        return {
          success: true,
          message: '로그인이 성공했습니다.'
        };
      } else {
        console.log('❌ Login failed:', data.error);
        return {
          success: false,
          message: data.error || '로그인에 실패했습니다.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    console.log('🔒 Logging out user...');
    
    try {
      // Clear session storage and cookies
      clearTokenEverywhere();
      setUser(null);
      
      // Optional: notify server about logout
      // This is not critical so we don't wait for it
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeader(),
      }).catch(() => {
        // Ignore logout API errors
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the user state
      clearTokenEverywhere();
      setUser(null);
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: getAuthHeader(),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token && data.user) {
          console.log('✅ Token refreshed successfully');
          
          // Update session data
          setSessionData({
            token: data.token,
            user: data.user
          });
          
          // Sync to cookies
          syncTokenToCookies();
          
          setUser(data.user);
          return true;
        }
      }
      
      console.log('❌ Token refresh failed');
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  // Role checking function
  const hasRole = useCallback((role: 'admin' | 'manager' | 'user') => {
    return user?.role === role;
  }, [user]);

  // Permission calculations
  const isAdmin = checkAdminRole();
  const isManager = checkManagerRole();
  const canCreateRecords = checkCanCreateRecords();
  const canDeleteRecords = checkCanDeleteRecords();
  const canManageUsers = isAdmin;
  const canEditRecords = isManager || isAdmin;

  // Auth context value
  const value: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated: !!user && checkAuthenticated(),
    
    // Actions
    login,
    logout,
    refreshToken,
    
    // Permission helpers
    hasRole,
    canManageUsers,
    canDeleteRecords,
    canCreateRecords,
    canEditRecords,
    isAdmin,
    isManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protecting routes that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      }
    }, [isAuthenticated, isLoading]);

    // Show loading while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      );
    }

    // Don't render component if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// HOC for protecting routes that require specific roles
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: 'admin' | 'manager',
  fallbackComponent?: React.ComponentType<P>
) {
  return function RoleProtectedComponent(props: P) {
    const { hasRole, isLoading, isAuthenticated } = useAuth();
    const hasRequiredRole = hasRole(requiredRole);

    // Redirect to login if not authenticated
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }, [isAuthenticated, isLoading]);

    // Show loading while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">권한 확인 중...</p>
          </div>
        </div>
      );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    // Show fallback component or access denied message if no required role
    if (!hasRequiredRole) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">접근 권한 없음</h2>
            <p className="text-gray-600 mb-4">
              이 페이지에 접근하려면 {requiredRole === 'admin' ? '관리자' : '매니저'} 권한이 필요합니다.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              이전 페이지로
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}