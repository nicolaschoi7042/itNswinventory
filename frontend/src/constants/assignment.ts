/**
 * Assignment Module Constants and Validation Rules
 *
 * This file contains all constants, validation rules, and configuration
 * used throughout the assignment management system.
 */

import { AssignmentStatus, AssetType } from '@/types/assignment';

// ============================================================================
// ASSIGNMENT STATUS CONSTANTS
// ============================================================================

export const ASSIGNMENT_STATUSES = {
  ACTIVE: '사용중' as const,
  RETURNED: '반납완료' as const,
  PENDING: '대기중' as const,
  OVERDUE: '연체' as const,
  LOST: '분실' as const,
  DAMAGED: '손상' as const,
} as const;

export const ASSIGNMENT_STATUS_LIST: AssignmentStatus[] = [
  ASSIGNMENT_STATUSES.ACTIVE,
  ASSIGNMENT_STATUSES.RETURNED,
  ASSIGNMENT_STATUSES.PENDING,
  ASSIGNMENT_STATUSES.OVERDUE,
  ASSIGNMENT_STATUSES.LOST,
  ASSIGNMENT_STATUSES.DAMAGED,
];

export const ASSIGNMENT_STATUS_LABELS = {
  [ASSIGNMENT_STATUSES.ACTIVE]: '사용 중',
  [ASSIGNMENT_STATUSES.RETURNED]: '반납 완료',
  [ASSIGNMENT_STATUSES.PENDING]: '대기 중',
  [ASSIGNMENT_STATUSES.OVERDUE]: '연체',
  [ASSIGNMENT_STATUSES.LOST]: '분실',
  [ASSIGNMENT_STATUSES.DAMAGED]: '손상',
} as const;

export const ASSIGNMENT_STATUS_COLORS = {
  [ASSIGNMENT_STATUSES.ACTIVE]: 'primary' as const,
  [ASSIGNMENT_STATUSES.RETURNED]: 'success' as const,
  [ASSIGNMENT_STATUSES.PENDING]: 'default' as const,
  [ASSIGNMENT_STATUSES.OVERDUE]: 'error' as const,
  [ASSIGNMENT_STATUSES.LOST]: 'error' as const,
  [ASSIGNMENT_STATUSES.DAMAGED]: 'warning' as const,
} as const;

export const ASSIGNMENT_STATUS_DESCRIPTIONS = {
  [ASSIGNMENT_STATUSES.ACTIVE]: '현재 직원이 사용 중인 자산',
  [ASSIGNMENT_STATUSES.RETURNED]: '정상적으로 반납된 자산',
  [ASSIGNMENT_STATUSES.PENDING]: '할당 대기 중인 자산',
  [ASSIGNMENT_STATUSES.OVERDUE]: '반납 예정일을 초과한 자산',
  [ASSIGNMENT_STATUSES.LOST]: '분실된 자산',
  [ASSIGNMENT_STATUSES.DAMAGED]: '손상된 자산',
} as const;

// ============================================================================
// ASSET TYPE CONSTANTS
// ============================================================================

export const ASSET_TYPES = {
  HARDWARE: 'hardware' as const,
  SOFTWARE: 'software' as const,
} as const;

export const ASSET_TYPE_LIST: AssetType[] = [
  ASSET_TYPES.HARDWARE,
  ASSET_TYPES.SOFTWARE,
];

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.HARDWARE]: '하드웨어',
  [ASSET_TYPES.SOFTWARE]: '소프트웨어',
} as const;

export const ASSET_TYPE_ICONS = {
  [ASSET_TYPES.HARDWARE]: 'Computer',
  [ASSET_TYPES.SOFTWARE]: 'Apps',
} as const;

// ============================================================================
// ASSIGNMENT CONDITION CONSTANTS
// ============================================================================

export const ASSET_CONDITIONS = {
  GOOD: 'good' as const,
  FAIR: 'fair' as const,
  POOR: 'poor' as const,
  DAMAGED: 'damaged' as const,
} as const;

export const ASSET_CONDITION_LABELS = {
  [ASSET_CONDITIONS.GOOD]: '양호',
  [ASSET_CONDITIONS.FAIR]: '보통',
  [ASSET_CONDITIONS.POOR]: '불량',
  [ASSET_CONDITIONS.DAMAGED]: '손상',
} as const;

