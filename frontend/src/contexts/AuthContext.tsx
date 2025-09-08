'use client';

// Authentication Context for managing authentication state across the app
// Based on the original IT Inventory System's authentication flow

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { type User, type LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  // Authentication state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Permission helpers
  hasRole: (role: 'Admin' | 'Manager' | 'User') => boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const storedUser = authService.getCurrentUser();
        
        if (storedUser) {
          // Validate token with backend
          const isValidToken = await authService.validateToken();
          
          if (isValidToken) {
            setUser(storedUser);
            
            // Optionally refresh user data from backend
            await authService.refreshUser();
            const refreshedUser = authService.getCurrentUser();
            if (refreshedUser) {
              setUser(refreshedUser);
            }
          } else {
            // Token is invalid, clear stored data
            await authService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If initialization fails, ensure user is logged out
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return {
        success: result.success,
        message: result.message || (result.success ? '로그인 성공' : '로그인 실패')
      };
    } catch (error) {
      console.error('Login error in context:', error);
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
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error in context:', error);
      // Even if logout fails, clear the user state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const refreshedUser = await authService.refreshUser();
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  // Role checking function
  const hasRole = useCallback((role: 'Admin' | 'Manager' | 'User') => {
    return authService.hasRole(role);
  }, []);

  // Get user permissions
  const permissions = authService.getUserPermissions(user);

  // Auth context value
  const value: AuthContextType = {
    // State
    user,
    isLoading,
    isAuthenticated: !!user,
    
    // Actions
    login,
    logout,
    refreshUser,
    
    // Permission helpers
    hasRole,
    canManageUsers: permissions.canManageUsers,
    canDeleteRecords: permissions.canDeleteRecords,
    canCreateRecords: permissions.canCreateRecords,
    canEditRecords: permissions.canEditRecords,
    isAdmin: permissions.isAdmin,
    isManager: permissions.isManager,
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
  requiredRole: 'Admin' | 'Manager',
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
              이 페이지에 접근하려면 {requiredRole === 'Admin' ? '관리자' : '매니저'} 권한이 필요합니다.
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