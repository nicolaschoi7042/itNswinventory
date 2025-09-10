/**
 * Assignment Utility Functions
 * 
 * This file contains utility functions for the assignment management system
 * including data manipulation, validation, formatting, and common operations.
 */

import { 
  Assignment, 
  AssignmentWithDetails,
  AssignmentStatus,
  AssetType,
  CreateAssignmentData,
  ReturnAssignmentData,
  AssignmentFilters,
  AssignmentStats 
} from '@/types/assignment';

import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  ASSIGNMENT_STATUS_DESCRIPTIONS,
  ASSET_TYPE_LABELS,
  ASSET_CONDITIONS,
  ASSET_CONDITION_LABELS,
  ASSIGNMENT_VALIDATION_RULES,
  ASSIGNMENT_ERROR_MESSAGES
} from '@/constants/assignment';

// ============================================================================
// DATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date to Korean locale string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('ko-KR');
};

/**
 * Format date to ISO string for API
 */
export const formatDateForAPI = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate: string | Date, endDate?: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Check if date is today
 */
export const isDateToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false;
  
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// ============================================================================
// ASSIGNMENT STATUS UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status display information
 */
export const getAssignmentStatusInfo = (status: AssignmentStatus) => {
  return {
    status,
    label: ASSIGNMENT_STATUS_LABELS[status],
    color: ASSIGNMENT_STATUS_COLORS[status],
    description: ASSIGNMENT_STATUS_DESCRIPTIONS[status]
  };
};

/**
 * Check if assignment is active
 */
export const isActiveAssignment = (assignment: Assignment): boolean => {
  return assignment.status === ASSIGNMENT_STATUSES.ACTIVE;
};

/**
 * Check if assignment is returned
 */
export const isReturnedAssignment = (assignment: Assignment): boolean => {
  return assignment.status === ASSIGNMENT_STATUSES.RETURNED;
};

/**
 * Check if assignment is overdue
 */
export const isOverdueAssignment = (assignment: Assignment): boolean => {
  return assignment.status === ASSIGNMENT_STATUSES.OVERDUE;
};

/**
 * Determine if assignment should be marked as overdue
 */
export const shouldMarkAsOverdue = (assignment: Assignment, expectedReturnDate?: string): boolean => {
  if (!isActiveAssignment(assignment)) return false;
  if (!expectedReturnDate) return false;
  
  return isDateInPast(expectedReturnDate);
};

// ============================================================================
// ASSIGNMENT DURATION AND FORMATTING
// ============================================================================

/**
 * Calculate assignment duration in days
 */
export const getAssignmentDuration = (assignment: Assignment): number => {
  return calculateDaysBetween(
    assignment.assigned_date,
    assignment.return_date || undefined
  );
};

/**
 * Format assignment duration as human-readable string
 */
export const formatAssignmentDuration = (assignment: Assignment): string => {
  const days = getAssignmentDuration(assignment);
  
  if (days === 0) return '오늘';
  if (days === 1) return '1일';
  if (days < 7) return `${days}일`;
  if (days < 30) return `${Math.floor(days / 7)}주`;
  if (days < 365) return `${Math.floor(days / 30)}개월`;
  
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  
  if (remainingMonths === 0) return `${years}년`;
  return `${years}년 ${remainingMonths}개월`;
};

/**
 * Get duration color based on assignment length
 */
export const getDurationColor = (assignment: Assignment): 'success' | 'info' | 'warning' | 'error' => {
  const days = getAssignmentDuration(assignment);
  
  if (days <= 30) return 'success';      // Green for short assignments
  if (days <= 90) return 'info';         // Blue for medium assignments  
  if (days <= 365) return 'warning';     // Orange for long assignments
  return 'error';                        // Red for very long assignments
};

// ============================================================================
// ASSET TYPE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get asset type display information
 */
export const getAssetTypeInfo = (assetType: AssetType) => {
  return {
    type: assetType,
    label: ASSET_TYPE_LABELS[assetType],
    icon: assetType === 'hardware' ? 'Computer' : 'Apps'
  };
};

/**
 * Format asset display name
 */
