/**
 * Assignment Service
 * Handles all asset assignment-related API operations
 * Based on the original system's assignment management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { Assignment, CreateAssignmentData, UpdateAssignmentData } from '@/types/assignment';
import type { ApiResponse } from '@/types/api';

export class AssignmentService {
  constructor(private client: ApiClient) {}

  /**
   * Get all assignments
   */
  async getAll(): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>('/assignments');
  }

  /**
   * Get assignment by ID
   */
  async getById(id: string): Promise<ApiResponse<Assignment>> {
    return this.client.get<Assignment>(`/assignments/${id}`);
  }

  /**
   * Create new assignment
   */
  async create(data: CreateAssignmentData): Promise<ApiResponse<Assignment>> {
    return this.client.post<Assignment>('/assignments', data);
  }

  /**
   * Update assignment
   */
  async update(id: string, data: UpdateAssignmentData): Promise<ApiResponse<Assignment>> {
    return this.client.put<Assignment>(`/assignments/${id}`, data);
  }

  /**
   * Delete assignment
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/assignments/${id}`);
  }

  /**
   * Return asset (mark assignment as returned)
   */
  async returnAsset(id: string, returnData: {
    notes?: string;
    condition?: string;
    rating?: number;
    issues?: string[];
    return_date?: string;
  }): Promise<ApiResponse<Assignment>> {
    return this.client.put<Assignment>(`/assignments/${id}/return`, returnData);
  }

  /**
   * Get assignments by employee
   */
  async getByEmployee(employeeId: string): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>(`/assignments?employee_id=${employeeId}`);
  }

  /**
   * Get assignments by asset type
   */
  async getByAssetType(assetType: 'hardware' | 'software'): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>(`/assignments?asset_type=${assetType}`);
  }

  /**
   * Get active assignments
   */
  async getActive(): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>('/assignments?status=active');
  }

  /**
   * Get overdue assignments
   */
  async getOverdue(): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>('/assignments?status=overdue');
  }

  /**
   * Search assignments
   */
  async search(query: string): Promise<ApiResponse<Assignment[]>> {
    return this.client.get<Assignment[]>(`/assignments/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Export assignments to Excel
   */
  async exportToExcel(): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>('/assignments/export/excel', {
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
  }
}