/**
 * Asset Availability Validation Utilities
 *
 * Comprehensive validation system for asset availability checking
 * with real-time validation and conflict detection.
 */

import {
  Assignment,
  AssignmentWithDetails,
  AssetType,
  AssignmentStatus,
} from '@/types/assignment';
import { Employee } from '@/types/employee';
import { Hardware } from '@/types/hardware';
import { Software } from '@/types/software';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AssetAvailabilityInfo {
  id: string;
  name: string;
  type: AssetType;
  isAvailable: boolean;
  status: string;
  currentAssignment?: Assignment;
  reason?: string;
  restrictions?: AssetRestriction[];
  nextAvailable?: string; // ISO date string
  utilizationLevel?: number; // 0-100 for software licenses
  maxConcurrentUsers?: number;
  currentUsers?: number;
}

export interface AssetRestriction {
  type:
    | 'department'
    | 'role'
    | 'location'
    | 'license_limit'
    | 'maintenance'
    | 'policy';
  message: string;
  severity: 'error' | 'warning' | 'info';
  canOverride?: boolean;
  overridePermission?: string;
}

export interface AvailabilityValidationResult {
  isValid: boolean;
  asset: AssetAvailabilityInfo;
  employee: Employee;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  recommendations: string[];
  canProceed: boolean;
  requiresApproval?: boolean;
  approvalReason?: string;
}

export interface ValidationIssue {
  type:
    | 'availability'
    | 'policy'
    | 'limit'
    | 'conflict'
    | 'maintenance'
    | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  solution?: string;
  canOverride?: boolean;
}

export interface AssetLimits {
  maxAssignmentsPerEmployee?: number;
  maxSameCategoryAssets?: number;
  departmentRestrictions?: string[];
  roleRequirements?: string[];
  geographicRestrictions?: string[];
}

// ============================================================================
// ASSET AVAILABILITY UTILITIES
// ============================================================================

/**
 * Get comprehensive asset availability information
 */
export const getAssetAvailabilityInfo = (
  assetId: string,
  assetType: AssetType,
  hardware: Hardware[],
  software: Software[],
  assignments: (Assignment | AssignmentWithDetails)[]
): AssetAvailabilityInfo => {
  // Find the asset
  const asset =
    assetType === 'hardware'
      ? hardware.find(hw => hw.id === assetId)
      : software.find(sw => sw.id === assetId);

  if (!asset) {
    return {
      id: assetId,
      name: 'Unknown Asset',
      type: assetType,
      isAvailable: false,
      status: 'not_found',
      reason: '자산을 찾을 수 없습니다.',
    };
  }

  // Find current assignments for this asset
  const currentAssignments = assignments.filter(
    assignment =>
      assignment.asset_id === assetId &&
      ['사용중', '대기중'].includes(assignment.status)
  );

  const activeAssignment = currentAssignments.find(
    assignment => assignment.status === '사용중'
  );

  // Check software license limits
  if (assetType === 'software') {
    const softwareAsset = asset as Software;
    const licenseCount = (softwareAsset as any).license_count || 1;
    const currentUsers = currentAssignments.length;
    const utilizationLevel = (currentUsers / licenseCount) * 100;

    return {
      id: asset.id,
      name: asset.name,
      type: assetType,
      isAvailable: currentUsers < licenseCount,
      status: currentUsers >= licenseCount ? 'license_full' : 'available',
      currentAssignment: activeAssignment,
      reason:
        currentUsers >= licenseCount
          ? '라이선스 한도에 도달했습니다.'
          : undefined,
      utilizationLevel,
      maxConcurrentUsers: licenseCount,
      currentUsers,
      restrictions: getLicenseRestrictions(
        softwareAsset,
        currentUsers,
        licenseCount
      ),
    };
  }

  // Hardware availability check
  const isAvailable = !activeAssignment && asset.status === 'available';
  const restrictions = getHardwareRestrictions(asset as Hardware);

  return {
    id: asset.id,
    name: asset.name,
    type: assetType,
    isAvailable,
    status: activeAssignment ? 'assigned' : asset.status || 'available',
    currentAssignment: activeAssignment,
    reason: activeAssignment
      ? `현재 ${activeAssignment.employee_name}에게 할당됨`
      : undefined,
    nextAvailable: activeAssignment?.return_date,
    restrictions,
  };
};