export const ASSET_CONDITION_COLORS = {
  [ASSET_CONDITIONS.GOOD]: 'success' as const,
  [ASSET_CONDITIONS.FAIR]: 'info' as const,
  [ASSET_CONDITIONS.POOR]: 'warning' as const,
  [ASSET_CONDITIONS.DAMAGED]: 'error' as const,
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const ASSIGNMENT_VALIDATION_RULES = {
  // Field length limits
  NOTES_MAX_LENGTH: 500,
  RETURN_NOTES_MAX_LENGTH: 500,
  EMPLOYEE_NAME_MAX_LENGTH: 100,
  ASSET_DESCRIPTION_MAX_LENGTH: 200,

  // Date validation
  MIN_ASSIGNMENT_DATE: new Date('2020-01-01').toISOString().split('T')[0],
  MAX_ASSIGNMENT_DATE: new Date().toISOString().split('T')[0],
  MAX_RETURN_DATE: new Date().toISOString().split('T')[0],

  // Assignment limits
  MAX_HARDWARE_PER_EMPLOYEE: 10,
  MAX_SOFTWARE_PER_EMPLOYEE: 20,
  MAX_ASSIGNMENT_DURATION_DAYS: 365 * 2, // 2 years

  // Search and pagination
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File upload (for future features)
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
} as const;

// ============================================================================
// FORM VALIDATION CONFIGURATIONS
// ============================================================================

export const ASSIGNMENT_FORM_VALIDATION = {
  employee_id: {
    required: true,
    message: '직원을 선택해주세요.',
  },
  asset_id: {
    required: true,
    message: '자산을 선택해주세요.',
  },
  asset_type: {
    required: true,
    values: ASSET_TYPE_LIST,
    message: '자산 유형을 선택해주세요.',
  },
  assigned_date: {
    required: true,
    min: ASSIGNMENT_VALIDATION_RULES.MIN_ASSIGNMENT_DATE,
    max: ASSIGNMENT_VALIDATION_RULES.MAX_ASSIGNMENT_DATE,
    message: '올바른 할당일을 선택해주세요.',
  },
  return_date: {
    required: false,
    max: ASSIGNMENT_VALIDATION_RULES.MAX_RETURN_DATE,
    message: '올바른 반납일을 선택해주세요.',
  },
  notes: {
    required: false,
    maxLength: ASSIGNMENT_VALIDATION_RULES.NOTES_MAX_LENGTH,
    message: `메모는 ${ASSIGNMENT_VALIDATION_RULES.NOTES_MAX_LENGTH}자 이하로 입력해주세요.`,
  },
  return_notes: {
    required: false,
    maxLength: ASSIGNMENT_VALIDATION_RULES.RETURN_NOTES_MAX_LENGTH,
    message: `반납 메모는 ${ASSIGNMENT_VALIDATION_RULES.RETURN_NOTES_MAX_LENGTH}자 이하로 입력해주세요.`,
  },
  condition: {
    required: false,
    values: Object.values(ASSET_CONDITIONS),
    message: '올바른 상태를 선택해주세요.',
  },
} as const;

// ============================================================================
// SEARCH AND FILTER CONFIGURATIONS
// ============================================================================

export const ASSIGNMENT_SEARCH_FIELDS = [
  'employee_name',
  'asset_id',
  'asset_description',
  'notes',
] as const;

export const ASSIGNMENT_FILTER_OPTIONS = {
  asset_type: {
    label: '자산 유형',
    options: ASSET_TYPE_LIST.map(type => ({
      value: type,
      label: ASSET_TYPE_LABELS[type],
    })),
  },
  status: {
    label: '상태',
    options: ASSIGNMENT_STATUS_LIST.map(status => ({
      value: status,
      label: ASSIGNMENT_STATUS_LABELS[status],
    })),
  },
  condition: {
    label: '상태',
    options: Object.values(ASSET_CONDITIONS).map(condition => ({
      value: condition,
      label: ASSET_CONDITION_LABELS[condition],
    })),
  },
} as const;

export const ASSIGNMENT_SORT_OPTIONS = [
  { value: 'assigned_date', label: '할당일', direction: 'desc' },
  { value: 'return_date', label: '반납일', direction: 'desc' },
  { value: 'employee_name', label: '직원명', direction: 'asc' },
  { value: 'asset_id', label: '자산 ID', direction: 'asc' },
  { value: 'status', label: '상태', direction: 'asc' },
  { value: 'created_at', label: '생성일', direction: 'desc' },
  { value: 'updated_at', label: '수정일', direction: 'desc' },
] as const;

// ============================================================================
// PERMISSION CONFIGURATIONS
// ============================================================================

export const ASSIGNMENT_PERMISSIONS = {
  // Actions that can be performed on assignments
  CREATE: 'assignment:create',
  READ: 'assignment:read',
  UPDATE: 'assignment:update',
  DELETE: 'assignment:delete',
  RETURN: 'assignment:return',
  EXPORT: 'assignment:export',

  // Role-based permissions
  ROLES: {
    ADMIN: {
      permissions: [
        'assignment:create',
        'assignment:read',
        'assignment:update',
        'assignment:delete',
        'assignment:return',
        'assignment:export',
      ],
    },
    MANAGER: {
      permissions: [
        'assignment:create',
        'assignment:read',
        'assignment:update',
        'assignment:return',
        'assignment:export',
      ],
    },
    USER: {
      permissions: ['assignment:read'],
    },
  },
} as const;

// ============================================================================
// UI CONFIGURATIONS
// ============================================================================

export const ASSIGNMENT_UI_CONFIG = {
  // Table configurations
  TABLE: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    STICKY_HEADER: true,
    SHOW_PAGINATION: true,
    ENABLE_SORTING: true,
    ENABLE_FILTERING: true,
  },

  // Modal configurations
  MODALS: {
    CREATE_ASSIGNMENT: {
      maxWidth: 'md',
      fullWidth: true,
      disableEscapeKeyDown: false,
    },
    ASSIGNMENT_DETAILS: {
      maxWidth: 'lg',
      fullWidth: true,
      disableEscapeKeyDown: false,
    },
    RETURN_ASSET: {
      maxWidth: 'sm',
      fullWidth: true,
      disableEscapeKeyDown: false,
    },
  },

  // Animation and timing
  ANIMATIONS: {
    LOADING_DELAY: 300,
    TOAST_DURATION: 4000,
    MODAL_TRANSITION: 200,
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ASSIGNMENT_ERROR_MESSAGES = {
  // General errors
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',

  // Assignment specific errors
  ASSIGNMENT_NOT_FOUND: '할당 정보를 찾을 수 없습니다.',
  ASSIGNMENT_ALREADY_RETURNED: '이미 반납된 자산입니다.',
  ASSET_NOT_AVAILABLE: '사용할 수 없는 자산입니다.',
  EMPLOYEE_NOT_FOUND: '직원 정보를 찾을 수 없습니다.',
  ASSET_ALREADY_ASSIGNED: '이미 할당된 자산입니다.',

  // Validation errors
  INVALID_DATE_RANGE: '올바른 날짜 범위를 선택해주세요.',
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  INVALID_FORMAT: '올바른 형식으로 입력해주세요.',

  // Permission errors
  INSUFFICIENT_PERMISSIONS: '이 작업을 수행할 권한이 없습니다.',
  ADMIN_ONLY: '관리자만 수행할 수 있는 작업입니다.',
  MANAGER_ONLY: '관리자 또는 매니저만 수행할 수 있는 작업입니다.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const ASSIGNMENT_SUCCESS_MESSAGES = {
  ASSIGNMENT_CREATED: '자산이 성공적으로 할당되었습니다.',
  ASSIGNMENT_UPDATED: '할당 정보가 수정되었습니다.',
  ASSIGNMENT_DELETED: '할당이 삭제되었습니다.',
  ASSET_RETURNED: '자산이 성공적으로 반납되었습니다.',
  EXPORT_COMPLETED: '데이터 내보내기가 완료되었습니다.',
  DATA_REFRESHED: '데이터가 새로고침되었습니다.',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const ASSIGNMENT_API_ENDPOINTS = {
  BASE: '/api/assignments',
  SEARCH: '/api/assignments/search',
  EXPORT: '/api/assignments/export',
  RETURN: (id: string) => `/api/assignments/${id}/return`,
  HISTORY: (id: string) => `/api/assignments/${id}/history`,
  STATS: '/api/assignments/stats',
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const ASSIGNMENT_DEFAULTS = {
  SEARCH_PARAMS: {
    query: '',
    sortBy: 'assigned_date' as const,
    sortOrder: 'desc' as const,
    page: 1,
    limit: ASSIGNMENT_VALIDATION_RULES.DEFAULT_PAGE_SIZE,
  },

  FILTERS: {
    asset_type: undefined,
    status: undefined,
    employee_id: undefined,
    department: undefined,
    assigned_date_from: undefined,
    assigned_date_to: undefined,
    return_date_from: undefined,
    return_date_to: undefined,
    overdue: undefined,
  },

  FORM_DATA: {
    assigned_date: new Date().toISOString().split('T')[0],
    notes: '',
    return_notes: '',
    condition: ASSET_CONDITIONS.GOOD,
  },
} as const;
