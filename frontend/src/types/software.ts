/**
 * Software Types and Interfaces
 * 소프트웨어 인벤토리 관리를 위한 TypeScript 타입 정의
 */

// Base Software interface matching database schema
export interface Software {
  id: string; // SW001, SW002, ...
  name: string;
  manufacturer?: string;
  version?: string;
  type?: string;
  license_type?: string;
  total_licenses: number;
  current_users: number;
  purchase_date?: string; // ISO date string
  expiry_date?: string; // ISO date string
  price?: number;
  is_active: boolean;
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  created_by?: number; // user ID
}

// Software with assignment information
export interface SoftwareWithAssignments extends Software {
  assignedUsers: number; // calculated field
  availableLicenses: number; // calculated field
  assignmentHistory?: SoftwareAssignment[];
  licenseUtilization: number; // percentage usage
}

// Software assignment interface
export interface SoftwareAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  asset_type: 'software';
  asset_id: string;
  assigned_date: string;
  return_date?: string;
  status: '사용중' | '반납완료';
  notes?: string;
  return_notes?: string;
  assigned_by?: number;
}

// Create Software Data (for POST requests)
export interface CreateSoftwareData {
  name: string;
  manufacturer?: string;
  version?: string;
  type?: string;
  license_type?: string;
  total_licenses: number;
  purchase_date?: string;
  expiry_date?: string;
  price?: number;
}

// Update Software Data (for PUT/PATCH requests)
export interface UpdateSoftwareData {
  name?: string;
  manufacturer?: string;
  version?: string;
  type?: string;
  license_type?: string;
  total_licenses?: number;
  purchase_date?: string;
  expiry_date?: string;
  price?: number;
}

// Software search parameters
export interface SoftwareSearchParams {
  query?: string;
  filters?: {
    type?: string;
    manufacturer?: string;
    license_type?: string;
    status?: 'active' | 'expired' | 'expiring_soon';
    purchase_date_from?: string;
    purchase_date_to?: string;
    expiry_date_from?: string;
    expiry_date_to?: string;
    price_range?: { min?: number; max?: number };
    license_utilization?: 'low' | 'medium' | 'high' | 'full';
  };
  sortBy?:
    | 'name'
    | 'manufacturer'
    | 'purchase_date'
    | 'expiry_date'
    | 'price'
    | 'license_utilization';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Software statistics interface
export interface SoftwareStats {
  totalSoftware: number;
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  totalValue: number;
  averageUtilization: number;
  expiringSoon: number; // licenses expiring within 30 days
  expired: number; // expired licenses
  byType: Record<string, number>;
  byManufacturer: Record<string, number>;
  byLicenseType: Record<string, number>;
}

// Software license status
export type SoftwareLicenseStatus = 'active' | 'expired' | 'expiring_soon';

// Software types predefined list
export const SOFTWARE_TYPES = [
  '운영체제',
  '오피스',
  '개발도구',
  '디자인',
  '보안',
  '데이터베이스',
  '서버',
  '네트워크',
  '백업',
  '가상화',
  '기타',
] as const;

// Software license types
export const SOFTWARE_LICENSE_TYPES = [
  '단일사용자',
  '다중사용자',
  '사이트',
  '볼륨',
  '구독',
  '영구',
  '교육용',
  '오픈소스',
  '기타',
] as const;

// Major software manufacturers
export const SOFTWARE_MANUFACTURERS = [
  'Microsoft',
  'Adobe',
  'Oracle',
  'SAP',
  'IBM',
  'VMware',
  'Autodesk',
  'Symantec',
  'McAfee',
  'Kaspersky',
  'Trend Micro',
  'JetBrains',
  'Atlassian',
  'Slack',
  'Zoom',
  '기타',
] as const;

// Type definitions for constants
export type SoftwareType = (typeof SOFTWARE_TYPES)[number];
export type SoftwareLicenseType = (typeof SOFTWARE_LICENSE_TYPES)[number];
export type SoftwareManufacturer = (typeof SOFTWARE_MANUFACTURERS)[number];

// Software form validation rules
export interface SoftwareValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  total_licenses: {
    required: boolean;
    min: number;
    max: number;
  };
  price: {
    min: number;
    max: number;
  };
  expiry_date: {
    mustBeFuture?: boolean;
  };
}

// Default validation rules
export const SOFTWARE_VALIDATION_RULES: SoftwareValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 200,
  },
  total_licenses: {
    required: true,
    min: 1,
    max: 10000,
  },
  price: {
    min: 0,
    max: 999999999,
  },
  expiry_date: {
    mustBeFuture: false, // Allow past expiry dates for record keeping
  },
};

// Software filters for UI components
export interface SoftwareFilters {
  search?: string;
  type?: string;
  manufacturer?: string;
  license_type?: string;
  status?: SoftwareLicenseStatus;
  purchase_date_from?: string;
  purchase_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
  utilization_filter?: 'low' | 'medium' | 'high' | 'full';
}

// License utilization calculation result
export interface LicenseUtilization {
  total: number;
  used: number;
  available: number;
  percentage: number;
  status: 'low' | 'medium' | 'high' | 'full';
  color: 'success' | 'warning' | 'error' | 'info';
}

// Software assignment request data
export interface SoftwareAssignmentData {
  software_id: string;
  employee_id: string;
  notes?: string;
}

// Software return request data
export interface SoftwareReturnData {
  assignment_id: string;
  return_date?: string;
  return_notes?: string;
}

// Type guards
export function isSoftware(obj: any): obj is Software {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.total_licenses === 'number' &&
    typeof obj.current_users === 'number' &&
    typeof obj.is_active === 'boolean'
  );
}

export function isSoftwareWithAssignments(
  obj: any
): obj is SoftwareWithAssignments {
  return (
    isSoftware(obj) &&
    typeof obj.assignedUsers === 'number' &&
    typeof obj.availableLicenses === 'number' &&
    typeof obj.licenseUtilization === 'number'
  );
}

// Utility functions
export function calculateLicenseUtilization(
  software: Software
): LicenseUtilization {
  const total = software.total_licenses;
  const used = software.current_users;
  const available = Math.max(0, total - used);
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

  let status: LicenseUtilization['status'];
  let color: LicenseUtilization['color'];

  if (percentage >= 100) {
    status = 'full';
    color = 'error';
  } else if (percentage >= 80) {
    status = 'high';
    color = 'warning';
  } else if (percentage >= 50) {
    status = 'medium';
    color = 'info';
  } else {
    status = 'low';
    color = 'success';
  }

  return {
    total,
    used,
    available,
    percentage,
    status,
    color,
  };
}

export function getSoftwareLicenseStatus(
  software: Software
): SoftwareLicenseStatus {
  if (!software.expiry_date) {
    return 'active';
  }

  const expiryDate = new Date(software.expiry_date);
  const today = new Date();
  const thirtyDaysFromNow = new Date(
    today.getTime() + 30 * 24 * 60 * 60 * 1000
  );

  if (expiryDate < today) {
    return 'expired';
  } else if (expiryDate <= thirtyDaysFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
}

export function formatSoftwareDisplayName(software: Software): string {
  let displayName = software.name;

  if (software.version) {
    displayName += ` v${software.version}`;
  }

  if (software.manufacturer) {
    displayName = `${software.manufacturer} ${displayName}`;
  }

  return displayName;
}

export function formatLicenseInfo(software: Software): string {
  const utilization = calculateLicenseUtilization(software);
  return `${utilization.used}/${utilization.total} 라이선스 사용 중 (${utilization.percentage}%)`;
}
