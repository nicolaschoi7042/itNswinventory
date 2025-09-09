/**
 * Employee Type Definitions
 * Based on the original system's database schema and API structure
 */

export interface Employee {
  id: string;                    // Employee ID (e.g., EMP001, EMP002)
  name: string;                  // Full name
  department: string;            // Department name
  position?: string;             // Job position
  hire_date?: string;           // Hire date (ISO string)
  email?: string;               // Email address
  phone?: string;               // Phone number
  is_deleted?: boolean;         // Soft delete flag
  created_at?: string;          // Creation timestamp
  updated_at?: string;          // Last update timestamp
  created_by?: string;          // User who created this record
  created_by_name?: string;     // Name of user who created this record
}

export interface CreateEmployeeData {
  name: string;
  department: string;
  position?: string;
  hire_date?: string;
  email?: string;
  phone?: string;
}

export interface UpdateEmployeeData {
  name?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  email?: string;
  phone?: string;
}

export interface EmployeeWithAssets extends Employee {
  assignedAssets: number;        // Count of assigned assets
  assignedAssetsDetails?: Array<{
    id: string;
    type: 'hardware' | 'software';
    name: string;
    status: string;
  }>;
}

// Department options from original system
export const DEPARTMENTS = [
  '개발팀',
  '영업팀', 
  '인사팀',
  '재무팀'
] as const;

export type Department = typeof DEPARTMENTS[number];

// Employee table column definitions for DataTable
export interface EmployeeTableColumn {
  id: keyof Employee | 'assignedAssets' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

export const EMPLOYEE_TABLE_COLUMNS: EmployeeTableColumn[] = [
  { id: 'id', label: '사번', minWidth: 100 },
  { id: 'name', label: '이름', minWidth: 120 },
  { id: 'department', label: '부서', minWidth: 120 },
  { id: 'assignedAssets', label: '할당된 자산', minWidth: 120, align: 'center' },
  { id: 'actions', label: '작업', minWidth: 120, align: 'center' }
];