export const formatAssetDisplayName = (assignment: Assignment | AssignmentWithDetails): string => {
  if ('asset' in assignment && assignment.asset) {
    const asset = assignment.asset;
    if (assignment.asset_type === 'hardware') {
      return `${asset.manufacturer || ''} ${asset.model || asset.name}`.trim();
    } else {
      return asset.name;
    }
  }
  
  return assignment.asset_description || assignment.asset_id;
};

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate asset availability
 */
export const validateAssetAvailability = (
  assetId: string,
  assetType: AssetType,
  assignments: Assignment[]
): {
  isAvailable: boolean;
  reason?: string;
  conflictingAssignments?: Assignment[];
} => {
  // Find all active assignments for this asset
  const activeAssignments = assignments.filter(assignment => 
    assignment.asset_id === assetId && 
    assignment.status === '사용중'
  );

  if (activeAssignments.length === 0) {
    return { isAvailable: true };
  }

  // For hardware, only one assignment allowed at a time
  if (assetType === 'hardware') {
    return {
      isAvailable: false,
      reason: '이 하드웨어는 이미 다른 직원에게 할당되어 있습니다.',
      conflictingAssignments: activeAssignments
    };
  }

  // For software, check license limits (this will need to be enhanced with actual license data)
  return {
    isAvailable: false,
    reason: '이 소프트웨어의 모든 라이선스가 사용 중입니다.',
    conflictingAssignments: activeAssignments
  };
};

/**
 * Validate employee assignment limits
 */
export const validateEmployeeAssignmentLimits = (
  employeeId: string,
  assignments: Assignment[],
  maxAssignments: number = 5
): {
  canAssign: boolean;
  currentCount: number;
  reason?: string;
  activeAssignments?: Assignment[];
} => {
  // Find all active assignments for this employee
  const activeAssignments = assignments.filter(assignment => 
    assignment.employee_id === employeeId && 
    assignment.status === '사용중'
  );

  const currentCount = activeAssignments.length;

  if (currentCount >= maxAssignments) {
    return {
      canAssign: false,
      currentCount,
      reason: `직원의 최대 할당 수(${maxAssignments}개)에 도달했습니다.`,
      activeAssignments
    };
  }

  return {
    canAssign: true,
    currentCount,
    activeAssignments
  };
};

/**
 * Validate software license availability
 */
export const validateSoftwareLicenseAvailability = (
  softwareId: string,
  assignments: Assignment[],
  softwareData?: {
    total_licenses?: number;
    max_licenses?: number;
    concurrent_users?: number;
  }
): {
  isAvailable: boolean;
  currentUsage: number;
  maxLicenses: number;
  reason?: string;
  utilizationRate?: number;
} => {
  // Count current software assignments
  const currentAssignments = assignments.filter(assignment => 
    assignment.asset_id === softwareId && 
    assignment.asset_type === 'software' &&
    assignment.status === '사용중'
  );

  const currentUsage = currentAssignments.length;
  const maxLicenses = softwareData?.max_licenses || softwareData?.total_licenses || 1;
  const utilizationRate = maxLicenses > 0 ? (currentUsage / maxLicenses) * 100 : 0;

  if (currentUsage >= maxLicenses) {
    return {
      isAvailable: false,
      currentUsage,
      maxLicenses,
      utilizationRate,
      reason: `모든 라이선스가 사용 중입니다. (${currentUsage}/${maxLicenses})`
    };
  }

  return {
    isAvailable: true,
    currentUsage,
    maxLicenses,
    utilizationRate
  };
};

/**
 * Comprehensive assignment validation
 */
