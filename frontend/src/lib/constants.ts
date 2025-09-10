// Application constants

// Asset status options
export const ASSET_STATUSES = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
} as const;

export const ASSET_STATUS_LABELS = {
  [ASSET_STATUSES.AVAILABLE]: '사용 가능',
  [ASSET_STATUSES.ASSIGNED]: '할당됨',
  [ASSET_STATUSES.MAINTENANCE]: '유지보수',
  [ASSET_STATUSES.RETIRED]: '폐기됨',
} as const;

export const ASSET_STATUS_COLORS = {
  [ASSET_STATUSES.AVAILABLE]: 'success',
  [ASSET_STATUSES.ASSIGNED]: 'warning',
  [ASSET_STATUSES.MAINTENANCE]: 'error',
  [ASSET_STATUSES.RETIRED]: 'default',
} as const;

// Employee status options
export const EMPLOYEE_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
} as const;

export const EMPLOYEE_STATUS_LABELS = {
  [EMPLOYEE_STATUSES.ACTIVE]: '재직',
  [EMPLOYEE_STATUSES.INACTIVE]: '휴직',
  [EMPLOYEE_STATUSES.TERMINATED]: '퇴사',
} as const;

export const EMPLOYEE_STATUS_COLORS = {
  [EMPLOYEE_STATUSES.ACTIVE]: 'success',
  [EMPLOYEE_STATUSES.INACTIVE]: 'warning',
  [EMPLOYEE_STATUSES.TERMINATED]: 'error',
} as const;

// License types
export const LICENSE_TYPES = {
  PERPETUAL: 'perpetual',
  SUBSCRIPTION: 'subscription',
  FREEWARE: 'freeware',
} as const;

export const LICENSE_TYPE_LABELS = {
  [LICENSE_TYPES.PERPETUAL]: '영구 라이선스',
  [LICENSE_TYPES.SUBSCRIPTION]: '구독',
  [LICENSE_TYPES.FREEWARE]: '무료',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: '관리자',
  [USER_ROLES.MANAGER]: '매니저',
  [USER_ROLES.USER]: '사용자',
} as const;

export const USER_ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'error',
  [USER_ROLES.MANAGER]: 'warning',
  [USER_ROLES.USER]: 'info',
} as const;

// Assignment status
export const ASSIGNMENT_STATUSES = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  TERMINATED: 'terminated',
} as const;

export const ASSIGNMENT_STATUS_LABELS = {
  [ASSIGNMENT_STATUSES.ACTIVE]: '사용중',
  [ASSIGNMENT_STATUSES.RETURNED]: '반납완료',
  [ASSIGNMENT_STATUSES.TERMINATED]: '종료',
} as const;

export const ASSIGNMENT_STATUS_COLORS = {
  [ASSIGNMENT_STATUSES.ACTIVE]: 'success',
  [ASSIGNMENT_STATUSES.RETURNED]: 'info',
  [ASSIGNMENT_STATUSES.TERMINATED]: 'default',
} as const;

// Common hardware types
export const HARDWARE_TYPES = [
  'Desktop',
  'Laptop',
  'Monitor',
  'Server',
  'Printer',
  'Scanner',
  'Network Equipment',
  'Mobile Device',
  'Tablet',
  'Accessories',
] as const;

// Common departments
export const DEPARTMENTS = [
  'IT',
  '인사',
  '재무',
  '마케팅',
  '영업',
  '개발',
  '디자인',
  '기획',
  '운영',
  '품질관리',
] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'YYYY년 MM월 DD일';
export const DISPLAY_DATETIME_FORMAT = 'YYYY년 MM월 DD일 HH:mm';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',

  // Employees
  EMPLOYEES: '/api/employees',
  EMPLOYEE: '/api/employees',

  // Hardware
  HARDWARE: '/api/hardware',
  HARDWARE_ITEM: '/api/hardware',

  // Software
  SOFTWARE: '/api/software',
  SOFTWARE_ITEM: '/api/software',

  // Assignments
  ASSIGNMENTS: '/api/assignments',
  ASSIGNMENT: '/api/assignments',
  ASSIGNMENT_RETURN: '/api/assignments',

  // Users
  USERS: '/api/users',
  USER: '/api/users',

  // Activities
  ACTIVITIES: '/api/activities',

  // Export
  EXPORT_EXCEL: '/api/export/excel',
} as const;
