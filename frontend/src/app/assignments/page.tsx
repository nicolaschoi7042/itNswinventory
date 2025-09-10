'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreIcon,
  Assignment as AssignmentIcon,
  TrendingUp as StatsIcon,
} from '@mui/icons-material';

// Import components and services
import { DataTable, Column } from '@/components/common/DataTable';
import { AssignmentTable } from '@/components/tables/AssignmentTable';
import { AssignmentSearch } from '@/components/search/AssignmentSearch';
import {
  AssignmentFilters as AssignmentFiltersComponent,
  QuickFilterBar,
} from '@/components/filters/AssignmentFilters';
import { ManagerGuard } from '@/components/guards/RoleGuards';
import { useAuth } from '@/hooks/useAuth';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentFilters,
  AssignmentStats,
  calculateAssignmentStats,
  searchAssignments,
  applyAssignmentFilters,
  sortAssignments,
} from '@/modules/assignment';

// Import enhanced dashboard component
import { AssignmentStatusDashboard } from '@/components/dashboard/AssignmentStatusDashboard';

// Import assignment modals
import { AssignmentDetailModal } from '@/components/modals/AssignmentDetailModal';
import { AssignmentFormModal } from '@/components/modals/AssignmentFormModal';
import { AssetReturnModal } from '@/components/modals/AssetReturnModal';
import { AdvancedSearchModal } from '@/components/modals/AdvancedSearchModal';

// Import filter panel
import { FilterPanel } from '@/components/panels/FilterPanel';

// Import layout
import MainLayout from '@/components/layout/MainLayout';

// Import assignment service and API client
import { AssignmentService } from '@/services/assignment.service';
import { ApiClient } from '@/lib/api-client';

// Import assignment types for prop passing
import type { Assignment } from '@/types/assignment';

// Import export utilities
import {
  exportAssignmentsToExcel,
  exportFilteredAssignments,
  ExportOptions,
} from '@/utils/assignmentExport.utils';

// Import error handling utilities
import {
  getAssignmentErrorMessage,
  getExportErrorMessage,
  formatErrorMessage,
  logError,
} from '@/utils/errorHandling.utils';

interface AssignmentPageState {
  assignments: AssignmentWithDetails[];
  employees: any[]; // Mock data for now
  hardware: any[]; // Mock data for now
  software: any[]; // Mock data for now
  loading: boolean;
  selectedAssignment: AssignmentWithDetails | null;
  showCreateModal: boolean;
  showDetailModal: boolean;
  showReturnModal: boolean;
  showAdvancedSearch: boolean;
  showFilterPanel: boolean;
  searchQuery: string;
  filters: AssignmentFilters;
  sortBy: keyof Assignment;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
  anchorEl: HTMLElement | null;
  error: string | null;
  successMessage: string | null;
}

