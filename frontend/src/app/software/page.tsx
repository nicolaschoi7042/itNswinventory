'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  MoreVert as MoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';

// Import components and services
import { DataTable } from '@/components/common/DataTable';
import { SearchFilter } from '@/components/tables/SearchFilter';
import { SoftwareFormModal } from '@/components/modals/SoftwareFormModal';
import { SoftwareDetailModal } from '@/components/modals/SoftwareDetailModal';
import {
  SoftwareAssignmentModal,
  useSoftwareAssignmentModal,
} from '@/components/modals/SoftwareAssignmentModal';
import { ManagerGuard } from '@/components/auth/ManagerGuard';
import { AdminGuard } from '@/components/auth/AdminGuard';
import MainLayout from '@/components/layout/MainLayout';
import SoftwareService from '@/services/software.service';
import { useAuth } from '@/hooks/useAuth';

// Import types
import {
  Software,
  SoftwareWithAssignments,
  SoftwareFilters,
  calculateLicenseUtilization,
  getSoftwareLicenseStatus,
  SoftwareLicenseStatus,
} from '@/types/software';

interface SoftwarePageState {
  software: SoftwareWithAssignments[];
  loading: boolean;
  selectedSoftware: SoftwareWithAssignments | null;
  showFormModal: boolean;
  showDetailModal: boolean;
  editMode: boolean;
  searchQuery: string;
  filters: SoftwareFilters;
  anchorEl: HTMLElement | null;
  error: string | null;
  successMessage: string | null;
}

