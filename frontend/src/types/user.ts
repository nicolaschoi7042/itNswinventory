/**
 * User Management Types
 *
 * Comprehensive TypeScript type definitions for user management functionality.
 * Includes user interfaces, form data types, and validation rules.
 */

// ============================================================================
// CORE USER TYPES
// ============================================================================

/**
 * User roles in the system with specific permissions
 */
export type UserRole = 'admin' | 'manager' | 'user';

/**
 * User status types
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User authentication methods
 */
export type AuthenticationType = 'ldap' | 'local';

/**
 * Core User interface matching backend database schema
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  authenticationType: AuthenticationType;
  department?: string;
  position?: string;
  phone?: string;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * User with additional metadata for display purposes
 */
export interface UserWithMetadata extends User {
  assignmentCount: number;
  activityCount: number;
  lastActivityDate?: string;
  permissions: UserPermissions;
}

/**
 * User permissions based on role
 */
export interface UserPermissions {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewUsers: boolean;
  canManageRoles: boolean;
  canResetPasswords: boolean;
  canActivateUsers: boolean;
  canDeactivateUsers: boolean;
  canViewAuditLogs: boolean;
  canManageAssets: boolean;
  canAssignAssets: boolean;
  canExportData: boolean;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Data for creating a new user
 */
export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  fullName: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  authenticationType?: AuthenticationType;
  status?: UserStatus;
  sendWelcomeEmail?: boolean;
}

/**
 * Data for updating an existing user
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  fullName?: string;
  role?: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  status?: UserStatus;
}

/**
 * Data for password operations
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Data for admin password reset
 */
export interface PasswordResetData {
  newPassword: string;
  confirmPassword: string;
  sendNotification?: boolean;
}

/**
 * User profile update form
 */
export interface UserProfileData {
  email?: string;
  fullName: string;
  department?: string;
  position?: string;
  phone?: string;
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

/**
 * User search criteria
 */
export interface UserSearchCriteria {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  authenticationType?: AuthenticationType;
  dateRange?: {
    start: string;
    end: string;
    field: 'createdAt' | 'lastLogin' | 'updatedAt';
  };
}

/**
 * User list filters
 */
export interface UserFilters {
  roles: UserRole[];
  statuses: UserStatus[];
  departments: string[];
  authenticationTypes: AuthenticationType[];
  showOnlyActive: boolean;
  showOnlyLocked: boolean;
  showRecentlyActive: boolean;
}

/**
 * User sorting options
 */
export interface UserSortOptions {
  field:
    | 'username'
    | 'fullName'
    | 'role'
    | 'status'
    | 'department'
    | 'lastLogin'
    | 'createdAt';
  direction: 'asc' | 'desc';
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * User validation rules
 */
export interface UserValidationRules {
  username: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
    reserved: string[];
  };
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbiddenPatterns: RegExp[];
  };
  email: {
    pattern: RegExp;
    maxLength: number;
    required: boolean;
  };
  fullName: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
}

/**
 * User validation errors
 */
export interface UserValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * User validation result
 */
export interface UserValidationResult {
  isValid: boolean;
  errors: UserValidationError[];
  warnings: string[];
}

// ============================================================================
// ACTIVITY AND AUDIT TYPES
// ============================================================================

/**
 * User activity types
 */
export type UserActivityType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'profile_update'
  | 'role_change'
  | 'account_lock'
  | 'account_unlock'
  | 'failed_login'
  | 'password_reset'
  | 'status_change';

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  username: string;
  activityType: UserActivityType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  performedBy?: string;
  performedByName?: string;
  timestamp: string;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  userId: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

// ============================================================================
// STATISTICS AND REPORTS
// ============================================================================

/**
 * User statistics
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
  ldapUsers: number;
  localUsers: number;
  lockedUsers: number;
  recentLogins: number;
  neverLoggedIn: number;
}

/**
 * User role distribution
 */
export interface UserRoleDistribution {
  role: UserRole;
  count: number;
  percentage: number;
}

/**
 * User department distribution
 */
export interface UserDepartmentDistribution {
  department: string;
  userCount: number;
  adminCount: number;
  managerCount: number;
  regularUserCount: number;
}

/**
 * User login analytics
 */
export interface UserLoginAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  data: {
    date: string;
    loginCount: number;
    uniqueUsers: number;
    failedAttempts: number;
  }[];
}

// ============================================================================
// EXPORT AND IMPORT TYPES
// ============================================================================

/**
 * User export options
 */
export interface UserExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeFields: (keyof User)[];
  includeMetadata: boolean;
  includeStatistics: boolean;
  includeActivities: boolean;
  filters?: UserFilters;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * User import data
 */
export interface UserImportData {
  username: string;
  fullName: string;
  email?: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  status?: UserStatus;
}

/**
 * User import result
 */
export interface UserImportResult {
  success: boolean;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: {
    row: number;
    field: string;
    value: string;
    error: string;
  }[];
  warnings: {
    row: number;
    message: string;
  }[];
  duplicates: {
    row: number;
    username: string;
    action: 'skipped' | 'updated';
  }[];
}

// ============================================================================
// CONSTANTS AND ENUMS
// ============================================================================

/**
 * Default user validation rules
 */
export const DEFAULT_USER_VALIDATION_RULES: UserValidationRules = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_.-]+$/,
    reserved: [
      'admin',
      'administrator',
      'root',
      'system',
      'guest',
      'user',
      'test',
      'demo',
    ],
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    forbiddenPatterns: [/password/i, /123456/, /qwerty/i],
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
    required: false,
  },
  fullName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u3131-\uD79D]+$/,
  },
};

/**
 * Role hierarchy for permission checking
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  user: 1,
};

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

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * User list item for display in tables
 */
export interface UserListItem {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  lastLogin?: string;
  createdAt: string;
  assignmentCount: number;
  isLocked: boolean;
}

/**
 * User selection for bulk operations
 */
export interface UserSelection {
  selectedUsers: string[];
  selectAll: boolean;
  excludedUsers: string[];
}

/**
 * Bulk user operation types
 */
export type BulkUserOperation =
  | 'activate'
  | 'deactivate'
  | 'suspend'
  | 'unlock'
  | 'change_role'
  | 'change_department'
  | 'delete'
  | 'export';

/**
 * Bulk user operation data
 */
export interface BulkUserOperationData {
  operation: BulkUserOperation;
  userIds: string[];
  data?: {
    role?: UserRole;
    department?: string;
    status?: UserStatus;
  };
}

/**
 * Bulk operation result
 */
export interface BulkUserOperationResult {
  success: boolean;
  totalAffected: number;
  successfulOperations: number;
  failedOperations: number;
  errors: {
    userId: string;
    username: string;
    error: string;
  }[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Re-export commonly used types for convenience
  User as UserType,
  CreateUserData as CreateUser,
  UpdateUserData as UpdateUser,
  UserRole as Role,
  UserStatus as Status,
  UserPermissions as Permissions,
};