export default function AssignmentsPage() {
  const theme = useTheme();
  const { user, hasAdminRole, hasManagerRole } = useAuth();

  // Initialize API services
  const apiClient = new ApiClient();
  const assignmentService = new AssignmentService(apiClient);

  const [state, setState] = useState<AssignmentPageState>({
    assignments: [],
    employees: [
      {
        id: 'E001',
        name: '김철수',
        department: 'IT개발팀',
        position: '시니어 개발자',
        email: 'kim@company.com',
      },
      {
        id: 'E002',
        name: '이영희',
        department: '마케팅팀',
        position: '매니저',
        email: 'lee@company.com',
      },
      {
        id: 'E003',
        name: '박민수',
        department: '디자인팀',
        position: '선임 디자이너',
        email: 'park@company.com',
      },
      {
        id: 'E004',
        name: '정수진',
        department: '마케팅팀',
        position: '주임',
        email: 'jung@company.com',
      },
      {
        id: 'E005',
        name: '최영호',
        department: '영업팀',
        position: '과장',
        email: 'choi@company.com',
      },
      {
        id: 'E006',
        name: '한미래',
        department: '영업팀',
        position: '사원',
        email: 'han@company.com',
      },
    ],
    hardware: [
      {
        id: 'HW001',
        name: 'Dell OptiPlex 7090',
        type: 'Desktop',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        status: 'available',
      },
      {
        id: 'HW002',
        name: 'MacBook Pro 16"',
        type: 'Laptop',
        manufacturer: 'Apple',
        model: 'MacBook Pro 16" M2',
        status: 'available',
      },
      {
        id: 'HW003',
        name: 'Samsung Monitor 27"',
        type: 'Monitor',
        manufacturer: 'Samsung',
        model: 'S27E450D',
        status: 'available',
      },
      {
        id: 'HW004',
        name: 'iPhone 15 Pro',
        type: 'Mobile',
        manufacturer: 'Apple',
        model: 'iPhone 15 Pro 256GB',
        status: 'available',
      },
      {
        id: 'HW005',
        name: 'Logitech Keyboard',
        type: 'Peripheral',
        manufacturer: 'Logitech',
        model: 'MX Keys',
        status: 'available',
      },
    ],
    software: [
      {
        id: 'SW001',
        name: 'Microsoft Office 365',
        type: 'Office Suite',
        manufacturer: 'Microsoft',
        version: 'Office 365 Business Premium',
        status: 'available',
      },
      {
        id: 'SW002',
        name: 'Adobe Creative Suite',
        type: 'Design Software',
        manufacturer: 'Adobe',
        version: 'Creative Cloud 2024',
        status: 'available',
      },
      {
        id: 'SW003',
        name: 'Visual Studio Code',
        type: 'Development Tool',
        manufacturer: 'Microsoft',
        version: 'Latest',
        status: 'available',
      },
      {
        id: 'SW004',
        name: 'Slack',
        type: 'Communication',
        manufacturer: 'Slack Technologies',
        version: 'Business+',
        status: 'available',
      },
    ],
    loading: true,
    selectedAssignment: null,
    showCreateModal: false,
    showDetailModal: false,
    showReturnModal: false,
    showAdvancedSearch: false,
    showFilterPanel: false,
    searchQuery: '',
    filters: {},
    sortBy: 'assigned_date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20,
    anchorEl: null,
    error: null,
    successMessage: null,
  });

  // Load assignments data
  const loadAssignments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // This will need to be implemented in the assignment service
      // For now, we'll use mock data with varied statuses for better demonstration
      const mockAssignments: AssignmentWithDetails[] = [
        {
          id: 'AS001',
          employee_id: 'E001',
          employee_name: '김철수',
          asset_id: 'HW001',
          asset_type: 'hardware',
          asset_description: 'Dell OptiPlex 7090',
          assigned_date: '2024-01-15',
          status: '사용중',
          notes: '개발용 데스크톱',
          assigned_by: 'admin',
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-15T09:00:00Z',
          employee: {
            id: 'E001',
            name: '김철수',
            department: 'IT개발팀',
            position: '시니어 개발자',
            email: 'kim@company.com',
          },
          asset: {
            id: 'HW001',
            name: 'OptiPlex 7090',
            type: 'Desktop',
            manufacturer: 'Dell',
            model: 'OptiPlex 7090',
            serial_number: 'DL789012',
            specifications: {
              cpu: 'Intel Core i7-11700',
              memory: '16GB DDR4',
              storage: '512GB SSD',
              os: 'Windows 11 Pro',
            },
          },
        },
        {
          id: 'AS002',
          employee_id: 'E002',
          employee_name: '이영희',
          asset_id: 'SW001',
          asset_type: 'software',
          asset_description: 'Microsoft Office 365',
          assigned_date: '2024-02-01',
          status: '사용중',
          notes: '문서 작업용',
          assigned_by: 'admin',
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z',
          employee: {
            id: 'E002',
            name: '이영희',
            department: '마케팅팀',
            position: '매니저',
            email: 'lee@company.com',
          },
          asset: {
            id: 'SW001',
            name: 'Microsoft Office 365',
            type: 'Office Suite',
            manufacturer: 'Microsoft',
            specifications: {
              version: 'Office 365 Business Premium',
              os: 'Windows/macOS/Web',
            },
          },
        },
        {
          id: 'AS003',
          employee_id: 'E003',
          employee_name: '박민수',
          asset_id: 'HW002',
          asset_type: 'hardware',
          asset_description: 'MacBook Pro 16"',
          assigned_date: '2023-11-01',
          status: '연체',
          notes: '반납 예정일 초과',
          assigned_by: 'admin',
          created_at: '2023-11-01T09:00:00Z',
          updated_at: '2024-01-01T09:00:00Z',
          employee: {
            id: 'E003',
            name: '박민수',
            department: '디자인팀',
            position: '선임 디자이너',
            email: 'park@company.com',
          },
          asset: {
            id: 'HW002',
            name: 'MacBook Pro 16"',
            type: 'Laptop',
            manufacturer: 'Apple',
            model: 'MacBook Pro 16" M2',
            serial_number: 'AP123456',
          },
        },
        {
          id: 'AS004',
          employee_id: 'E004',
          employee_name: '정수진',
          asset_id: 'SW002',
          asset_type: 'software',
          asset_description: 'Adobe Creative Suite',
          assigned_date: '2024-01-20',
          return_date: '2024-08-15',
          status: '반납완료',
          notes: '프로젝트 완료로 반납',
          assigned_by: 'admin',
          created_at: '2024-01-20T09:00:00Z',
          updated_at: '2024-08-15T17:00:00Z',
          employee: {
            id: 'E004',
            name: '정수진',
            department: '마케팅팀',
            position: '주임',
            email: 'jung@company.com',
          },
          asset: {
            id: 'SW002',
            name: 'Adobe Creative Suite',
            type: 'Design Software',
            manufacturer: 'Adobe',
          },
        },
        {
          id: 'AS005',
          employee_id: 'E005',
          employee_name: '최영호',
          asset_id: 'HW003',
          asset_type: 'hardware',
          asset_description: 'Samsung Monitor 27"',
          assigned_date: '2024-08-01',
          status: '대기중',
          notes: '설치 대기',
          assigned_by: 'admin',
          created_at: '2024-08-01T09:00:00Z',
          updated_at: '2024-08-01T09:00:00Z',
          employee: {
            id: 'E005',
            name: '최영호',
            department: '영업팀',
            position: '과장',
            email: 'choi@company.com',
          },
          asset: {
            id: 'HW003',
            name: 'Samsung Monitor 27"',
            type: 'Monitor',
            manufacturer: 'Samsung',
            model: 'S27E450D',
            serial_number: 'SM789012',
          },
        },
        {
          id: 'AS006',
          employee_id: 'E006',
          employee_name: '한미래',
          asset_id: 'HW004',
          asset_type: 'hardware',
          asset_description: 'iPhone 15 Pro',
          assigned_date: '2023-10-15',
          status: '분실',
          notes: '분실 신고 접수',
          assigned_by: 'admin',
          created_at: '2023-10-15T09:00:00Z',
          updated_at: '2024-07-01T09:00:00Z',
          employee: {
            id: 'E006',
            name: '한미래',
            department: '영업팀',
            position: '사원',
            email: 'han@company.com',
          },
          asset: {
            id: 'HW004',
            name: 'iPhone 15 Pro',
            type: 'Mobile',
            manufacturer: 'Apple',
            model: 'iPhone 15 Pro 256GB',
            serial_number: 'IP456789',
          },
        },
      ];

      setState(prev => ({
        ...prev,
        assignments: mockAssignments,
        loading: false,
      }));
    } catch (error: any) {
      const errorInfo = getAssignmentErrorMessage(error, 'load');
      logError('Assignment Data Loading', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Filter and search assignments
  const filteredAssignments = useMemo(() => {
    let result = [...state.assignments];

    // Apply text search
    if (state.searchQuery.trim()) {
      result = searchAssignments(result, state.searchQuery);
    }

    // Apply filters
    result = applyAssignmentFilters(result, state.filters);

    // Apply sorting
    result = sortAssignments(result, state.sortBy, state.sortOrder);

    return result;
  }, [
    state.assignments,
    state.searchQuery,
    state.filters,
    state.sortBy,
    state.sortOrder,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateAssignmentStats(state.assignments);
  }, [state.assignments]);

  // Event handlers
  const handleCreateAssignment = () => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  };

  const handleViewAssignment = (assignment: AssignmentWithDetails) => {
    setState(prev => ({
      ...prev,
      selectedAssignment: assignment,
      showDetailModal: true,
    }));
  };

  const handleEditAssignment = (assignment: AssignmentWithDetails) => {
    setState(prev => ({
      ...prev,
      selectedAssignment: assignment,
      showCreateModal: true,
    }));
  };

  const handleDeleteAssignment = async (assignment: AssignmentWithDetails) => {
    // Admin-only permission check
    if (!hasAdminRole()) {
      setState(prev => ({
        ...prev,
        error: '할당 삭제는 관리자만 가능합니다.',
      }));
      return;
    }

    // Confirmation dialog with detailed warning
    const confirmMessage =
      `할당 "${assignment.id}"을 정말 삭제하시겠습니까?\n\n` +
      `직원: ${assignment.employee_name}\n` +
      `자산: ${assignment.asset_description}\n` +
      `상태: ${assignment.status}\n\n` +
      `이 작업은 되돌릴 수 없습니다.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('Deleting assignment via API:', assignment.id);

      // Call API to delete assignment
      const response = await assignmentService.delete(assignment.id);

      if (!response.success) {
        throw new Error(response.error || '할당 삭제 API 호출에 실패했습니다.');
      }

      // Update local state by removing the assignment
      const updatedAssignments = state.assignments.filter(
        assign => assign.id !== assignment.id
      );

      // Free up the asset if assignment was active
      if (assignment.status === '사용중') {
        if (assignment.asset_type === 'hardware') {
          setState(prev => ({
            ...prev,
            hardware: prev.hardware.map(hw =>
              hw.id === assignment.asset_id
                ? {
                    ...hw,
                    status: 'available',
                    updated_at: new Date().toISOString(),
                  }
                : hw
            ),
          }));
        } else {
          setState(prev => ({
            ...prev,
            software: prev.software.map(sw =>
              sw.id === assignment.asset_id
                ? {
                    ...sw,
                    status: 'available',
                    updated_at: new Date().toISOString(),
                  }
                : sw
            ),
          }));
        }

        // Decrease employee's active assignment count
        setState(prev => ({
          ...prev,
          employees: prev.employees.map(emp =>
            emp.id === assignment.employee_id
              ? {
                  ...emp,
                  active_assignments: Math.max(
                    (emp.active_assignments || 1) - 1,
                    0
                  ),
                  updated_at: new Date().toISOString(),
                }
              : emp
          ),
        }));
      }

      setState(prev => ({
        ...prev,
        assignments: updatedAssignments,
        loading: false,
        successMessage: `할당 "${assignment.id}"이 성공적으로 삭제되었습니다.`,
      }));

      console.log('Assignment deleted successfully:', assignment.id);
    } catch (error: any) {
      const errorInfo = getAssignmentErrorMessage(error, 'delete');
      logError('Assignment Deletion', error, { assignmentId: assignment.id });

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  };

  const handleReturnAsset = (assignment: AssignmentWithDetails) => {
    setState(prev => ({
      ...prev,
      selectedAssignment: assignment,
      showReturnModal: true,
    }));
  };

  const handleAssetReturn = async (returnData: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('Processing asset return via API:', returnData);

      if (!state.selectedAssignment) {
        throw new Error('선택된 할당이 없습니다.');
      }

      const assignment = state.selectedAssignment;
      const returnDate = new Date().toISOString().split('T')[0];

      // Prepare return data for API
      const apiReturnData = {
        notes: returnData.notes,
        condition: returnData.condition || 'good',
        rating: returnData.rating || 5,
        issues: returnData.issues || [],
        return_date: returnDate,
      };

      // Call API to return asset
      console.log(
        'Calling AssignmentService.returnAsset:',
        assignment.id,
        apiReturnData
      );
      const response = await assignmentService.returnAsset(
        assignment.id,
        apiReturnData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || '자산 반납 API 호출에 실패했습니다.');
      }

      // Enrich API response with employee and asset details
      const employee = state.employees.find(
        e => e.id === assignment.employee_id
      );
      const asset =
        assignment.asset_type === 'hardware'
          ? state.hardware.find(h => h.id === assignment.asset_id)
          : state.software.find(s => s.id === assignment.asset_id);

      const enrichedAssignment: AssignmentWithDetails = {
        ...response.data,
        employee_name: employee?.name || assignment.employee_name,
        asset_description: asset?.name || assignment.asset_description,
        employee: employee || assignment.employee,
        asset: asset || assignment.asset,
        return_condition: returnData.condition || 'good',
        return_issues: returnData.issues || [],
        return_rating: returnData.rating || 5,
        updated_at: new Date().toISOString(),
      };

      // Update assignment status to returned
      const updatedAssignments = state.assignments.map(assign =>
        assign.id === assignment.id ? enrichedAssignment : assign
      );

      // Update asset status to available
      const updatedHardware = state.hardware.map(hw =>
        hw.id === assignment.asset_id && assignment.asset_type === 'hardware'
          ? {
              ...hw,
              status:
                returnData.condition === 'damaged'
                  ? 'maintenance'
                  : 'available',
              last_returned: returnDate,
              condition: returnData.condition || 'good',
              updated_at: new Date().toISOString(),
            }
          : hw
      );

      const updatedSoftware = state.software.map(sw =>
        sw.id === assignment.asset_id && assignment.asset_type === 'software'
          ? {
              ...sw,
              status: 'available',
              last_returned: returnDate,
              updated_at: new Date().toISOString(),
            }
          : sw
      );

      // Update employee status (remove assignment count, etc.)
      const updatedEmployees = state.employees.map(emp =>
        emp.id === assignment.employee_id
          ? {
              ...emp,
              active_assignments: (emp.active_assignments || 1) - 1,
              last_return_date: returnDate,
              updated_at: new Date().toISOString(),
            }
          : emp
      );

      // Log the return activity
      const returnActivity = {
        id: `ACT${Date.now()}`,
        type: 'asset_return',
        description: `자산 반납 완료: ${assignment.asset_description} → ${assignment.employee_name}`,
        user: 'current_user', // This should be actual user
        timestamp: new Date().toISOString(),
        details: {
          assignment_id: assignment.id,
          asset_id: assignment.asset_id,
          asset_type: assignment.asset_type,
          employee_id: assignment.employee_id,
          condition: returnData.condition,
          rating: returnData.rating,
          issues: returnData.issues,
          notes: returnData.notes,
        },
      };

      setState(prev => ({
        ...prev,
        assignments: updatedAssignments,
        hardware: updatedHardware,
        software: updatedSoftware,
        employees: updatedEmployees,
        loading: false,
        showReturnModal: false,
        selectedAssignment: null,
        successMessage: `자산 "${assignment.asset_description}"이(가) 성공적으로 반납되었습니다.${
          returnData.condition === 'damaged'
            ? ' 자산이 정비 상태로 변경되었습니다.'
            : ''
        }`,
      }));

      console.log('Asset return completed successfully via API:', {
        assignment: assignment.id,
        asset: assignment.asset_id,
        employee: assignment.employee_id,
        condition: returnData.condition,
        rating: returnData.rating,
        response: response.data,
      });
    } catch (error: any) {
      const errorInfo = getAssignmentErrorMessage(error, 'return');
      logError('Asset Return', error, {
        assignmentId: assignment.id,
        returnData,
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  };

  const handleSortChange = (
    sortBy: keyof Assignment,
    sortOrder: 'asc' | 'desc'
  ) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const handleExportExcel = async (
    exportType: 'all' | 'filtered' = 'filtered'
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, anchorEl: null }));

      const exportOptions: ExportOptions = {
        includeEmployeeDetails: true,
        includeAssetDetails: true,
        includeHistory: true,
        includeStatistics: true,
        format: 'xlsx',
      };

      if (exportType === 'all') {
        // Export all assignments
        await exportAssignmentsToExcel(state.assignments, {
          ...exportOptions,
          fileName: `all_assignments_${new Date().toISOString().split('T')[0]}`,
        });
      } else {
        // Export filtered assignments
        await exportFilteredAssignments(
          state.assignments,
          state.filters,
          state.searchQuery,
          {
            ...exportOptions,
            fileName: `filtered_assignments_${new Date().toISOString().split('T')[0]}`,
          }
        );
      }

      setState(prev => ({
        ...prev,
        loading: false,
        successMessage: `Excel 파일이 성공적으로 다운로드되었습니다. (총 ${
          exportType === 'all'
            ? state.assignments.length
            : filteredAssignments.length
        }개 항목)`,
      }));
    } catch (error: any) {
      const errorInfo = getExportErrorMessage(error, 'excel');
      logError('Excel Export', error, {
        exportType,
        itemCount:
          exportType === 'all'
            ? state.assignments.length
            : filteredAssignments.length,
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  };

  const handleExportCSV = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, anchorEl: null }));

      await exportFilteredAssignments(
        state.assignments,
        state.filters,
        state.searchQuery,
        {
          includeEmployeeDetails: true,
          includeAssetDetails: true,
          includeHistory: false,
          includeStatistics: false,
          format: 'csv',
          fileName: `assignments_${new Date().toISOString().split('T')[0]}`,
        }
      );

      setState(prev => ({
        ...prev,
        loading: false,
        successMessage: 'CSV 파일이 성공적으로 다운로드되었습니다.',
      }));
    } catch (error: any) {
      const errorInfo = getExportErrorMessage(error, 'csv');
      logError('CSV Export', error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  };

  const handleCloseError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const handleCloseSuccess = () => {
    setState(prev => ({ ...prev, successMessage: null }));
  };

  // Handle assignment creation/update
  const handleSubmitAssignment = async (
    data: CreateAssignmentData | UpdateAssignmentData
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      if (state.selectedAssignment) {
        // Update existing assignment via API
        console.log(
          'Updating assignment via API:',
          state.selectedAssignment.id,
          data
        );

        const response = await AssignmentService.update(
          state.selectedAssignment.id,
          data
        );

        if (response.success && response.data) {
          // Enrich the updated assignment with employee and asset details
          const employee = state.employees.find(
            e => e.id === response.data.employee_id
          );
          const asset =
            response.data.asset_type === 'hardware'
              ? state.hardware.find(h => h.id === response.data.asset_id)
              : state.software.find(s => s.id === response.data.asset_id);

          const enrichedAssignment: AssignmentWithDetails = {
            ...response.data,
            employee_name:
              employee?.name || state.selectedAssignment?.employee_name || '',
            asset_description:
              asset?.name || state.selectedAssignment?.asset_description || '',
            employee: employee || state.selectedAssignment?.employee,
            asset: asset || state.selectedAssignment?.asset,
            updated_at: new Date().toISOString(),
          };

          // Update local state with enriched API response
          const updatedAssignments = state.assignments.map(assignment =>
            assignment.id === state.selectedAssignment?.id
              ? enrichedAssignment
              : assignment
          );

          setState(prev => ({
            ...prev,
            assignments: updatedAssignments,
            loading: false,
            successMessage: '할당이 성공적으로 수정되었습니다.',
            showCreateModal: false,
            selectedAssignment: null,
          }));

          // Update asset and employee status if they changed
          const oldAssignment = state.selectedAssignment;
          if (oldAssignment) {
            // If asset changed, update both old and new asset statuses
            if (
              oldAssignment.asset_id !== response.data.asset_id ||
              oldAssignment.asset_type !== response.data.asset_type
            ) {
              // Free up old asset
              if (oldAssignment.asset_type === 'hardware') {
                setState(prev => ({
                  ...prev,
                  hardware: prev.hardware.map(hw =>
                    hw.id === oldAssignment.asset_id
                      ? {
                          ...hw,
                          status: 'available',
                          updated_at: new Date().toISOString(),
                        }
                      : hw
                  ),
                }));
              } else {
                setState(prev => ({
                  ...prev,
                  software: prev.software.map(sw =>
                    sw.id === oldAssignment.asset_id
                      ? {
                          ...sw,
                          status: 'available',
                          updated_at: new Date().toISOString(),
                        }
                      : sw
                  ),
                }));
              }

              // Assign new asset
              if (response.data.asset_type === 'hardware') {
                setState(prev => ({
                  ...prev,
                  hardware: prev.hardware.map(hw =>
                    hw.id === response.data.asset_id
                      ? {
                          ...hw,
                          status: 'assigned',
                          updated_at: new Date().toISOString(),
                        }
                      : hw
                  ),
                }));
              } else {
                setState(prev => ({
                  ...prev,
                  software: prev.software.map(sw =>
                    sw.id === response.data.asset_id
                      ? {
                          ...sw,
                          status: 'assigned',
                          updated_at: new Date().toISOString(),
                        }
                      : sw
                  ),
                }));
              }
            }

            // If employee changed, update assignment counts
            if (oldAssignment.employee_id !== response.data.employee_id) {
              setState(prev => ({
                ...prev,
                employees: prev.employees.map(emp => {
                  if (emp.id === oldAssignment.employee_id) {
                    // Decrease old employee's count
                    return {
                      ...emp,
                      active_assignments: Math.max(
                        (emp.active_assignments || 1) - 1,
                        0
                      ),
                      updated_at: new Date().toISOString(),
                    };
                  } else if (emp.id === response.data.employee_id) {
                    // Increase new employee's count
                    return {
                      ...emp,
                      active_assignments: (emp.active_assignments || 0) + 1,
                      updated_at: new Date().toISOString(),
                    };
                  }
                  return emp;
                }),
              }));
            }
          }
        } else {
          throw new Error(response.error || '할당 수정에 실패했습니다.');
        }
      } else {
        // Create new assignment via API
        console.log('Creating new assignment via API:', data);

        const response = await AssignmentService.create(data);

        if (response.success && response.data) {
          // Enrich response data with employee and asset details
          const employee = state.employees.find(e => e.id === data.employee_id);
          const asset =
            data.asset_type === 'hardware'
              ? state.hardware.find(h => h.id === data.asset_id)
              : state.software.find(s => s.id === data.asset_id);

          const enrichedAssignment: AssignmentWithDetails = {
            ...response.data,
            employee_name: employee?.name || '',
            asset_description: asset?.name || '',
            employee: employee,
            asset: asset,
          };

          setState(prev => ({
            ...prev,
            assignments: [enrichedAssignment, ...prev.assignments],
            loading: false,
            successMessage: '새 할당이 성공적으로 생성되었습니다.',
            showCreateModal: false,
          }));

          // Update asset status to assigned
          if (data.asset_type === 'hardware') {
            setState(prev => ({
              ...prev,
              hardware: prev.hardware.map(hw =>
                hw.id === data.asset_id
                  ? {
                      ...hw,
                      status: 'assigned',
                      updated_at: new Date().toISOString(),
                    }
                  : hw
              ),
            }));
          } else {
            setState(prev => ({
              ...prev,
              software: prev.software.map(sw =>
                sw.id === data.asset_id
                  ? {
                      ...sw,
                      status: 'assigned',
                      updated_at: new Date().toISOString(),
                    }
                  : sw
              ),
            }));
          }

          // Update employee assignment count
          setState(prev => ({
            ...prev,
            employees: prev.employees.map(emp =>
              emp.id === data.employee_id
                ? {
                    ...emp,
                    active_assignments: (emp.active_assignments || 0) + 1,
                    updated_at: new Date().toISOString(),
                  }
                : emp
            ),
          }));
        } else {
          throw new Error(response.error || '할당 생성에 실패했습니다.');
        }
      }
    } catch (error: any) {
      const operation = state.selectedAssignment ? 'update' : 'create';
      const errorInfo = getAssignmentErrorMessage(error, operation);
      logError('Assignment Submission', error, {
        operation,
        assignmentData: data,
        assignmentId: state.selectedAssignment?.id,
      });

      setState(prev => ({
        ...prev,
        loading: false,
        error: formatErrorMessage(errorInfo),
      }));
    }
  };

  // Filter options for search component
  const filterOptions = {
    asset_type: [
      { value: 'hardware', label: '하드웨어' },
      { value: 'software', label: '소프트웨어' },
    ],
    status: [
      { value: '사용중', label: '사용 중' },
      { value: '반납완료', label: '반납 완료' },
      { value: '대기중', label: '대기 중' },
      { value: '연체', label: '연체' },
      { value: '분실', label: '분실' },
      { value: '손상', label: '손상' },
    ],
    department: Array.from(
      new Set(state.assignments.map(a => a.employee.department))
    ).map(dept => ({
      value: dept,
      label: dept,
    })),
    assigned_date_from: true,
    assigned_date_to: true,
    return_date_from: true,
    return_date_to: true,
  };

  return (
    <MainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          자산 할당 관리
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          직원에게 할당된 자산을 관리하고 추적합니다.
        </Typography>

        {/* Read-only notice for user role */}
        {!hasManagerRole() && !hasAdminRole() && (
          <Box sx={{ mt: 2 }}>
            <Alert severity='info' variant='outlined'>
              <Typography variant='body2'>
                현재 읽기 전용 모드입니다. 할당 생성, 수정, 삭제 권한이 필요한
                경우 관리자에게 문의하세요.
              </Typography>
            </Alert>
          </Box>
        )}
      </Box>

      {/* Enhanced Status Dashboard */}
      <Box sx={{ mb: 3 }}>
        <AssignmentStatusDashboard
          assignments={state.assignments}
          variant='compact'
          showTrends={true}
          showRecentActivity={true}
          maxRecentItems={3}
        />
      </Box>

      {/* Quick Filters */}
      <Box sx={{ mb: 3 }}>
        <QuickFilterBar
          assignments={state.assignments}
          filters={state.filters}
          onFiltersChange={filters =>
            setState(prev => ({
              ...prev,
              filters,
              page: 1,
            }))
          }
          onAdvancedSearch={() =>
            setState(prev => ({ ...prev, showFilterPanel: true }))
          }
        />
      </Box>

      {/* Actions Bar */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <ManagerGuard>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateAssignment}
          >
            자산 할당
          </Button>
        </ManagerGuard>

        <Button
          variant='outlined'
          startIcon={<ExportIcon />}
          onClick={event =>
            setState(prev => ({ ...prev, anchorEl: event.currentTarget }))
          }
        >
          내보내기
        </Button>

        <Menu
          anchorEl={state.anchorEl}
          open={Boolean(state.anchorEl)}
          onClose={() => setState(prev => ({ ...prev, anchorEl: null }))}
        >
          <MenuItem onClick={() => handleExportExcel('filtered')}>
            <ExportIcon sx={{ mr: 1 }} fontSize='small' />
            필터된 할당 내보내기 (Excel)
          </MenuItem>
          <MenuItem onClick={() => handleExportExcel('all')}>
            <ExportIcon sx={{ mr: 1 }} fontSize='small' />
            전체 할당 내보내기 (Excel)
          </MenuItem>
          <MenuItem onClick={handleExportCSV}>
            <ExportIcon sx={{ mr: 1 }} fontSize='small' />
            CSV 내보내기
          </MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1 }} />

        <AssignmentSearch
          assignments={state.assignments}
          searchQuery={state.searchQuery}
          onSearchChange={query =>
            setState(prev => ({ ...prev, searchQuery: query }))
          }
          onSuggestionSelect={suggestion => {
            setState(prev => ({ ...prev, searchQuery: suggestion.value }));
          }}
          onAdvancedSearch={() => {
            setState(prev => ({ ...prev, showFilterPanel: true }));
          }}
          placeholder='직원명, 자산 ID, 할당 ID로 검색...'
          showSuggestions={true}
          showRecentSearches={true}
          maxSuggestions={8}
          size='medium'
        />
      </Box>

      {/* Main Content */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AssignmentTable
          assignments={filteredAssignments}
          loading={state.loading}
          totalCount={filteredAssignments.length}
          page={state.page}
          pageSize={state.pageSize}
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onViewAssignment={handleViewAssignment}
          onEditAssignment={handleEditAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          onReturnAsset={handleReturnAsset}
        />
      </Card>

      {/* Assignment Form Modal */}
      <AssignmentFormModal
        open={state.showCreateModal}
        assignment={state.selectedAssignment}
        employees={state.employees}
        hardware={state.hardware}
        software={state.software}
        assignments={state.assignments}
        onClose={() =>
          setState(prev => ({
            ...prev,
            showCreateModal: false,
            selectedAssignment: null,
          }))
        }
        onSubmit={handleSubmitAssignment}
        loading={state.loading}
      />

      {/* Assignment Detail Modal */}
      <AssignmentDetailModal
        open={state.showDetailModal}
        assignment={state.selectedAssignment}
        onClose={() =>
          setState(prev => ({
            ...prev,
            showDetailModal: false,
            selectedAssignment: null,
          }))
        }
        onEdit={handleEditAssignment}
        onReturn={handleReturnAsset}
        onDelete={handleDeleteAssignment}
      />

      {/* Asset Return Modal */}
      <AssetReturnModal
        open={state.showReturnModal}
        assignment={state.selectedAssignment}
        onClose={() =>
          setState(prev => ({
            ...prev,
            showReturnModal: false,
            selectedAssignment: null,
          }))
        }
        onReturn={handleAssetReturn}
        loading={state.loading}
        allowEarlyReturn={true}
        requireConditionAssessment={true}
        requireManagerApproval={hasManagerRole() && !hasAdminRole()}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        open={state.showAdvancedSearch}
        assignments={state.assignments}
        currentFilters={state.filters}
        currentSearchQuery={state.searchQuery}
        onClose={() =>
          setState(prev => ({ ...prev, showAdvancedSearch: false }))
        }
        onApplyFilters={(filters, searchQuery) => {
          setState(prev => ({
            ...prev,
            filters,
            searchQuery,
            page: 1,
            showAdvancedSearch: false,
          }));
        }}
        onSaveSearch={search => {
          setState(prev => ({
            ...prev,
            successMessage: `검색 조건 "${search.name}"이 저장되었습니다.`,
          }));
        }}
      />

      {/* Filter Panel */}
      <FilterPanel
        open={state.showFilterPanel}
        assignments={state.assignments}
        filters={state.filters}
        onClose={() => setState(prev => ({ ...prev, showFilterPanel: false }))}
        onFiltersChange={filters =>
          setState(prev => ({
            ...prev,
            filters,
            page: 1,
          }))
        }
        onApplyFilters={() => {
          setState(prev => ({ ...prev, showFilterPanel: false }));
        }}
      />

      {/* Notifications */}
      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity='error' variant='filled'>
          {state.error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!state.successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity='success' variant='filled'>
          {state.successMessage}
        </Alert>
      </Snackbar>
      </Box>
    </MainLayout>
  );
}
