/**
 * User Management Constants
 *
 * Centralized constants for user management including roles, permissions,
 * validation rules, and system defaults.
 */

import type {
  UserRole,
  UserStatus,
  UserPermissions,
  UserValidationRules,
} from '@/types/user';

// ============================================================================
// USER ROLE CONSTANTS
// ============================================================================

/**
 * Available user roles in the system
 */
export const USER_ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  USER: 'user' as const,
} as const;

/**
 * User role labels for display
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: '시스템 관리자',
  manager: '매니저',
  user: '일반 사용자',
};

/**
 * User role descriptions
 */
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: '모든 시스템 기능과 사용자 관리 권한을 가집니다',
  manager: '자산 관리 및 할당 권한을 가집니다',
  user: '읽기 전용 권한으로 자신의 할당된 자산을 확인할 수 있습니다',
};

/**
 * Role hierarchy for permission checking (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  user: 1,
};

/**
 * Role colors for UI display
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#d32f2f', // Red
  manager: '#1976d2', // Blue
  user: '#388e3c', // Green
};

// ============================================================================
// USER STATUS CONSTANTS
// ============================================================================

/**
 * Available user statuses
 */
export const USER_STATUSES = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  SUSPENDED: 'suspended' as const,
  PENDING: 'pending' as const,
} as const;

/**
 * User status labels for display
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지',
  pending: '대기중',
};

/**
 * User status descriptions
 */
export const USER_STATUS_DESCRIPTIONS: Record<UserStatus, string> = {
  active: '시스템에 로그인하고 모든 기능을 사용할 수 있습니다',
  inactive: '시스템에 로그인할 수 없습니다',
  suspended: '일시적으로 시스템 사용이 제한됩니다',
  pending: '계정 승인 대기 중입니다',
};

/**
 * Status colors for UI display
 */
export const STATUS_COLORS: Record<UserStatus, string> = {
  active: '#4caf50', // Green
  inactive: '#757575', // Grey
  suspended: '#f57c00', // Orange
  pending: '#2196f3', // Blue
};

// ============================================================================
// PERMISSION CONSTANTS
// ============================================================================

/**
 * Default permissions by role
 */
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewUsers: true,
    canManageRoles: true,
    canResetPasswords: true,
    canActivateUsers: true,
    canDeactivateUsers: true,
    canViewAuditLogs: true,
    canManageAssets: true,
    canAssignAssets: true,
    canExportData: true,
  },
  manager: {
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: true,
    canManageRoles: false,
    canResetPasswords: false,
    canActivateUsers: false,
    canDeactivateUsers: false,
    canViewAuditLogs: false,
    canManageAssets: true,
    canAssignAssets: true,
    canExportData: true,
  },
  user: {
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: false,
    canManageRoles: false,
    canResetPasswords: false,
    canActivateUsers: false,
    canDeactivateUsers: false,
    canViewAuditLogs: false,
    canManageAssets: false,
    canAssignAssets: false,
    canExportData: false,
  },
};

/**
 * Permission labels for display
 */
export const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  canCreateUsers: '사용자 생성',
  canEditUsers: '사용자 편집',
  canDeleteUsers: '사용자 삭제',
  canViewUsers: '사용자 조회',
  canManageRoles: '역할 관리',
  canResetPasswords: '비밀번호 재설정',
  canActivateUsers: '사용자 활성화',
  canDeactivateUsers: '사용자 비활성화',
  canViewAuditLogs: '감사 로그 조회',
  canManageAssets: '자산 관리',
  canAssignAssets: '자산 할당',
  canExportData: '데이터 내보내기',
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Username validation rules
 */
export const USERNAME_VALIDATION = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
  PATTERN: /^[a-zA-Z0-9_.-]+$/,
  RESERVED_USERNAMES: [
    'admin',
    'administrator',
    'root',
    'system',
    'guest',
    'user',
    'test',
    'demo',
    'support',
    'help',
    'info',
    'contact',
    'mail',
    'email',
    'webmaster',
    'postmaster',
    'hostmaster',
    'abuse',
    'security',
    'api',
    'www',
    'ftp',
  ],
} as const;

/**
 * Password validation rules
 */
export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,
  FORBIDDEN_PATTERNS: [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
  ],
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Email validation rules
 */
export const EMAIL_VALIDATION = {
  PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MAX_LENGTH: 255,
  REQUIRED: false,
} as const;