export const validateAssignmentEligibility = (
  employeeId: string,
  assetId: string,
  assetType: AssetType,
  assignments: Assignment[],
  options?: {
    maxEmployeeAssignments?: number;
    softwareData?: {
      total_licenses?: number;
      max_licenses?: number;
      concurrent_users?: number;
    };
    excludeAssignmentId?: string; // For edit mode
  }
): {
  isEligible: boolean;
  issues: Array<{
    type: 'asset_availability' | 'employee_limit' | 'software_license' | 'conflict';
    severity: 'error' | 'warning';
    message: string;
    details?: any;
  }>;
  warnings: string[];
  recommendations: string[];
} => {
  const issues: Array<{
    type: 'asset_availability' | 'employee_limit' | 'software_license' | 'conflict';
    severity: 'error' | 'warning';
    message: string;
    details?: any;
  }> = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Filter out the assignment being edited if in edit mode
  const filteredAssignments = options?.excludeAssignmentId 
    ? assignments.filter(a => a.id !== options.excludeAssignmentId)
    : assignments;

  // 1. Validate asset availability
  const assetAvailability = validateAssetAvailability(assetId, assetType, filteredAssignments);
  if (!assetAvailability.isAvailable) {
    issues.push({
      type: 'asset_availability',
      severity: 'error',
      message: assetAvailability.reason || '자산을 사용할 수 없습니다.',
      details: assetAvailability.conflictingAssignments
    });
  }

  // 2. Validate employee assignment limits
  const employeeLimits = validateEmployeeAssignmentLimits(
    employeeId, 
    filteredAssignments, 
    options?.maxEmployeeAssignments
  );
  if (!employeeLimits.canAssign) {
    issues.push({
      type: 'employee_limit',
      severity: 'error',
      message: employeeLimits.reason || '직원의 할당 한도를 초과했습니다.',
      details: {
        currentCount: employeeLimits.currentCount,
        activeAssignments: employeeLimits.activeAssignments
      }
    });
  } else if (employeeLimits.currentCount >= (options?.maxEmployeeAssignments || 5) - 1) {
    warnings.push(`직원의 할당 한도에 거의 도달했습니다. (${employeeLimits.currentCount + 1}/${options?.maxEmployeeAssignments || 5})`);
  }

  // 3. Validate software licenses (if software asset)
  if (assetType === 'software' && options?.softwareData) {
    const licenseValidation = validateSoftwareLicenseAvailability(
      assetId,
      filteredAssignments,
      options.softwareData
    );
    
    if (!licenseValidation.isAvailable) {
      issues.push({
        type: 'software_license',
        severity: 'error',
        message: licenseValidation.reason || '소프트웨어 라이선스를 사용할 수 없습니다.',
        details: {
          currentUsage: licenseValidation.currentUsage,
          maxLicenses: licenseValidation.maxLicenses,
          utilizationRate: licenseValidation.utilizationRate
        }
      });
    } else if (licenseValidation.utilizationRate && licenseValidation.utilizationRate >= 80) {
      warnings.push(`소프트웨어 라이선스 사용률이 높습니다. (${licenseValidation.utilizationRate.toFixed(1)}%)`);
    }
  }

  // 4. Check for scheduling conflicts
  const schedulingConflicts = assignments.filter(assignment =>
    assignment.employee_id === employeeId &&
    assignment.asset_id === assetId &&
    assignment.status === '사용중' &&
    assignment.id !== options?.excludeAssignmentId
  );

  if (schedulingConflicts.length > 0) {
    issues.push({
      type: 'conflict',
      severity: 'error',
      message: '이미 동일한 자산에 대한 활성 할당이 있습니다.',
      details: schedulingConflicts
    });
  }

  // Add recommendations
  if (issues.length === 0) {
    if (assetType === 'hardware') {
      recommendations.push('하드웨어 할당이 승인되었습니다.');
    } else {
      recommendations.push('소프트웨어 라이선스 할당이 승인되었습니다.');
    }
  } else {
    if (issues.some(i => i.type === 'asset_availability')) {
      recommendations.push('다른 사용 가능한 자산을 선택하거나 기존 할당이 반납된 후 다시 시도하세요.');
    }
    if (issues.some(i => i.type === 'employee_limit')) {
      recommendations.push('직원의 기존 할당을 반납하거나 관리자에게 한도 증가를 요청하세요.');
    }
  }

  const isEligible = issues.filter(i => i.severity === 'error').length === 0;

  return {
    isEligible,
    issues,
    warnings,
    recommendations
  };
};

/**
 * Enhanced assignment creation data validation with availability checks
 */
