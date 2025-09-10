import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Undo as UndoIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

// Import types and services
import {
  SoftwareWithAssignments,
  SoftwareAssignment,
  calculateLicenseUtilization,
  getSoftwareLicenseStatus,
  formatSoftwareDisplayName,
  formatLicenseInfo,
  SoftwareLicenseStatus,
} from '@/types/software';
import { SoftwareService } from '@/services/software.service';
import { ManagerGuard } from '@/components/auth/ManagerGuard';
import {
  SoftwareReturnModal,
  useSoftwareReturnModal,
} from './SoftwareReturnModal';

interface SoftwareDetailModalProps {
  open: boolean;
  onClose: () => void;
  software: SoftwareWithAssignments;
  onEdit?: () => void;
  onDataChanged?: () => void;
}

interface ModalState {
  assignmentHistory: SoftwareAssignment[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export function SoftwareDetailModal({
  open,
  onClose,
  software,
  onEdit,
  onDataChanged,
}: SoftwareDetailModalProps) {
  const [state, setState] = useState<ModalState>({
    assignmentHistory: [],
    loading: true,
    error: null,
    successMessage: null,
  });

  // Return modal
  const { openModal: openReturnModal, SoftwareReturnModalComponent } =
    useSoftwareReturnModal();

  // Load assignment history
  useEffect(() => {
    if (open && software) {
      loadAssignmentHistory();
    }
  }, [open, software?.id]);

  const loadAssignmentHistory = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const history = await SoftwareService.getSoftwareAssignmentHistory(
        software.id
      );
      setState(prev => ({
        ...prev,
        assignmentHistory: history,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load assignment history:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : '할당 이력을 불러오는데 실패했습니다.',
      }));
    }
  };

  // Calculate license utilization
  const utilization = calculateLicenseUtilization(software);
  const licenseStatus = getSoftwareLicenseStatus(software);

  // Get license status color and icon
  const getLicenseStatusDisplay = (status: SoftwareLicenseStatus) => {
    switch (status) {
      case 'active':
        return {
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          text: '활성',
        };
      case 'expiring_soon':
        return {
          color: 'warning' as const,
          icon: <WarningIcon />,
          text: '만료임박',
        };
      case 'expired':
        return { color: 'error' as const, icon: <ErrorIcon />, text: '만료' };
      default:
        return {
          color: 'default' as const,
          icon: <CheckCircleIcon />,
          text: '알 수 없음',
        };
    }
  };

  const statusDisplay = getLicenseStatusDisplay(licenseStatus);

  // Get active assignments
  const activeAssignments = state.assignmentHistory.filter(
    a => a.status === '사용중'
  );
  const completedAssignments = state.assignmentHistory.filter(
    a => a.status === '반납완료'
  );

  // Handle return license
  const handleReturnLicense = (assignment: SoftwareAssignment) => {
    openReturnModal(assignment, software);
  };

  const handleReturnSuccess = async () => {
    // Reload assignment history
    await loadAssignmentHistory();
    // Notify parent component to refresh software data
    if (onDataChanged) {
      onDataChanged();
    }
  };

