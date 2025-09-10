/**
 * Assignment Detail Modal Component
 * 
 * Comprehensive modal for displaying detailed assignment information
 * with enhanced employee and asset displays.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Notes as NotesIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Undo as ReturnIcon
} from '@mui/icons-material';

// Import types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentStatus
} from '@/types/assignment';

import {
  formatDate,
  formatAssignmentDuration,
  getAssignmentStatusInfo
} from '@/utils/assignment.utils';

// Import enhanced display components
import { EmployeeInfoDisplay } from '@/components/display/EmployeeInfoDisplay';
import { AssetInfoDisplay } from '@/components/display/AssetInfoDisplay';
import { StatusIndicator, DurationVisualization } from '@/components/visualization/StatusVisualization';

// Import role guards
import { AdminGuard, ManagerGuard } from '@/components/guards/RoleGuards';

// ============================================================================
// INTERFACES
// ============================================================================

interface AssignmentDetailModalProps {
  open: boolean;
  assignment: AssignmentWithDetails | null;
  onClose: () => void;
  onEdit?: (assignment: AssignmentWithDetails) => void;
  onReturn?: (assignment: AssignmentWithDetails) => void;
  onDelete?: (assignment: AssignmentWithDetails) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentDetailModal({
  open,
  assignment,
  onClose,
  onEdit,
  onReturn,
  onDelete
}: AssignmentDetailModalProps) {
  const theme = useTheme();

  if (!assignment) return null;

  const statusInfo = getAssignmentStatusInfo(assignment.status);
  const canReturn = assignment.status === '사용중';
  const canEdit = assignment.status !== '반납완료';

  // Prepare employee information
  const employeeInfo = assignment.employee ? {
    id: assignment.employee.id,
    name: assignment.employee.name,
    department: assignment.employee.department,
    position: assignment.employee.position,
    email: assignment.employee.email
  } : {
    id: assignment.employee_id,
    name: assignment.employee_name,
    department: '부서 정보 없음',
    position: '직책 정보 없음'
  };

  // Prepare asset information
  const assetInfo = assignment.asset ? {
    id: assignment.asset.id,
    name: assignment.asset.name,
    type: assignment.asset.type,
    manufacturer: assignment.asset.manufacturer,
    model: assignment.asset.model,
    serial_number: assignment.asset.serial_number,
    status: 'assigned' as const
  } : {
    id: assignment.asset_id,
    name: assignment.asset_description || assignment.asset_id,
    type: assignment.asset_type === 'hardware' ? 'Hardware' : 'Software',
    manufacturer: '',
    model: '',
    status: 'assigned' as const
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
        }
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6">
            할당 상세 정보
          </Typography>
          <StatusIndicator 
            status={assignment.status} 
            size="small" 
            variant="detailed"
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Assignment Overview */}
          <Grid item xs={12}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" />
                  할당 개요
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          할당일
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(assignment.assigned_date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HistoryIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          사용 기간
                        </Typography>
                        <DurationVisualization 
                          assignment={assignment}
                          showProgress={true}
                          showCategory={true}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {assignment.return_date && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarIcon fontSize="small" color="success" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            반납일
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="success.main">
                            {formatDate(assignment.return_date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          할당자
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.assigned_by}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      할당 ID
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                      {assignment.id}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Employee Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  직원 정보
                </Typography>
                
                <EmployeeInfoDisplay
                  employee={employeeInfo}
                  variant="detailed"
                  size="large"
                  showContact={true}
                  showDepartment={true}
                  showPosition={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Asset Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon color="primary" />
                  자산 정보
                </Typography>
                
                <AssetInfoDisplay
                  asset={assetInfo}
                  assetType={assignment.asset_type}
                  variant="detailed"
                  size="large"
                  showSpecifications={true}
                  showStatus={true}
                  showWarranty={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Notes and Additional Information */}
          {assignment.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotesIcon color="primary" />
                    메모
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    p: 2, 
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    {assignment.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Assignment History/Timeline */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" />
                  할당 이력
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Created */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main' 
                    }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        할당 생성
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(assignment.created_at)} • {assignment.assigned_by}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Last Updated */}
                  {assignment.updated_at !== assignment.created_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'warning.main' 
                      }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          정보 수정
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(assignment.updated_at)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Returned */}
                  {assignment.return_date && assignment.returned_by && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main' 
                      }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          자산 반납
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(assignment.return_date)} • {assignment.returned_by}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 1 
      }}>
        <Button onClick={onClose} color="inherit">
          닫기
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <ManagerGuard>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(assignment)}
            >
              수정
            </Button>
          )}
          
          {canReturn && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReturnIcon />}
              onClick={() => onReturn?.(assignment)}
            >
              반납 처리
            </Button>
          )}
        </ManagerGuard>
        
        <AdminGuard>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete?.(assignment)}
          >
            삭제
          </Button>
        </AdminGuard>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentDetailModal;