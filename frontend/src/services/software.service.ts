/**
 * Software Service
 * Handles all software license-related API operations
 * Based on the original system's software management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { Software, CreateSoftwareData, UpdateSoftwareData } from '@/types/software';
import type { ApiResponse } from '@/types/api';

export class SoftwareService {
  constructor(private client: ApiClient) {}

  /**
   * Get all software licenses
   */
  async getAll(): Promise<ApiResponse<Software[]>> {
    return this.client.get<Software[]>('/software');
  }

  /**
   * Get software by ID
   */
  async getById(id: string): Promise<ApiResponse<Software>> {
    return this.client.get<Software>(`/software/${id}`);
  }

  /**
   * Create new software license
   */
  async create(data: CreateSoftwareData): Promise<ApiResponse<Software>> {
    return this.client.post<Software>('/software', data);
  }

  /**
   * Update software license
   */
  async update(id: string, data: UpdateSoftwareData): Promise<ApiResponse<Software>> {
    return this.client.put<Software>(`/software/${id}`, data);
  }

  /**
   * Delete software license
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/software/${id}`);
  }

  /**
   * Search software licenses
   */
  async search(query: string): Promise<ApiResponse<Software[]>> {
    return this.client.get<Software[]>(`/software/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get software by category
   */
  async getByCategory(category: string): Promise<ApiResponse<Software[]>> {
    return this.client.get<Software[]>(`/software?category=${encodeURIComponent(category)}`);
  }

  /**
   * Get software by vendor
   */
  async getByVendor(vendor: string): Promise<ApiResponse<Software[]>> {
    return this.client.get<Software[]>(`/software?vendor=${encodeURIComponent(vendor)}`);
  }

  /**
   * Get expiring licenses (within next N days)
   */
  async getExpiring(days: number = 30): Promise<ApiResponse<Software[]>> {
    return this.client.get<Software[]>(`/software/expiring?days=${days}`);
  }

  /**
   * Get license usage statistics
   */
  async getUsageStats(): Promise<ApiResponse<any>> {
    return this.client.get('/software/usage-stats');
  }

  /**
   * Export software to Excel
   */
  async exportToExcel(): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>('/software/export/excel', {
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
  }
}