/**
 * Validate asset assignment with comprehensive checks
 */
export const validateAssetAssignment = (
  employee: Employee,
  assetId: string,
  assetType: AssetType,
  hardware: Hardware[],
  software: Software[],
  assignments: (Assignment | AssignmentWithDetails)[]
): AvailabilityValidationResult => {
  const asset = getAssetAvailabilityInfo(
    assetId,
    assetType,
    hardware,
    software,
    assignments
  );
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const recommendations: string[] = [];

  // Basic availability check
  if (!asset.isAvailable) {
    issues.push({
      type: 'availability',
      severity: 'error',
      message: asset.reason || '자산을 사용할 수 없습니다.',
      solution: asset.nextAvailable
        ? `예상 반납일: ${asset.nextAvailable}`
        : '다른 자산을 선택하거나 현재 할당을 확인하세요.',
    });
  }

  // Employee assignment limits
  const employeeAssignments = assignments.filter(
    assignment =>
      assignment.employee_id === employee.id && assignment.status === '사용중'
  );

  const limits = getAssetLimits(assetType);

  // Check maximum assignments per employee
  if (
    limits.maxAssignmentsPerEmployee &&
    employeeAssignments.length >= limits.maxAssignmentsPerEmployee
  ) {
    issues.push({
      type: 'limit',
      severity: 'error',
      message: `직원당 최대 ${limits.maxAssignmentsPerEmployee}개의 자산만 할당 가능합니다.`,
      solution: '기존 할당을 반납한 후 새로운 할당을 진행하세요.',
    });
  }

  // Check same category limits
  if (limits.maxSameCategoryAssets) {
    const sameCategoryCount = employeeAssignments.filter(
      assignment => assignment.asset_type === assetType
    ).length;

    if (sameCategoryCount >= limits.maxSameCategoryAssets) {
      warnings.push({
        type: 'limit',
        severity: 'warning',
        message: `같은 카테고리 자산이 ${sameCategoryCount}개 할당되어 있습니다.`,
        solution: '필요시 기존 할당을 검토하세요.',
        canOverride: true,
      });
    }
  }

  // Department restrictions
  if (
    limits.departmentRestrictions &&
    !limits.departmentRestrictions.includes(employee.department)
  ) {
    issues.push({
      type: 'policy',
      severity: 'error',
      message: `${employee.department} 부서에서는 이 자산을 사용할 수 없습니다.`,
      solution: '자산 정책을 확인하거나 관리자에게 문의하세요.',
    });
  }

  // Asset-specific restrictions
  if (asset.restrictions) {
    asset.restrictions.forEach(restriction => {
      if (restriction.severity === 'error') {
        issues.push({
          type: 'policy',
          severity: restriction.severity,
          message: restriction.message,
          canOverride: restriction.canOverride,
        });
      } else {
        warnings.push({
          type: 'policy',
          severity: restriction.severity,
          message: restriction.message,
          canOverride: restriction.canOverride,
        });
      }
    });
  }

  // Software license utilization warnings
  if (
    assetType === 'software' &&
    asset.utilizationLevel &&
    asset.utilizationLevel > 80
  ) {
    warnings.push({
      type: 'limit',
      severity: 'warning',
      message: `라이선스 사용률이 ${Math.round(asset.utilizationLevel)}%입니다.`,
      solution: '라이선스 추가 구매를 고려하세요.',
    });
  }

  // Compatibility checks
  const compatibilityIssues = checkAssetCompatibility(
    employee,
    asset,
    employeeAssignments
  );
  issues.push(...compatibilityIssues);

  // Generate recommendations
  if (issues.length === 0 && warnings.length === 0) {
    recommendations.push('할당에 문제가 없습니다.');
  }

  if (
    asset.type === 'software' &&
    asset.currentUsers &&
    asset.maxConcurrentUsers
  ) {
    if (asset.currentUsers < asset.maxConcurrentUsers * 0.5) {
      recommendations.push('라이선스 여유가 충분합니다.');
    }
  }

  const canProceed = issues.length === 0;
  const requiresApproval = warnings.some(
    w => w.severity === 'warning' && !w.canOverride
  );

  return {
    isValid: canProceed,
    asset,
    employee,
    issues,
    warnings,
    recommendations,
    canProceed,
    requiresApproval,
    approvalReason: requiresApproval
      ? '정책 예외 승인이 필요합니다.'
      : undefined,
  };
};