export const validateCreateAssignmentData = (
  data: CreateAssignmentData,
  assignments: Assignment[] = [],
  options?: {
    maxEmployeeAssignments?: number;
    softwareData?: {
      total_licenses?: number;
      max_licenses?: number;
      concurrent_users?: number;
    };
  }
): { 
  isValid: boolean; 
  errors: string[];
  warnings: string[];
  eligibilityCheck?: ReturnType<typeof validateAssignmentEligibility>;
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required field validation
  if (!data.employee_id?.trim()) {
    errors.push('직원을 선택해주세요.');
  }
  
  if (!data.asset_id?.trim()) {
    errors.push('자산을 선택해주세요.');
  }
  
  if (!data.asset_type) {
    errors.push('자산 유형을 선택해주세요.');
  }
  
  if (!data.assigned_date) {
    errors.push('할당일을 선택해주세요.');
  }
  
  // Date validation
  if (data.assigned_date) {
    const assignedDate = new Date(data.assigned_date);
    const minDate = new Date(ASSIGNMENT_VALIDATION_RULES.MIN_ASSIGNMENT_DATE);
    const maxDate = new Date(ASSIGNMENT_VALIDATION_RULES.MAX_ASSIGNMENT_DATE);
    
    if (assignedDate < minDate || assignedDate > maxDate) {
      errors.push('올바른 할당일을 선택해주세요.');
    }
  }
  
  // Notes length validation
  if (data.notes && data.notes.length > ASSIGNMENT_VALIDATION_RULES.NOTES_MAX_LENGTH) {
    errors.push(`메모는 ${ASSIGNMENT_VALIDATION_RULES.NOTES_MAX_LENGTH}자 이하로 입력해주세요.`);
  }

  // Enhanced availability and eligibility validation
  let eligibilityCheck: ReturnType<typeof validateAssignmentEligibility> | undefined;
  
  if (data.employee_id && data.asset_id && data.asset_type && assignments.length > 0) {
    eligibilityCheck = validateAssignmentEligibility(
      data.employee_id,
      data.asset_id,
      data.asset_type,
      assignments,
      options
    );

    // Add eligibility errors to main errors array
    eligibilityCheck.issues
      .filter(issue => issue.severity === 'error')
      .forEach(issue => errors.push(issue.message));

    // Add eligibility warnings to warnings array
    warnings.push(...eligibilityCheck.warnings);
  }
  
  return { 
    isValid: errors.length === 0, 
    errors,
    warnings,
    eligibilityCheck
  };
};

/**
 * Validate return assignment data
 */
