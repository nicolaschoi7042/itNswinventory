/**
 * Hardware Service
 * Handles all hardware asset-related API operations
 * Based on the original system's hardware management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { Hardware, CreateHardwareData, UpdateHardwareData } from '@/types/hardware';
import type { ApiResponse } from '@/types/api';

export class HardwareService {
  constructor(private client: ApiClient) {}

  /**
   * Get all hardware assets
   */
  async getAll(): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>('/hardware');
  }

  /**
   * Get hardware by ID
   */
  async getById(id: string): Promise<ApiResponse<Hardware>> {
    return this.client.get<Hardware>(`/hardware/${id}`);
  }

  /**
   * Create new hardware asset
   */
  async create(data: CreateHardwareData): Promise<ApiResponse<Hardware>> {
    return this.client.post<Hardware>('/hardware', data);
  }

  /**
   * Update hardware asset
   */
  async update(id: string, data: UpdateHardwareData): Promise<ApiResponse<Hardware>> {
    return this.client.put<Hardware>(`/hardware/${id}`, data);
  }

  /**
   * Delete hardware asset
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/hardware/${id}`);
  }

  /**
   * Search hardware assets
   */
  async search(query: string): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>(`/hardware/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get hardware by type
   */
  async getByType(type: string): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>(`/hardware?type=${encodeURIComponent(type)}`);
  }

  /**
   * Get hardware by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>(`/hardware?status=${encodeURIComponent(status)}`);
  }

  /**
   * Get available hardware (not assigned)
   */
  async getAvailable(): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>('/hardware?status=available');
  }

  /**
   * Export hardware to Excel
   */
  async exportToExcel(): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>('/hardware/export/excel', {
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
  }
}