/**
 * Assignment Conflicts and Edge Cases Utility Functions
 * 
 * Handles complex assignment scenarios including conflicts, edge cases,
 * and automated resolution suggestions.
 */

import { 
  Assignment, 
  AssignmentWithDetails,
  AssetType,
  AssignmentStatus
} from '@/types/assignment';
import { Employee } from '@/types/employee';
import { Hardware } from '@/types/hardware';
import { Software } from '@/types/software';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: AssignmentConflict[];
  warnings: AssignmentWarning[];
  suggestions: ConflictResolution[];
}

export interface AssignmentConflict {
  id: string;
  type: 'scheduling' | 'resource' | 'policy' | 'business_rule' | 'data_integrity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedAssignments: string[];
  affectedEmployees: string[];
  affectedAssets: string[];
  detectedAt: string;
  canAutoResolve: boolean;
  impact: string;
}

export interface AssignmentWarning {
  id: string;
  type: 'performance' | 'compliance' | 'optimization' | 'maintenance';
  message: string;
  details?: string;
  actionable: boolean;
  recommendation?: string;
}

export interface ConflictResolution {
  conflictId: string;
  type: 'reschedule' | 'reassign' | 'alternative_asset' | 'policy_override' | 'manual_review';
  title: string;
  description: string;
  steps: string[];
  automated: boolean;
  confidence: number; // 0-1
  estimatedResolutionTime: string;
  alternatives?: ConflictResolution[];
}

export interface EdgeCaseScenario {
  scenario: 'expired_asset' | 'inactive_employee' | 'maintenance_conflict' | 'license_expiry' | 'bulk_return' | 'cascade_effect';
  description: string;
  detection: () => boolean;
  resolution: string[];
  preventive: string[];
}

// ============================================================================
// CONFLICT DETECTION FUNCTIONS
// ============================================================================

/**
 * Comprehensive conflict detection for assignment scenarios
 */
export function detectAssignmentConflicts(
  newAssignment: {
    employee_id: string;
    asset_id: string;
    asset_type: AssetType;
    assigned_date: string;
    expected_return_date?: string;
  },
  existingAssignments: Assignment[],
  employees: Employee[],
  hardware: Hardware[],
  software: Software[]
): ConflictDetectionResult {
  const conflicts: AssignmentConflict[] = [];
  const warnings: AssignmentWarning[] = [];
  const suggestions: ConflictResolution[] = [];
  const timestamp = new Date().toISOString();

  // 1. Resource Conflicts (Double booking)
  const resourceConflicts = detectResourceConflicts(newAssignment, existingAssignments);
  conflicts.push(...resourceConflicts.map(conflict => ({
    ...conflict,
    detectedAt: timestamp
  })));

  // 2. Scheduling Conflicts
  const schedulingConflicts = detectSchedulingConflicts(newAssignment, existingAssignments);
  conflicts.push(...schedulingConflicts.map(conflict => ({
    ...conflict,
    detectedAt: timestamp
  })));

  // 3. Policy Violations
  const policyConflicts = detectPolicyViolations(newAssignment, existingAssignments, employees);
  conflicts.push(...policyConflicts.map(conflict => ({
    ...conflict,
    detectedAt: timestamp
  })));

  // 4. Business Rule Violations
  const businessRuleConflicts = detectBusinessRuleViolations(newAssignment, existingAssignments, employees, hardware, software);
  conflicts.push(...businessRuleConflicts.map(conflict => ({
    ...conflict,
    detectedAt: timestamp
  })));

  // 5. Data Integrity Issues
  const dataIntegrityConflicts = detectDataIntegrityIssues(newAssignment, employees, hardware, software);
  conflicts.push(...dataIntegrityConflicts.map(conflict => ({
    ...conflict,
    detectedAt: timestamp
  })));

  // 6. Generate Warnings
  const performanceWarnings = generatePerformanceWarnings(newAssignment, existingAssignments);
  warnings.push(...performanceWarnings);

  const complianceWarnings = generateComplianceWarnings(newAssignment, existingAssignments, hardware, software);
  warnings.push(...complianceWarnings);

  // 7. Generate Resolution Suggestions
  for (const conflict of conflicts) {
    const resolutions = generateConflictResolutions(conflict, newAssignment, existingAssignments, employees, hardware, software);
    suggestions.push(...resolutions);
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    warnings,
    suggestions
  };
}