/**
 * Check real-time asset availability
 */
export const checkRealTimeAvailability = async (
  assetId: string,
  assetType: AssetType
): Promise<{ available: boolean; reason?: string; nextCheck?: number }> => {
  // Simulate real-time API check
  return new Promise(resolve => {
    setTimeout(() => {
      // Mock real-time check
      const isAvailable = Math.random() > 0.1; // 90% chance available

      resolve({
        available: isAvailable,
        reason: isAvailable
          ? undefined
          : '실시간 확인 결과 자산이 사용 중입니다.',
        nextCheck: isAvailable ? undefined : Date.now() + 60000, // Check again in 1 minute
      });
    }, 500);
  });
};

/**
 * Get asset assignment conflicts
 */
export const getAssetConflicts = (
  assetId: string,
  proposedDate: string,
  assignments: (Assignment | AssignmentWithDetails)[]
): Assignment[] => {
  const proposedDateTime = new Date(proposedDate);

  return assignments.filter(assignment => {
    if (assignment.asset_id !== assetId) return false;
    if (assignment.status === '반납완료') return false;

    const assignedDate = new Date(assignment.assigned_date);
    const returnDate = assignment.return_date
      ? new Date(assignment.return_date)
      : null;

    // Check for date conflicts
    if (returnDate) {
      return proposedDateTime >= assignedDate && proposedDateTime <= returnDate;
    } else {
      // No return date means currently assigned
      return assignment.status === '사용중';
    }
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getLicenseRestrictions = (
  software: Software,
  currentUsers: number,
  maxUsers: number
): AssetRestriction[] => {
  const restrictions: AssetRestriction[] = [];

  const utilizationRate = (currentUsers / maxUsers) * 100;

  if (utilizationRate >= 100) {
    restrictions.push({
      type: 'license_limit',
      message: '라이선스 한도에 도달했습니다.',
      severity: 'error',
    });
  } else if (utilizationRate >= 90) {
    restrictions.push({
      type: 'license_limit',
      message: '라이선스 한도에 거의 도달했습니다.',
      severity: 'warning',
    });
  }

  return restrictions;
};

const getHardwareRestrictions = (hardware: Hardware): AssetRestriction[] => {
  const restrictions: AssetRestriction[] = [];

  // Check maintenance status
  if ((hardware as any).maintenance_status === 'scheduled') {
    restrictions.push({
      type: 'maintenance',
      message: '예정된 유지보수가 있습니다.',
      severity: 'warning',
      canOverride: true,
    });
  }

  // Check hardware condition
  if ((hardware as any).condition === 'poor') {
    restrictions.push({
      type: 'maintenance',
      message: '하드웨어 상태가 좋지 않습니다.',
      severity: 'warning',
      canOverride: true,
      overridePermission: 'manager',
    });
  }

  return restrictions;
};

const getAssetLimits = (assetType: AssetType): AssetLimits => {
  // Default limits based on asset type
  if (assetType === 'hardware') {
    return {
      maxAssignmentsPerEmployee: 5,
      maxSameCategoryAssets: 3,
      departmentRestrictions: [], // No restrictions by default
    };
  } else {
    return {
      maxAssignmentsPerEmployee: 10,
      maxSameCategoryAssets: 5,
      departmentRestrictions: [], // No restrictions by default
    };
  }
};

const checkAssetCompatibility = (
  employee: Employee,
  asset: AssetAvailabilityInfo,
  existingAssignments: (Assignment | AssignmentWithDetails)[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Check for conflicting asset types
  if (asset.type === 'hardware' && asset.name.includes('Mac')) {
    const hasWindowsAssets = existingAssignments.some(assignment =>
      assignment.asset_description?.includes('Windows')
    );

    if (hasWindowsAssets) {
      issues.push({
        type: 'compatibility',
        severity: 'warning',
        message: 'Windows와 Mac 자산이 동시에 할당됩니다.',
        solution: '호환성을 확인하세요.',
        canOverride: true,
      });
    }
  }

  return issues;
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getAssetAvailabilityInfo,
  validateAssetAssignment,
  checkRealTimeAvailability,
  getAssetConflicts,
};
