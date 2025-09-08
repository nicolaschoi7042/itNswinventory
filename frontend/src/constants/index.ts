// 기존 IT 인벤토리 시스템의 상수들
// 기존 시스템에서 사용하던 값들을 그대로 유지

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  EMPLOYEES: '/employees',
  HARDWARE: '/hardware',
  SOFTWARE: '/software',
  ASSIGNMENTS: '/assignments',
  ACTIVITIES: '/activities',
  USERS: '/users',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export const ASSET_STATUSES = {
  HARDWARE: {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    MAINTENANCE: 'maintenance',
    RETIRED: 'retired',
  },
  ASSIGNMENT: {
    ACTIVE: '사용중',
    RETURNED: '반납완료',
    PENDING: '대기중',
  },
} as const;

export const LICENSE_TYPES = {
  PERPETUAL: 'perpetual',
  SUBSCRIPTION: 'subscription',
  OEM: 'oem',
} as const;

export const ACTIVITY_TYPES = {
  ASSIGNMENT: 'assignment',
  RETURN: 'return',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export const ENTITY_TYPES = {
  EMPLOYEE: 'employee',
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  ASSIGNMENT: 'assignment',
  USER: 'user',
} as const;

// 기존 시스템에서 사용하던 기본값들
export const DEFAULT_VALUES = {
  ITEMS_PER_PAGE: 10,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30분
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
} as const;

// 기존 시스템의 New York Business 테마 색상
export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  NY_NAVY: '#1e293b',
  NY_BLUE: '#3b82f6',
  NY_GRAY: '#64748b',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
} as const;

// 기존 시스템에서 사용하던 정규식 패턴
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9\-\s\(\)]+$/,
  ASSET_TAG: /^[A-Z0-9\-]+$/,
  SERIAL_NUMBER: /^[A-Z0-9\-]+$/,
} as const;

// 기존 시스템의 에러 메시지들 (한국어 유지)
export const ERROR_MESSAGES = {
  LOGIN_FAILED: '로그인에 실패했습니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  ACCESS_DENIED: '이 작업을 수행할 권한이 없습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  VALIDATION_ERROR: '입력한 정보를 다시 확인해주세요.',
  SAVE_ERROR: '저장 중 오류가 발생했습니다.',
  DELETE_ERROR: '삭제 중 오류가 발생했습니다.',
  LOAD_ERROR: '데이터를 불러오는 중 오류가 발생했습니다.',
} as const;

// 기존 시스템의 성공 메시지들 (한국어 유지)
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인에 성공했습니다.',
  SAVE_SUCCESS: '성공적으로 저장되었습니다.',
  UPDATE_SUCCESS: '성공적으로 수정되었습니다.',
  DELETE_SUCCESS: '성공적으로 삭제되었습니다.',
  ASSIGNMENT_SUCCESS: '성공적으로 할당되었습니다.',
  RETURN_SUCCESS: '성공적으로 반납되었습니다.',
} as const;
