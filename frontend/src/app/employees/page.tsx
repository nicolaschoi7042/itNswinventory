'use client';

import React, { useState, useEffect } from 'react';
import { ManagerGuard } from '@/components/guards/RoleGuards';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExcelIcon
} from '@mui/icons-material';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchFilter } from '@/components/tables/SearchFilter';
import { EmployeeFormModal, useEmployeeFormModal, EmployeeDetailModal, useEmployeeDetailModal } from '@/components/modals';
import { HighlightText, useHighlightRenderer } from '@/components/common/HighlightText';
import MainLayout from '@/components/layout/MainLayout';
import { Employee, EmployeeWithAssets, CreateEmployeeData, UpdateEmployeeData } from '@/types/employee';
import { EmployeeService } from '@/services/employee.service';
import { AssignmentService } from '@/services/assignment.service';
import { ApiClient } from '@/lib/api-client';

interface EmployeesPageState {
  employees: EmployeeWithAssets[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  departmentFilter: string;
  positionFilter: string;
  hireDateFrom: string;
  hireDateTo: string;
  assetsFilter: string; // none, has-assets, no-assets
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

export default function EmployeesPage() {
  const { user } = useAuth();
  const [state, setState] = useState<EmployeesPageState>({
    employees: [],
    loading: false,
    error: null,
    searchQuery: '',
    departmentFilter: '',
    positionFilter: '',
    hireDateFrom: '',
    hireDateTo: '',
    assetsFilter: '',
    notification: { open: false, message: '', severity: 'info' }
  });

  // Employee form modal state
  const employeeModal = useEmployeeFormModal();
  const employeeDetailModal = useEmployeeDetailModal();

  const apiClient = new ApiClient();
  const employeeService = new EmployeeService(apiClient);
  const assignmentService = new AssignmentService(apiClient);

  // Load employee data
  const loadEmployees = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [employeesResponse, assignmentsResponse] = await Promise.all([
        employeeService.getAll(),
        assignmentService.getAll()
      ]);

      if (employeesResponse.success && assignmentsResponse.success) {
        const employees = employeesResponse.data || [];
        const assignments = assignmentsResponse.data || [];

        // Calculate assigned assets count for each employee
        const employeesWithAssets: EmployeeWithAssets[] = employees.map(employee => ({
          ...employee,
          assignedAssets: assignments.filter(
            assignment => assignment.employee_id === employee.id && assignment.status === '사용중'
          ).length
        }));

        setState(prev => ({ 
          ...prev, 
          employees: employeesWithAssets,
          loading: false 
        }));
      } else {
        throw new Error(employeesResponse.error || assignmentsResponse.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load employees'
      }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  // Handle department filter
  const handleDepartmentFilter = (department: string) => {
    setState(prev => ({ ...prev, departmentFilter: department }));
  };

  // Handle position filter
  const handlePositionFilter = (position: string) => {
    setState(prev => ({ ...prev, positionFilter: position }));
  };

  // Handle hire date filters
  const handleHireDateFromFilter = (date: string) => {
    setState(prev => ({ ...prev, hireDateFrom: date }));
  };

  const handleHireDateToFilter = (date: string) => {
    setState(prev => ({ ...prev, hireDateTo: date }));
  };

  // Handle assets filter
  const handleAssetsFilter = (filter: string) => {
    setState(prev => ({ ...prev, assetsFilter: filter }));
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      departmentFilter: '',
      positionFilter: '',
      hireDateFrom: '',
      hireDateTo: '',
      assetsFilter: ''
    }));
  };

