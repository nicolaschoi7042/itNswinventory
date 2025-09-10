/**
 * Assignment Status Filter Component
 *
 * Advanced status filtering with visual indicators, status transitions,
 * and intelligent filtering options.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  Stack,
  Tooltip,
  LinearProgress,
  Badge,
  IconButton,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Assignment as ReturnedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Error as LostIcon,
  Build as DamagedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentStatus,
  AssignmentFilters,
} from '@/types/assignment';

import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
} from '@/constants/assignment';

import {
  getAssignmentStatusInfo,
  isOverdueAssignment,
} from '@/utils/assignment.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface StatusDistribution {
  status: AssignmentStatus;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface StatusFilterProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  selectedStatuses: AssignmentStatus[];
  onStatusChange: (statuses: AssignmentStatus[]) => void;
  variant?: 'compact' | 'standard' | 'detailed';
  showDistribution?: boolean;
  showOverdueFilter?: boolean;
  allowMultiple?: boolean;
  title?: string;
}

interface StatusGroup {
  id: string;
  name: string;
  statuses: AssignmentStatus[];
  color: string;
  description: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const STATUS_ICONS: Record<AssignmentStatus, React.ReactNode> = {
  사용중: <ActiveIcon />,
  반납완료: <ReturnedIcon />,
  대기중: <PendingIcon />,
  연체: <OverdueIcon />,
  분실: <LostIcon />,
  손상: <DamagedIcon />,
};

const STATUS_DESCRIPTIONS: Record<AssignmentStatus, string> = {
  사용중: '현재 직원에게 할당되어 사용 중인 자산',
  반납완료: '사용이 완료되어 반납된 자산',
  대기중: '할당 대기 중이거나 설치 준비 중인 자산',
  연체: '반납 예정일이 지난 자산',
  분실: '분실 신고된 자산',
  손상: '손상되어 수리가 필요한 자산',
};

const STATUS_GROUPS: StatusGroup[] = [
  {
    id: 'active',
    name: '활성 상태',
    statuses: ['사용중', '대기중'],
    color: 'success',
    description: '현재 활성화된 할당',
  },
  {
    id: 'completed',
    name: '완료 상태',
    statuses: ['반납완료'],
    color: 'info',
    description: '완료된 할당',
  },
  {
    id: 'issues',
    name: '문제 상태',
    statuses: ['연체', '분실', '손상'],
    color: 'error',
    description: '문제가 있는 할당',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateStatusDistribution = (
  assignments: (Assignment | AssignmentWithDetails)[]
): StatusDistribution[] => {
  const total = assignments.length;
  const statusCounts = new Map<AssignmentStatus, number>();

  // Initialize counts
  Object.values(ASSIGNMENT_STATUSES).forEach(status => {
    statusCounts.set(status, 0);
  });

  // Count assignments by status
  assignments.forEach(assignment => {
    const current = statusCounts.get(assignment.status) || 0;
    statusCounts.set(assignment.status, current + 1);
  });

  // Create distribution array
  return Object.values(ASSIGNMENT_STATUSES).map(status => {
    const count = statusCounts.get(status) || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return {
      status,
      count,
      percentage,
      color: ASSIGNMENT_STATUS_COLORS[status],
      icon: STATUS_ICONS[status],
      description: STATUS_DESCRIPTIONS[status],
    };
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StatusFilter({
  assignments,
  selectedStatuses,
  onStatusChange,
  variant = 'standard',
  showDistribution = true,
  showOverdueFilter = true,
  allowMultiple = true,
  title = '상태 필터',
}: StatusFilterProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(variant === 'detailed');
  const [filterMode, setFilterMode] = useState<'individual' | 'groups'>(
    'individual'
  );

  // Calculate status distribution
  const statusDistribution = useMemo(
    () => calculateStatusDistribution(assignments),
    [assignments]
  );

  // Handle status selection
  const handleStatusToggle = useCallback(
    (status: AssignmentStatus) => {
      if (allowMultiple) {
        const newStatuses = selectedStatuses.includes(status)
          ? selectedStatuses.filter(s => s !== status)
          : [...selectedStatuses, status];
        onStatusChange(newStatuses);
      } else {
        onStatusChange(selectedStatuses.includes(status) ? [] : [status]);
      }
    },
    [selectedStatuses, onStatusChange, allowMultiple]
  );

  // Handle group selection
  const handleGroupSelect = useCallback(
    (group: StatusGroup) => {
      const groupStatuses = group.statuses;
      const allSelected = groupStatuses.every(status =>
        selectedStatuses.includes(status)
      );

      if (allSelected) {
        // Remove all group statuses
        const newStatuses = selectedStatuses.filter(
          status => !groupStatuses.includes(status)
        );
        onStatusChange(newStatuses);
      } else {
        // Add all group statuses
        const newStatuses = [
          ...new Set([...selectedStatuses, ...groupStatuses]),
        ];
        onStatusChange(newStatuses);
      }
    },
    [selectedStatuses, onStatusChange]
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onStatusChange([]);
  }, [onStatusChange]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    onStatusChange(Object.values(ASSIGNMENT_STATUSES));
  }, [onStatusChange]);

  // Compact variant
  if (variant === 'compact') {
    return (
      <Box
        sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Typography variant='caption' color='text.secondary'>
          상태:
        </Typography>
        {statusDistribution
          .filter(dist => dist.count > 0)
          .map(dist => (
            <Chip
              key={dist.status}
              icon={dist.icon}
              label={`${ASSIGNMENT_STATUS_LABELS[dist.status]} (${dist.count})`}
              variant={
                selectedStatuses.includes(dist.status) ? 'filled' : 'outlined'
              }
              color={
                selectedStatuses.includes(dist.status)
                  ? (dist.color as any)
                  : 'default'
              }
              size='small'
              onClick={() => handleStatusToggle(dist.status)}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(
                    theme.palette[dist.color as keyof typeof theme.palette]
                      ?.main || theme.palette.primary.main,
                    0.1
                  ),
                },
              }}
            />
          ))}
        {selectedStatuses.length > 0 && (
          <IconButton size='small' onClick={handleClearAll}>
            <ClearIcon fontSize='small' />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography
            variant='h6'
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon color='primary' />
            {title}
            {selectedStatuses.length > 0 && (
              <Badge badgeContent={selectedStatuses.length} color='primary' />
            )}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedStatuses.length > 0 && (
              <Button
                size='small'
                onClick={handleClearAll}
                startIcon={<ClearIcon />}
              >
                초기화
              </Button>
            )}

            <IconButton size='small' onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Status Distribution Overview */}
        {showDistribution && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='subtitle2' gutterBottom>
              상태 분포
            </Typography>
            <Stack spacing={1}>
              {statusDistribution
                .filter(dist => dist.count > 0)
                .map(dist => (
                  <Box key={dist.status}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {dist.icon}
                        <Typography variant='body2'>
                          {ASSIGNMENT_STATUS_LABELS[dist.status]}
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {dist.count}개 ({dist.percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={dist.percentage}
                      color={dist.color as any}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
            </Stack>
          </Box>
        )}

        {/* Quick Actions */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size='small'
            variant='outlined'
            onClick={handleSelectAll}
            disabled={
              selectedStatuses.length ===
              Object.values(ASSIGNMENT_STATUSES).length
            }
          >
            전체 선택
          </Button>
          <Button
            size='small'
            variant='outlined'
            onClick={handleClearAll}
            disabled={selectedStatuses.length === 0}
          >
            전체 해제
          </Button>
        </Box>

        {/* Filter Mode Toggle */}
        <Collapse in={expanded}>
          <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
              value={filterMode}
              exclusive
              onChange={(_, value) => value && setFilterMode(value)}
              size='small'
            >
              <ToggleButton value='individual'>개별 선택</ToggleButton>
              <ToggleButton value='groups'>그룹 선택</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Individual Status Selection */}
          {filterMode === 'individual' && (
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                상태별 선택
              </Typography>
              <Stack spacing={2}>
                {statusDistribution.map(dist => (
                  <Box
                    key={dist.status}
                    onClick={() => handleStatusToggle(dist.status)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      backgroundColor: selectedStatuses.includes(dist.status)
                        ? alpha(
                            theme.palette[
                              dist.color as keyof typeof theme.palette
                            ]?.main || theme.palette.primary.main,
                            0.1
                          )
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(
                          theme.palette[
                            dist.color as keyof typeof theme.palette
                          ]?.main || theme.palette.primary.main,
                          0.05
                        ),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={selectedStatuses.includes(dist.status)}
                        color={dist.color as any}
                        onChange={() => handleStatusToggle(dist.status)}
                        onClick={e => e.stopPropagation()}
                      />
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {dist.icon}
                        <Box>
                          <Typography variant='body2' fontWeight='medium'>
                            {ASSIGNMENT_STATUS_LABELS[dist.status]}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {dist.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant='h6' color={`${dist.color}.main`}>
                        {dist.count}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {dist.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Group Selection */}
          {filterMode === 'groups' && (
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                그룹별 선택
              </Typography>
              <Stack spacing={2}>
                {STATUS_GROUPS.map(group => {
                  const groupStatuses = group.statuses;
                  const allSelected = groupStatuses.every(status =>
                    selectedStatuses.includes(status)
                  );
                  const someSelected = groupStatuses.some(status =>
                    selectedStatuses.includes(status)
                  );
                  const groupCount = groupStatuses.reduce((sum, status) => {
                    const dist = statusDistribution.find(
                      d => d.status === status
                    );
                    return sum + (dist?.count || 0);
                  }, 0);

                  return (
                    <Card
                      key={group.id}
                      variant='outlined'
                      onClick={() => handleGroupSelect(group)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: allSelected
                          ? alpha(
                              theme.palette[
                                group.color as keyof typeof theme.palette
                              ]?.main || theme.palette.primary.main,
                              0.1
                            )
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette[
                              group.color as keyof typeof theme.palette
                            ]?.main || theme.palette.primary.main,
                            0.05
                          ),
                        },
                      }}
                    >
                      <CardContent sx={{ py: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected && !allSelected}
                              color={group.color as any}
                              onChange={() => handleGroupSelect(group)}
                              onClick={e => e.stopPropagation()}
                            />
                            <Box>
                              <Typography variant='body2' fontWeight='medium'>
                                {group.name}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {group.description}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant='h6'
                              color={`${group.color}.main`}
                            >
                              {groupCount}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {groupStatuses.map(status => {
                                const dist = statusDistribution.find(
                                  d => d.status === status
                                );
                                return dist && dist.count > 0 ? (
                                  <Chip
                                    key={status}
                                    label={dist.count}
                                    size='small'
                                    color={dist.color as any}
                                    variant='outlined'
                                    sx={{
                                      minWidth: 'auto',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                ) : null;
                              })}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Overdue Filter */}
          {showOverdueFilter && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant='subtitle2' gutterBottom>
                특수 필터
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStatuses.includes('연체')}
                    onChange={() => handleStatusToggle('연체')}
                    color='error'
                  />
                }
                label={
                  <Box>
                    <Typography variant='body2'>연체된 할당만 표시</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      반납 예정일이 지난 할당을 표시합니다
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
        </Collapse>

        {/* Applied Filters Summary */}
        {selectedStatuses.length > 0 && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'
            >
              적용된 필터 ({selectedStatuses.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {selectedStatuses.map(status => {
                const dist = statusDistribution.find(d => d.status === status);
                return (
                  <Chip
                    key={status}
                    icon={STATUS_ICONS[status]}
                    label={`${ASSIGNMENT_STATUS_LABELS[status]} (${dist?.count || 0})`}
                    onDelete={() => handleStatusToggle(status)}
                    color={dist?.color as any}
                    size='small'
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// STATUS TIMELINE COMPONENT
// ============================================================================

interface StatusTimelineProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  selectedStatuses: AssignmentStatus[];
  onStatusChange: (statuses: AssignmentStatus[]) => void;
}

export function StatusTimeline({
  assignments,
  selectedStatuses,
  onStatusChange,
}: StatusTimelineProps) {
  const theme = useTheme();

  // Calculate status transitions over time
  const statusTransitions = useMemo(() => {
    // This would analyze assignment history to show status changes over time
    // For now, we'll show current distribution
    return calculateStatusDistribution(assignments);
  }, [assignments]);

  return (
    <Card>
      <CardContent>
        <Typography
          variant='h6'
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <TimelineIcon color='primary' />
          상태 변화 추이
        </Typography>

        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'end',
            gap: 1,
            mt: 2,
          }}
        >
          {statusTransitions.map((dist, index) => (
            <Tooltip
              key={dist.status}
              title={`${ASSIGNMENT_STATUS_LABELS[dist.status]}: ${dist.count}개 (${dist.percentage.toFixed(1)}%)`}
            >
              <Box
                onClick={() => {
                  const newStatuses = selectedStatuses.includes(dist.status)
                    ? selectedStatuses.filter(s => s !== dist.status)
                    : [...selectedStatuses, dist.status];
                  onStatusChange(newStatuses);
                }}
                sx={{
                  flexGrow: 1,
                  height: `${Math.max(dist.percentage, 5)}%`,
                  backgroundColor: selectedStatuses.includes(dist.status)
                    ? theme.palette[dist.color as keyof typeof theme.palette]
                        ?.main
                    : alpha(
                        theme.palette[dist.color as keyof typeof theme.palette]
                          ?.main || theme.palette.primary.main,
                        0.3
                      ),
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor:
                      theme.palette[dist.color as keyof typeof theme.palette]
                        ?.main,
                    transform: 'translateY(-2px)',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {statusTransitions.map(dist => (
            <Box key={dist.status} sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant='caption' color='text.secondary'>
                {ASSIGNMENT_STATUS_LABELS[dist.status]}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StatusFilter;
