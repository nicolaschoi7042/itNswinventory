/**
 * User Management Utility Functions
 *
 * Collection of utility functions for user management including validation,
 * formatting, permission checking, and data manipulation.
 */

import type {
  User,
  UserRole,
  UserStatus,
  UserPermissions,
  UserValidationResult,
  UserValidationError,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserSortOptions,
  UserActivity,
  UserSession,
  UserStatistics,
} from '@/types/user';

import {
  USER_VALIDATION_RULES,
  ROLE_HIERARCHY,
  DEFAULT_PERMISSIONS,
  USERNAME_VALIDATION,
  PASSWORD_VALIDATION,
  EMAIL_VALIDATION,
  FULLNAME_VALIDATION,
  SECURITY_CONSTANTS,
  VALIDATION_MESSAGES,
  USER_STATUS_LABELS,
  USER_ROLE_LABELS,
  hasRolePrivilege,
  validatePasswordStrength,
  isReservedUsername,
} from '@/constants/user.constants';

// Re-export validatePasswordStrength for direct import
export { validatePasswordStrength };

// ============================================================================
// USER VALIDATION UTILITIES
// ============================================================================

/**
 * Validate username according to business rules
 */
export function validateUsername(username: string): UserValidationError[] {
  const errors: UserValidationError[] = [];

  if (!username || username.trim().length === 0) {
    errors.push({
      field: 'username',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
    return errors;
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < USERNAME_VALIDATION.MIN_LENGTH) {
    errors.push({
      field: 'username',
      message: `최소 ${USERNAME_VALIDATION.MIN_LENGTH}자 이상이어야 합니다`,
      code: 'TOO_SHORT',
    });
  }

  if (trimmedUsername.length > USERNAME_VALIDATION.MAX_LENGTH) {
    errors.push({
      field: 'username',
      message: `최대 ${USERNAME_VALIDATION.MAX_LENGTH}자 이하여야 합니다`,
      code: 'TOO_LONG',
    });
  }

  if (!USERNAME_VALIDATION.PATTERN.test(trimmedUsername)) {
    errors.push({
      field: 'username',
      message: '영문, 숫자, 점(.), 하이픈(-), 언더스코어(_)만 사용 가능합니다',
      code: 'INVALID_CHARACTERS',
    });
  }

  if (isReservedUsername(trimmedUsername)) {
    errors.push({
      field: 'username',
      message: VALIDATION_MESSAGES.RESERVED_USERNAME,
      code: 'RESERVED_USERNAME',
    });
  }

  return errors;
}

/**
 * Validate email address
 */
export function validateEmail(email?: string): UserValidationError[] {
  const errors: UserValidationError[] = [];

  if (!email || email.trim().length === 0) {
    if (EMAIL_VALIDATION.REQUIRED) {
      errors.push({
        field: 'email',
        message: VALIDATION_MESSAGES.REQUIRED,
        code: 'REQUIRED',
      });
    }
    return errors;
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > EMAIL_VALIDATION.MAX_LENGTH) {
    errors.push({
      field: 'email',
      message: `최대 ${EMAIL_VALIDATION.MAX_LENGTH}자 이하여야 합니다`,
      code: 'TOO_LONG',
    });
  }

  if (!EMAIL_VALIDATION.PATTERN.test(trimmedEmail)) {
    errors.push({
      field: 'email',
      message: VALIDATION_MESSAGES.EMAIL_INVALID,
      code: 'INVALID_FORMAT',
    });
  }

  return errors;
}

/**
 * Validate full name
 */
export function validateFullName(fullName: string): UserValidationError[] {
  const errors: UserValidationError[] = [];

  if (!fullName || fullName.trim().length === 0) {
    errors.push({
      field: 'fullName',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
    return errors;
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < FULLNAME_VALIDATION.MIN_LENGTH) {
    errors.push({
      field: 'fullName',
      message: `최소 ${FULLNAME_VALIDATION.MIN_LENGTH}자 이상이어야 합니다`,
      code: 'TOO_SHORT',
    });
  }

  if (trimmedName.length > FULLNAME_VALIDATION.MAX_LENGTH) {
    errors.push({
      field: 'fullName',
      message: `최대 ${FULLNAME_VALIDATION.MAX_LENGTH}자 이하여야 합니다`,
      code: 'TOO_LONG',
    });
  }

  if (!FULLNAME_VALIDATION.PATTERN.test(trimmedName)) {
    errors.push({
      field: 'fullName',
      message: '한글, 영문, 공백만 사용 가능합니다',
      code: 'INVALID_CHARACTERS',
    });
  }

  return errors;
}

/**
 * Validate password with strength checking
 */
export function validatePassword(
  password: string,
  confirmPassword?: string
): UserValidationError[] {
  const errors: UserValidationError[] = [];

  if (!password || password.length === 0) {
    errors.push({
      field: 'password',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
    return errors;
  }

  const strengthResult = validatePasswordStrength(password);
  if (!strengthResult.isValid) {
    strengthResult.issues.forEach(issue => {
      errors.push({
        field: 'password',
        message: issue,
        code: 'WEAK_PASSWORD',
      });
    });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
      code: 'PASSWORD_MISMATCH',
    });
  }

  return errors;
}

/**
 * Comprehensive user data validation
 */
export function validateUserData(
  data: CreateUserData | UpdateUserData,
  isUpdate = false
): UserValidationResult {
  const errors: UserValidationError[] = [];
  const warnings: string[] = [];

  // Validate username (required for create, optional for update)
  if ('username' in data && data.username !== undefined) {
    errors.push(...validateUsername(data.username));
  } else if (!isUpdate) {
    errors.push({
      field: 'username',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
  }

  // Validate password (required for create only)
  if ('password' in data && data.password !== undefined) {
    errors.push(...validatePassword(data.password));
  } else if (!isUpdate) {
    errors.push({
      field: 'password',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
  }

  // Validate email
  if (data.email !== undefined) {
    errors.push(...validateEmail(data.email));
  }

  // Validate full name (required)
  if (data.fullName !== undefined) {
    errors.push(...validateFullName(data.fullName));
  } else if (!isUpdate) {
    errors.push({
      field: 'fullName',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
  }

  // Validate role
  if (data.role !== undefined) {
    const validRoles: UserRole[] = ['admin', 'manager', 'user'];
    if (!validRoles.includes(data.role)) {
      errors.push({
        field: 'role',
        message: '유효하지 않은 역할입니다',
        code: 'INVALID_VALUE',
      });
    }
  } else if (!isUpdate) {
    errors.push({
      field: 'role',
      message: VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED',
    });
  }

  // Add warnings for optional fields
  if (!data.email || data.email.trim().length === 0) {
    warnings.push('이메일 주소가 없으면 비밀번호 재설정이 어려울 수 있습니다');
  }

  if (!data.department || data.department.trim().length === 0) {
    warnings.push('부서 정보가 없으면 조직도 관리가 어려울 수 있습니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole): UserPermissions {
  return { ...DEFAULT_PERMISSIONS[role] };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  user: User,
  permission: keyof UserPermissions
): boolean {
  const permissions = getUserPermissions(user.role);
  return permissions[permission];
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(
  managerRole: UserRole,
  targetRole: UserRole
): boolean {
  return hasRolePrivilege(managerRole, targetRole);
}

/**
 * Check if user can perform action on another user
 */
export function canPerformUserAction(
  currentUser: User,
  targetUser: User,
  action: keyof UserPermissions
): boolean {
  // Add null safety checks
  if (!currentUser || !targetUser) {
    return false;
  }

  // User can always edit their own profile (limited fields)
  if (currentUser.id === targetUser.id && action === 'canEditUsers') {
    return true;
  }

  // Check permission and role hierarchy
  return (
    hasPermission(currentUser, action) &&
    canManageUser(currentUser.role, targetUser.role)
  );
}

/**
 * Get manageable roles for a user
 */
export function getManageableRoles(userRole: UserRole): UserRole[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level <= userLevel)
    .map(([role]) => role as UserRole);
}

// ============================================================================
// USER STATUS UTILITIES
// ============================================================================

/**
 * Check if user account is locked
 */
export function isUserLocked(user: User): boolean {
  if (!user || !user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
}

/**
 * Check if user account is active and can login
 */
export function canUserLogin(user: User): boolean {
  if (!user) return false;
  return user.status === 'active' && !isUserLocked(user);
}

/**
 * Get user status display information
 */
export function getUserStatusInfo(user: User): {
  status: UserStatus;
  label: string;
  canLogin: boolean;
  isLocked: boolean;
  reason?: string;
} {
  if (!user) {
    return {
      status: 'inactive',
      label: '알 수 없음',
      canLogin: false,
      isLocked: false,
      reason: '사용자 정보를 찾을 수 없습니다'
    };
  }

  const isLocked = isUserLocked(user);
  const canLogin = canUserLogin(user);

  let reason: string | undefined;
  if (!canLogin) {
    if (isLocked && user.lockedUntil) {
      reason = `계정이 ${new Date(user.lockedUntil).toLocaleString()}까지 잠겨있습니다`;
    } else if (user.status !== 'active') {
      reason = `계정 상태: ${USER_STATUS_LABELS[user.status]}`;
    }
  }

  return {
    status: user.status,
    label: USER_STATUS_LABELS[user.status],
    canLogin,
    isLocked,
    reason,
  };
}

/**
 * Calculate when account will be unlocked
 */
export function getUnlockTime(user: User): Date | null {
  if (!user.lockedUntil) return null;
  const unlockTime = new Date(user.lockedUntil);
  return unlockTime > new Date() ? unlockTime : null;
}

// ============================================================================
// USER DISPLAY UTILITIES
// ============================================================================

/**
 * Format user display name
 */
export function formatUserDisplayName(user: User): string {
  if (user.fullName && user.fullName.trim().length > 0) {
    return `${user.fullName} (${user.username})`;
  }
  return user.username;
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User): string {
  if (user.fullName && user.fullName.trim().length > 0) {
    const names = user.fullName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }
  return user.username.charAt(0).toUpperCase();
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  return USER_ROLE_LABELS[role];
}

/**
 * Format last login time
 */
export function formatLastLogin(lastLogin?: string): string {
  if (!lastLogin) return '로그인 기록 없음';

  const loginDate = new Date(lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - loginDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `오늘 ${loginDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays === 1) {
    return `어제 ${loginDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return loginDate.toLocaleDateString('ko-KR');
  }
}

// ============================================================================
// USER FILTERING AND SORTING UTILITIES
// ============================================================================

/**
 * Filter users based on criteria
 */
export function filterUsers(
  users: User[],
  filters: Partial<UserFilters>
): User[] {
  return users.filter(user => {
    // Role filter
    if (filters.roles && filters.roles.length > 0) {
      if (!filters.roles.includes(user.role)) return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(user.status)) return false;
    }

    // Department filter
    if (filters.departments && filters.departments.length > 0) {
      if (!user.department || !filters.departments.includes(user.department))
        return false;
    }

    // Authentication type filter
    if (filters.authenticationTypes && filters.authenticationTypes.length > 0) {
      if (!filters.authenticationTypes.includes(user.authenticationType))
        return false;
    }

    // Active users only
    if (filters.showOnlyActive) {
      if (!canUserLogin(user)) return false;
    }

    // Locked users only
    if (filters.showOnlyLocked) {
      if (!isUserLocked(user)) return false;
    }

    // Recently active users
    if (filters.showRecentlyActive) {
      if (!user.lastLogin) return false;
      const lastLogin = new Date(user.lastLogin);
      const daysSinceLogin =
        (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 30) return false; // Consider 30 days as recent
    }

    return true;
  });
}

/**
 * Search users by query
 */
export function searchUsers(users: User[], query: string): User[] {
  if (!query || query.trim().length === 0) return users;

  const searchTerm = query.toLowerCase().trim();

  return users.filter(
    user =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.fullName.toLowerCase().includes(searchTerm) ||
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.department && user.department.toLowerCase().includes(searchTerm)) ||
      (user.position && user.position.toLowerCase().includes(searchTerm))
  );
}

/**
 * Sort users by criteria
 */
export function sortUsers(users: User[], sortOptions: UserSortOptions): User[] {
  const { field, direction } = sortOptions;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...users].sort((a, b) => {
    const aValue: any = a[field];
    const bValue: any = b[field];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }

    // Handle date comparisons
    if (field === 'lastLogin' || field === 'createdAt') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return (aDate.getTime() - bDate.getTime()) * multiplier;
    }

    // Handle role hierarchy sorting
    if (field === 'role') {
      const aLevel = ROLE_HIERARCHY[aValue as UserRole] || 0;
      const bLevel = ROLE_HIERARCHY[bValue as UserRole] || 0;
      return (aLevel - bLevel) * multiplier;
    }

    // Default comparison
    if (aValue < bValue) return -1 * multiplier;
    if (aValue > bValue) return 1 * multiplier;
    return 0;
  });
}

// ============================================================================
// USER STATISTICS UTILITIES
// ============================================================================

/**
 * Calculate user statistics
 */
export function calculateUserStatistics(users: User[]): UserStatistics {
  const stats: UserStatistics = {
    totalUsers: users.length,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
    adminUsers: 0,
    managerUsers: 0,
    regularUsers: 0,
    ldapUsers: 0,
    localUsers: 0,
    lockedUsers: 0,
    recentLogins: 0,
    neverLoggedIn: 0,
  };

  users.forEach(user => {
    // Count by status
    switch (user.status) {
      case 'active':
        stats.activeUsers++;
        break;
      case 'inactive':
        stats.inactiveUsers++;
        break;
      case 'suspended':
        stats.suspendedUsers++;
        break;
    }

    // Count by role
    switch (user.role) {
      case 'admin':
        stats.adminUsers++;
        break;
      case 'manager':
        stats.managerUsers++;
        break;
      case 'user':
        stats.regularUsers++;
        break;
    }

    // Count by authentication type
    switch (user.authenticationType) {
      case 'ldap':
        stats.ldapUsers++;
        break;
      case 'local':
        stats.localUsers++;
        break;
    }

    // Count locked users
    if (isUserLocked(user)) {
      stats.lockedUsers++;
    }

    // Count login activity
    if (!user.lastLogin) {
      stats.neverLoggedIn++;
    } else {
      const lastLogin = new Date(user.lastLogin);
      const daysSinceLogin =
        (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin <= 30) {
        stats.recentLogins++;
      }
    }
  });

  return stats;
}

/**
 * Get user activity summary
 */
export function getUserActivitySummary(activities: UserActivity[]): {
  totalActivities: number;
  loginCount: number;
  failedLoginCount: number;
  passwordChangeCount: number;
  lastActivity?: UserActivity;
} {
  return {
    totalActivities: activities.length,
    loginCount: activities.filter(a => a.activityType === 'login').length,
    failedLoginCount: activities.filter(a => a.activityType === 'failed_login')
      .length,
    passwordChangeCount: activities.filter(
      a => a.activityType === 'password_change'
    ).length,
    lastActivity: activities.length > 0 ? activities[0] : undefined,
  };
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform user data for API
 */
export function transformUserForApi(user: Partial<User>): Record<string, any> {
  const apiData: Record<string, any> = {};

  // Map frontend fields to API fields if needed
  if (user.username !== undefined) apiData.username = user.username;
  if (user.email !== undefined) apiData.email = user.email;
  if (user.fullName !== undefined) apiData.full_name = user.fullName;
  if (user.role !== undefined) apiData.role = user.role;
  if (user.status !== undefined) apiData.status = user.status;
  if (user.department !== undefined) apiData.department = user.department;
  if (user.position !== undefined) apiData.position = user.position;
  if (user.phone !== undefined) apiData.phone = user.phone;

  return apiData;
}

/**
 * Transform API response to user data
 */
export function transformApiToUser(apiData: any): User {
  return {
    id: apiData.id,
    username: apiData.username,
    email: apiData.email,
    fullName: apiData.full_name || apiData.fullName,
    role: apiData.role,
    status: apiData.status || 'active',
    authenticationType:
      apiData.authentication_type || apiData.authenticationType || 'local',
    department: apiData.department,
    position: apiData.position,
    phone: apiData.phone,
    lastLogin: apiData.last_login || apiData.lastLogin,
    loginAttempts: apiData.login_attempts || apiData.loginAttempts || 0,
    lockedUntil: apiData.locked_until || apiData.lockedUntil,
    passwordChangedAt: apiData.password_changed_at || apiData.passwordChangedAt,
    createdAt: apiData.created_at || apiData.createdAt,
    updatedAt: apiData.updated_at || apiData.updatedAt,
    createdBy: apiData.created_by || apiData.createdBy,
    updatedBy: apiData.updated_by || apiData.updatedBy,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const UserUtils = {
  // Validation
  validateUsername,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordStrength,
  validateUserData,

  // Permissions
  getUserPermissions,
  hasPermission,
  canManageUser,
  canPerformUserAction,
  getManageableRoles,

  // Status
  isUserLocked,
  canUserLogin,
  getUserStatusInfo,
  getUnlockTime,

  // Display
  formatUserDisplayName,
  getUserInitials,
  formatUserRole,
  formatLastLogin,

  // Filtering & Sorting
  filterUsers,
  searchUsers,
  sortUsers,

  // Statistics
  calculateUserStatistics,
  getUserActivitySummary,

  // Transformation
  transformUserForApi,
  transformApiToUser,
};

export default UserUtils;