export const validateReturnAssignmentData = (
  data: ReturnAssignmentData, 
  assignment: Assignment
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required field validation
  if (!data.return_date) {
    errors.push('반납일을 선택해주세요.');
  }
  
  // Date validation
  if (data.return_date) {
    const returnDate = new Date(data.return_date);
    const assignedDate = new Date(assignment.assigned_date);
    const maxDate = new Date(ASSIGNMENT_VALIDATION_RULES.MAX_RETURN_DATE);
    
    if (returnDate < assignedDate) {
      errors.push('반납일은 할당일보다 이후여야 합니다.');
    }
    
    if (returnDate > maxDate) {
      errors.push('반납일은 오늘 날짜를 초과할 수 없습니다.');
    }
  }
  
  // Return notes validation
  if (data.return_notes && data.return_notes.length > ASSIGNMENT_VALIDATION_RULES.RETURN_NOTES_MAX_LENGTH) {
    errors.push(`반납 메모는 ${ASSIGNMENT_VALIDATION_RULES.RETURN_NOTES_MAX_LENGTH}자 이하로 입력해주세요.`);
  }
  
  // Condition validation
  if (data.condition && !Object.values(ASSET_CONDITIONS).includes(data.condition)) {
    errors.push('올바른 상태를 선택해주세요.');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
  if (!query.trim()) return { isValid: true };
  
  if (query.length < ASSIGNMENT_VALIDATION_RULES.MIN_SEARCH_LENGTH) {
    return { 
      isValid: false, 
      error: `검색어는 ${ASSIGNMENT_VALIDATION_RULES.MIN_SEARCH_LENGTH}자 이상 입력해주세요.` 
    };
  }
  
  if (query.length > ASSIGNMENT_VALIDATION_RULES.MAX_SEARCH_LENGTH) {
    return { 
      isValid: false, 
      error: `검색어는 ${ASSIGNMENT_VALIDATION_RULES.MAX_SEARCH_LENGTH}자 이하로 입력해주세요.` 
    };
  }
  
  return { isValid: true };
};

// ============================================================================
// FILTERING AND SORTING UTILITY FUNCTIONS
// ============================================================================

/**
 * Apply filters to assignment list
 */
export const applyAssignmentFilters = (
  assignments: (Assignment | AssignmentWithDetails)[], 
  filters: AssignmentFilters
): (Assignment | AssignmentWithDetails)[] => {
  let filtered = [...assignments];
  
  // Asset type filter
  if (filters.asset_type) {
    filtered = filtered.filter(a => a.asset_type === filters.asset_type);
  }
  
  // Status filter (can be single status or array of statuses)
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filtered = filtered.filter(a => filters.status!.includes(a.status));
    } else {
      filtered = filtered.filter(a => a.status === filters.status);
    }
  }
  
  // Employee filter (by name or ID)
  if (filters.employee_id) {
    filtered = filtered.filter(a => 
      a.employee_id === filters.employee_id || 
      a.employee_name === filters.employee_id
    );
  }
  
  // Department filter (requires AssignmentWithDetails)
  if (filters.department) {
    filtered = filtered.filter(a => {
      if ('employee' in a && a.employee) {
        return a.employee.department === filters.department;
      }
      return false;
    });
  }
  
  // Asset ID filter
  if (filters.asset_id) {
    filtered = filtered.filter(a => a.asset_id === filters.asset_id);
  }
  
  // Manufacturer filter (requires AssignmentWithDetails)
  if (filters.manufacturer) {
    filtered = filtered.filter(a => {
      if ('asset' in a && a.asset) {
        return a.asset.manufacturer?.toLowerCase().includes(filters.manufacturer!.toLowerCase());
      }
      return false;
    });
  }
  
  // Date range filters
  if (filters.assigned_date_from) {
    const fromDate = new Date(filters.assigned_date_from);
    filtered = filtered.filter(a => new Date(a.assigned_date) >= fromDate);
  }
  
  if (filters.assigned_date_to) {
    const toDate = new Date(filters.assigned_date_to);
    filtered = filtered.filter(a => new Date(a.assigned_date) <= toDate);
  }
  
  if (filters.return_date_from && filters.return_date_to) {
    const fromDate = new Date(filters.return_date_from);
    const toDate = new Date(filters.return_date_to);
    filtered = filtered.filter(a => {
      if (!a.return_date) return false;
      const returnDate = new Date(a.return_date);
      return returnDate >= fromDate && returnDate <= toDate;
    });
  }
  
  // Overdue filter
  if (filters.overdue === true) {
    filtered = filtered.filter(a => isOverdueAssignment(a));
  } else if (filters.overdue === false) {
    filtered = filtered.filter(a => !isOverdueAssignment(a));
  }
  
  return filtered;
};

/**
 * Advanced status filtering with complex conditions
 */
export const applyAdvancedStatusFilters = (
  assignments: (Assignment | AssignmentWithDetails)[],
  statusConditions: {
    includeStatuses?: AssignmentStatus[];
    excludeStatuses?: AssignmentStatus[];
    overdueOnly?: boolean;
    activeOnly?: boolean;
    problemsOnly?: boolean;
    dateRange?: {
      from?: string;
      to?: string;
      field: 'assigned_date' | 'return_date';
    };
  }
): (Assignment | AssignmentWithDetails)[] => {
  let filtered = [...assignments];

  // Include specific statuses
  if (statusConditions.includeStatuses && statusConditions.includeStatuses.length > 0) {
    filtered = filtered.filter(a => statusConditions.includeStatuses!.includes(a.status));
  }

  // Exclude specific statuses
  if (statusConditions.excludeStatuses && statusConditions.excludeStatuses.length > 0) {
    filtered = filtered.filter(a => !statusConditions.excludeStatuses!.includes(a.status));
  }

  // Overdue only
  if (statusConditions.overdueOnly) {
    filtered = filtered.filter(a => isOverdueAssignment(a));
  }

  // Active only (사용중, 대기중)
  if (statusConditions.activeOnly) {
    filtered = filtered.filter(a => ['사용중', '대기중'].includes(a.status));
  }

  // Problems only (연체, 분실, 손상)
  if (statusConditions.problemsOnly) {
    filtered = filtered.filter(a => ['연체', '분실', '손상'].includes(a.status));
  }

  // Date range filtering
  if (statusConditions.dateRange) {
    const { from, to, field } = statusConditions.dateRange;
    
    if (from) {
      const fromDate = new Date(from);
      filtered = filtered.filter(a => {
        const dateValue = field === 'assigned_date' ? a.assigned_date : a.return_date;
        return dateValue && new Date(dateValue) >= fromDate;
      });
    }
    
    if (to) {
      const toDate = new Date(to);
      filtered = filtered.filter(a => {
        const dateValue = field === 'assigned_date' ? a.assigned_date : a.return_date;
        return dateValue && new Date(dateValue) <= toDate;
      });
    }
  }

  return filtered;
};

