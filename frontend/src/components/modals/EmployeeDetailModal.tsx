'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon
} from '@mui/icons-material';
import { EmployeeWithAssets } from '@/types/employee';
import { AssignmentService } from '@/services/assignment.service';
import { ApiClient } from '@/lib/api-client';

interface Assignment {
  id: string;
  asset_type: 'hardware' | 'software';
  asset_id: string;
  asset_name: string;
  status: string;
  assigned_date: string;
  returned_date?: string;
  notes?: string;
}

interface EmployeeDetailModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeWithAssets | null;
}

export function EmployeeDetailModal({
  open,
  onClose,
  employee
}: EmployeeDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new ApiClient();
  const assignmentService = new AssignmentService(apiClient);

  // Load assignment history when employee changes
  useEffect(() => {
    if (open && employee) {
      loadAssignmentHistory();
    }
  }, [open, employee]);

  const loadAssignmentHistory = async () => {
    if (!employee) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.getByEmployee(employee.id);
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to load assignment history');
      }
    } catch (error) {
      console.error('Failed to load assignment history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignment history');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  // Get status color for assignments
  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case '사용중': return 'success';
      case '반납완료': return 'default';
      case '수리중': return 'warning';
      case '분실': return 'error';
      default: return 'info';
    }
  };

  const activeAssignments = assignments.filter(a => a.status === '사용중');
  const historyAssignments = assignments.filter(a => a.status !== '사용중');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" component="span">
            {employee.name} 상세 정보
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Employee Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="primary" />
                기본 정보
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                    사번:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {employee.id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                    부서:
                  </Typography>
                  <Chip label={employee.department} color="primary" size="small" />
                </Box>

                {employee.position && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      직책:
                    </Typography>
                    <Typography variant="body1">
                      {employee.position}
                    </Typography>
                  </Box>
                )}

                {employee.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      이메일:
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'primary.main' }}>
                      {employee.email}
                    </Typography>
                  </Box>
                )}

                {employee.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      연락처:
                    </Typography>
                    <Typography variant="body1">
                      {employee.phone}
                    </Typography>
                  </Box>
                )}

                {employee.hire_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                      입사일:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(employee.hire_date)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Asset Assignment Summary */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentIcon color="primary" />
                자산 할당 현황
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    현재 사용 중인 자산:
                  </Typography>
                  <Chip 
                    label={`${employee.assignedAssets} 개`}
                    color={employee.assignedAssets > 0 ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    총 할당 이력:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {assignments.length} 건
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    하드웨어:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ComputerIcon fontSize="small" color="action" />
                    <Typography variant="body1">
                      {assignments.filter(a => a.asset_type === 'hardware').length} 건
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    소프트웨어:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AppsIcon fontSize="small" color="action" />
                    <Typography variant="body1">
                      {assignments.filter(a => a.asset_type === 'software').length} 건
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Assignment History */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AssignmentIcon color="primary" />
              자산 할당 이력
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <>
                {/* Current Assignments */}
                {activeAssignments.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="success.main" sx={{ mb: 1, fontWeight: 'medium' }}>
                      현재 사용 중인 자산 ({activeAssignments.length}개)
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>자산 유형</TableCell>
                            <TableCell>자산명</TableCell>
                            <TableCell>할당일</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>비고</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeAssignments.map((assignment, index) => (
                            <TableRow key={`${assignment.id}-${index}`}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {assignment.asset_type === 'hardware' ? (
                                    <>
                                      <ComputerIcon fontSize="small" color="primary" />
                                      하드웨어
                                    </>
                                  ) : (
                                    <>
                                      <AppsIcon fontSize="small" color="secondary" />
                                      소프트웨어
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {assignment.asset_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {assignment.asset_id}
                                </Typography>
                              </TableCell>
                              <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={assignment.status}
                                  color={getStatusColor(assignment.status)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {assignment.notes || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Assignment History */}
                {historyAssignments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                      할당 이력 ({historyAssignments.length}건)
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>자산 유형</TableCell>
                            <TableCell>자산명</TableCell>
                            <TableCell>할당일</TableCell>
                            <TableCell>반납일</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>비고</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {historyAssignments.map((assignment, index) => (
                            <TableRow key={`${assignment.id}-${index}`}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {assignment.asset_type === 'hardware' ? (
                                    <>
                                      <ComputerIcon fontSize="small" color="action" />
                                      하드웨어
                                    </>
                                  ) : (
                                    <>
                                      <AppsIcon fontSize="small" color="action" />
                                      소프트웨어
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {assignment.asset_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {assignment.asset_id}
                                </Typography>
                              </TableCell>
                              <TableCell>{formatDate(assignment.assigned_date)}</TableCell>
                              <TableCell>{formatDate(assignment.returned_date)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={assignment.status}
                                  color={getStatusColor(assignment.status)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {assignment.notes || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {assignments.length === 0 && !loading && (
                  <Alert severity="info">
                    이 직원에게는 아직 할당된 자산이 없습니다.
                  </Alert>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Hook for managing employee detail modal state
export function useEmployeeDetailModal() {
  const [open, setOpen] = useState(false);
  const [employee, setEmployee] = useState<EmployeeWithAssets | null>(null);

  const openModal = (employeeToShow: EmployeeWithAssets) => {
    setEmployee(employeeToShow);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEmployee(null);
  };

  return {
    open,
    employee,
    openModal,
    closeModal,
  };
}