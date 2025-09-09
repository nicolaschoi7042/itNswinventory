/**
 * Hardware Asset Management Types
 * Based on the original system's hardware management functionality
 */

// Hardware asset status options
export const HARDWARE_STATUSES = [
  '대기중',
  '사용중', 
  '수리중',
  '폐기'
] as const;

// Hardware asset types
export const HARDWARE_TYPES = [
  'Desktop',
  'Laptop',
  'Monitor',
  'Printer',
  'Scanner',
  'Server',
  'Network Equipment',
  'Mobile Device',
  'Tablet',
  'Accessories',
  'Other'
] as const;

// Hardware manufacturers (common ones)
export const HARDWARE_MANUFACTURERS = [
  'Samsung',
  'LG',
  'Dell',
  'HP',
  'Lenovo',
  'ASUS',
  'Acer',
  'Apple',
  'Microsoft',
  'Canon',
  'Epson',
  'Cisco',
  'Other'
] as const;

// Base hardware interface
export interface Hardware {
  id: string;                    // Asset tag (HW001, HW002, etc.)
  type: string;                  // Hardware type
  manufacturer: string;          // Manufacturer name
  model: string;                 // Model name/number
  serial_number: string;         // Serial number
  purchase_date?: string;        // Purchase date (YYYY-MM-DD)
  price?: number;               // Purchase price
  status: typeof HARDWARE_STATUSES[number];
  assigned_to?: string;         // Employee ID if assigned
  assigned_to_name?: string;    // Employee name (from JOIN)
  notes?: string;               // Additional notes
  created_at?: string;          // Creation timestamp
  updated_at?: string;          // Last update timestamp
  is_active?: boolean;          // Soft delete flag
}

// Hardware with extended information (for display)
export interface HardwareWithAssignee extends Hardware {
  assignedEmployeeName?: string; // For display purposes
  assignmentDate?: string;       // When it was assigned
  assignmentHistory?: Assignment[]; // Assignment history
}

// Hardware creation data (omits auto-generated fields)
export interface CreateHardwareData {
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  purchase_date?: string;
  price?: number;
  notes?: string;
}

// Hardware update data (omits immutable fields)
export interface UpdateHardwareData {
  type?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  price?: number;
  status?: typeof HARDWARE_STATUSES[number];
  notes?: string;
}

// Hardware filter options
export interface HardwareFilters {
  type?: string;
  manufacturer?: string;
  status?: string;
  assignedTo?: string;
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

// Hardware search parameters
export interface HardwareSearchParams {
  query?: string;               // Search term
  filters?: HardwareFilters;    // Filter options
  sortBy?: string;              // Sort field
  sortOrder?: 'asc' | 'desc';   // Sort direction
  page?: number;                // Pagination
  limit?: number;               // Items per page
}

// Assignment interface (for assignment history)
export interface Assignment {
  id: string;
  asset_type: 'hardware' | 'software';
  asset_id: string;
  employee_id: string;
  employee_name?: string;
  assigned_date: string;
  returned_date?: string;
  status: string;
  notes?: string;
  assigned_by?: string;
}

// Hardware statistics
export interface HardwareStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  totalValue: number;
  averageAge: number;
}

// Type guards
export function isValidHardwareStatus(status: string): status is typeof HARDWARE_STATUSES[number] {
  return HARDWARE_STATUSES.includes(status as typeof HARDWARE_STATUSES[number]);
}

export function isValidHardwareType(type: string): type is typeof HARDWARE_TYPES[number] {
  return HARDWARE_TYPES.includes(type as typeof HARDWARE_TYPES[number]);
}

// Hardware form validation schema
export interface HardwareFormData {
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  price: string;
  status: string;
  notes: string;
}

// Hardware table column configuration
export interface HardwareTableColumn {
  id: keyof Hardware | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render?: (value: any, hardware: Hardware) => React.ReactNode;
}

// Export type for hardware table data
export type HardwareTableData = HardwareWithAssignee;

// Re-export commonly used types
export type HardwareStatus = typeof HARDWARE_STATUSES[number];
export type HardwareType = typeof HARDWARE_TYPES[number];
export type HardwareManufacturer = typeof HARDWARE_MANUFACTURERS[number];