/**
 * Get status transition recommendations
 */
export const getStatusTransitionRecommendations = (
  assignment: Assignment | AssignmentWithDetails
): { 
  recommended: AssignmentStatus[]; 
  prohibited: AssignmentStatus[]; 
  warnings: string[] 
} => {
  const current = assignment.status;
  const warnings: string[] = [];
  
  const transitions: Record<AssignmentStatus, {
    recommended: AssignmentStatus[];
    prohibited: AssignmentStatus[];
  }> = {
    '대기중': {
      recommended: ['사용중'],
      prohibited: ['반납완료']
    },
    '사용중': {
      recommended: ['반납완료', '연체', '분실', '손상'],
      prohibited: ['대기중']
    },
    '연체': {
      recommended: ['반납완료', '분실', '손상'],
      prohibited: ['대기중']
    },
    '반납완료': {
      recommended: [],
      prohibited: ['사용중', '대기중', '연체']
    },
    '분실': {
      recommended: ['반납완료'],
      prohibited: ['사용중', '대기중']
    },
    '손상': {
      recommended: ['반납완료', '사용중'],
      prohibited: ['대기중']
    }
  };

  const config = transitions[current];
  
  // Add warnings based on current status
  if (current === '연체') {
    warnings.push('이 할당은 연체 상태입니다. 즉시 반납 처리를 권장합니다.');
  }
  
  if (current === '분실') {
    warnings.push('분실된 자산입니다. 관련 절차를 확인하세요.');
  }
  
  if (current === '손상') {
    warnings.push('손상된 자산입니다. 수리 후 재할당하거나 반납 처리하세요.');
  }

  return {
    recommended: config.recommended,
    prohibited: config.prohibited,
    warnings
  };
};

/**
 * Calculate status change impact
 */
export const calculateStatusChangeImpact = (
  assignments: (Assignment | AssignmentWithDetails)[],
  fromStatus: AssignmentStatus,
  toStatus: AssignmentStatus
): {
  affectedCount: number;
  estimatedTime: string;
  requiredActions: string[];
  warnings: string[];
} => {
  const affectedAssignments = assignments.filter(a => a.status === fromStatus);
  const affectedCount = affectedAssignments.length;
  
  // Estimate processing time (rough calculation)
  const estimatedMinutes = affectedCount * 2; // 2 minutes per assignment
  const estimatedTime = estimatedMinutes < 60 
    ? `약 ${estimatedMinutes}분`
    : `약 ${Math.ceil(estimatedMinutes / 60)}시간`;
  
  const requiredActions: string[] = [];
  const warnings: string[] = [];
  
  // Define required actions based on status transition
  if (toStatus === '반납완료') {
    requiredActions.push('반납 확인 및 자산 상태 점검');
    requiredActions.push('반납 문서 작성');
  }
  
  if (toStatus === '분실') {
    requiredActions.push('분실 신고서 작성');
    requiredActions.push('관련 부서 통보');
    warnings.push('분실 처리는 신중하게 진행하세요.');
  }
  
  if (toStatus === '손상') {
    requiredActions.push('손상 정도 평가');
    requiredActions.push('수리 계획 수립');
  }
  
  if (affectedCount > 10) {
    warnings.push(`${affectedCount}개의 할당이 영향을 받습니다. 일괄 처리를 신중하게 진행하세요.`);
  }

  return {
    affectedCount,
    estimatedTime,
    requiredActions,
    warnings
  };
};

