/**
 * Software Service
 * Handles all software-related API operations and business logic
 */

import { ApiClient } from '@/lib/api-client';
import type {
  Software,
  SoftwareWithAssignments,
  CreateSoftwareData,
  UpdateSoftwareData,
  SoftwareSearchParams,
  SoftwareStats,
  SoftwareAssignmentData,
  SoftwareReturnData,
  SoftwareAssignment,
} from '@/types/software';
import type { ApiResponse } from '@/types/api';

export class SoftwareService {
  constructor(private client: ApiClient) {}

  /**
   * Get all software items
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
   * Create new software
   */
  async create(data: CreateSoftwareData): Promise<ApiResponse<Software>> {
    return this.client.post<Software>('/software', data);
  }

  /**
   * Update software
   */
  async update(
    id: string,
    data: UpdateSoftwareData
  ): Promise<ApiResponse<Software>> {
    return this.client.put<Software>(`/software/${id}`, data);
  }

  /**
   * Delete software
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/software/${id}`);
  }

  /**
   * Search software
   */
  async search(params: SoftwareSearchParams): Promise<ApiResponse<Software[]>> {
    const queryParams = new URLSearchParams();

    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.vendor) queryParams.append('vendor', params.vendor);
    if (params.status) queryParams.append('status', params.status);
    if (params.license_type)
      queryParams.append('license_type', params.license_type);
    if (params.version) queryParams.append('version', params.version);

    return this.client.get<Software[]>(
      `/software/search?${queryParams.toString()}`
    );
  }

  /**
   * Get software statistics
   */
  async getStats(): Promise<ApiResponse<SoftwareStats>> {
    return this.client.get<SoftwareStats>('/software/stats');
  }

  /**
   * Get software with assignment information
   */
  async getSoftwareWithAssignments(): Promise<
    ApiResponse<SoftwareWithAssignments[]>
  > {
    const softwareResponse = await this.getAll();
    const assignmentsResponse = await this.getSoftwareAssignments();

    if (!softwareResponse.success || !assignmentsResponse.success) {
      return {
        success: false,
        error: 'Failed to fetch software or assignments data',
      };
    }

    const software = softwareResponse.data;
    const assignments = assignmentsResponse.data;

    const softwareWithAssignments = software.map(sw => {
      const swAssignments = assignments.filter(
        a =>
          a.asset_type === 'software' &&
          a.asset_id === sw.id &&
          a.status === '사용중'
      );

      const assignedUsers = swAssignments.length;
      const availableLicenses = Math.max(0, sw.total_licenses - assignedUsers);
      const licenseUtilization =
        sw.total_licenses > 0
          ? Math.round((assignedUsers / sw.total_licenses) * 100)
          : 0;

      return {
        ...sw,
        assigned_users: assignedUsers,
        available_licenses: availableLicenses,
        license_utilization: licenseUtilization,
        assignments: swAssignments,
      };
    });

    return {
      success: true,
      data: softwareWithAssignments,
    };
  }

  /**
   * Get all software assignments
   */
  async getSoftwareAssignments(): Promise<ApiResponse<SoftwareAssignment[]>> {
    return this.client.get<SoftwareAssignment[]>('/assignments?type=software');
  }

  /**
   * Get assignments for specific software
   */
  async getAssignmentsBySoftware(
    softwareId: string
  ): Promise<ApiResponse<SoftwareAssignment[]>> {
    return this.client.get<SoftwareAssignment[]>(
      `/assignments?type=software&assetId=${softwareId}`
    );
  }

  /**
   * Create software assignment
   */
  async createAssignment(
    data: SoftwareAssignmentData
  ): Promise<ApiResponse<SoftwareAssignment>> {
    return this.client.post<SoftwareAssignment>('/assignments', {
      ...data,
      asset_type: 'software',
    });
  }

  /**
   * Update software assignment
   */
  async updateAssignment(
    id: string,
    data: Partial<SoftwareAssignmentData>
  ): Promise<ApiResponse<SoftwareAssignment>> {
    return this.client.put<SoftwareAssignment>(`/assignments/${id}`, data);
  }

  /**
   * Return software assignment
   */
  async returnAssignment(
    id: string,
    data: SoftwareReturnData
  ): Promise<ApiResponse<SoftwareAssignment>> {
    return this.client.put<SoftwareAssignment>(
      `/assignments/${id}/return`,
      data
    );
  }

  /**
   * Get license compliance report
   */
  async getLicenseComplianceReport(
    params: {
      category?: string;
      vendor?: string;
      criticality?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.vendor) queryParams.append('vendor', params.vendor);
    if (params.criticality)
      queryParams.append('criticality', params.criticality);

    return this.client.get<any>(
      `/software/compliance-report?${queryParams.toString()}`
    );
  }

  /**
   * Export license utilization report
   */
  async exportUtilizationReport(
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>(
      `/software/export/utilization?format=${format}`,
      {
        responseType: 'blob',
      }
    );
  }

  /**
   * Get software categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.client.get<string[]>('/software/categories');
  }

  /**
   * Get software vendors
   */
  async getVendors(): Promise<ApiResponse<string[]>> {
    return this.client.get<string[]>('/software/vendors');
  }

  /**
   * Bulk update software
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<UpdateSoftwareData> }>
  ): Promise<ApiResponse<Software[]>> {
    return this.client.put<Software[]>('/software/bulk-update', { updates });
  }

  /**
   * Import software from CSV
   */
  async importFromCSV(
    file: File
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post<{ imported: number; errors: string[] }>(
      '/software/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}

// Create and export service instance
const apiClient = new ApiClient();
const softwareService = new SoftwareService(apiClient);

export { softwareService };
export default softwareService;