/**
 * Full name validation rules
 */
export const FULLNAME_VALIDATION = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z\s\u3131-\uD79D]+$/, // Allows Korean characters
} as const;

/**
 * Complete validation rules object
 */
export const USER_VALIDATION_RULES: UserValidationRules = {
  username: {
    minLength: USERNAME_VALIDATION.MIN_LENGTH,
    maxLength: USERNAME_VALIDATION.MAX_LENGTH,
    pattern: USERNAME_VALIDATION.PATTERN,
    reserved: USERNAME_VALIDATION.RESERVED_USERNAMES,
  },
  password: {
    minLength: PASSWORD_VALIDATION.MIN_LENGTH,
    maxLength: PASSWORD_VALIDATION.MAX_LENGTH,
    requireUppercase: PASSWORD_VALIDATION.REQUIRE_UPPERCASE,
    requireLowercase: PASSWORD_VALIDATION.REQUIRE_LOWERCASE,
    requireNumbers: PASSWORD_VALIDATION.REQUIRE_NUMBERS,
    requireSpecialChars: PASSWORD_VALIDATION.REQUIRE_SPECIAL_CHARS,
    forbiddenPatterns: PASSWORD_VALIDATION.FORBIDDEN_PATTERNS,
  },
  email: {
    pattern: EMAIL_VALIDATION.PATTERN,
    maxLength: EMAIL_VALIDATION.MAX_LENGTH,
    required: EMAIL_VALIDATION.REQUIRED,
  },
  fullName: {
    minLength: FULLNAME_VALIDATION.MIN_LENGTH,
    maxLength: FULLNAME_VALIDATION.MAX_LENGTH,
    pattern: FULLNAME_VALIDATION.PATTERN,
  },
};

// ============================================================================
// AUTHENTICATION CONSTANTS
// ============================================================================

/**
 * Authentication types
 */
export const AUTH_TYPES = {
  LDAP: 'ldap' as const,
  LOCAL: 'local' as const,
} as const;

/**
 * Authentication type labels
 */
export const AUTH_TYPE_LABELS = {
  ldap: 'LDAP',
  local: '로컬',
} as const;

/**
 * Session and security constants
 */
export const SECURITY_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  PASSWORD_HISTORY_COUNT: 5,
  PASSWORD_EXPIRY_DAYS: 90,
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  PASSWORD_RESET_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Table pagination defaults
 */
export const USER_TABLE_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_DISPLAY_ITEMS: 1000,
} as const;

/**
 * Search and filter defaults
 */
export const SEARCH_CONSTANTS = {
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_SEARCHES: 10,
} as const;

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다',
  INVALID_FORMAT: '올바른 형식이 아닙니다',
  TOO_SHORT: '너무 짧습니다',
  TOO_LONG: '너무 깁니다',
  INVALID_CHARACTERS: '유효하지 않은 문자가 포함되어 있습니다',
  RESERVED_USERNAME: '사용할 수 없는 사용자명입니다',
  WEAK_PASSWORD: '비밀번호가 너무 약합니다',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
  EMAIL_INVALID: '올바른 이메일 주소를 입력하세요',
  DUPLICATE_USERNAME: '이미 사용 중인 사용자명입니다',
  DUPLICATE_EMAIL: '이미 사용 중인 이메일입니다',
} as const;

// ============================================================================
// DEPARTMENT CONSTANTS
// ============================================================================

/**
 * Default departments (can be extended)
 */
export const DEFAULT_DEPARTMENTS = [
  'IT',
  '인사팀',
  '재무팀',
  '영업팀',
  '마케팅팀',
  '개발팀',
  '운영팀',
  '기획팀',
  '디자인팀',
  '품질관리팀',
] as const;

/**
 * Default positions (can be extended)
 */
export const DEFAULT_POSITIONS = [
  '팀장',
  '매니저',
  '시니어',
  '주니어',
  '인턴',
  '계약직',
  '파트타임',
  '프리랜서',
] as const;

// ============================================================================
// ACTIVITY CONSTANTS
// ============================================================================

/**
 * User activity types
 */
export const USER_ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PROFILE_UPDATE: 'profile_update',
  ROLE_CHANGE: 'role_change',
  ACCOUNT_LOCK: 'account_lock',
  ACCOUNT_UNLOCK: 'account_unlock',
  FAILED_LOGIN: 'failed_login',
  PASSWORD_RESET: 'password_reset',
  STATUS_CHANGE: 'status_change',
} as const;

