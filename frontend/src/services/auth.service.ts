// Authentication service for the IT Inventory System
// Handles login, logout, token management, and user session

import { apiClient, ApiError } from '@/lib/api-client';
import {
  setStoredToken,
  removeStoredToken,
  setStoredUser,
  getStoredToken,
  getStoredUser,
  type User,
  type LoginCredentials,
  type AuthResponse,
} from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

export class AuthService {
  /**
   * Login with username and password
   * Supports both LDAP and local authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{
        token: string;
        user: User;
        message?: string;
      }>('/api/auth/login', credentials);

      if (response.success && response.data) {
        const { token, user } = response.data;

        // Store token and user data
        setStoredToken(token);
        setStoredUser(user);

        return {
          success: true,
          token,
          user,
          message: response.data.message || '로그인 성공',
        };
      }

      return {
        success: false,
        message: response.message || '로그인에 실패했습니다.',
      };
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint if needed for session cleanup
      await apiClient.post('/api/auth/logout').catch(() => {
        // Ignore logout API errors - we'll clear local data anyway
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      removeStoredToken();

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Get current user from stored data
   */
  getCurrentUser(): User | null {
    return getStoredUser();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      return false;
    }

    // TODO: Optionally validate token expiry
    return true;
  }

  /**
   * Refresh user data from backend
   */
  async refreshUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/api/auth/me');

      if (response.success && response.data) {
        setStoredUser(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh user data:', error);

      // If unauthorized, clear stored data
      if (error instanceof ApiError && error.status === 401) {
        removeStoredToken();
      }

      return null;
    }
  }

  /**
   * Validate current token with backend
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/auth/validate');
      return response.success;
    } catch (error) {
      console.error('Token validation failed:', error);

      if (error instanceof ApiError && error.status === 401) {
        removeStoredToken();
      }

      return false;
    }
  }

  /**
   * Change password (for local accounts only)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return {
        success: response.success,
        message:
          response.message ||
          (response.success
            ? '비밀번호가 변경되었습니다.'
            : '비밀번호 변경에 실패했습니다.'),
      };
    } catch (error) {
      console.error('Password change error:', error);

      if (error instanceof ApiError) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Get user roles and permissions
   */
  getUserPermissions(user?: User | null): {
    canManageUsers: boolean;
    canDeleteRecords: boolean;
    canCreateRecords: boolean;
    canEditRecords: boolean;
    isAdmin: boolean;
    isManager: boolean;
  } {
    const currentUser = user || this.getCurrentUser();

    if (!currentUser) {
      return {
        canManageUsers: false,
        canDeleteRecords: false,
        canCreateRecords: false,
        canEditRecords: false,
        isAdmin: false,
        isManager: false,
      };
    }

    const isAdmin = currentUser.role === 'Admin';
    const isManager = currentUser.role === 'Manager' || isAdmin;

    return {
      canManageUsers: isAdmin,
      canDeleteRecords: isAdmin,
      canCreateRecords: isManager,
      canEditRecords: isManager,
      isAdmin,
      isManager,
    };
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: 'Admin' | 'Manager' | 'User'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    switch (role) {
      case 'Admin':
        return user.role === 'Admin';
      case 'Manager':
        return user.role === 'Manager' || user.role === 'Admin';
      case 'User':
        return true; // All authenticated users have at least User role
      default:
        return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