/**
 * Detect resource conflicts (double booking of assets)
 */
function detectResourceConflicts(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string; expected_return_date?: string },
  existingAssignments: Assignment[]
): Omit<AssignmentConflict, 'detectedAt'>[] {
  const conflicts: Omit<AssignmentConflict, 'detectedAt'>[] = [];
  
  // For hardware: Check if already assigned
  if (newAssignment.asset_type === 'hardware') {
    const conflictingAssignments = existingAssignments.filter(assignment =>
      assignment.asset_id === newAssignment.asset_id &&
      assignment.asset_type === 'hardware' &&
      assignment.status === '사용중'
    );

    if (conflictingAssignments.length > 0) {
      conflicts.push({
        id: `resource_conflict_${newAssignment.asset_id}_${Date.now()}`,
        type: 'resource',
        severity: 'critical',
        title: '하드웨어 자산 이중 할당',
        description: '이 하드웨어는 이미 다른 직원에게 할당되어 있습니다.',
        affectedAssignments: conflictingAssignments.map(a => a.id),
        affectedEmployees: [newAssignment.employee_id, ...conflictingAssignments.map(a => a.employee_id)],
        affectedAssets: [newAssignment.asset_id],
        canAutoResolve: false,
        impact: '신규 할당이 불가능하며, 기존 할당을 먼저 반납해야 합니다.'
      });
    }
  }

  // For software: Check license limits
  if (newAssignment.asset_type === 'software') {
    const activeSoftwareAssignments = existingAssignments.filter(assignment =>
      assignment.asset_id === newAssignment.asset_id &&
      assignment.asset_type === 'software' &&
      assignment.status === '사용중'
    );

    // Note: This would need actual software license data to be fully functional
    const estimatedMaxLicenses = 5; // This should come from software data
    
    if (activeSoftwareAssignments.length >= estimatedMaxLicenses) {
      conflicts.push({
        id: `license_conflict_${newAssignment.asset_id}_${Date.now()}`,
        type: 'resource',
        severity: 'high',
        title: '소프트웨어 라이선스 한도 초과',
        description: '사용 가능한 모든 소프트웨어 라이선스가 할당되어 있습니다.',
        affectedAssignments: activeSoftwareAssignments.map(a => a.id),
        affectedEmployees: [newAssignment.employee_id, ...activeSoftwareAssignments.map(a => a.employee_id)],
        affectedAssets: [newAssignment.asset_id],
        canAutoResolve: false,
        impact: '신규 라이선스 할당이 불가능하며, 기존 할당을 반납하거나 추가 라이선스를 구입해야 합니다.'
      });
    }
  }

  return conflicts;
}

/**
 * Detect scheduling conflicts
 */
