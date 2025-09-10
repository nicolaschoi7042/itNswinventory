/**
 * Filter Panel Component
 *
 * Collapsible side panel with comprehensive filtering options
 * for assignments with visual feedback and filter management.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Computer as ComputerIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentFilters,
  AssignmentStatus,
} from '@/types/assignment';

import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
} from '@/constants/assignment';

import { applyAssignmentFilters, formatDate } from '@/utils/assignment.utils';

// Import advanced StatusFilter component
import { StatusFilter } from '@/components/filters/StatusFilter';

// ============================================================================
// INTERFACES
// ============================================================================

interface FilterPanelProps {
  open: boolean;
  assignments: (Assignment | AssignmentWithDetails)[];
  filters: AssignmentFilters;
  onClose: () => void;
  onFiltersChange: (filters: AssignmentFilters) => void;
  onApplyFilters?: () => void;
}

interface FilterGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  filters: (keyof AssignmentFilters)[];
  expanded?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getUniqueValues = (
  assignments: (Assignment | AssignmentWithDetails)[],
  extractor: (
    assignment: Assignment | AssignmentWithDetails
  ) => string | undefined
): Array<{ value: string; count: number }> => {
  const valueMap = new Map<string, number>();

  assignments.forEach(assignment => {
    const value = extractor(assignment);
    if (value) {
      valueMap.set(value, (valueMap.get(value) || 0) + 1);
    }
  });

  return Array.from(valueMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
};

// ============================================================================
// FILTER GROUPS CONFIGURATION
// ============================================================================

const filterGroups: FilterGroup[] = [
  {
    id: 'basic',
    title: '기본 필터',
    icon: <FilterIcon />,
    filters: ['asset_type', 'status'],
    expanded: true,
  },
  {
    id: 'people',
    title: '직원 및 부서',
    icon: <PersonIcon />,
    filters: ['employee_id', 'department'],
  },
  {
    id: 'assets',
    title: '자산 정보',
    icon: <ComputerIcon />,
    filters: ['asset_id', 'manufacturer'],
  },
  {
    id: 'dates',
    title: '날짜 범위',
    icon: <CalendarIcon />,
    filters: [
      'assigned_date_from',
      'assigned_date_to',
      'return_date_from',
      'return_date_to',
    ],
  },
  {
    id: 'advanced',
    title: '고급 옵션',
    icon: <TrendingUpIcon />,
    filters: ['overdue'],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FilterPanel({
  open,
  assignments,
  filters,
  onClose,
  onFiltersChange,
  onApplyFilters,
}: FilterPanelProps) {
  const theme = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.filter(g => g.expanded).map(g => g.id))
  );

  // Extract unique values with counts
  const uniqueEmployees = useMemo(
    () => getUniqueValues(assignments, a => a.employee_name),
    [assignments]
  );

  const uniqueDepartments = useMemo(
    () =>
      getUniqueValues(assignments, a =>
        'employee' in a && a.employee ? a.employee.department : undefined
      ),
    [assignments]
  );

  const uniqueAssetIds = useMemo(
    () => getUniqueValues(assignments, a => a.asset_id),
    [assignments]
  );

  const uniqueManufacturers = useMemo(
    () =>
      getUniqueValues(assignments, a =>
        'asset' in a && a.asset ? a.asset.manufacturer : undefined
      ),
    [assignments]
  );

  // Status distribution
  const statusDistribution = useMemo(() => {
    const distribution = new Map<AssignmentStatus, number>();
    Object.values(ASSIGNMENT_STATUSES).forEach(status => {
      distribution.set(status, 0);
    });

    assignments.forEach(assignment => {
      const current = distribution.get(assignment.status) || 0;
      distribution.set(assignment.status, current + 1);
    });

    return distribution;
  }, [assignments]);

  // Asset type distribution
  const assetTypeDistribution = useMemo(() => {
    const hardware = assignments.filter(
      a => a.asset_type === 'hardware'
    ).length;
    const software = assignments.filter(
      a => a.asset_type === 'software'
    ).length;
    return { hardware, software };
  }, [assignments]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== '' && value !== null
    ).length;
  }, [filters]);

  // Result count with current filters
  const resultCount = useMemo(() => {
    return applyAssignmentFilters(assignments, filters).length;
  }, [assignments, filters]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: keyof AssignmentFilters, value: any) => {
      const newFilters = {
        ...filters,
        [key]: value || undefined,
      };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Toggle filter group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  // Render filter input based on type
  const renderFilterInput = (filterKey: keyof AssignmentFilters) => {
    switch (filterKey) {
      case 'asset_type':
        return (
          <FormControl fullWidth size='small'>
            <InputLabel>자산 유형</InputLabel>
            <Select
              value={filters.asset_type || ''}
              onChange={e => handleFilterChange('asset_type', e.target.value)}
              label='자산 유형'
            >
              <MenuItem value=''>
                <em>전체</em>
              </MenuItem>
              <MenuItem value='hardware'>
                하드웨어 ({assetTypeDistribution.hardware})
              </MenuItem>
              <MenuItem value='software'>
                소프트웨어 ({assetTypeDistribution.software})
              </MenuItem>
            </Select>
          </FormControl>
        );

      case 'status':
        return (
          <StatusFilter
            assignments={assignments}
            selectedStatuses={
              Array.isArray(filters.status)
                ? filters.status
                : filters.status
                  ? [filters.status]
                  : []
            }
            onStatusChange={statuses => {
              handleFilterChange(
                'status',
                statuses.length === 0 ? undefined : statuses
              );
            }}
            variant='detailed'
            showDistribution={true}
            showOverdueFilter={false}
            allowMultiple={true}
            title='상태'
          />
        );

      case 'employee_id':
        return (
          <Autocomplete
            size='small'
            options={uniqueEmployees}
            getOptionLabel={option => option.value}
            value={
              uniqueEmployees.find(emp => emp.value === filters.employee_id) ||
              null
            }
            onChange={(_, value) =>
              handleFilterChange('employee_id', value?.value)
            }
            renderInput={params => <TextField {...params} label='직원' />}
            renderOption={(props, option) => (
              <Box component='li' {...props}>
                <PersonIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                <Box>
                  <Typography variant='body2'>{option.value}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {option.count}개 할당
                  </Typography>
                </Box>
              </Box>
            )}
          />
        );

      case 'department':
        return (
          <Autocomplete
            size='small'
            options={uniqueDepartments}
            getOptionLabel={option => option.value}
            value={
              uniqueDepartments.find(
                dept => dept.value === filters.department
              ) || null
            }
            onChange={(_, value) =>
              handleFilterChange('department', value?.value)
            }
            renderInput={params => <TextField {...params} label='부서' />}
            renderOption={(props, option) => (
              <Box component='li' {...props}>
                <BusinessIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                <Box>
                  <Typography variant='body2'>{option.value}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {option.count}명
                  </Typography>
                </Box>
              </Box>
            )}
          />
        );

      case 'asset_id':
        return (
          <Autocomplete
            size='small'
            options={uniqueAssetIds}
            getOptionLabel={option => option.value}
            value={
              uniqueAssetIds.find(asset => asset.value === filters.asset_id) ||
              null
            }
            onChange={(_, value) =>
              handleFilterChange('asset_id', value?.value)
            }
            renderInput={params => <TextField {...params} label='자산 ID' />}
            renderOption={(props, option) => (
              <Box component='li' {...props}>
                <ComputerIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                <Box>
                  <Typography variant='body2'>{option.value}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {option.count}개 할당
                  </Typography>
                </Box>
              </Box>
            )}
          />
        );

      case 'manufacturer':
        return (
          <Autocomplete
            size='small'
            options={uniqueManufacturers}
            getOptionLabel={option => option.value}
            value={
              uniqueManufacturers.find(
                mfg => mfg.value === filters.manufacturer
              ) || null
            }
            onChange={(_, value) =>
              handleFilterChange('manufacturer', value?.value)
            }
            renderInput={params => <TextField {...params} label='제조사' />}
            renderOption={(props, option) => (
              <Box component='li' {...props}>
                <Typography variant='body2'>{option.value}</Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ ml: 1 }}
                >
                  ({option.count})
                </Typography>
              </Box>
            )}
          />
        );

      case 'assigned_date_from':
        return (
          <DatePicker
            label='할당일 시작'
            value={
              filters.assigned_date_from
                ? new Date(filters.assigned_date_from)
                : null
            }
            onChange={date =>
              handleFilterChange(
                'assigned_date_from',
                date?.toISOString().split('T')[0]
              )
            }
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        );

      case 'assigned_date_to':
        return (
          <DatePicker
            label='할당일 종료'
            value={
              filters.assigned_date_to
                ? new Date(filters.assigned_date_to)
                : null
            }
            onChange={date =>
              handleFilterChange(
                'assigned_date_to',
                date?.toISOString().split('T')[0]
              )
            }
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        );

      case 'return_date_from':
        return (
          <DatePicker
            label='반납일 시작'
            value={
              filters.return_date_from
                ? new Date(filters.return_date_from)
                : null
            }
            onChange={date =>
              handleFilterChange(
                'return_date_from',
                date?.toISOString().split('T')[0]
              )
            }
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        );

      case 'return_date_to':
        return (
          <DatePicker
            label='반납일 종료'
            value={
              filters.return_date_to ? new Date(filters.return_date_to) : null
            }
            onChange={date =>
              handleFilterChange(
                'return_date_to',
                date?.toISOString().split('T')[0]
              )
            }
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        );

      case 'overdue':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={filters.overdue === true}
                onChange={e =>
                  handleFilterChange(
                    'overdue',
                    e.target.checked ? true : undefined
                  )
                }
              />
            }
            label='연체된 할당만 표시'
          />
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant='h6'
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon color='primary' />
            필터
            {activeFilterCount > 0 && (
              <Badge badgeContent={activeFilterCount} color='primary' />
            )}
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Result Summary */}
        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>{resultCount}개</strong> / {assignments.length}개 결과
          </Typography>
        </Box>

        {/* Filter Groups */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={2}>
            {filterGroups.map(group => {
              const isExpanded = expandedGroups.has(group.id);
              const hasActiveFilters = group.filters.some(
                filter =>
                  filters[filter] !== undefined && filters[filter] !== ''
              );

              return (
                <Card key={group.id} variant='outlined'>
                  <CardContent sx={{ pb: isExpanded ? 2 : 1 }}>
                    <Box
                      onClick={() => toggleGroup(group.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        mb: isExpanded ? 2 : 0,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {group.icon}
                        {group.title}
                        {hasActiveFilters && (
                          <CheckCircleIcon fontSize='small' color='primary' />
                        )}
                      </Typography>
                    </Box>

                    {isExpanded && (
                      <Stack spacing={2}>
                        {group.filters.map(filterKey => (
                          <Box key={filterKey}>
                            {renderFilterInput(filterKey)}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            variant='outlined'
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={activeFilterCount === 0}
            fullWidth
          >
            초기화
          </Button>

          {onApplyFilters && (
            <Button
              variant='contained'
              startIcon={<CheckCircleIcon />}
              onClick={onApplyFilters}
              fullWidth
            >
              적용
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FilterPanel;