  // Handle export assignment history for this software
  const handleExportAssignmentHistory = async () => {
    try {
      await SoftwareService.downloadAssignmentHistory(software.id);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant='h6' component='div'>
              소프트웨어 상세 정보
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {formatSoftwareDisplayName(software)}
            </Typography>
          </Box>
          <ManagerGuard>
            <Tooltip title='수정'>
              <IconButton onClick={onEdit} color='primary'>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </ManagerGuard>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {state.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  기본 정보
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      소프트웨어 ID:
                    </Typography>
                    <Typography variant='body2'>{software.id}</Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      제조사:
                    </Typography>
                    <Typography variant='body2'>
                      {software.manufacturer || '-'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      버전:
                    </Typography>
                    <Typography variant='body2'>
                      {software.version || '-'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      종류:
                    </Typography>
                    <Typography variant='body2'>
                      {software.type || '-'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      라이선스 유형:
                    </Typography>
                    <Typography variant='body2'>
                      {software.license_type || '-'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* License Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <TrendingUpIcon color='primary' />
                  <Typography variant='h6'>라이선스 현황</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2'>
                      사용률: {utilization.used}/{utilization.total}
                    </Typography>
                    <Typography variant='body2'>
                      {utilization.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={utilization.percentage}
                    color={utilization.color}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      총 라이선스:
                    </Typography>
                    <Typography variant='body2'>
                      {utilization.total}개
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      사용 중:
                    </Typography>
                    <Typography variant='body2'>
                      {utilization.used}개
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      사용 가능:
                    </Typography>
                    <Typography variant='body2'>
                      {utilization.available}개
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Purchase and Status Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  구매 정보
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      구매일:
                    </Typography>
                    <Typography variant='body2'>
                      {software.purchase_date
                        ? new Date(software.purchase_date).toLocaleDateString(
                            'ko-KR'
                          )
                        : '-'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      만료일:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2'>
                        {software.expiry_date
                          ? new Date(software.expiry_date).toLocaleDateString(
                              'ko-KR'
                            )
                          : '-'}
                      </Typography>
                      {software.expiry_date && (
                        <Chip
                          size='small'
                          color={statusDisplay.color}
                          icon={statusDisplay.icon}
                          label={statusDisplay.text}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      구매 가격:
                    </Typography>
                    <Typography variant='body2'>
                      {software.price
                        ? `₩${software.price.toLocaleString()}`
                        : '-'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      등록일:
                    </Typography>
                    <Typography variant='body2'>
                      {software.created_at
                        ? new Date(software.created_at).toLocaleDateString(
                            'ko-KR'
                          )
                        : '-'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  사용 통계
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' color='primary'>
                        {activeAssignments.length}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        현재 사용자
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h4' color='text.secondary'>
                        {completedAssignments.length}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        반납 완료
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Assignments */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                >
                  <AssignmentIcon color='primary' />
                  <Typography variant='h6'>
                    현재 할당 현황 ({activeAssignments.length}명)
                  </Typography>
                </Box>

                {state.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : activeAssignments.length > 0 ? (
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>직원명</TableCell>
                          <TableCell>할당일</TableCell>
                          <TableCell>메모</TableCell>
                          <TableCell align='center'>작업</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeAssignments.map(assignment => (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <Typography variant='body2'>
                                {assignment.employee_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>
                                {new Date(
                                  assignment.assigned_date
                                ).toLocaleDateString('ko-KR')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {assignment.notes || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <ManagerGuard>
                                <Tooltip title='반납 처리'>
                                  <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() =>
                                      handleReturnLicense(assignment)
                                    }
                                  >
                                    <UndoIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              </ManagerGuard>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity='info'>현재 할당된 사용자가 없습니다.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Assignment History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color='primary' />
                    <Typography variant='h6'>
                      할당 이력 ({state.assignmentHistory.length}건)
                    </Typography>
                  </Box>
                  {state.assignmentHistory.length > 0 && (
                    <Tooltip title='할당 이력 내보내기'>
                      <IconButton
                        size='small'
                        onClick={handleExportAssignmentHistory}
                      >
                        <ExportIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {state.loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : state.assignmentHistory.length > 0 ? (
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>직원명</TableCell>
                          <TableCell>할당일</TableCell>
                          <TableCell>반납일</TableCell>
                          <TableCell>상태</TableCell>
                          <TableCell>메모</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.assignmentHistory
                          .sort(
                            (a, b) =>
                              new Date(b.assigned_date).getTime() -
                              new Date(a.assigned_date).getTime()
                          )
                          .map(assignment => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <Typography variant='body2'>
                                  {assignment.employee_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {new Date(
                                    assignment.assigned_date
                                  ).toLocaleDateString('ko-KR')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2'>
                                  {assignment.return_date
                                    ? new Date(
                                        assignment.return_date
                                      ).toLocaleDateString('ko-KR')
                                    : '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size='small'
                                  label={assignment.status}
                                  color={
                                    assignment.status === '사용중'
                                      ? 'primary'
                                      : 'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  {assignment.status === '반납완료' &&
                                  assignment.return_notes
                                    ? assignment.return_notes
                                    : assignment.notes || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity='info'>할당 이력이 없습니다.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>닫기</Button>
        <ManagerGuard>
          <Button onClick={onEdit} variant='contained'>
            수정
          </Button>
        </ManagerGuard>
      </DialogActions>

      {/* Return Modal */}
      <SoftwareReturnModalComponent onSuccess={handleReturnSuccess} />

      {/* Success Snackbar */}
      <Snackbar
        open={!!state.successMessage}
        autoHideDuration={4000}
        onClose={() => setState(prev => ({ ...prev, successMessage: null }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setState(prev => ({ ...prev, successMessage: null }))}
          severity='success'
          variant='filled'
        >
          {state.successMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
