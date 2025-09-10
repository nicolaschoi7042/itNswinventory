/**
 * Assignment Export Utilities
 * Comprehensive Excel export functionality for assignment data
 */

import * as XLSX from 'xlsx';
import { AssignmentWithDetails, AssignmentFilters } from '@/types/assignment';
import { formatDate } from './assignment.utils';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ExportOptions {
  includeEmployeeDetails?: boolean;
  includeAssetDetails?: boolean;
  includeHistory?: boolean;
  includeStatistics?: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
  format?: 'xlsx' | 'csv';
  fileName?: string;
}

export interface ExportData {
  assignments: AssignmentWithDetails[];
  summary: AssignmentExportSummary;
  filters?: AssignmentFilters;
  exportDate: string;
  exportedBy: string;
}

export interface AssignmentExportSummary {
  totalAssignments: number;
  activeAssignments: number;
  returnedAssignments: number;
  overdueAssignments: number;
  byAssetType: {
    hardware: number;
    software: number;
  };
  byStatus: Record<string, number>;
  byDepartment: Record<string, number>;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export assignments to Excel format
 */
export const exportAssignmentsToExcel = async (
  assignments: AssignmentWithDetails[],
  options: ExportOptions = {}
): Promise<void> => {
  const {
    includeEmployeeDetails = true,
    includeAssetDetails = true,
    includeHistory = true,
    includeStatistics = true,
    format = 'xlsx',
    fileName = `assignments_export_${new Date().toISOString().split('T')[0]}`,
  } = options;

  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Main assignments sheet
    const assignmentData = prepareAssignmentData(assignments, {
      includeEmployeeDetails,
      includeAssetDetails,
    });
    const assignmentSheet = XLSX.utils.json_to_sheet(assignmentData);

    // Style the header row
    const assignmentRange = XLSX.utils.decode_range(
      assignmentSheet['!ref'] || 'A1'
    );
    for (let col = assignmentRange.s.c; col <= assignmentRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!assignmentSheet[cellRef]) continue;
      assignmentSheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center' },
      };
    }

    // Auto-size columns
    const colWidths =
      assignmentData.length > 0
        ? Object.keys(assignmentData[0]).map(key => ({
            wch: Math.max(key.length, 15),
          }))
        : [];
    assignmentSheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, assignmentSheet, '할당 목록');

    // Summary statistics sheet
    if (includeStatistics) {
      const summary = generateAssignmentSummary(assignments);
      const summaryData = prepareSummaryData(summary);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, '통계 요약');
    }

    // Assignment history sheet
    if (includeHistory) {
      const historyData = prepareHistoryData(assignments);
      const historySheet = XLSX.utils.json_to_sheet(historyData);
      XLSX.utils.book_append_sheet(workbook, historySheet, '할당 이력');
    }

    // Asset utilization sheet
    const utilizationData = prepareUtilizationData(assignments);
    const utilizationSheet = XLSX.utils.json_to_sheet(utilizationData);
    XLSX.utils.book_append_sheet(workbook, utilizationSheet, '자산 활용도');

    // Employee assignment sheet
    const employeeData = prepareEmployeeAssignmentData(assignments);
    const employeeSheet = XLSX.utils.json_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, '직원별 할당');

    // Export the file
    if (format === 'xlsx') {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      // For CSV, export only the main assignments sheet
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
    }

    console.log(`Assignments exported successfully: ${fileName}.${format}`);
  } catch (error) {
    console.error('Assignment export failed:', error);
    throw new Error(
      `Excel 내보내기에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
};

/**
 * Export filtered assignments
 */
export const exportFilteredAssignments = async (
  assignments: AssignmentWithDetails[],
  filters: AssignmentFilters,
  searchQuery: string = '',
  options: ExportOptions = {}
): Promise<void> => {
  const filteredAssignments = applyFiltersForExport(
    assignments,
    filters,
    searchQuery
  );

  const fileName = `filtered_assignments_${Object.keys(filters).join('_')}_${new Date().toISOString().split('T')[0]}`;

  await exportAssignmentsToExcel(filteredAssignments, {
    ...options,
    fileName,
  });
};

// ============================================================================
// DATA PREPARATION FUNCTIONS
// ============================================================================

/**
 * Prepare main assignment data for export
 */
const prepareAssignmentData = (
  assignments: AssignmentWithDetails[],
  options: { includeEmployeeDetails: boolean; includeAssetDetails: boolean }
): any[] => {
  return assignments.map(assignment => {
    const baseData = {
      '할당 ID': assignment.id,
      직원명: assignment.employee_name,
      자산명: assignment.asset_description,
      '자산 유형':
        assignment.asset_type === 'hardware' ? '하드웨어' : '소프트웨어',
      할당일: formatDate(assignment.assigned_date),
      반납일: assignment.return_date
        ? formatDate(assignment.return_date)
        : '미반납',
      상태: assignment.status,
      할당자: assignment.assigned_by,
      메모: assignment.notes || '',
      생성일: formatDate(assignment.created_at),
      수정일: formatDate(assignment.updated_at),
    };

    // Add employee details if requested
    if (options.includeEmployeeDetails && assignment.employee) {
      Object.assign(baseData, {
        부서: assignment.employee.department,
        직책: assignment.employee.position,
        이메일: assignment.employee.email,
      });
    }

    // Add asset details if requested
    if (options.includeAssetDetails && assignment.asset) {
      Object.assign(baseData, {
        '자산 ID': assignment.asset.id,
        제조사: assignment.asset.manufacturer || '',
        모델: assignment.asset.model || '',
        '시리얼 번호': assignment.asset.serial_number || '',
      });
    }

    return baseData;
  });
};

/**
 * Generate assignment summary statistics
 */
const generateAssignmentSummary = (
  assignments: AssignmentWithDetails[]
): AssignmentExportSummary => {
  const total = assignments.length;
  const active = assignments.filter(a => a.status === '사용중').length;
  const returned = assignments.filter(a => a.status === '반납완료').length;
  const overdue = assignments.filter(a => a.status === '연체').length;

  const byAssetType = {
    hardware: assignments.filter(a => a.asset_type === 'hardware').length,
    software: assignments.filter(a => a.asset_type === 'software').length,
  };

  const byStatus = assignments.reduce(
    (acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const byDepartment = assignments.reduce(
    (acc, assignment) => {
      const dept = assignment.employee?.department || '알 수 없음';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalAssignments: total,
    activeAssignments: active,
    returnedAssignments: returned,
    overdueAssignments: overdue,
    byAssetType,
    byStatus,
    byDepartment,
  };
};

/**
 * Prepare summary data for export
 */
const prepareSummaryData = (summary: AssignmentExportSummary): any[] => {
  return [
    { 항목: '총 할당 수', 값: summary.totalAssignments },
    { 항목: '활성 할당', 값: summary.activeAssignments },
    { 항목: '반납 완료', 값: summary.returnedAssignments },
    { 항목: '연체', 값: summary.overdueAssignments },
    { 항목: '', 값: '' }, // Separator
    { 항목: '하드웨어 할당', 값: summary.byAssetType.hardware },
    { 항목: '소프트웨어 할당', 값: summary.byAssetType.software },
    { 항목: '', 값: '' }, // Separator
    ...Object.entries(summary.byStatus).map(([status, count]) => ({
      항목: `상태: ${status}`,
      값: count,
    })),
    { 항목: '', 값: '' }, // Separator
    ...Object.entries(summary.byDepartment).map(([dept, count]) => ({
      항목: `부서: ${dept}`,
      값: count,
    })),
  ];
};

/**
 * Prepare history data for export
 */
const prepareHistoryData = (assignments: AssignmentWithDetails[]): any[] => {
  return assignments
    .filter(a => a.return_date) // Only returned assignments
    .map(assignment => ({
      '할당 ID': assignment.id,
      직원명: assignment.employee_name,
      자산명: assignment.asset_description,
      할당일: formatDate(assignment.assigned_date),
      반납일: assignment.return_date ? formatDate(assignment.return_date) : '',
      '사용 기간(일)': assignment.return_date
        ? Math.ceil(
            (new Date(assignment.return_date).getTime() -
              new Date(assignment.assigned_date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      '반납 상태': assignment.return_condition || '정상',
      평점: assignment.return_rating || 5,
      메모: assignment.notes || '',
    }));
};

/**
 * Prepare asset utilization data
 */
const prepareUtilizationData = (
  assignments: AssignmentWithDetails[]
): any[] => {
  const assetUsage = assignments.reduce(
    (acc, assignment) => {
      const key = `${assignment.asset_id}_${assignment.asset_type}`;
      if (!acc[key]) {
        acc[key] = {
          assetId: assignment.asset_id,
          assetName: assignment.asset_description,
          assetType: assignment.asset_type,
          totalAssignments: 0,
          activeAssignments: 0,
          averageUsageDays: 0,
          lastAssigned: assignment.assigned_date,
        };
      }

      acc[key].totalAssignments++;
      if (assignment.status === '사용중') {
        acc[key].activeAssignments++;
      }

      if (assignment.assigned_date > acc[key].lastAssigned) {
        acc[key].lastAssigned = assignment.assigned_date;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  return Object.values(assetUsage).map((asset: any) => ({
    '자산 ID': asset.assetId,
    자산명: asset.assetName,
    '자산 유형': asset.assetType === 'hardware' ? '하드웨어' : '소프트웨어',
    '총 할당 횟수': asset.totalAssignments,
    '현재 활성 할당': asset.activeAssignments,
    '최근 할당일': formatDate(asset.lastAssigned),
    활용도: asset.totalAssignments > 0 ? '높음' : '낮음',
  }));
};

/**
 * Prepare employee assignment data
 */
const prepareEmployeeAssignmentData = (
  assignments: AssignmentWithDetails[]
): any[] => {
  const employeeStats = assignments.reduce(
    (acc, assignment) => {
      const empId = assignment.employee_id;
      if (!acc[empId]) {
        acc[empId] = {
          name: assignment.employee_name,
          department: assignment.employee?.department || '',
          position: assignment.employee?.position || '',
          totalAssignments: 0,
          activeAssignments: 0,
          returnedAssignments: 0,
          overdueAssignments: 0,
        };
      }

      acc[empId].totalAssignments++;

      if (assignment.status === '사용중') acc[empId].activeAssignments++;
      if (assignment.status === '반납완료') acc[empId].returnedAssignments++;
      if (assignment.status === '연체') acc[empId].overdueAssignments++;

      return acc;
    },
    {} as Record<string, any>
  );

  return Object.values(employeeStats).map((emp: any) => ({
    직원명: emp.name,
    부서: emp.department,
    직책: emp.position,
    '총 할당': emp.totalAssignments,
    '현재 사용중': emp.activeAssignments,
    '반납 완료': emp.returnedAssignments,
    연체: emp.overdueAssignments,
  }));
};

/**
 * Apply filters for export
 */
const applyFiltersForExport = (
  assignments: AssignmentWithDetails[],
  filters: AssignmentFilters,
  searchQuery: string
): AssignmentWithDetails[] => {
  let filtered = [...assignments];

  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      assignment =>
        assignment.employee_name.toLowerCase().includes(query) ||
        assignment.asset_description.toLowerCase().includes(query) ||
        assignment.id.toLowerCase().includes(query)
    );
  }

  // Apply filters
  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    filtered = filtered.filter(assignment =>
      statuses.includes(assignment.status)
    );
  }

  if (filters.asset_type) {
    filtered = filtered.filter(
      assignment => assignment.asset_type === filters.asset_type
    );
  }

  if (filters.assigned_date_from) {
    filtered = filtered.filter(
      assignment => assignment.assigned_date >= filters.assigned_date_from!
    );
  }

  if (filters.assigned_date_to) {
    filtered = filtered.filter(
      assignment => assignment.assigned_date <= filters.assigned_date_to!
    );
  }

  return filtered;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  exportAssignmentsToExcel,
  exportFilteredAssignments,
  generateAssignmentSummary,
};
