/**
 * Hardware Service
 * Handles all hardware asset-related API operations
 * Based on the original system's hardware management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { 
  Hardware, 
  CreateHardwareData, 
  UpdateHardwareData,
  HardwareSearchParams,
  HardwareStats
} from '@/types/hardware';
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
   * Search hardware assets with advanced parameters
   */
  async search(params: HardwareSearchParams): Promise<ApiResponse<Hardware[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('q', params.query);
    }
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }
    
    if (params.page) {
      queryParams.append('page', String(params.page));
    }
    
    if (params.limit) {
      queryParams.append('limit', String(params.limit));
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/hardware/search?${queryString}` : '/hardware/search';
    
    return this.client.get<Hardware[]>(url);
  }

  /**
   * Simple search for backward compatibility
   */
  async simpleSearch(query: string): Promise<ApiResponse<Hardware[]>> {
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

  /**
   * Get hardware statistics
   */
  async getStatistics(): Promise<ApiResponse<HardwareStats>> {
    return this.client.get<HardwareStats>('/hardware/statistics');
  }

  /**
   * Get assigned hardware
   */
  async getAssigned(): Promise<ApiResponse<Hardware[]>> {
    return this.client.get<Hardware[]>('/hardware/assigned');
  }

  /**
   * Get hardware assignment history
   */
  async getAssignmentHistory(id: string): Promise<ApiResponse<any[]>> {
    return this.client.get<any[]>(`/hardware/${id}/assignments`);
  }

  /**
   * Update hardware status
   */
  async updateStatus(id: string, status: string, notes?: string): Promise<ApiResponse<Hardware>> {
    return this.client.put<Hardware>(`/hardware/${id}/status`, { status, notes });
  }

  /**
   * Assign hardware to employee
   */
  async assign(hardwareId: string, employeeId: string, notes?: string): Promise<ApiResponse<any>> {
    return this.client.post<any>('/assignments', {
      asset_type: 'hardware',
      asset_id: hardwareId,
      employee_id: employeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      notes
    });
  }

  /**
   * Return hardware asset
   */
  async return(assignmentId: string, returnDate?: string, notes?: string): Promise<ApiResponse<any>> {
    return this.client.put<any>(`/assignments/${assignmentId}/return`, {
      return_date: returnDate || new Date().toISOString().split('T')[0],
      notes
    });
  }

  /**
   * Bulk update hardware assets
   */
  async bulkUpdate(updates: Array<{ id: string; data: UpdateHardwareData }>): Promise<ApiResponse<Hardware[]>> {
    return this.client.post<Hardware[]>('/hardware/bulk-update', { updates });
  }

  /**
   * Bulk delete hardware assets
   */
  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return this.client.post<void>('/hardware/bulk-delete', { ids });
  }

  /**
   * Validate hardware data
   */
  validateHardwareData(data: CreateHardwareData | UpdateHardwareData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation for creation
    if ('type' in data && !data.type?.trim()) {
      errors.push('하드웨어 유형은 필수 입력 항목입니다.');
    }

    if ('manufacturer' in data && !data.manufacturer?.trim()) {
      errors.push('제조사는 필수 입력 항목입니다.');
    }

    if ('model' in data && !data.model?.trim()) {
      errors.push('모델명은 필수 입력 항목입니다.');
    }

    if ('serial_number' in data && !data.serial_number?.trim()) {
      errors.push('시리얼 번호는 필수 입력 항목입니다.');
    }

    // Price validation
    if (data.price !== undefined && data.price !== null) {
      if (data.price < 0) {
        errors.push('가격은 0 이상이어야 합니다.');
      }
      if (data.price > 999999999) {
        errors.push('가격이 너무 큽니다.');
      }
    }

    // Date validation
    if (data.purchase_date) {
      const purchaseDate = new Date(data.purchase_date);
      const today = new Date();
      
      if (isNaN(purchaseDate.getTime())) {
        errors.push('올바른 구매일자 형식을 입력해주세요.');
      } else if (purchaseDate > today) {
        errors.push('구매일자는 오늘 날짜보다 이후일 수 없습니다.');
      }
    }

    // Serial number format validation (basic)
    if ('serial_number' in data && data.serial_number) {
      if (data.serial_number.length < 3) {
        errors.push('시리얼 번호는 최소 3자 이상이어야 합니다.');
      }
      if (data.serial_number.length > 50) {
        errors.push('시리얼 번호는 50자를 초과할 수 없습니다.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format hardware for display
   */
  formatHardwareForDisplay(hardware: Hardware): string {
    return `${hardware.type} ${hardware.manufacturer} ${hardware.model} (${hardware.id})`;
  }

  /**
   * Calculate hardware value statistics
   */
  calculateValueStats(hardwareList: Hardware[]): { total: number; average: number; min: number; max: number } {
    const validPrices = hardwareList
      .map(hw => hw.price)
      .filter((price): price is number => typeof price === 'number' && price > 0);

    if (validPrices.length === 0) {
      return { total: 0, average: 0, min: 0, max: 0 };
    }

    const total = validPrices.reduce((sum, price) => sum + price, 0);
    const average = total / validPrices.length;
    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);

    return { total, average, min, max };
  }

  /**
   * Filter hardware by multiple criteria
   */
  filterHardware(
    hardwareList: Hardware[], 
    filters: {
      search?: string;
      type?: string;
      manufacturer?: string;
      status?: string;
      assignedTo?: string;
      priceRange?: { min?: number; max?: number };
    }
  ): Hardware[] {
    return hardwareList.filter(hardware => {
      // Search filter (searches across multiple fields)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchFields = [
          hardware.id,
          hardware.type,
          hardware.manufacturer,
          hardware.model,
          hardware.serial_number,
          hardware.assigned_to_name || '',
          hardware.notes || ''
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(searchLower)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && hardware.type !== filters.type) {
        return false;
      }

      // Manufacturer filter
      if (filters.manufacturer && hardware.manufacturer !== filters.manufacturer) {
        return false;
      }

      // Status filter
      if (filters.status && hardware.status !== filters.status) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo) {
        if (filters.assignedTo === 'unassigned' && hardware.assigned_to) {
          return false;
        }
        if (filters.assignedTo === 'assigned' && !hardware.assigned_to) {
          return false;
        }
        if (filters.assignedTo !== 'assigned' && filters.assignedTo !== 'unassigned' && 
            hardware.assigned_to !== filters.assignedTo) {
          return false;
        }
      }

      // Price range filter
      if (filters.priceRange && hardware.price) {
        if (filters.priceRange.min !== undefined && hardware.price < filters.priceRange.min) {
          return false;
        }
        if (filters.priceRange.max !== undefined && hardware.price > filters.priceRange.max) {
          return false;
        }
      }

      return true;
    });
  }
}