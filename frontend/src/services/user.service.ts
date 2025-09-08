/**
 * User Service
 * Handles all user management-related API operations
 * Based on the original system's user management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { User, CreateUserData, UpdateUserData } from '@/types/user';
import type { ApiResponse } from '@/types/api';

export class UserService {
  constructor(private client: ApiClient) {}

  /**
   * Get all users (Admin only)
   */
  async getAll(): Promise<ApiResponse<User[]>> {
    return this.client.get<User[]>('/users');
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<ApiResponse<User>> {
    return this.client.get<User>(`/users/${id}`);
  }

  /**
   * Create new user (Admin only)
   */
  async create(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.client.post<User>('/users', data);
  }

  /**
   * Update user (Admin only)
   */
  async update(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/users/${id}`, data);
  }

  /**
   * Delete user (Admin only)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/users/${id}`);
  }

  /**
   * Activate user (Admin only)
   */
  async activate(id: string): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/users/${id}/activate`);
  }

  /**
   * Deactivate user (Admin only)
   */
  async deactivate(id: string): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/users/${id}/deactivate`);
  }

  /**
   * Change user password
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/users/${id}/password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Reset user password (Admin only)
   */
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/users/${id}/reset-password`, {
      newPassword
    });
  }

  /**
   * Get users by role
   */
  async getByRole(role: 'admin' | 'manager' | 'user'): Promise<ApiResponse<User[]>> {
    return this.client.get<User[]>(`/users?role=${role}`);
  }

  /**
   * Search users
   */
  async search(query: string): Promise<ApiResponse<User[]>> {
    return this.client.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }
}