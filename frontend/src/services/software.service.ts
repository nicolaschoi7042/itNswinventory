/**
 * Software Service
 * API integration and business logic for software inventory management
 */

import { AxiosResponse } from 'axios';
import { ApiService } from './api.service';
import { 
  Software, 
  SoftwareWithAssignments,
  CreateSoftwareData, 
  UpdateSoftwareData,
  SoftwareSearchParams,
  SoftwareStats,
  SoftwareAssignmentData,
  SoftwareReturnData,
  SoftwareAssignment,
  calculateLicenseUtilization,
  getSoftwareLicenseStatus
} from '../types/software';

export class SoftwareService {
  private static readonly ENDPOINT = '/api/software';
  private static readonly ASSIGNMENTS_ENDPOINT = '/api/assignments';

  /**
   * Get all software items
   */
  static async getSoftware(): Promise<Software[]> {
    try {
      const response: AxiosResponse<Software[]> = await ApiService.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch software:', error);
      throw new Error('소프트웨어 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Get software with assignment information
   */
  static async getSoftwareWithAssignments(): Promise<SoftwareWithAssignments[]> {
    try {
      const [software, assignments] = await Promise.all([
        this.getSoftware(),
        this.getSoftwareAssignments()
      ]);

      return software.map(sw => {
        const swAssignments = assignments.filter(a => 
          a.asset_type === 'software' && 
          a.asset_id === sw.id && 
          a.status === '사용중'
        );
        
        const assignedUsers = swAssignments.length;
        const availableLicenses = Math.max(0, sw.total_licenses - assignedUsers);
        const licenseUtilization = sw.total_licenses > 0 
          ? Math.round((assignedUsers / sw.total_licenses) * 100) 
          : 0;

        return {
          ...sw,
          assignedUsers,
          availableLicenses,
          licenseUtilization,
          assignmentHistory: swAssignments
        };
      });
    } catch (error) {
      console.error('Failed to fetch software with assignments:', error);
      throw new Error('소프트웨어 할당 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Get software by ID
   */
  static async getSoftwareById(id: string): Promise<Software> {
    try {
      const response: AxiosResponse<Software> = await ApiService.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch software ${id}:`, error);
      throw new Error('소프트웨어 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Create new software
   */
  static async createSoftware(data: CreateSoftwareData): Promise<Software> {
    try {
      const response: AxiosResponse<Software> = await ApiService.post(this.ENDPOINT, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create software:', error);
      throw new Error('소프트웨어 등록에 실패했습니다.');
    }
  }

  /**
   * Update software
   */
  static async updateSoftware(id: string, data: UpdateSoftwareData): Promise<Software> {
    try {
      const response: AxiosResponse<Software> = await ApiService.put(`${this.ENDPOINT}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update software ${id}:`, error);
      throw new Error('소프트웨어 정보 수정에 실패했습니다.');
    }
  }

  /**
   * Delete software (admin only)
   */
  static async deleteSoftware(id: string): Promise<void> {
    try {
      await ApiService.delete(`${this.ENDPOINT}/${id}`);
    } catch (error) {
      console.error(`Failed to delete software ${id}:`, error);
      throw new Error('소프트웨어 삭제에 실패했습니다.');
    }
  }

  /**
   * Search software with filters
   */
  static async searchSoftware(params: SoftwareSearchParams): Promise<{
    software: SoftwareWithAssignments[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('q', params.query);
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            if (typeof value === 'object' && value !== null) {
              queryParams.append(key, JSON.stringify(value));
            } else {
              queryParams.append(key, String(value));
            }
          }
        });
      }
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.page) queryParams.append('page', String(params.page));
      if (params.limit) queryParams.append('limit', String(params.limit));

      const response = await ApiService.get(`${this.ENDPOINT}/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search software:', error);
      throw new Error('소프트웨어 검색에 실패했습니다.');
    }
  }

  /**
   * Get software statistics
   */
  static async getSoftwareStats(): Promise<SoftwareStats> {
    try {
      const response: AxiosResponse<SoftwareStats> = await ApiService.get(`${this.ENDPOINT}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch software stats:', error);
      throw new Error('소프트웨어 통계를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Get software assignments
   */
  static async getSoftwareAssignments(): Promise<SoftwareAssignment[]> {
    try {
      const response: AxiosResponse<SoftwareAssignment[]> = await ApiService.get(
        `${this.ASSIGNMENTS_ENDPOINT}?asset_type=software`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch software assignments:', error);
      throw new Error('소프트웨어 할당 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Get assignment history for specific software
   */
  static async getSoftwareAssignmentHistory(softwareId: string): Promise<SoftwareAssignment[]> {
    try {
      const response: AxiosResponse<SoftwareAssignment[]> = await ApiService.get(
        `${this.ASSIGNMENTS_ENDPOINT}?asset_type=software&asset_id=${softwareId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch assignment history for software ${softwareId}:`, error);
      throw new Error('할당 이력을 불러오는데 실패했습니다.');
    }
  }

  /**
   * Assign software license to employee
   */
  static async assignSoftware(data: SoftwareAssignmentData): Promise<SoftwareAssignment> {
    try {
      const assignmentData = {
        employee_id: data.employee_id,
        asset_type: 'software',
        asset_id: data.software_id,
        assigned_date: new Date().toISOString().split('T')[0],
        status: '사용중',
        notes: data.notes
      };

      const response: AxiosResponse<SoftwareAssignment> = await ApiService.post(
        this.ASSIGNMENTS_ENDPOINT, 
        assignmentData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to assign software:', error);
      throw new Error('소프트웨어 할당에 실패했습니다.');
    }
  }

  /**
   * Return software license
   */
  static async returnSoftware(data: SoftwareReturnData): Promise<SoftwareAssignment> {
    try {
      const returnData = {
        return_date: data.return_date || new Date().toISOString().split('T')[0],
        return_notes: data.return_notes,
        status: '반납완료'
      };

      const response: AxiosResponse<SoftwareAssignment> = await ApiService.put(
        `${this.ASSIGNMENTS_ENDPOINT}/${data.assignment_id}/return`,
        returnData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to return software:', error);
      throw new Error('소프트웨어 반납에 실패했습니다.');
    }
  }

  /**
   * Check license availability
   */
  static async checkLicenseAvailability(softwareId: string): Promise<{
    available: boolean;
    total: number;
    used: number;
    remaining: number;
  }> {
    try {
      const [software, assignments] = await Promise.all([
        this.getSoftwareById(softwareId),
        this.getSoftwareAssignmentHistory(softwareId)
      ]);

      const activeAssignments = assignments.filter(a => a.status === '사용중');
      const used = activeAssignments.length;
      const remaining = Math.max(0, software.total_licenses - used);

      return {
        available: remaining > 0,
        total: software.total_licenses,
        used,
        remaining
      };
    } catch (error) {
      console.error(`Failed to check license availability for ${softwareId}:`, error);
      throw new Error('라이선스 가용성 확인에 실패했습니다.');
    }
  }

  /**
   * Export software data to Excel
   */
  static async exportToExcel(params?: SoftwareSearchParams): Promise<Blob> {
    try {
      let endpoint = `${this.ENDPOINT}/export`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('q', params.query);
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
              if (typeof value === 'object' && value !== null) {
                queryParams.append(key, JSON.stringify(value));
              } else {
                queryParams.append(key, String(value));
              }
            }
          });
        }
        if (queryParams.toString()) {
          endpoint += `?${queryParams.toString()}`;
        }
      }

      const response = await ApiService.get(endpoint, {
        responseType: 'blob'
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Failed to export software data:', error);
      throw new Error('소프트웨어 데이터 내보내기에 실패했습니다.');
    }
  }

  /**
   * Download Excel file
   */
  static async downloadExcel(params?: SoftwareSearchParams, filename?: string): Promise<void> {
    try {
      const blob = await this.exportToExcel(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `software_inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download Excel file:', error);
      throw new Error('Excel 파일 다운로드에 실패했습니다.');
    }
  }

  /**
   * Export license utilization report to Excel
   */
  static async exportLicenseUtilizationReport(): Promise<Blob> {
    try {
      const response = await ApiService.get(`${this.ENDPOINT}/export/utilization`, {
        responseType: 'blob'
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Failed to export license utilization report:', error);
      throw new Error('라이선스 사용률 보고서 내보내기에 실패했습니다.');
    }
  }

  /**
   * Download license utilization report Excel file
   */
  static async downloadLicenseUtilizationReport(filename?: string): Promise<void> {
    try {
      const blob = await this.exportLicenseUtilizationReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `software_license_utilization_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download license utilization report:', error);
      throw new Error('라이선스 사용률 보고서 다운로드에 실패했습니다.');
    }
  }

  /**
   * Export assignment history to Excel
   */
  static async exportAssignmentHistory(softwareId?: string): Promise<Blob> {
    try {
      let endpoint = `${this.ASSIGNMENTS_ENDPOINT}/export`;
      if (softwareId) {
        endpoint += `?asset_type=software&asset_id=${softwareId}`;
      } else {
        endpoint += `?asset_type=software`;
      }

      const response = await ApiService.get(endpoint, {
        responseType: 'blob'
      });

      return new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    } catch (error) {
      console.error('Failed to export assignment history:', error);
      throw new Error('할당 이력 내보내기에 실패했습니다.');
    }
  }

  /**
   * Download assignment history Excel file
   */
  static async downloadAssignmentHistory(softwareId?: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportAssignmentHistory(softwareId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const defaultFilename = softwareId 
        ? `software_${softwareId}_assignment_history_${new Date().toISOString().split('T')[0]}.xlsx`
        : `software_assignment_history_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = filename || defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download assignment history:', error);
      throw new Error('할당 이력 다운로드에 실패했습니다.');
    }
  }

  /**
   * Get software license utilization report
   */
  static async getLicenseUtilizationReport(): Promise<{
    software: SoftwareWithAssignments[];
    summary: {
      totalSoftware: number;
      totalLicenses: number;
      usedLicenses: number;
      utilizationPercentage: number;
      underutilized: number; // < 50%
      wellUtilized: number;  // 50-80%
      overUtilized: number;  // > 80%
      fullyUtilized: number; // 100%
    };
  }> {
    try {
      const softwareWithAssignments = await this.getSoftwareWithAssignments();
      
      const totalSoftware = softwareWithAssignments.length;
      const totalLicenses = softwareWithAssignments.reduce((sum, sw) => sum + sw.total_licenses, 0);
      const usedLicenses = softwareWithAssignments.reduce((sum, sw) => sum + sw.assignedUsers, 0);
      const utilizationPercentage = totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0;

      let underutilized = 0;
      let wellUtilized = 0;
      let overUtilized = 0;
      let fullyUtilized = 0;

      softwareWithAssignments.forEach(sw => {
        const utilization = calculateLicenseUtilization(sw);
        if (utilization.percentage === 100) {
          fullyUtilized++;
        } else if (utilization.percentage > 80) {
          overUtilized++;
        } else if (utilization.percentage >= 50) {
          wellUtilized++;
        } else {
          underutilized++;
        }
      });

      return {
        software: softwareWithAssignments,
        summary: {
          totalSoftware,
          totalLicenses,
          usedLicenses,
          utilizationPercentage,
          underutilized,
          wellUtilized,
          overUtilized,
          fullyUtilized
        }
      };
    } catch (error) {
      console.error('Failed to generate license utilization report:', error);
      throw new Error('라이선스 사용률 보고서 생성에 실패했습니다.');
    }
  }

  /**
   * Get expiring licenses (within 30 days)
   */
  static async getExpiringLicenses(days: number = 30): Promise<Software[]> {
    try {
      const software = await this.getSoftware();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);

      return software.filter(sw => {
        if (!sw.expiry_date) return false;
        const expiryDate = new Date(sw.expiry_date);
        const today = new Date();
        return expiryDate >= today && expiryDate <= cutoffDate;
      });
    } catch (error) {
      console.error('Failed to get expiring licenses:', error);
      throw new Error('만료 예정 라이선스를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Get expired licenses
   */
  static async getExpiredLicenses(): Promise<Software[]> {
    try {
      const software = await this.getSoftware();
      const today = new Date();

      return software.filter(sw => {
        if (!sw.expiry_date) return false;
        const expiryDate = new Date(sw.expiry_date);
        return expiryDate < today;
      });
    } catch (error) {
      console.error('Failed to get expired licenses:', error);
      throw new Error('만료된 라이선스를 불러오는데 실패했습니다.');
    }
  }

  /**
   * Validate software data before submission
   */
  static validateSoftwareData(data: CreateSoftwareData | UpdateSoftwareData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Name validation
    if ('name' in data && (!data.name || data.name.trim().length < 2)) {
      errors.push('소프트웨어 이름은 최소 2자 이상이어야 합니다.');
    }

    // Total licenses validation
    if ('total_licenses' in data && data.total_licenses !== undefined) {
      if (data.total_licenses < 1) {
        errors.push('총 라이선스 수는 1개 이상이어야 합니다.');
      }
      if (data.total_licenses > 10000) {
        errors.push('총 라이선스 수는 10,000개를 초과할 수 없습니다.');
      }
    }

    // Price validation
    if ('price' in data && data.price !== undefined) {
      if (data.price < 0) {
        errors.push('가격은 0 이상이어야 합니다.');
      }
      if (data.price > 999999999) {
        errors.push('가격이 너무 큽니다.');
      }
    }

    // Date validation
    if ('purchase_date' in data && data.purchase_date) {
      const purchaseDate = new Date(data.purchase_date);
      if (isNaN(purchaseDate.getTime())) {
        errors.push('올바른 구매일자를 입력해주세요.');
      }
    }

    if ('expiry_date' in data && data.expiry_date) {
      const expiryDate = new Date(data.expiry_date);
      if (isNaN(expiryDate.getTime())) {
        errors.push('올바른 만료일자를 입력해주세요.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}