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
  Snackbar,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExcelIcon,
  Assignment as AssignIcon,
} from '@mui/icons-material';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchFilter } from '@/components/common/SearchFilter';
import {
  HardwareFormModal,
  useHardwareFormModal,
  HardwareDetailModal,
  useHardwareDetailModal,
} from '@/components/modals';
import {
  HighlightText,
  useHighlightRenderer,
} from '@/components/common/HighlightText';
import MainLayout from '@/components/layout/MainLayout';
import {
  Hardware,
  HardwareWithAssignee,
  CreateHardwareData,
  UpdateHardwareData,
  HARDWARE_STATUSES,
  HARDWARE_TYPES,
  HARDWARE_MANUFACTURERS,
} from '@/types/hardware';
import { HardwareService } from '@/services/hardware.service';
import { AssignmentService } from '@/services/assignment.service';
import { ApiClient } from '@/lib/api-client';

interface HardwarePageState {
  hardware: HardwareWithAssignee[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  typeFilter: string;
  manufacturerFilter: string;
  statusFilter: string;
  assignmentFilter: string; // all, assigned, unassigned
  purchaseDateFrom: string;
  purchaseDateTo: string;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

export default function HardwarePage() {
  const { user } = useAuth();
  const [state, setState] = useState<HardwarePageState>({
    hardware: [],
    loading: false,
    error: null,
    searchQuery: '',
    typeFilter: '',
    manufacturerFilter: '',
    statusFilter: '',
    assignmentFilter: '',
    purchaseDateFrom: '',
    purchaseDateTo: '',
    notification: { open: false, message: '', severity: 'info' },
  });

  // Hardware form modal state
  const hardwareModal = useHardwareFormModal();
  const hardwareDetailModal = useHardwareDetailModal();

  const apiClient = new ApiClient();
  const hardwareService = new HardwareService(apiClient);
  const assignmentService = new AssignmentService(apiClient);

  // Load hardware data
  const loadHardware = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [hardwareResponse, assignmentsResponse] = await Promise.all([
        hardwareService.getAll(),
        assignmentService.getAll(),
      ]);

      if (hardwareResponse.success && assignmentsResponse.success) {
        const hardware = hardwareResponse.data || [];
        const assignments = assignmentsResponse.data || [];

        // Enhance hardware with assignment information
        const hardwareWithAssignee: HardwareWithAssignee[] = hardware.map(
          hw => {
            const currentAssignment = assignments.find(
              assignment =>
                assignment.asset_type === 'hardware' &&
                assignment.asset_id === hw.id &&
                assignment.status === '사용중'
            );

            return {
              ...hw,
              assignedEmployeeName: currentAssignment?.employee_name,
              assignmentDate: currentAssignment?.assigned_date,
              assignmentHistory: assignments.filter(
                assignment =>
                  assignment.asset_type === 'hardware' &&
                  assignment.asset_id === hw.id
              ),
            };
          }
        );

        setState(prev => ({
          ...prev,
          hardware: hardwareWithAssignee,
          loading: false,
        }));
      } else {
        throw new Error(
          hardwareResponse.error ||
            assignmentsResponse.error ||
            'Failed to load data'
        );
      }
    } catch (error) {
      console.error('Failed to load hardware:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Failed to load hardware',
      }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadHardware();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  // Handle type filter
  const handleTypeFilter = (type: string) => {
    setState(prev => ({ ...prev, typeFilter: type }));
  };

  // Handle manufacturer filter
  const handleManufacturerFilter = (manufacturer: string) => {
    setState(prev => ({ ...prev, manufacturerFilter: manufacturer }));
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setState(prev => ({ ...prev, statusFilter: status }));
  };

  // Handle assignment filter
  const handleAssignmentFilter = (filter: string) => {
    setState(prev => ({ ...prev, assignmentFilter: filter }));
  };

  // Handle purchase date filters
  const handlePurchaseDateFromFilter = (date: string) => {
    setState(prev => ({ ...prev, purchaseDateFrom: date }));
  };

  const handlePurchaseDateToFilter = (date: string) => {
    setState(prev => ({ ...prev, purchaseDateTo: date }));
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      typeFilter: '',
      manufacturerFilter: '',
      statusFilter: '',
      assignmentFilter: '',
      purchaseDateFrom: '',
      purchaseDateTo: '',
    }));
  };

  // Handle create hardware
  const handleCreateHardware = async (data: CreateHardwareData) => {
    try {
      const response = await hardwareService.create(data);

      if (response.success) {
        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: '하드웨어가 성공적으로 등록되었습니다.',
            severity: 'success',
          },
        }));

        // Reload hardware list
        await loadHardware();
      } else {
        throw new Error(response.error || 'Failed to create hardware');
      }
    } catch (error) {
      console.error('Create hardware error:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '하드웨어 등록에 실패했습니다.',
          severity: 'error',
        },
      }));
    }
  };

  // Handle update hardware
  const handleUpdateHardware = async (data: UpdateHardwareData) => {
    if (!hardwareModal.hardware) return;

    try {
      const response = await hardwareService.update(
        hardwareModal.hardware.id,
        data
      );

      if (response.success) {
        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: '하드웨어 정보가 성공적으로 수정되었습니다.',
            severity: 'success',
          },
        }));

        // Reload hardware list
        await loadHardware();
      } else {
        throw new Error(response.error || 'Failed to update hardware');
      }
    } catch (error) {
      console.error('Update hardware error:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '하드웨어 정보 수정에 실패했습니다.',
          severity: 'error',
        },
      }));
    }
  };

  // Handle delete hardware
  const handleDeleteHardware = async (hardware: HardwareWithAssignee) => {
    // Check if hardware is assigned
    if (hardware.assigned_to) {
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message:
            '할당된 하드웨어는 삭제할 수 없습니다. 먼저 반납 처리하세요.',
          severity: 'warning',
        },
      }));
      return;
    }

    if (
      !window.confirm(
        `정말로 "${hardware.manufacturer} ${hardware.model} (${hardware.id})" 하드웨어를 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const response = await hardwareService.delete(hardware.id);

      if (response.success) {
        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: '하드웨어가 성공적으로 삭제되었습니다.',
            severity: 'success',
          },
        }));

        // Reload hardware list
        await loadHardware();
      } else {
        throw new Error(response.error || 'Failed to delete hardware');
      }
    } catch (error) {
      console.error('Delete hardware error:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '하드웨어 삭제에 실패했습니다.',
          severity: 'error',
        },
      }));
    }
  };

  // Filter hardware based on current filters
  const filteredHardware = state.hardware.filter(hardware => {
    // Search filter (searches across multiple fields)
    if (state.searchQuery) {
      const searchLower = state.searchQuery.toLowerCase();
      const searchFields = [
        hardware.id,
        hardware.type,
        hardware.manufacturer,
        hardware.model,
        hardware.serial_number,
        hardware.assignedEmployeeName || '',
        hardware.notes || '',
      ]
        .join(' ')
        .toLowerCase();

      if (!searchFields.includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (state.typeFilter && hardware.type !== state.typeFilter) {
      return false;
    }

    // Manufacturer filter
    if (
      state.manufacturerFilter &&
      hardware.manufacturer !== state.manufacturerFilter
    ) {
      return false;
    }

    // Status filter
    if (state.statusFilter && hardware.status !== state.statusFilter) {
      return false;
    }

    // Assignment filter
    if (state.assignmentFilter) {
      if (state.assignmentFilter === 'assigned' && !hardware.assigned_to) {
        return false;
      }
      if (state.assignmentFilter === 'unassigned' && hardware.assigned_to) {
        return false;
      }
    }

    // Purchase date range filter
    if (state.purchaseDateFrom && hardware.purchase_date) {
      if (hardware.purchase_date < state.purchaseDateFrom) {
        return false;
      }
    }

    if (state.purchaseDateTo && hardware.purchase_date) {
      if (hardware.purchase_date > state.purchaseDateTo) {
        return false;
      }
    }

    return true;
  });

  // Get unique values for filter options
  const uniqueTypes = [...new Set(state.hardware.map(hw => hw.type))].sort();
  const uniqueManufacturers = [
    ...new Set(state.hardware.map(hw => hw.manufacturer)),
  ].sort();
  const uniqueStatuses = [
    ...new Set(state.hardware.map(hw => hw.status)),
  ].sort();

  // Handle export to Excel
  const handleExportToExcel = async () => {
    try {
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '엑셀 파일을 생성하고 있습니다...',
          severity: 'info',
        },
      }));

      const response = await hardwareService.exportToExcel();
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hardware_assets_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        setState(prev => ({
          ...prev,
          notification: {
            open: true,
            message: '엑셀 파일이 다운로드되었습니다.',
            severity: 'success',
          },
        }));
      }
    } catch (error) {
      console.error('Export failed:', error);
      setState(prev => ({
        ...prev,
        notification: {
          open: true,
          message: '엑셀 내보내기에 실패했습니다.',
          severity: 'error',
        },
      }));
    }
  };

  // Hardware table columns
  const highlightRenderer = useHighlightRenderer(state.searchQuery);

  const columns: Column<HardwareWithAssignee>[] = [
    {
      id: 'id',
      label: '자산 번호',
      sortable: true,
      minWidth: 120,
      render: (value: string) => highlightRenderer(value),
    },
    {
      id: 'type',
      label: '유형',
      sortable: true,
      minWidth: 100,
      render: (value: string) => highlightRenderer(value),
    },
    {
      id: 'manufacturer',
      label: '제조사',
      sortable: true,
      minWidth: 100,
      render: (value: string) => highlightRenderer(value),
    },
    {
      id: 'model',
      label: '모델명',
      sortable: true,
      minWidth: 150,
      render: (value: string) => highlightRenderer(value),
    },
    {
      id: 'serial_number',
      label: '시리얼 번호',
      sortable: true,
      minWidth: 150,
      render: (value: string) => highlightRenderer(value),
    },
    {
      id: 'status',
      label: '상태',
      sortable: true,
      minWidth: 100,
      render: (value: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case '대기중':
              return 'default';
            case '사용중':
              return 'success';
            case '수리중':
              return 'warning';
            case '폐기':
              return 'error';
            default:
              return 'default';
          }
        };
        return (
          <Chip label={value} size='small' color={getStatusColor(value)} />
        );
      },
    },
    {
      id: 'assigned_to_name',
      label: '사용자',
      sortable: true,
      minWidth: 120,
      render: (value: string | undefined, hardware: HardwareWithAssignee) =>
        value ? (
          highlightRenderer(value)
        ) : (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontStyle: 'italic' }}
          >
            미할당
          </Typography>
        ),
    },
    {
      id: 'purchase_date',
      label: '구매일',
      sortable: true,
      minWidth: 100,
      render: (value: string | undefined) =>
        value ? new Date(value).toLocaleDateString('ko-KR') : '-',
    },
    {
      id: 'price',
      label: '구매가격',
      sortable: true,
      align: 'right',
      minWidth: 120,
      render: (value: number | undefined) =>
        value ? `₩${value.toLocaleString()}` : '-',
    },
    {
      id: 'actions',
      label: '작업',
      minWidth: 120,
      render: (_, hardware: HardwareWithAssignee) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size='small'
            onClick={() => hardwareDetailModal.openModal(hardware)}
            sx={{ color: 'primary.main' }}
          >
            <ViewIcon fontSize='small' />
          </IconButton>

          <IconButton
            size='small'
            onClick={() => hardwareModal.openEditModal(hardware)}
            sx={{ color: 'warning.main' }}
          >
            <EditIcon fontSize='small' />
          </IconButton>

          {!hardware.assigned_to && (
            <IconButton
              size='small'
              onClick={() => {
                // TODO: Open assignment modal in Task 9.0
                console.log('Assign hardware:', hardware.id);
              }}
              sx={{ color: 'success.main' }}
            >
              <AssignIcon fontSize='small' />
            </IconButton>
          )}

          {user?.role === 'admin' && (
            <IconButton
              size='small'
              onClick={() => handleDeleteHardware(hardware)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  // Count active filters
  const activeFiltersCount = [
    state.searchQuery,
    state.typeFilter,
    state.manufacturerFilter,
    state.statusFilter,
    state.assignmentFilter,
    state.purchaseDateFrom,
    state.purchaseDateTo,
  ].filter(filter => filter && filter.trim() !== '').length;

  return (
    <ManagerGuard>
      <MainLayout>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={3}
          >
            <Box display='flex' alignItems='center' gap={2}>
              <ComputerIcon color='primary' sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant='h4' component='h1'>
                  하드웨어 관리
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  총 {state.hardware.length}개 자산 중 {filteredHardware.length}
                  개 표시
                  {activeFiltersCount > 0 && (
                    <Chip
                      label={`${activeFiltersCount}개 필터 적용`}
                      size='small'
                      color='primary'
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>

            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                startIcon={<ExcelIcon />}
                onClick={handleExportToExcel}
                disabled={state.loading || state.hardware.length === 0}
              >
                엑셀 내보내기
              </Button>

              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={hardwareModal.openCreateModal}
              >
                하드웨어 등록
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {state.error && (
            <Alert
              severity='error'
              sx={{ mb: 3 }}
              onClose={() => setState(prev => ({ ...prev, error: null }))}
            >
              {state.error}
            </Alert>
          )}

          {/* Search and Filters */}
          <SearchFilter
            searchQuery={state.searchQuery}
            onSearchChange={handleSearch}
            onClearAllFilters={handleClearAllFilters}
            activeFiltersCount={activeFiltersCount}
            filters={[
              {
                type: 'select',
                label: '하드웨어 유형',
                value: state.typeFilter,
                onChange: handleTypeFilter,
                options: [
                  { value: '', label: '전체' },
                  ...uniqueTypes.map(type => ({ value: type, label: type })),
                ],
              },
              {
                type: 'autocomplete',
                label: '제조사',
                value: state.manufacturerFilter,
                onChange: handleManufacturerFilter,
                options: uniqueManufacturers,
                placeholder: '제조사를 선택하세요',
              },
              {
                type: 'select',
                label: '상태',
                value: state.statusFilter,
                onChange: handleStatusFilter,
                options: [
                  { value: '', label: '전체' },
                  ...uniqueStatuses.map(status => ({
                    value: status,
                    label: status,
                  })),
                ],
              },
              {
                type: 'select',
                label: '할당 상태',
                value: state.assignmentFilter,
                onChange: handleAssignmentFilter,
                options: [
                  { value: '', label: '전체' },
                  { value: 'assigned', label: '할당됨' },
                  { value: 'unassigned', label: '미할당' },
                ],
              },
              {
                type: 'date',
                label: '구매일 시작',
                value: state.purchaseDateFrom,
                onChange: handlePurchaseDateFromFilter,
              },
              {
                type: 'date',
                label: '구매일 종료',
                value: state.purchaseDateTo,
                onChange: handlePurchaseDateToFilter,
              },
            ]}
          />

          {/* Hardware Table */}
          <DataTable
            columns={columns}
            data={filteredHardware}
            loading={state.loading}
            onRowClick={hardware => hardwareDetailModal.openModal(hardware)}
            pagination
            pageSize={20}
            totalCount={filteredHardware.length}
            emptyStateMessage='등록된 하드웨어가 없습니다.'
            searchEmptyStateMessage='검색 조건에 맞는 하드웨어가 없습니다.'
          />

          {/* Notification Snackbar */}
          <Snackbar
            open={state.notification.open}
            autoHideDuration={6000}
            onClose={() =>
              setState(prev => ({
                ...prev,
                notification: { ...prev.notification, open: false },
              }))
            }
          >
            <Alert
              severity={state.notification.severity}
              onClose={() =>
                setState(prev => ({
                  ...prev,
                  notification: { ...prev.notification, open: false },
                }))
              }
            >
              {state.notification.message}
            </Alert>
          </Snackbar>

          {/* Hardware Form Modal */}
          <HardwareFormModal
            open={hardwareModal.open}
            onClose={hardwareModal.closeModal}
            hardware={hardwareModal.hardware}
            onSubmit={
              hardwareModal.hardware
                ? handleUpdateHardware
                : handleCreateHardware
            }
            loading={state.loading}
          />

          {/* Hardware Detail Modal */}
          <HardwareDetailModal
            open={hardwareDetailModal.open}
            onClose={hardwareDetailModal.closeModal}
            hardware={hardwareDetailModal.hardware}
          />
        </Box>
      </MainLayout>
    </ManagerGuard>
  );
}