export default function SoftwarePage() {
  const theme = useTheme();
  const { user, hasAdminRole, hasManagerRole } = useAuth();

  const [state, setState] = useState<SoftwarePageState>({
    software: [],
    loading: true,
    selectedSoftware: null,
    showFormModal: false,
    showDetailModal: false,
    editMode: false,
    searchQuery: '',
    filters: {},
    anchorEl: null,
    error: null,
    successMessage: null,
  });

  // Assignment modal
  const { openModal: openAssignmentModal, SoftwareAssignmentModalComponent } =
    useSoftwareAssignmentModal();

  // Load software data
  const loadSoftware = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const softwareData = await SoftwareService.getSoftwareWithAssignments();
      setState(prev => ({ ...prev, software: softwareData, loading: false }));
    } catch (error) {
      console.error('Failed to load software:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : '소프트웨어 데이터를 불러오는데 실패했습니다.',
      }));
    }
  }, []);

  useEffect(() => {
    loadSoftware();
  }, [loadSoftware]);

  // Filter and search software
  const filteredSoftware = useMemo(() => {
    let result = [...state.software];

    // Apply text search
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter(
        software =>
          software.name.toLowerCase().includes(query) ||
          software.manufacturer?.toLowerCase().includes(query) ||
          software.version?.toLowerCase().includes(query) ||
          software.type?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (state.filters.type) {
      result = result.filter(software => software.type === state.filters.type);
    }

    if (state.filters.manufacturer) {
      result = result.filter(
        software => software.manufacturer === state.filters.manufacturer
      );
    }

    if (state.filters.license_type) {
      result = result.filter(
        software => software.license_type === state.filters.license_type
      );
    }

    if (state.filters.status) {
      result = result.filter(
        software => getSoftwareLicenseStatus(software) === state.filters.status
      );
    }

    if (state.filters.utilization_filter) {
      result = result.filter(software => {
        const utilization = calculateLicenseUtilization(software);
        switch (state.filters.utilization_filter) {
          case 'low':
            return utilization.percentage < 50;
          case 'medium':
            return utilization.percentage >= 50 && utilization.percentage < 80;
          case 'high':
            return utilization.percentage >= 80 && utilization.percentage < 100;
          case 'full':
            return utilization.percentage === 100;
          default:
            return true;
        }
      });
    }

    // Apply date range filters
    if (state.filters.purchase_date_from) {
      result = result.filter(software => {
        if (!software.purchase_date) return false;
        return (
          new Date(software.purchase_date) >=
          new Date(state.filters.purchase_date_from!)
        );
      });
    }

    if (state.filters.purchase_date_to) {
      result = result.filter(software => {
        if (!software.purchase_date) return false;
        return (
          new Date(software.purchase_date) <=
          new Date(state.filters.purchase_date_to!)
        );
      });
    }

    if (state.filters.expiry_date_from) {
      result = result.filter(software => {
        if (!software.expiry_date) return false;
        return (
          new Date(software.expiry_date) >=
          new Date(state.filters.expiry_date_from!)
        );
      });
    }

    if (state.filters.expiry_date_to) {
      result = result.filter(software => {
        if (!software.expiry_date) return false;
        return (
          new Date(software.expiry_date) <=
          new Date(state.filters.expiry_date_to!)
        );
      });
    }

    return result;
  }, [state.software, state.searchQuery, state.filters]);

  // License status color mapping
  const getLicenseStatusColor = (status: SoftwareLicenseStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  // License status text mapping
  const getLicenseStatusText = (status: SoftwareLicenseStatus) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'expiring_soon':
        return '만료임박';
      case 'expired':
        return '만료';
      default:
        return '알 수 없음';
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'name' as keyof SoftwareWithAssignments,
        label: '소프트웨어명',
        minWidth: 200,
        render: (value: any, software: SoftwareWithAssignments) => (
          <Box>
            <Typography variant='body2' fontWeight='medium'>
              {software.name}
            </Typography>
            {software.version && (
              <Typography variant='caption' color='text.secondary'>
                v{software.version}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        id: 'manufacturer' as keyof SoftwareWithAssignments,
        label: '제조사',
        minWidth: 120,
        render: (value: any) => value || '-',
      },
      {
        id: 'type' as keyof SoftwareWithAssignments,
        label: '종류',
        minWidth: 100,
        render: (value: any) => value || '-',
      },
      {
        id: 'license_type' as keyof SoftwareWithAssignments,
        label: '라이선스 유형',
        minWidth: 120,
        render: (value: any) => value || '-',
      },
      {
        id: 'licenseUtilization' as keyof SoftwareWithAssignments,
        label: '라이선스 사용률',
        minWidth: 200,
        align: 'center' as const,
        render: (value: any, software: SoftwareWithAssignments) => {
          const utilization = calculateLicenseUtilization(software);
          return (
            <Box sx={{ minWidth: 150 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant='caption'>
                  {utilization.used}/{utilization.total}
                </Typography>
                <Typography variant='caption'>
                  {utilization.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={utilization.percentage}
                color={utilization.color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          );
        },
      },
      {
        id: 'expiry_date' as keyof SoftwareWithAssignments,
        label: '만료일',
        minWidth: 120,
        render: (value: any, software: SoftwareWithAssignments) => {
          if (!value) return '-';
          const status = getSoftwareLicenseStatus(software);
          return (
            <Chip
              label={new Date(value).toLocaleDateString('ko-KR')}
              color={getLicenseStatusColor(status)}
              size='small'
              icon={
                status === 'expired' ? (
                  <ErrorIcon />
                ) : status === 'expiring_soon' ? (
                  <WarningIcon />
                ) : (
                  <CheckCircleIcon />
                )
              }
            />
          );
        },
      },
      {
        id: 'actions',
        label: '작업',
        minWidth: 120,
        align: 'center' as const,
        render: (value: any, software: SoftwareWithAssignments) => (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <Tooltip title='상세보기'>
              <IconButton
                size='small'
                onClick={() => handleViewSoftware(software)}
              >
                <ViewIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <ManagerGuard>
              <Tooltip title='수정'>
                <IconButton
                  size='small'
                  onClick={() => handleEditSoftware(software)}
                >
                  <EditIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </ManagerGuard>
            <ManagerGuard>
              <Tooltip title='할당'>
                <IconButton
                  size='small'
                  color='primary'
                  onClick={() => handleAssignSoftware(software)}
                  disabled={
                    calculateLicenseUtilization(software).available <= 0
                  }
                >
                  <AssignmentIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </ManagerGuard>
            <AdminGuard>
              <Tooltip title='삭제'>
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => handleDeleteSoftware(software)}
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </AdminGuard>
          </Box>
        ),
      },
    ],
    []
  );

  // Event handlers
  const handleAddSoftware = () => {
    setState(prev => ({
      ...prev,
      selectedSoftware: null,
      editMode: false,
      showFormModal: true,
    }));
  };

  const handleEditSoftware = (software: SoftwareWithAssignments) => {
    setState(prev => ({
      ...prev,
      selectedSoftware: software,
      editMode: true,
      showFormModal: true,
    }));
  };

  const handleViewSoftware = (software: SoftwareWithAssignments) => {
    setState(prev => ({
      ...prev,
      selectedSoftware: software,
      showDetailModal: true,
    }));
  };

  const handleDeleteSoftware = async (software: SoftwareWithAssignments) => {
    if (
      !window.confirm(`"${software.name}" 소프트웨어를 정말 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      await SoftwareService.deleteSoftware(software.id);
      setState(prev => ({
        ...prev,
        successMessage: '소프트웨어가 성공적으로 삭제되었습니다.',
      }));
      await loadSoftware();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : '소프트웨어 삭제에 실패했습니다.',
      }));
    }
  };

  const handleAssignSoftware = (software: SoftwareWithAssignments) => {
    openAssignmentModal(software);
  };

  const handleAssignmentSuccess = async () => {
    setState(prev => ({
      ...prev,
      successMessage: '소프트웨어가 성공적으로 할당되었습니다.',
    }));
    await loadSoftware();
  };

  const handleSoftwareSaved = () => {
    setState(prev => ({
      ...prev,
      showFormModal: false,
      selectedSoftware: null,
      editMode: false,
      successMessage: state.editMode
        ? '소프트웨어가 수정되었습니다.'
        : '소프트웨어가 등록되었습니다.',
    }));
    loadSoftware();
  };

  const handleExportExcel = async () => {
    try {
      await SoftwareService.downloadExcel(
        state.searchQuery
          ? { query: state.searchQuery, filters: state.filters }
          : { filters: state.filters }
      );
      setState(prev => ({
        ...prev,
        successMessage: 'Excel 파일이 다운로드되었습니다.',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Excel 내보내기에 실패했습니다.',
      }));
    }
  };

  const handleExportUtilizationReport = async () => {
    try {
      await SoftwareService.downloadLicenseUtilizationReport();
      setState(prev => ({
        ...prev,
        successMessage: '라이선스 사용률 보고서가 다운로드되었습니다.',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : '라이선스 사용률 보고서 다운로드에 실패했습니다.',
      }));
    }
  };

  const handleExportAssignmentHistory = async () => {
    try {
      await SoftwareService.downloadAssignmentHistory();
      setState(prev => ({
        ...prev,
        successMessage: '할당 이력이 다운로드되었습니다.',
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : '할당 이력 다운로드에 실패했습니다.',
      }));
    }
  };

  const handleCloseError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const handleCloseSuccess = () => {
    setState(prev => ({ ...prev, successMessage: null }));
  };

  // Filter functionality is handled by SearchFilter internally

  return (
    <MainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          소프트웨어 관리
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          소프트웨어 라이선스 및 할당을 관리합니다.
        </Typography>
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
            onClick={handleAddSoftware}
          >
            소프트웨어 등록
          </Button>
        </ManagerGuard>

        <Button
          variant='outlined'
          startIcon={<MoreIcon />}
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
          <MenuItem
            onClick={() => {
              setState(prev => ({ ...prev, anchorEl: null }));
              handleExportExcel();
            }}
          >
            <ExportIcon sx={{ mr: 1 }} fontSize='small' />
            소프트웨어 목록
          </MenuItem>
          <MenuItem
            onClick={() => {
              setState(prev => ({ ...prev, anchorEl: null }));
              handleExportUtilizationReport();
            }}
          >
            <ReportIcon sx={{ mr: 1 }} fontSize='small' />
            라이선스 사용률 보고서
          </MenuItem>
          <MenuItem
            onClick={() => {
              setState(prev => ({ ...prev, anchorEl: null }));
              handleExportAssignmentHistory();
            }}
          >
            <AssignmentIcon sx={{ mr: 1 }} fontSize='small' />
            할당 이력
          </MenuItem>
        </Menu>

        <Box sx={{ flexGrow: 1 }} />

        <SearchFilter
          searchValue={state.searchQuery}
          onSearchChange={query =>
            setState(prev => ({ ...prev, searchQuery: query }))
          }
          searchPlaceholder='소프트웨어명, 제조사, 버전으로 검색...'
        />
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color='text.secondary' gutterBottom>
              총 소프트웨어
            </Typography>
            <Typography variant='h5'>{state.software.length}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color='text.secondary' gutterBottom>
              총 라이선스
            </Typography>
            <Typography variant='h5'>
              {state.software.reduce((sum, s) => sum + s.total_licenses, 0)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color='text.secondary' gutterBottom>
              사용 중인 라이선스
            </Typography>
            <Typography variant='h5'>
              {state.software.reduce((sum, s) => sum + s.assignedUsers, 0)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography color='text.secondary' gutterBottom>
              만료 예정
            </Typography>
            <Typography variant='h5' color='warning.main'>
              {
                state.software.filter(
                  s => getSoftwareLicenseStatus(s) === 'expiring_soon'
                ).length
              }
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <DataTable
          data={filteredSoftware}
          columns={columns}
          loading={state.loading}
          emptyMessage='소프트웨어가 없습니다.'
          rowKey='id'
          stickyHeader
          maxHeight='calc(100vh - 400px)'
        />
      </Card>

      {/* Modals */}
      {state.showFormModal && (
        <SoftwareFormModal
          open={state.showFormModal}
          onClose={() => setState(prev => ({ ...prev, showFormModal: false }))}
          onSave={handleSoftwareSaved}
          software={state.selectedSoftware}
          editMode={state.editMode}
        />
      )}

      {state.showDetailModal && state.selectedSoftware && (
        <SoftwareDetailModal
          open={state.showDetailModal}
          onClose={() =>
            setState(prev => ({ ...prev, showDetailModal: false }))
          }
          software={state.selectedSoftware}
          onEdit={() => {
            setState(prev => ({
              ...prev,
              showDetailModal: false,
              editMode: true,
              showFormModal: true,
            }));
          }}
          onDataChanged={loadSoftware}
        />
      )}

      {/* Assignment Modal */}
      <SoftwareAssignmentModalComponent onSuccess={handleAssignmentSuccess} />

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
