/**
 * Employee Service
 * Handles all employee-related API operations
 * Based on the original system's employee management functionality
 */

import { ApiClient } from '@/lib/api-client';
import type { Employee, CreateEmployeeData, UpdateEmployeeData } from '@/types/employee';
import type { ApiResponse } from '@/types/api';

export class EmployeeService {
  constructor(private client: ApiClient) {}

  /**
   * Get all employees
   */
  async getAll(): Promise<ApiResponse<Employee[]>> {
    return this.client.get<Employee[]>('/employees');
  }

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<ApiResponse<Employee>> {
    return this.client.get<Employee>(`/employees/${id}`);
  }

  /**
   * Create new employee
   */
  async create(data: CreateEmployeeData): Promise<ApiResponse<Employee>> {
    return this.client.post<Employee>('/employees', data);
  }

  /**
   * Update employee
   */
  async update(id: string, data: UpdateEmployeeData): Promise<ApiResponse<Employee>> {
    return this.client.put<Employee>(`/employees/${id}`, data);
  }

  /**
   * Delete employee
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/employees/${id}`);
  }

  /**
   * Search employees
   */
  async search(query: string): Promise<ApiResponse<Employee[]>> {
    return this.client.get<Employee[]>(`/employees/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get employees by department
   */
  async getByDepartment(department: string): Promise<ApiResponse<Employee[]>> {
    return this.client.get<Employee[]>(`/employees?department=${encodeURIComponent(department)}`);
  }

  /**
   * Export employees to Excel
   */
  async exportToExcel(): Promise<ApiResponse<Blob>> {
    return this.client.get<Blob>('/employees/export/excel', {
      headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    });
  }
}