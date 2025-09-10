/**
 * Assignment Management Types
 * 
 * This file contains all TypeScript interfaces and types for the asset assignment system.
 * It handles both hardware and software assignment workflows with comprehensive validation.
 */

// Assignment status types
export type AssignmentStatus = 
  | '사용중'      // Currently assigned and in use
  | '반납완료'    // Returned and completed
  | '대기중'      // Waiting for assignment
  | '연체'        // Overdue return
  | '분실'        // Lost or missing
  | '손상';       // Damaged

// Asset types that can be assigned
export type AssetType = 'hardware' | 'software';

// Base assignment interface
export interface Assignment {
  id: string;
  employee_id: string;
  employee_name: string;
  asset_id: string;
  asset_type: AssetType;
  asset_description?: string;
  assigned_date: string; // ISO date string
  return_date?: string; // ISO date string, null if not returned
  status: AssignmentStatus;
  notes?: string;
  assigned_by: string; // User ID who made the assignment
  returned_by?: string; // User ID who processed the return
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Assignment with populated employee and asset data
export interface AssignmentWithDetails extends Assignment {
  employee: {
    id: string;
    name: string;
    department: string;
    position: string;
    email?: string;
  };
  asset: {
    id: string;
    name: string;
    type: string;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
  };
}

// Data for creating new assignments
export interface CreateAssignmentData {
  employee_id: string;
  asset_id: string;
  asset_type: AssetType;
  assigned_date: string; // ISO date string
  notes?: string;
  expected_return_date?: string; // ISO date string for temporary assignments
}

// Data for updating assignments
export interface UpdateAssignmentData {
  notes?: string;
  expected_return_date?: string;
  status?: AssignmentStatus;
}

// Data for returning assets
export interface ReturnAssignmentData {
  return_date: string; // ISO date string
  return_notes?: string;
  condition?: 'good' | 'fair' | 'poor' | 'damaged';
}

// Assignment search and filter parameters
export interface AssignmentSearchParams {
  query?: string; // Text search across employee names and asset descriptions
  filters?: AssignmentFilters;
  sortBy?: keyof Assignment;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AssignmentFilters {
  asset_type?: AssetType;
  status?: AssignmentStatus | AssignmentStatus[]; // Support both single and multiple status selection
  employee_id?: string;
  department?: string;
  asset_id?: string;
  manufacturer?: string;
  assigned_date_from?: string; // ISO date string
  assigned_date_to?: string; // ISO date string
  return_date_from?: string; // ISO date string
  return_date_to?: string; // ISO date string
  overdue?: boolean; // Filter for overdue returns
}

// Assignment statistics and analytics
export interface AssignmentStats {
  total_assignments: number;
  active_assignments: number;
  returned_assignments: number;
  overdue_assignments: number;
  by_asset_type: {
    hardware: number;
    software: number;
  };
  by_status: Record<AssignmentStatus, number>;
  by_department: Record<string, number>;
  recent_assignments: Assignment[];
  recent_returns: Assignment[];
}

// Assignment history and audit trail
export interface AssignmentHistory {
  assignment_id: string;
  action: 'created' | 'updated' | 'returned' | 'deleted';
  performed_by: string;
  performed_at: string; // ISO date string
  details: Record<string, any>;
  notes?: string;
}

// Validation rules for assignments
export const ASSIGNMENT_VALIDATION_RULES = {
  notes: {
    maxLength: 500
  },
  return_notes: {
    maxLength: 500
  },
  assigned_date: {
    required: true,
    maxDate: new Date() // Cannot assign in the future
  },
  return_date: {
    required: false,
    maxDate: new Date() // Cannot return in the future
  }
} as const;

// Assignment status permissions and actions
export const ASSIGNMENT_STATUS_PERMISSIONS = {
  '사용중': {
    allowReturn: true,
    allowEdit: true,
    allowDelete: false
  },
  '반납완료': {
    allowReturn: false,
    allowEdit: false,
    allowDelete: true
  },
  '대기중': {
    allowReturn: false,
    allowEdit: true,
    allowDelete: true
  },
  '연체': {
    allowReturn: true,
    allowEdit: true,
    allowDelete: false
  },
  '분실': {
    allowReturn: false,
    allowEdit: true,
    allowDelete: false
  },
  '손상': {
    allowReturn: true,
    allowEdit: true,
    allowDelete: false
  }
} as const;

// Utility functions are now moved to @/utils/assignment.utils.ts
// Import them from there to avoid code duplication
// export { AssignmentUtils } from '@/utils/assignment.utils';

// Type guards
export const isAssignment = (obj: any): obj is Assignment => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.employee_id === 'string' &&
    typeof obj.asset_id === 'string' &&
    ['hardware', 'software'].includes(obj.asset_type) &&
    typeof obj.assigned_date === 'string' &&
    ['사용중', '반납완료', '대기중', '연체', '분실', '손상'].includes(obj.status);
};

export const isAssignmentWithDetails = (obj: any): obj is AssignmentWithDetails => {
  return isAssignment(obj) &&
    obj.employee &&
    typeof obj.employee.name === 'string' &&
    obj.asset &&
    typeof obj.asset.name === 'string';
};

// Default values
export const createDefaultAssignment = (): Partial<CreateAssignmentData> => ({
  assigned_date: new Date().toISOString().split('T')[0],
  notes: ''
});

export const createDefaultAssignmentFilters = (): AssignmentFilters => ({
  asset_type: undefined,
  status: undefined,
  employee_id: undefined,
  department: undefined,
  assigned_date_from: undefined,
  assigned_date_to: undefined,
  return_date_from: undefined,
  return_date_to: undefined,
  overdue: undefined
});