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
  Computer as ComputerIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachMoney as PriceIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { HardwareWithAssignee } from '@/types/hardware';
import { AssignmentService } from '@/services/assignment.service';
import { ApiClient } from '@/lib/api-client';

interface Assignment {
  id: string;
  asset_type: 'hardware' | 'software';
  asset_id: string;
  employee_id: string;
  employee_name: string;
  status: string;
  assigned_date: string;
  returned_date?: string;
  notes?: string;
  assigned_by?: string;
}

interface HardwareDetailModalProps {
  open: boolean;
  onClose: () => void;
  hardware: HardwareWithAssignee | null;
}

export function HardwareDetailModal({
  open,
  onClose,
  hardware
}: HardwareDetailModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new ApiClient();
  const assignmentService = new AssignmentService(apiClient);

  // Load assignment history when hardware changes
  useEffect(() => {
    if (open && hardware) {
      loadAssignmentHistory();
    }
  }, [open, hardware]);

  const loadAssignmentHistory = async () => {
    if (!hardware) return;

    setLoading(true);
    setError(null);

    try {
      // Get all assignments for this hardware
      const response = await assignmentService.getAll();
      
      if (response.success && response.data) {
        const hardwareAssignments = response.data.filter(
          assignment => 
            assignment.asset_type === 'hardware' && 
            assignment.asset_id === hardware.id
        );
        
        // Sort by assigned date (most recent first)
        const sortedAssignments = hardwareAssignments.sort((a, b) => 
          new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime()
        );
        
        setAssignments(sortedAssignments);
      } else {
        throw new Error(response.error || 'Failed to load assignment history');
      }
    } catch (error) {
      console.error('Failed to load assignment history:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignment history');
    } finally {
      setLoading(false);
    }
  };

  // Get status color for chips
  const getStatusColor = (status: string) => {
    switch (status) {
      case '대기중': return 'default';
      case '사용중': return 'success';
      case '수리중': return 'warning';
      case '폐기': return 'error';
      default: return 'default';
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case '사용중': return 'success';
      case '반납완료': return 'default';
      case '분실': return 'error';
      case '손상': return 'warning';
      default: return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '정보 없음';
    return `₩${price.toLocaleString()}`;
  };

  if (!hardware) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100vh' : '600px',
          maxHeight: isMobile ? '100vh' : '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ComputerIcon color="primary" />
          <Box>
            <Typography variant="h6" component="div">
              하드웨어 상세 정보
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {hardware.id} - {hardware.type}
            </Typography>
          </Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ 
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InventoryIcon color="primary" />
                <Typography variant="h6">기본 정보</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">자산 번호</Typography>
                <Typography variant="body1" fontWeight="bold">{hardware.id}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">하드웨어 유형</Typography>
                <Typography variant="body1">{hardware.type}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">제조사</Typography>
                <Typography variant="body1">{hardware.manufacturer}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">모델명</Typography>
                <Typography variant="body1">{hardware.model}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">시리얼 번호</Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {hardware.serial_number}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">상태</Typography>
                <Chip 
                  label={hardware.status} 
                  color={getStatusColor(hardware.status)} 
                  size="small" 
                />
              </Box>
            </Paper>
          </Grid>

          {/* Financial & Assignment Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PriceIcon color="primary" />
                <Typography variant="h6">구매 및 할당 정보</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">구매일자</Typography>
                <Typography variant="body1">
                  {hardware.purchase_date ? formatDate(hardware.purchase_date) : '정보 없음'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">구매가격</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formatPrice(hardware.price)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">현재 사용자</Typography>
                {hardware.assignedEmployeeName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="success" />
                    <Typography variant="body1">{hardware.assignedEmployeeName}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    미할당
                  </Typography>
                )}
              </Box>

              {hardware.assignmentDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">할당일자</Typography>
                  <Typography variant="body1">
                    {formatDate(hardware.assignmentDate)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">등록일자</Typography>
                <Typography variant="body1">
                  {hardware.created_at ? formatDate(hardware.created_at) : '정보 없음'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Notes */}
          {hardware.notes && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BuildIcon color="primary" />
                  <Typography variant="h6">메모</Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {hardware.notes}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Assignment History */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AssignmentIcon color="primary" />
                <Typography variant="h6">할당 이력</Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : assignments.length === 0 ? (
                <Alert severity="info">
                  이 하드웨어에 대한 할당 이력이 없습니다.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>사용자</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>할당일</TableCell>
                        <TableCell>반납일</TableCell>
                        <TableCell>메모</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" />
                              {assignment.employee_name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.status} 
                              color={getAssignmentStatusColor(assignment.status)}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(assignment.assigned_date)}
                          </TableCell>
                          <TableCell>
                            {assignment.returned_date 
                              ? formatDate(assignment.returned_date) 
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {assignment.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Custom hook for managing hardware detail modal state
export function useHardwareDetailModal() {
  const [open, setOpen] = useState(false);
  const [hardware, setHardware] = useState<HardwareWithAssignee | null>(null);

  const openModal = (hardwareToView: HardwareWithAssignee) => {
    setHardware(hardwareToView);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setHardware(null);
  };

  return {
    open,
    hardware,
    openModal,
    closeModal,
  };
}