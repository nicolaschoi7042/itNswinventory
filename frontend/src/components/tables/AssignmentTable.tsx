/**
 * Assignment Data Table Component
 * 
 * Displays assignment data with sorting, pagination, filtering, and status visualization.
 * Supports both basic Assignment and detailed AssignmentWithDetails data.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  LinearProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  useTheme,
  alpha,
  Badge,
  Divider,
  Fade
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Undo as ReturnIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  Apps as AppsIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentStatus,
  AssetType
} from '@/types/assignment';

import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  ASSET_TYPE_LABELS,
  ASSIGNMENT_UI_CONFIG
} from '@/constants/assignment';

import {
  formatDate,
  formatAssignmentDuration,
  getDurationColor,
  getAssignmentStatusInfo,
  sortAssignments
} from '@/utils/assignment.utils';

// Role guards
import { AdminGuard, ManagerGuard } from '@/components/guards/RoleGuards';

// Enhanced display components
import { EmployeeInfoDisplay } from '@/components/display/EmployeeInfoDisplay';
import { AssetInfoDisplay } from '@/components/display/AssetInfoDisplay';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AssignmentTableColumn {
  id: keyof Assignment | 'actions' | 'duration' | 'employee' | 'asset';
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, assignment: Assignment | AssignmentWithDetails) => React.ReactNode;
}

interface AssignmentTableProps {
  /** Assignment data to display */
  assignments: (Assignment | AssignmentWithDetails)[];
  /** Loading state */
  loading?: boolean;
  /** Total count for pagination */
  totalCount?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Current sort field */
  sortBy?: keyof Assignment;
  /** Current sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Show pagination controls */
  showPagination?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected assignment IDs */
  selectedIds?: string[];
  /** Custom columns configuration */
  columns?: AssignmentTableColumn[];
  /** Event handlers */
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortBy: keyof Assignment, sortOrder: 'asc' | 'desc') => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onViewAssignment?: (assignment: Assignment | AssignmentWithDetails) => void;
  onEditAssignment?: (assignment: Assignment | AssignmentWithDetails) => void;
  onDeleteAssignment?: (assignment: Assignment | AssignmentWithDetails) => void;
  onReturnAsset?: (assignment: Assignment | AssignmentWithDetails) => void;
}

// ============================================================================
// DEFAULT COLUMNS CONFIGURATION
// ============================================================================

const createDefaultColumns = (
  onViewAssignment?: (assignment: Assignment | AssignmentWithDetails) => void,
  onEditAssignment?: (assignment: Assignment | AssignmentWithDetails) => void,
  onDeleteAssignment?: (assignment: Assignment | AssignmentWithDetails) => void,
  onReturnAsset?: (assignment: Assignment | AssignmentWithDetails) => void
): AssignmentTableColumn[] => [
  {
    id: 'assigned_date',
    label: '할당일',
    minWidth: 120,
    sortable: true,
    render: (value: string) => (
      <Typography variant="body2">
        {formatDate(value)}
      </Typography>
    )
  },
  {
    id: 'employee',
    label: '직원',
    minWidth: 180,
    render: (_, assignment) => {
      const employeeInfo = 'employee' in assignment && assignment.employee ? {
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

      return (
        <EmployeeInfoDisplay
          employee={employeeInfo}
          variant="compact"
          size="small"
          showDepartment={true}
          showPosition={false}
          showContact={false}
        />
      );
    }
  },
  {
    id: 'asset',
    label: '자산',
    minWidth: 220,
    render: (_, assignment) => {
      const assetInfo = 'asset' in assignment && assignment.asset ? {
        id: assignment.asset.id,
        name: assignment.asset.name,
        type: assignment.asset.type,
        manufacturer: assignment.asset.manufacturer,
        model: assignment.asset.model,
        serial_number: assignment.asset.serial_number
      } : {
        id: assignment.asset_id,
        name: assignment.asset_description || assignment.asset_id,
        type: assignment.asset_type === 'hardware' ? 'Hardware' : 'Software',
        manufacturer: '',
        model: ''
      };

      return (
        <AssetInfoDisplay
          asset={assetInfo}
          assetType={assignment.asset_type}
          variant="compact"
          size="small"
          showSpecifications={false}
          showStatus={false}
          showWarranty={false}
        />
      );
    }
  },
  {
    id: 'status',
    label: '상태',
    minWidth: 140,
    align: 'center',
    sortable: true,
    render: (value: AssignmentStatus, assignment) => {
      const statusInfo = getAssignmentStatusInfo(value);
      
      // Status icon based on status type
      const getStatusIcon = (status: AssignmentStatus) => {
        switch (status) {
          case '사용중':
            return <CheckCircleIcon sx={{ fontSize: 16 }} />;
          case '반납완료':
            return <CheckCircleIcon sx={{ fontSize: 16 }} />;
          case '대기중':
            return <ScheduleIcon sx={{ fontSize: 16 }} />;
          case '연체':
            return <WarningIcon sx={{ fontSize: 16 }} />;
          case '분실':
            return <ErrorIcon sx={{ fontSize: 16 }} />;
          case '손상':
            return <ErrorIcon sx={{ fontSize: 16 }} />;
          default:
            return <HelpIcon sx={{ fontSize: 16 }} />;
        }
      };
      
      // Enhanced status display with icon and additional info
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Chip
            icon={getStatusIcon(value)}
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            sx={{ 
              fontWeight: 'medium',
              '& .MuiChip-icon': {
                fontSize: 16
              }
            }}
          />
          {/* Additional status indicator for overdue items */}
          {value === '연체' && (
            <Typography variant="caption" color="error.main" sx={{ fontSize: '0.65rem' }}>
              즉시 반납 필요
            </Typography>
          )}
          {/* Status progress for active assignments */}
          {value === '사용중' && (
            <Box sx={{ width: '100%', mt: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={75} // This could be calculated based on expected return date
                color="success"
                sx={{ 
                  height: 3, 
                  borderRadius: 1,
                  backgroundColor: alpha(statusInfo.color === 'success' ? '#4caf50' : '#2196f3', 0.2)
                }}
              />
            </Box>
          )}
        </Box>
      );
    }
  },
  {
    id: 'duration',
    label: '사용 기간',
    minWidth: 140,
    align: 'center',
    render: (_, assignment) => {
      const duration = formatAssignmentDuration(assignment);
      const color = getDurationColor(assignment);
      
      // Calculate days for progress visualization
      const assignedDate = new Date(assignment.assigned_date);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Duration category for visualization
      const getDurationCategory = (days: number) => {
        if (days <= 30) return { label: '단기', progress: (days / 30) * 100, color: 'success' };
        if (days <= 90) return { label: '중기', progress: ((days - 30) / 60) * 100, color: 'warning' };
        return { label: '장기', progress: 100, color: 'error' };
      };
      
      const durationCategory = getDurationCategory(daysDiff);
      
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
            label={duration}
            size="small"
            color={color}
            variant="outlined"
            sx={{
              '& .MuiChip-icon': {
                fontSize: 14
              }
            }}
          />
          {/* Duration visualization bar */}
          {assignment.status === '사용중' && (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {durationCategory.label} 사용
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(durationCategory.progress, 100)}
                color={durationCategory.color as any}
                sx={{ 
                  width: '100%',
                  height: 2, 
                  borderRadius: 1,
                  mt: 0.25
                }}
              />
            </Box>
          )}
        </Box>
      );
    }
  },
  {
    id: 'return_date',
    label: '반납일',
    minWidth: 120,
    sortable: true,
    render: (value: string) => (
      <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
        {value ? formatDate(value) : '-'}
      </Typography>
    )
  },
  {
    id: 'actions',
    label: '작업',
    minWidth: 160,
    align: 'center',
    render: (_, assignment) => (
      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Tooltip title="상세보기">
          <IconButton
            size="small"
            onClick={() => onViewAssignment?.(assignment)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <ManagerGuard>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={() => onEditAssignment?.(assignment)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {assignment.status === '사용중' && (
            <Tooltip title="반납">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onReturnAsset?.(assignment)}
              >
                <ReturnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </ManagerGuard>
        
        <AdminGuard>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteAssignment?.(assignment)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </AdminGuard>
      </Stack>
    )
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentTable({
  assignments,
  loading = false,
  totalCount,
  page = 1,
  pageSize = ASSIGNMENT_UI_CONFIG.TABLE.DEFAULT_PAGE_SIZE,
  sortBy = 'assigned_date',
  sortOrder = 'desc',
  showPagination = true,
  selectable = false,
  selectedIds = [],
  columns,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSelectionChange,
  onViewAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onReturnAsset
}: AssignmentTableProps) {
  const theme = useTheme();
  
  // Create columns configuration
  const tableColumns = useMemo(() => {
    return columns || createDefaultColumns(
      onViewAssignment,
      onEditAssignment,
      onDeleteAssignment,
      onReturnAsset
    );
  }, [columns, onViewAssignment, onEditAssignment, onDeleteAssignment, onReturnAsset]);

  // Handle sorting
  const handleSort = useCallback((column: AssignmentTableColumn) => {
    if (!column.sortable || !onSortChange) return;
    
    const newSortOrder = 
      sortBy === column.id && sortOrder === 'asc' ? 'desc' : 'asc';
    
    onSortChange(column.id as keyof Assignment, newSortOrder);
  }, [sortBy, sortOrder, onSortChange]);

  // Handle page change
  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    onPageChange?.(newPage);
  }, [onPageChange]);

  // Handle page size change
  const handlePageSizeChange = useCallback((event: any) => {
    onPageSizeChange?.(parseInt(event.target.value, 10));
  }, [onPageSizeChange]);

  // Calculate total pages
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1;

  // Empty state
  if (!loading && assignments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          할당된 자산이 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary">
          새로운 자산 할당을 만들어보세요.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Loading Progress */}
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1 
          }} 
        />
      )}

      {/* Table Container */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          position: 'relative',
          maxHeight: '70vh',
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }
        }}
      >
        <Table stickyHeader={ASSIGNMENT_UI_CONFIG.TABLE.STICKY_HEADER}>
          {/* Table Header */}
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                    fontWeight: 'bold',
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(column)}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {assignments.map((assignment, index) => {
              // Row styling based on status
              const getRowStyling = (assignment: Assignment | AssignmentWithDetails) => {
                const baseStyle = {
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  },
                  ...(selectable && selectedIds.includes(assignment.id) && {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  })
                };
                
                // Add status-specific styling
                switch (assignment.status) {
                  case '연체':
                    return {
                      ...baseStyle,
                      borderLeft: `4px solid ${theme.palette.error.main}`,
                      backgroundColor: alpha(theme.palette.error.main, 0.02)
                    };
                  case '분실':
                  case '손상':
                    return {
                      ...baseStyle,
                      borderLeft: `4px solid ${theme.palette.warning.main}`,
                      backgroundColor: alpha(theme.palette.warning.main, 0.02)
                    };
                  case '반납완료':
                    return {
                      ...baseStyle,
                      opacity: 0.8,
                      backgroundColor: alpha(theme.palette.success.main, 0.01)
                    };
                  default:
                    return baseStyle;
                }
              };
              
              return (
                <Fade in={true} timeout={300 + index * 50} key={assignment.id}>
                  <TableRow
                    hover
                    sx={getRowStyling(assignment)}
                  >
                    {tableColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{ py: 1.5 }}
                      >
                        {column.render 
                          ? column.render(assignment[column.id as keyof Assignment], assignment)
                          : assignment[column.id as keyof Assignment] || '-'
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                </Fade>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {showPagination && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          {/* Page Size Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              페이지당 항목 수:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                variant="outlined"
              >
                {ASSIGNMENT_UI_CONFIG.TABLE.PAGE_SIZE_OPTIONS.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Results Info */}
          <Typography variant="body2" color="text.secondary">
            {totalCount ? (
              `${((page - 1) * pageSize) + 1}-${Math.min(page * pageSize, totalCount)} / ${totalCount}개`
            ) : (
              `${assignments.length}개 항목`
            )}
          </Typography>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          )}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// ADDITIONAL COMPONENTS FOR SPECIFIC USE CASES
// ============================================================================

/**
 * Compact Assignment Table for dashboard or summary views
 */
export function CompactAssignmentTable({
  assignments,
  maxItems = 5,
  showActions = false,
  onViewAssignment
}: {
  assignments: (Assignment | AssignmentWithDetails)[];
  maxItems?: number;
  showActions?: boolean;
  onViewAssignment?: (assignment: Assignment | AssignmentWithDetails) => void;
}) {
  const displayItems = assignments.slice(0, maxItems);

  const compactColumns: AssignmentTableColumn[] = [
    {
      id: 'employee_name',
      label: '직원',
      render: (value: string) => (
        <Typography variant="body2" fontWeight="medium">
          {value}
        </Typography>
      )
    },
    {
      id: 'asset_id',
      label: '자산',
      render: (value: string, assignment) => (
        <Box>
          <Typography variant="body2">{value}</Typography>
          <Chip
            label={ASSET_TYPE_LABELS[assignment.asset_type]}
            size="small"
            variant="outlined"
          />
        </Box>
      )
    },
    {
      id: 'status',
      label: '상태',
      align: 'center',
      render: (value: AssignmentStatus) => {
        const statusInfo = getAssignmentStatusInfo(value);
        return (
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
        );
      }
    },
    ...(showActions ? [{
      id: 'actions' as const,
      label: '작업',
      align: 'center' as const,
      render: (_: any, assignment: Assignment | AssignmentWithDetails) => (
        <IconButton
          size="small"
          onClick={() => onViewAssignment?.(assignment)}
        >
          <ViewIcon fontSize="small" />
        </IconButton>
      )
    }] : [])
  ];

  return (
    <AssignmentTable
      assignments={displayItems}
      columns={compactColumns}
      showPagination={false}
      onViewAssignment={onViewAssignment}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentTable;

// Export types for external use
export type { AssignmentTableProps, AssignmentTableColumn };