/**
 * Search assignments by text
 */
export const searchAssignments = (
  assignments: (Assignment | AssignmentWithDetails)[], 
  query: string
): (Assignment | AssignmentWithDetails)[] => {
  if (!query.trim()) return assignments;
  
  const searchTerm = query.toLowerCase().trim();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
  
  return assignments.filter(assignment => {
    // Create searchable text array
    const searchableFields: string[] = [
      // Basic assignment fields
      assignment.employee_name || '',
      assignment.asset_id || '',
      assignment.asset_description || '',
      assignment.id || '',
      assignment.status || '',
      assignment.notes || '',
      
      // Asset type
      assignment.asset_type === 'hardware' ? '하드웨어' : '소프트웨어',
      assignment.asset_type || '',
    ];
    
    // Enhanced employee information (if available)
    if ('employee' in assignment && assignment.employee) {
      searchableFields.push(
        assignment.employee.name || '',
        assignment.employee.department || '',
        assignment.employee.position || '',
        assignment.employee.email || ''
      );
    }
    
    // Enhanced asset information (if available)
    if ('asset' in assignment && assignment.asset) {
      searchableFields.push(
        assignment.asset.name || '',
        assignment.asset.type || '',
        assignment.asset.manufacturer || '',
        assignment.asset.model || '',
        assignment.asset.serial_number || ''
      );
      
      // Asset specifications
      if (assignment.asset.specifications) {
        const specs = assignment.asset.specifications;
        searchableFields.push(
          specs.cpu || '',
          specs.memory || '',
          specs.storage || '',
          specs.display || '',
          specs.os || '',
          specs.version || ''
        );
      }
    }
    
    // Date fields for more natural searching
    searchableFields.push(
      formatDate(assignment.assigned_date),
      assignment.return_date ? formatDate(assignment.return_date) : ''
    );
    
    // Join all searchable text
    const searchableText = searchableFields
      .filter(field => field)
      .join(' ')
      .toLowerCase();
    
    // Check if all search words are found
    if (searchWords.length === 1) {
      return searchableText.includes(searchTerm);
    } else {
      // For multiple words, all must be found
      return searchWords.every(word => searchableText.includes(word));
    }
  });
};

/**
 * Sort assignments by specified field
 */