  // Filter employees based on all filters
  const filteredEmployees = state.employees.filter(employee => {
    // Search filter
    const matchesSearch = !state.searchQuery || 
      employee.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (employee.position && employee.position.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
      (employee.email && employee.email.toLowerCase().includes(state.searchQuery.toLowerCase()));
    
    // Department filter
    const matchesDepartment = !state.departmentFilter || 
      employee.department === state.departmentFilter;

    // Position filter
    const matchesPosition = !state.positionFilter || 
      (employee.position && employee.position === state.positionFilter);

    // Hire date range filter
    const matchesHireDateFrom = !state.hireDateFrom || 
      !employee.hire_date || 
      new Date(employee.hire_date) >= new Date(state.hireDateFrom);
      
    const matchesHireDateTo = !state.hireDateTo || 
      !employee.hire_date || 
      new Date(employee.hire_date) <= new Date(state.hireDateTo);

    // Assets filter
    let matchesAssets = true;
    if (state.assetsFilter === 'has-assets') {
      matchesAssets = employee.assignedAssets > 0;
    } else if (state.assetsFilter === 'no-assets') {
      matchesAssets = employee.assignedAssets === 0;
    }

    return matchesSearch && matchesDepartment && matchesPosition && 
           matchesHireDateFrom && matchesHireDateTo && matchesAssets;
  });

  // Count active filters
  const activeFilterCount = [
    state.searchQuery,
    state.departmentFilter,
    state.positionFilter,
    state.hireDateFrom,
    state.hireDateTo,
    state.assetsFilter
  ].filter(Boolean).length;

  // Handle create employee
  const handleCreateEmployee = async (data: CreateEmployeeData) => {
    try {
      employeeModal.setModalLoading(true);
      const response = await employeeService.create(data);
      
      if (response.success) {
        await loadEmployees(); // Reload the list
        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: `직원 "${data.name}"이 성공적으로 등록되었습니다.`,
            severity: 'success'
          }
        }));
      } else {
        throw new Error(response.error || '직원 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create employee:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: error instanceof Error ? error.message : '직원 등록 중 오류가 발생했습니다.',
          severity: 'error'
        }
      }));
    } finally {
      employeeModal.setModalLoading(false);
    }
  };

  // Handle update employee
  const handleUpdateEmployee = async (data: UpdateEmployeeData) => {
    if (!employeeModal.employee) return;

    try {
      employeeModal.setModalLoading(true);
      const response = await employeeService.update(employeeModal.employee.id, data);
      
      if (response.success) {
        await loadEmployees(); // Reload the list
        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: `직원 "${data.name || employeeModal.employee?.name}" 정보가 성공적으로 수정되었습니다.`,
            severity: 'success'
          }
        }));
      } else {
        throw new Error(response.error || '직원 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: error instanceof Error ? error.message : '직원 정보 수정 중 오류가 발생했습니다.',
          severity: 'error'
        }
      }));
    } finally {
      employeeModal.setModalLoading(false);
    }
  };

  // Handle employee form submission
  const handleEmployeeFormSubmit = async (data: CreateEmployeeData | UpdateEmployeeData) => {
    if (employeeModal.employee) {
      await handleUpdateEmployee(data);
    } else {
      await handleCreateEmployee(data as CreateEmployeeData);
    }
  };

  // Handle edit employee
  const handleEdit = (employee: EmployeeWithAssets) => {
    employeeModal.openEditModal(employee);
  };

  // Handle delete employee
  const handleDelete = async (employee: EmployeeWithAssets) => {
    if (!window.confirm(`정말로 "${employee.name}" 직원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 직원의 모든 자산 할당도 함께 제거됩니다.`)) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await employeeService.delete(employee.id);
      
      if (response.success) {
        await loadEmployees(); // Reload the list
        setState(prev => ({
          ...prev,
          loading: false,
          notification: {
            open: true,
            message: `직원 "${employee.name}"이 성공적으로 삭제되었습니다.`,
            severity: 'success'
          }
        }));
      } else {
        throw new Error(response.error || '직원 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        notification: {
          open: true,
          message: error instanceof Error ? error.message : '직원 삭제 중 오류가 발생했습니다.',
          severity: 'error'
        }
      }));
    }
  };

  // Handle add employee
  const handleAdd = () => {
    employeeModal.openCreateModal();
  };

  // Handle Excel export
  const handleExport = async () => {
    try {
      await employeeService.exportToExcel();
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '엑셀 파일이 다운로드되었습니다.',
          severity: 'success'
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '엑셀 다운로드 중 오류가 발생했습니다.',
          severity: 'error'
        }
      }));
    }
  };

  // Create highlight renderer
  const highlightRenderer = useHighlightRenderer(state.searchQuery);

  // Define table columns with search highlighting
  const columns: Column<EmployeeWithAssets>[] = [
    {
      key: 'id',
      label: '사번',
      width: 100,
      sortable: true,
      render: (value: string) => highlightRenderer(value)
    },
    {
      key: 'name',
      label: '이름',
      width: 120,
      sortable: true,
      render: (value: string) => highlightRenderer(value, { variant: 'subtitle2' })
    },
    {
      key: 'department',
      label: '부서',
      width: 120,
      sortable: true,
      render: (value: string) => highlightRenderer(value)
    },
    {
      key: 'assignedAssets',
      label: '할당된 자산',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <Chip 
          label={`${value} 개`}
          color={value > 0 ? 'primary' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      key: 'id', // Using id as key for actions column
      label: '작업',
      width: 120,
      align: 'center',
      render: (_, employee) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton 
            size="small" 
            onClick={() => employeeDetailModal.openModal(employee)}
            color="info"
            title={`${employee.name} 상세보기`}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleEdit(employee)}
            color="primary"
            title={`${employee.name} 수정`}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {user?.role === 'admin' && (
            <IconButton 
              size="small" 
              onClick={() => handleDelete(employee)}
              color="error"
              title={`${employee.name} 삭제`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

  return (
    <MainLayout>
      <ManagerGuard>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1">
                임직원 관리
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                onClick={handleExport}
                color="success"
              >
                엑셀 내보내기
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                신규 등록
              </Button>
            </Box>
          </Box>

          {/* Search and Filter */}
          <SearchFilter
            searchValue={state.searchQuery}
            onSearchChange={handleSearch}
            searchPlaceholder="이름, 부서, 사번, 직책, 이메일로 검색..."
            searchFullWidth={false}
            filters={[
              {
                label: '부서',
                value: state.departmentFilter,
                onChange: handleDepartmentFilter,
                options: [
                  { label: '전체 부서', value: '' },
                  { label: '개발팀', value: '개발팀' },
                  { label: '영업팀', value: '영업팀' },
                  { label: '인사팀', value: '인사팀' },
                  { label: '재무팀', value: '재무팀' }
                ]
              }
            ]}
            advancedFilters={[
              {
                key: 'position',
                label: '직책',
                type: 'autocomplete',
                value: state.positionFilter,
                onChange: handlePositionFilter,
                options: Array.from(new Set(
                  state.employees
                    .map(emp => emp.position)
                    .filter(Boolean)
                )).map(position => ({
                  value: position!,
                  label: position!
                })).sort((a, b) => a.label.localeCompare(b.label)),
                placeholder: '직책 선택'
              },
              {
                key: 'hireDateFrom',
                label: '입사일 (시작)',
                type: 'date',
                value: state.hireDateFrom,
                onChange: handleHireDateFromFilter,
                placeholder: '시작 날짜'
              },
              {
                key: 'hireDateTo', 
                label: '입사일 (종료)',
                type: 'date',
                value: state.hireDateTo,
                onChange: handleHireDateToFilter,
                placeholder: '종료 날짜'
              },
              {
                key: 'assets',
                label: '자산 할당',
                type: 'select',
                value: state.assetsFilter,
                onChange: handleAssetsFilter,
                options: [
                  { label: '전체', value: '' },
                  { label: '자산 있음', value: 'has-assets' },
                  { label: '자산 없음', value: 'no-assets' }
                ]
              }
            ]}
            showClearAll={true}
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
          />

          {/* Error Alert */}
          {state.error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
              {state.error}
            </Alert>
          )}

          {/* Results Count and Summary */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              총 {state.employees.length}명 중 {filteredEmployees.length}명 표시
              {activeFilterCount > 0 && (
                <Chip 
                  label={`${activeFilterCount} 필터 적용됨`}
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {state.searchQuery && (
              <Typography variant="body2" color="text.secondary">
                "{state.searchQuery}" 검색 결과
              </Typography>
            )}
          </Box>

          {/* Data Table */}
          <DataTable<EmployeeWithAssets>
            data={filteredEmployees}
            columns={columns}
            loading={state.loading}
            emptyMessage="등록된 임직원이 없습니다."
            pagination={true}
            pageSize={10}
            sortable={true}
            stickyHeader={true}
            maxHeight="70vh"
            rowKey="id"
          />

          {/* Notification Snackbar */}
          <Snackbar
            open={state.notification.open}
            autoHideDuration={4000}
            onClose={() => setState(prev => ({ 
              ...prev, 
              notification: { ...prev.notification, open: false }
            }))}
          >
            <Alert 
              severity={state.notification.severity}
              onClose={() => setState(prev => ({ 
                ...prev, 
                notification: { ...prev.notification, open: false }
              }))}
            >
              {state.notification.message}
            </Alert>
          </Snackbar>

          {/* Employee Form Modal */}
          <EmployeeFormModal
            open={employeeModal.open}
            onClose={employeeModal.closeModal}
            employee={employeeModal.employee}
            onSubmit={handleEmployeeFormSubmit}
            loading={employeeModal.loading}
          />

          {/* Employee Detail Modal */}
          <EmployeeDetailModal
            open={employeeDetailModal.open}
            onClose={employeeDetailModal.closeModal}
            employee={employeeDetailModal.employee}
          />
        </Box>
      </ManagerGuard>
    </MainLayout>
  );
}