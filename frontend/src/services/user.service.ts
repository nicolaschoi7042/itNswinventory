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
    return this.client.get<User[]>('/admin/users');
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<ApiResponse<User>> {
    return this.client.get<User>(`/admin/users/${id}`);
  }

  /**
   * Create new user (Admin only)
   */
  async create(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.client.post<User>('/admin/users', data);
  }

  /**
   * Update user (Admin only)
   */
  async update(id: string, data: UpdateUserData): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/admin/users/${id}`, data);
  }

  /**
   * Delete user (Admin only)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/admin/users/${id}`);
  }

  /**
   * Activate user (Admin only)
   */
  async activate(id: string): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/admin/users/${id}/status`, { is_active: true });
  }

  /**
   * Deactivate user (Admin only)
   */
  async deactivate(id: string): Promise<ApiResponse<User>> {
    return this.client.put<User>(`/admin/users/${id}/status`, { is_active: false });
  }

  /**
   * Change user password (Not implemented in backend yet)
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    // TODO: Implement password change API in backend
    throw new Error('Change password API not implemented yet');
  }

  /**
   * Reset user password (Admin only)
   */
  async resetPassword(
    id: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/admin/users/${id}/reset-password`, {
      new_password: newPassword,
    });
  }

  /**
   * Get users by role (Not implemented in backend yet)
   */
  async getByRole(
    role: 'admin' | 'manager' | 'user'
  ): Promise<ApiResponse<User[]>> {
    // TODO: Implement role-based user filtering in backend
    throw new Error('Get users by role API not implemented yet');
  }

  /**
   * Search users (Not implemented in backend yet)
   */
  async search(query: string): Promise<ApiResponse<User[]>> {
    // TODO: Implement user search API in backend
    throw new Error('User search API not implemented yet');
  }
}
