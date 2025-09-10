/**
 * Authentication Hook
 *
 * Provides authentication state and role-based access control
 */

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'user';
  department?: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Mock authentication for development
    // In production, this would fetch from JWT token or auth service
    const mockUser: User = {
      id: 'user001',
      username: 'admin',
      name: '관리자',
      email: 'admin@company.com',
      role: 'admin',
      department: 'IT부서',
      permissions: ['read', 'write', 'delete', 'manage_users'],
    };

    setAuthState({
      user: mockUser,
      loading: false,
      error: null,
    });
  }, []);

  const hasAdminRole = (): boolean => {
    return authState.user?.role === 'admin';
  };

  const hasManagerRole = (): boolean => {
    return (
      authState.user?.role === 'admin' || authState.user?.role === 'manager'
    );
  };

  const hasPermission = (permission: string): boolean => {
    return authState.user?.permissions.includes(permission) || false;
  };

  const login = async (username: string, password: string): Promise<void> => {
    // Mock login implementation
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: 'user001',
        username,
        name: username === 'admin' ? '관리자' : '사용자',
        role: username === 'admin' ? 'admin' : 'user',
        permissions:
          username === 'admin'
            ? ['read', 'write', 'delete', 'manage_users']
            : ['read'],
      };

      setAuthState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : '로그인에 실패했습니다.',
      }));
    }
  };

  const logout = (): void => {
    setAuthState({
      user: null,
      loading: false,
      error: null,
    });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    hasAdminRole,
    hasManagerRole,
    hasPermission,
    login,
    logout,
  };
}