export const sortAssignments = (
  assignments: Assignment[], 
  sortBy: keyof Assignment, 
  sortOrder: 'asc' | 'desc' = 'desc'
): Assignment[] => {
  return [...assignments].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Handle null/undefined values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortOrder === 'asc' ? -1 : 1;
    if (valueB == null) return sortOrder === 'asc' ? 1 : -1;
    
    // Handle date strings
    if (typeof valueA === 'string' && typeof valueB === 'string' && 
        (sortBy.includes('date') || sortBy.includes('_at'))) {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// ============================================================================
// STATISTICS AND ANALYTICS UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate assignment statistics
 */
export const calculateAssignmentStats = (assignments: Assignment[]): AssignmentStats => {
  const stats: AssignmentStats = {
    total_assignments: assignments.length,
    active_assignments: 0,
    returned_assignments: 0,
    overdue_assignments: 0,
    by_asset_type: {
      hardware: 0,
      software: 0
    },
    by_status: {
      '사용중': 0,
      '반납완료': 0,
      '대기중': 0,
      '연체': 0,
      '분실': 0,
      '손상': 0
    },
    by_department: {},
    recent_assignments: [],
    recent_returns: []
  };
  
  assignments.forEach(assignment => {
    // Status counts
    stats.by_status[assignment.status]++;
    
    if (isActiveAssignment(assignment)) stats.active_assignments++;
    if (isReturnedAssignment(assignment)) stats.returned_assignments++;
    if (isOverdueAssignment(assignment)) stats.overdue_assignments++;
    
    // Asset type counts
    stats.by_asset_type[assignment.asset_type]++;
    
    // Department counts (if employee data is available)
    if ('employee' in assignment && assignment.employee?.department) {
      const dept = assignment.employee.department;
      stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;
    }
  });
  
  // Recent assignments (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  stats.recent_assignments = assignments
    .filter(a => new Date(a.assigned_date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime())
    .slice(0, 10);
  
  // Recent returns (last 30 days)
  stats.recent_returns = assignments
    .filter(a => a.return_date && new Date(a.return_date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.return_date!).getTime() - new Date(a.return_date!).getTime())
    .slice(0, 10);
  
  return stats;
};

/**
 * Get assignment trends for chart display
 */
export const getAssignmentTrends = (assignments: Assignment[], days: number = 30): {
  dates: string[];
  assigned: number[];
  returned: number[];
} => {
  const trends = {
    dates: [] as string[],
    assigned: [] as number[],
    returned: [] as number[]
  };
  
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = formatDateForAPI(date);
    
    trends.dates.push(dateStr);
    
    // Count assignments made on this date
    const assignedCount = assignments.filter(a => 
      formatDateForAPI(new Date(a.assigned_date)) === dateStr
    ).length;
    
    // Count returns made on this date
    const returnedCount = assignments.filter(a => 
      a.return_date && formatDateForAPI(new Date(a.return_date)) === dateStr
    ).length;
    
    trends.assigned.push(assignedCount);
    trends.returned.push(returnedCount);
  }
  
  return trends;
};

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

/**
 * Prepare assignment data for export
 */
export const prepareAssignmentDataForExport = (assignments: Assignment[]): Record<string, any>[] => {
  return assignments.map(assignment => ({
    '할당 ID': assignment.id,
    '직원명': assignment.employee_name,
    '자산 ID': assignment.asset_id,
    '자산 유형': ASSET_TYPE_LABELS[assignment.asset_type],
    '자산 설명': assignment.asset_description || '-',
    '할당일': formatDate(assignment.assigned_date),
    '반납일': assignment.return_date ? formatDate(assignment.return_date) : '-',
    '상태': ASSIGNMENT_STATUS_LABELS[assignment.status],
    '사용 기간': formatAssignmentDuration(assignment),
    '메모': assignment.notes || '-',
    '할당자': assignment.assigned_by,
    '반납 처리자': assignment.returned_by || '-'
  }));
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (type: 'assignments' | 'history' | 'stats', format: 'xlsx' | 'csv' = 'xlsx'): string => {
  const today = new Date().toISOString().split('T')[0];
  const typeLabels = {
    assignments: '자산할당현황',
    history: '할당이력',
    stats: '할당통계'
  };
  
  return `${typeLabels[type]}_${today}.${format}`;
};

// ============================================================================
// PERMISSION UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user can perform action on assignment
 */
export const canPerformAssignmentAction = (
  action: 'create' | 'update' | 'delete' | 'return',
  userRole: 'admin' | 'manager' | 'user',
  assignment?: Assignment
): boolean => {
  switch (action) {
    case 'create':
      return userRole === 'admin' || userRole === 'manager';
      
    case 'update':
      return userRole === 'admin' || userRole === 'manager';
      
    case 'return':
      return userRole === 'admin' || userRole === 'manager';
      
    case 'delete':
      return userRole === 'admin';
      
    default:
      return false;
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const AssignmentUtils = {
  // Date utilities
  formatDate,
  formatDateForAPI,
  calculateDaysBetween,
  isDateInPast,
  isDateToday,
  
  // Status utilities
  getAssignmentStatusInfo,
  isActiveAssignment,
  isReturnedAssignment,
  isOverdueAssignment,
  shouldMarkAsOverdue,
  
  // Duration utilities
  getAssignmentDuration,
  formatAssignmentDuration,
  getDurationColor,
  
  // Asset utilities
  getAssetTypeInfo,
  formatAssetDisplayName,
  
  // Validation utilities
  validateAssetAvailability,
  validateEmployeeAssignmentLimits,
  validateSoftwareLicenseAvailability,
  validateAssignmentEligibility,
  validateCreateAssignmentData,
  validateReturnAssignmentData,
  validateSearchQuery,
  
  // Filtering and sorting utilities
  applyAssignmentFilters,
  searchAssignments,
  sortAssignments,
  
  // Statistics utilities
  calculateAssignmentStats,
  getAssignmentTrends,
  
  // Export utilities
  prepareAssignmentDataForExport,
  generateExportFilename,
  
  // Permission utilities
  canPerformAssignmentAction
};