/**
 * Activity type labels
 */
export const ACTIVITY_TYPE_LABELS = {
  login: '로그인',
  logout: '로그아웃',
  password_change: '비밀번호 변경',
  profile_update: '프로필 업데이트',
  role_change: '역할 변경',
  account_lock: '계정 잠금',
  account_unlock: '계정 잠금 해제',
  failed_login: '로그인 실패',
  password_reset: '비밀번호 재설정',
  status_change: '상태 변경',
} as const;

// ============================================================================
// EXPORT CONSTANTS
// ============================================================================

/**
 * Export format options
 */
export const EXPORT_FORMATS = {
  EXCEL: 'excel' as const,
  CSV: 'csv' as const,
  PDF: 'pdf' as const,
} as const;

/**
 * Export format labels
 */
export const EXPORT_FORMAT_LABELS = {
  excel: 'Excel (.xlsx)',
  csv: 'CSV (.csv)',
  pdf: 'PDF (.pdf)',
} as const;

/**
 * Default export fields
 */
export const DEFAULT_EXPORT_FIELDS = [
  'username',
  'fullName',
  'email',
  'role',
  'status',
  'department',
  'position',
  'lastLogin',
  'createdAt',
] as const;

// ============================================================================
// UTILITY FUNCTIONS FOR CONSTANTS
// ============================================================================

/**
 * Check if a role has higher or equal privileges than another
 */
export function hasRolePrivilege(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all roles with equal or lower privileges
 */
export function getManageableRoles(userRole: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level <= userLevel)
    .map(([role]) => role as UserRole);
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): UserPermissions {
  return { ...DEFAULT_PERMISSIONS[role] };
}

/**
 * Check if a username is reserved
 */
export function isReservedUsername(username: string): boolean {
  return USERNAME_VALIDATION.RESERVED_USERNAMES.includes(
    username.toLowerCase()
  );
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 0;

  if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    issues.push(`최소 ${PASSWORD_VALIDATION.MIN_LENGTH}자 이상이어야 합니다`);
  } else {
    score += 1;
  }

  if (PASSWORD_VALIDATION.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    issues.push('대문자를 포함해야 합니다');
  } else if (PASSWORD_VALIDATION.REQUIRE_UPPERCASE) {
    score += 1;
  }

  if (PASSWORD_VALIDATION.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    issues.push('소문자를 포함해야 합니다');
  } else if (PASSWORD_VALIDATION.REQUIRE_LOWERCASE) {
    score += 1;
  }

  if (PASSWORD_VALIDATION.REQUIRE_NUMBERS && !/\d/.test(password)) {
    issues.push('숫자를 포함해야 합니다');
  } else if (PASSWORD_VALIDATION.REQUIRE_NUMBERS) {
    score += 1;
  }

  if (
    PASSWORD_VALIDATION.REQUIRE_SPECIAL_CHARS &&
    !new RegExp(
      `[${PASSWORD_VALIDATION.SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`
    ).test(password)
  ) {
    issues.push('특수문자를 포함해야 합니다');
  } else if (PASSWORD_VALIDATION.REQUIRE_SPECIAL_CHARS) {
    score += 1;
  }

  // Check for forbidden patterns
  for (const pattern of PASSWORD_VALIDATION.FORBIDDEN_PATTERNS) {
    if (pattern.test(password)) {
      issues.push('일반적인 패턴은 사용할 수 없습니다');
      score -= 1;
      break;
    }
  }

  // Bonus for length
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  return {
    isValid: issues.length === 0,
    issues,
    score: Math.max(0, score),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,
  ROLE_COLORS,
  USER_STATUSES,
  USER_STATUS_LABELS,
  USER_STATUS_DESCRIPTIONS,
  STATUS_COLORS,
  DEFAULT_PERMISSIONS,
  PERMISSION_LABELS,
  USER_VALIDATION_RULES,
  AUTH_TYPES,
  AUTH_TYPE_LABELS,
  SECURITY_CONSTANTS,
  USER_TABLE_CONSTANTS,
  SEARCH_CONSTANTS,
  VALIDATION_MESSAGES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_POSITIONS,
  USER_ACTIVITY_TYPES,
  ACTIVITY_TYPE_LABELS,
  EXPORT_FORMATS,
  EXPORT_FORMAT_LABELS,
  DEFAULT_EXPORT_FIELDS,
};