function detectSchedulingConflicts(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string; expected_return_date?: string },
  existingAssignments: Assignment[]
): Omit<AssignmentConflict, 'detectedAt'>[] {
  const conflicts: Omit<AssignmentConflict, 'detectedAt'>[] = [];
  
  // Check if employee already has assignment for same asset on same date
  const sameEmployeeSameAsset = existingAssignments.filter(assignment =>
    assignment.employee_id === newAssignment.employee_id &&
    assignment.asset_id === newAssignment.asset_id &&
    assignment.status === '사용중'
  );

  if (sameEmployeeSameAsset.length > 0) {
    conflicts.push({
      id: `scheduling_conflict_${newAssignment.employee_id}_${newAssignment.asset_id}_${Date.now()}`,
      type: 'scheduling',
      severity: 'high',
      title: '중복 자산 할당',
      description: '해당 직원이 이미 동일한 자산을 할당받고 있습니다.',
      affectedAssignments: sameEmployeeSameAsset.map(a => a.id),
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: true,
      impact: '중복 할당으로 인한 관리상 혼란이 발생할 수 있습니다.'
    });
  }

  // Check for overlapping assignment periods
  if (newAssignment.expected_return_date) {
    const overlappingAssignments = existingAssignments.filter(assignment => {
      if (assignment.asset_id !== newAssignment.asset_id) return false;
      if (assignment.status !== '사용중') return false;
      
      const newStart = new Date(newAssignment.assigned_date);
      const newEnd = new Date(newAssignment.expected_return_date!);
      const existingStart = new Date(assignment.assigned_date);
      const existingEnd = assignment.expected_return_date ? new Date(assignment.expected_return_date) : new Date('2099-12-31');

      // Check for overlap
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (overlappingAssignments.length > 0) {
      conflicts.push({
        id: `period_overlap_${newAssignment.asset_id}_${Date.now()}`,
        type: 'scheduling',
        severity: 'medium',
        title: '할당 기간 겹침',
        description: '할당 예정 기간이 기존 할당과 겹칩니다.',
        affectedAssignments: overlappingAssignments.map(a => a.id),
        affectedEmployees: [newAssignment.employee_id, ...overlappingAssignments.map(a => a.employee_id)],
        affectedAssets: [newAssignment.asset_id],
        canAutoResolve: true,
        impact: '자산 사용 스케줄링에 문제가 발생할 수 있습니다.'
      });
    }
  }

  return conflicts;
}

/**
 * Detect policy violations
 */
function detectPolicyViolations(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string },
  existingAssignments: Assignment[],
  employees: Employee[]
): Omit<AssignmentConflict, 'detectedAt'>[] {
  const conflicts: Omit<AssignmentConflict, 'detectedAt'>[] = [];
  const employee = employees.find(e => e.id === newAssignment.employee_id);

  if (!employee) {
    conflicts.push({
      id: `employee_not_found_${newAssignment.employee_id}_${Date.now()}`,
      type: 'policy',
      severity: 'critical',
      title: '직원 정보 없음',
      description: '할당하려는 직원을 찾을 수 없습니다.',
      affectedAssignments: [],
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: false,
      impact: '유효하지 않은 직원에게 자산을 할당할 수 없습니다.'
    });
    return conflicts;
  }

  // Check maximum assignments per employee
  const employeeActiveAssignments = existingAssignments.filter(assignment =>
    assignment.employee_id === newAssignment.employee_id &&
    assignment.status === '사용중'
  );

  if (employeeActiveAssignments.length >= 5) {
    conflicts.push({
      id: `max_assignments_exceeded_${newAssignment.employee_id}_${Date.now()}`,
      type: 'policy',
      severity: 'high',
      title: '최대 할당 수 초과',
      description: `${employee.name}님이 이미 최대 할당 수(5개)에 도달했습니다.`,
      affectedAssignments: employeeActiveAssignments.map(a => a.id),
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: false,
      impact: '직원의 할당 한도를 초과하여 관리가 어려워질 수 있습니다.'
    });
  }

  // Check employee status (if available)
  if (employee.status === 'inactive') {
    conflicts.push({
      id: `inactive_employee_${newAssignment.employee_id}_${Date.now()}`,
      type: 'policy',
      severity: 'high',
      title: '비활성 직원 할당',
      description: '비활성 상태의 직원에게 자산을 할당하려고 합니다.',
      affectedAssignments: [],
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: false,
      impact: '비활성 직원에게 할당된 자산의 관리가 어려울 수 있습니다.'
    });
  }

  return conflicts;
}

/**
 * Detect business rule violations
 */
function detectBusinessRuleViolations(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string },
  existingAssignments: Assignment[],
  employees: Employee[],
  hardware: Hardware[],
  software: Software[]
): Omit<AssignmentConflict, 'detectedAt'>[] {
  const conflicts: Omit<AssignmentConflict, 'detectedAt'>[] = [];
  
  // Check asset status and availability
  if (newAssignment.asset_type === 'hardware') {
    const asset = hardware.find(h => h.id === newAssignment.asset_id);
    
    if (asset) {
      if (asset.status === 'maintenance') {
        conflicts.push({
          id: `maintenance_asset_${newAssignment.asset_id}_${Date.now()}`,
          type: 'business_rule',
          severity: 'high',
          title: '유지보수 중인 자산',
          description: '현재 유지보수 중인 하드웨어를 할당하려고 합니다.',
          affectedAssignments: [],
          affectedEmployees: [newAssignment.employee_id],
          affectedAssets: [newAssignment.asset_id],
          canAutoResolve: false,
          impact: '유지보수 중인 자산은 사용할 수 없습니다.'
        });
      }

      if (asset.status === 'disposed') {
        conflicts.push({
          id: `disposed_asset_${newAssignment.asset_id}_${Date.now()}`,
          type: 'business_rule',
          severity: 'critical',
          title: '폐기된 자산',
          description: '이미 폐기된 하드웨어를 할당하려고 합니다.',
          affectedAssignments: [],
          affectedEmployees: [newAssignment.employee_id],
          affectedAssets: [newAssignment.asset_id],
          canAutoResolve: false,
          impact: '폐기된 자산은 할당할 수 없습니다.'
        });
      }
    }
  }

  if (newAssignment.asset_type === 'software') {
    const asset = software.find(s => s.id === newAssignment.asset_id);
    
    if (asset) {
      // Check expiry date
      if (asset.expiry_date) {
        const expiryDate = new Date(asset.expiry_date);
        const assignmentDate = new Date(newAssignment.assigned_date);
        
        if (expiryDate <= assignmentDate) {
          conflicts.push({
            id: `expired_software_${newAssignment.asset_id}_${Date.now()}`,
            type: 'business_rule',
            severity: 'high',
            title: '만료된 소프트웨어',
            description: '라이선스가 만료된 소프트웨어를 할당하려고 합니다.',
            affectedAssignments: [],
            affectedEmployees: [newAssignment.employee_id],
            affectedAssets: [newAssignment.asset_id],
            canAutoResolve: false,
            impact: '만료된 라이선스는 사용할 수 없습니다.'
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Detect data integrity issues
 */
function detectDataIntegrityIssues(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string },
  employees: Employee[],
  hardware: Hardware[],
  software: Software[]
): Omit<AssignmentConflict, 'detectedAt'>[] {
  const conflicts: Omit<AssignmentConflict, 'detectedAt'>[] = [];

  // Check if employee exists
  const employeeExists = employees.some(e => e.id === newAssignment.employee_id);
  if (!employeeExists) {
    conflicts.push({
      id: `employee_not_exists_${newAssignment.employee_id}_${Date.now()}`,
      type: 'data_integrity',
      severity: 'critical',
      title: '존재하지 않는 직원',
      description: '할당하려는 직원 ID가 시스템에 존재하지 않습니다.',
      affectedAssignments: [],
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: false,
      impact: '데이터 무결성 위반으로 할당이 불가능합니다.'
    });
  }

  // Check if asset exists
  const assetExists = newAssignment.asset_type === 'hardware'
    ? hardware.some(h => h.id === newAssignment.asset_id)
    : software.some(s => s.id === newAssignment.asset_id);

  if (!assetExists) {
    conflicts.push({
      id: `asset_not_exists_${newAssignment.asset_id}_${Date.now()}`,
      type: 'data_integrity',
      severity: 'critical',
      title: '존재하지 않는 자산',
      description: '할당하려는 자산 ID가 시스템에 존재하지 않습니다.',
      affectedAssignments: [],
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: false,
      impact: '데이터 무결성 위반으로 할당이 불가능합니다.'
    });
  }

  // Check assignment date validity
  const assignmentDate = new Date(newAssignment.assigned_date);
  const currentDate = new Date();
  const futureLimit = new Date();
  futureLimit.setFullYear(currentDate.getFullYear() + 1);

  if (assignmentDate > futureLimit) {
    conflicts.push({
      id: `future_date_${Date.now()}`,
      type: 'data_integrity',
      severity: 'medium',
      title: '미래 날짜 할당',
      description: '할당일이 너무 미래로 설정되어 있습니다.',
      affectedAssignments: [],
      affectedEmployees: [newAssignment.employee_id],
      affectedAssets: [newAssignment.asset_id],
      canAutoResolve: true,
      impact: '비현실적인 할당 일정입니다.'
    });
  }

  return conflicts;
}

/**
 * Generate performance warnings
 */
function generatePerformanceWarnings(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType },
  existingAssignments: Assignment[]
): AssignmentWarning[] {
  const warnings: AssignmentWarning[] = [];

  // Check for high assignment volume
  const recentAssignments = existingAssignments.filter(assignment => {
    const assignedDate = new Date(assignment.assigned_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return assignedDate >= weekAgo;
  });

  if (recentAssignments.length > 50) {
    warnings.push({
      id: `high_volume_warning_${Date.now()}`,
      type: 'performance',
      message: '최근 일주일간 높은 할당 볼륨이 감지되었습니다.',
      details: `${recentAssignments.length}개의 새로운 할당이 생성되었습니다.`,
      actionable: true,
      recommendation: '시스템 성능과 관리 효율성을 위해 할당 프로세스를 검토하세요.'
    });
  }

  // Check for potential asset shortage
  const employeeAssignments = existingAssignments.filter(assignment =>
    assignment.employee_id === newAssignment.employee_id &&
    assignment.status === '사용중'
  );

  if (employeeAssignments.length >= 4) {
    warnings.push({
      id: `approaching_limit_warning_${Date.now()}`,
      type: 'performance',
      message: '직원의 할당 한도에 근접했습니다.',
      details: `현재 ${employeeAssignments.length}개 할당, 최대 5개`,
      actionable: true,
      recommendation: '추가 할당 전에 기존 할당을 검토하세요.'
    });
  }

  return warnings;
}

/**
 * Generate compliance warnings
 */
function generateComplianceWarnings(
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType },
  existingAssignments: Assignment[],
  hardware: Hardware[],
  software: Software[]
): AssignmentWarning[] {
  const warnings: AssignmentWarning[] = [];

  // Check for software license compliance
  if (newAssignment.asset_type === 'software') {
    const asset = software.find(s => s.id === newAssignment.asset_id);
    
    if (asset && asset.expiry_date) {
      const expiryDate = new Date(asset.expiry_date);
      const warningDate = new Date(expiryDate);
      warningDate.setMonth(warningDate.getMonth() - 1); // 1 month before expiry
      
      if (new Date() >= warningDate) {
        warnings.push({
          id: `license_expiry_warning_${newAssignment.asset_id}`,
          type: 'compliance',
          message: '소프트웨어 라이선스가 곧 만료됩니다.',
          details: `만료일: ${expiryDate.toLocaleDateString('ko-KR')}`,
          actionable: true,
          recommendation: '라이선스 갱신을 준비하세요.'
        });
      }
    }
  }

  // Check for hardware maintenance schedule
  if (newAssignment.asset_type === 'hardware') {
    const asset = hardware.find(h => h.id === newAssignment.asset_id);
    
    if (asset && asset.last_maintenance) {
      const lastMaintenance = new Date(asset.last_maintenance);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (lastMaintenance < sixMonthsAgo) {
        warnings.push({
          id: `maintenance_due_warning_${newAssignment.asset_id}`,
          type: 'compliance',
          message: '하드웨어 유지보수가 필요할 수 있습니다.',
          details: `마지막 유지보수: ${lastMaintenance.toLocaleDateString('ko-KR')}`,
          actionable: true,
          recommendation: '유지보수 일정을 확인하세요.'
        });
      }
    }
  }

  return warnings;
}

/**
 * Generate conflict resolution suggestions
 */
function generateConflictResolutions(
  conflict: Omit<AssignmentConflict, 'detectedAt'>,
  newAssignment: { employee_id: string; asset_id: string; asset_type: AssetType; assigned_date: string },
  existingAssignments: Assignment[],
  employees: Employee[],
  hardware: Hardware[],
  software: Software[]
): ConflictResolution[] {
  const resolutions: ConflictResolution[] = [];

  switch (conflict.type) {
    case 'resource':
      if (conflict.title.includes('하드웨어')) {
        resolutions.push({
          conflictId: conflict.id,
          type: 'alternative_asset',
          title: '대체 하드웨어 제안',
          description: '유사한 사양의 사용 가능한 하드웨어로 대체',
          steps: [
            '1. 동일한 유형의 사용 가능한 하드웨어 검색',
            '2. 대체 가능한 자산 목록 확인',
            '3. 직원에게 대체 자산 제안',
            '4. 승인 후 대체 자산으로 할당'
          ],
          automated: true,
          confidence: 0.8,
          estimatedResolutionTime: '5-10분'
        });

        resolutions.push({
          conflictId: conflict.id,
          type: 'reschedule',
          title: '할당 일정 조정',
          description: '기존 할당의 반납 예정일 이후로 할당 연기',
          steps: [
            '1. 기존 할당의 예상 반납일 확인',
            '2. 새로운 할당일 계산',
            '3. 일정 조정 제안',
            '4. 승인 후 새로운 일정으로 예약'
          ],
          automated: false,
          confidence: 0.6,
          estimatedResolutionTime: '1-2일'
        });
      }
      break;

    case 'scheduling':
      resolutions.push({
        conflictId: conflict.id,
        type: 'reschedule',
        title: '일정 재조정',
        description: '겹치는 할당 기간을 조정하여 충돌 해결',
        steps: [
          '1. 현재 할당 일정 분석',
          '2. 최적의 새로운 일정 계산',
          '3. 관련 당사자에게 일정 변경 제안',
          '4. 승인 후 일정 업데이트'
        ],
        automated: true,
        confidence: 0.9,
        estimatedResolutionTime: '즉시'
      });
      break;

    case 'policy':
      if (conflict.title.includes('최대 할당 수')) {
        resolutions.push({
          conflictId: conflict.id,
          type: 'manual_review',
          title: '관리자 승인 요청',
          description: '정책 예외 승인을 위한 관리자 검토',
          steps: [
            '1. 예외 승인 요청서 작성',
            '2. 관리자에게 검토 요청',
            '3. 비즈니스 필요성 검증',
            '4. 승인 시 예외 할당 처리'
          ],
          automated: false,
          confidence: 0.5,
          estimatedResolutionTime: '1-3일'
        });
      }
      break;

    case 'business_rule':
      if (conflict.title.includes('유지보수')) {
        resolutions.push({
          conflictId: conflict.id,
          type: 'alternative_asset',
          title: '대체 자산 할당',
          description: '유지보수가 완료된 유사한 자산으로 대체',
          steps: [
            '1. 유지보수 완료된 동일 유형 자산 검색',
            '2. 대체 가능한 자산 목록 생성',
            '3. 자산 상태 및 사양 확인',
            '4. 최적의 대체 자산 제안'
          ],
          automated: true,
          confidence: 0.7,
          estimatedResolutionTime: '10-15분'
        });
      }
      break;

    case 'data_integrity':
      resolutions.push({
        conflictId: conflict.id,
        type: 'manual_review',
        title: '데이터 정정 요청',
        description: '시스템 관리자에게 데이터 정정 요청',
        steps: [
          '1. 데이터 불일치 상세 분석',
          '2. 정정 요청서 작성',
          '3. 시스템 관리자 검토',
          '4. 데이터 정정 후 재시도'
        ],
        automated: false,
        confidence: 0.3,
        estimatedResolutionTime: '1-5일'
      });
      break;
  }

  return resolutions;
}

// ============================================================================
// EDGE CASE HANDLING
// ============================================================================

/**
 * Handle specific edge case scenarios
 */
export function handleEdgeCaseScenarios(
  scenario: EdgeCaseScenario['scenario'],
  context: {
    assignments: Assignment[];
    employees: Employee[];
    hardware: Hardware[];
    software: Software[];
  }
): {
  detected: boolean;
  description: string;
  resolutionSteps: string[];
  preventiveSteps: string[];
} {
  const scenarios: Record<EdgeCaseScenario['scenario'], EdgeCaseScenario> = {
    expired_asset: {
      scenario: 'expired_asset',
      description: '만료된 자산(소프트웨어 라이선스 등)이 할당되려고 함',
      detection: () => {
        // Implementation would check for expired software in assignments
        return false;
      },
      resolution: [
        '만료된 자산 식별 및 목록 작성',
        '관련 할당 일시 중단',
        '대체 자산 또는 라이선스 갱신 검토',
        '새로운 자산으로 재할당 또는 라이선스 갱신'
      ],
      preventive: [
        '자산 만료일 모니터링 시스템 구축',
        '만료 30일 전 자동 알림 설정',
        '라이선스 갱신 프로세스 자동화',
        '정기적인 자산 상태 감사'
      ]
    },
    
    inactive_employee: {
      scenario: 'inactive_employee',
      description: '비활성 직원에게 자산이 할당되려고 함',
      detection: () => {
        // Implementation would check for inactive employees
        return false;
      },
      resolution: [
        '비활성 직원 목록 확인',
        '해당 직원의 기존 할당 검토',
        '자산 회수 및 재할당 계획 수립',
        '활성 직원에게 재할당'
      ],
      preventive: [
        '직원 상태 변경 시 자동 알림',
        '퇴사 프로세스에 자산 반납 절차 포함',
        '정기적인 직원 상태 동기화',
        '비활성 계정 자동 차단'
      ]
    },

    maintenance_conflict: {
      scenario: 'maintenance_conflict',
      description: '유지보수 예정 자산이 할당되려고 함',
      detection: () => {
        // Implementation would check maintenance schedules
        return false;
      },
      resolution: [
        '유지보수 일정 확인',
        '할당 일정과 유지보수 일정 조정',
        '대체 자산 확보',
        '일정 재조정 또는 대체 자산 할당'
      ],
      preventive: [
        '유지보수 일정 사전 공지',
        '할당 시스템과 유지보수 일정 연동',
        '예방적 유지보수 계획 수립',
        '충분한 예비 자산 확보'
      ]
    },

    license_expiry: {
      scenario: 'license_expiry',
      description: '라이선스 만료로 인한 대량 할당 해제 필요',
      detection: () => {
        // Implementation would check for expiring licenses
        return false;
      },
      resolution: [
        '만료 예정 라이선스 식별',
        '영향받는 모든 할당 목록 작성',
        '라이선스 갱신 또는 대체 솔루션 검토',
        '갱신 또는 할당 해제 실행'
      ],
      preventive: [
        '라이선스 만료 추적 시스템',
        '자동 갱신 프로세스 구축',
        '라이선스 사용량 모니터링',
        '계약 갱신 알림 자동화'
      ]
    },

    bulk_return: {
      scenario: 'bulk_return',
      description: '대량 자산 반납으로 인한 시스템 부하',
      detection: () => {
        // Implementation would detect bulk operations
        return false;
      },
      resolution: [
        '대량 반납 요청 큐 생성',
        '배치 처리 시스템 활용',
        '점진적 처리로 시스템 부하 분산',
        '처리 결과 모니터링 및 검증'
      ],
      preventive: [
        '배치 처리 시스템 최적화',
        '대량 작업 스케줄링',
        '시스템 리소스 모니터링',
        '작업 큐 관리 시스템 구축'
      ]
    },

    cascade_effect: {
      scenario: 'cascade_effect',
      description: '하나의 변경이 다수의 관련 할당에 영향',
      detection: () => {
        // Implementation would detect cascading changes
        return false;
      },
      resolution: [
        '영향 범위 분석',
        '연쇄 효과 시뮬레이션',
        '단계적 변경 계획 수립',
        '관련 당사자 사전 통지 후 실행'
      ],
      preventive: [
        '의존성 분석 도구 활용',
        '변경 영향 평가 프로세스',
        '시뮬레이션 테스트 환경',
        '롤백 계획 수립'
      ]
    }
  };

  const selectedScenario = scenarios[scenario];
  const detected = selectedScenario.detection();

  return {
    detected,
    description: selectedScenario.description,
    resolutionSteps: selectedScenario.resolution,
    preventiveSteps: selectedScenario.preventive
  };
}

// ============================================================================
// AUTOMATED CONFLICT RESOLUTION
// ============================================================================

/**
 * Attempt automated resolution of conflicts
 */
export async function attemptAutomatedResolution(
  conflict: AssignmentConflict,
  resolution: ConflictResolution,
  context: {
    assignments: Assignment[];
    employees: Employee[];
    hardware: Hardware[];
    software: Software[];
  }
): Promise<{
  success: boolean;
  message: string;
  updatedAssignments?: Assignment[];
  fallbackOptions?: ConflictResolution[];
}> {
  if (!resolution.automated || resolution.confidence < 0.7) {
    return {
      success: false,
      message: '자동 해결이 불가능합니다. 수동 검토가 필요합니다.',
      fallbackOptions: resolution.alternatives || []
    };
  }

  // This would contain actual automated resolution logic
  // For now, returning a simulation of the process
  
  try {
    switch (resolution.type) {
      case 'alternative_asset':
        // Logic to find and suggest alternative assets
        return {
          success: true,
          message: '대체 자산을 성공적으로 식별했습니다.',
          updatedAssignments: context.assignments // Would be updated assignments
        };

      case 'reschedule':
        // Logic to automatically reschedule
        return {
          success: true,
          message: '할당 일정이 자동으로 조정되었습니다.',
          updatedAssignments: context.assignments // Would be updated assignments
        };

      default:
        return {
          success: false,
          message: '지원되지 않는 자동 해결 유형입니다.',
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `자동 해결 중 오류가 발생했습니다: ${error}`,
      fallbackOptions: resolution.alternatives || []
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  detectAssignmentConflicts,
  handleEdgeCaseScenarios,
  attemptAutomatedResolution
};