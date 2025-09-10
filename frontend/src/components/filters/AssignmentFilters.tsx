/**
 * Assignment Filters Component
 *
 * Comprehensive filtering interface for assignments with multiple filter types,
 * quick filters, and filter management capabilities.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Chip,
  Button,
  IconButton,
  Collapse,
  Divider,
  Badge,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Bookmark as BookmarkIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Import assignment types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentFilters as IAssignmentFilters,
  AssignmentStatus,
} from '@/types/assignment';

import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_LABELS,
  ASSET_TYPE_LABELS,
} from '@/constants/assignment';

import { applyAssignmentFilters } from '@/utils/assignment.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  filters: IAssignmentFilters;
  color?: string;
}

interface AssignmentFiltersProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  filters: IAssignmentFilters;
  onFiltersChange: (filters: IAssignmentFilters) => void;
  showQuickFilters?: boolean;
  showAdvancedFilters?: boolean;
  variant?: 'compact' | 'standard' | 'expanded';
  onAdvancedSearch?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getUniqueValues = (
  assignments: (Assignment | AssignmentWithDetails)[],
  extractor: (
    assignment: Assignment | AssignmentWithDetails
  ) => string | undefined
): string[] => {
  const values = assignments
    .map(extractor)
    .filter((value): value is string => Boolean(value))
    .filter((value, index, array) => array.indexOf(value) === index);

  return values.sort();
};

const getFilterResultCount = (
  assignments: (Assignment | AssignmentWithDetails)[],
  filters: IAssignmentFilters
): number => {
  return applyAssignmentFilters(assignments, filters).length;
};

// ============================================================================
// QUICK FILTERS CONFIGURATION
// ============================================================================

const createQuickFilters = (
  assignments: (Assignment | AssignmentWithDetails)[]
): QuickFilter[] => [
  {
    id: 'active',
    label: '사용 중',
    icon: <PersonIcon />,
    filters: { status: '사용중' },
    color: 'success',
  },
  {
    id: 'overdue',
    label: '연체',
    icon: <WarningIcon />,
    filters: { status: '연체' },
    color: 'error',
  },
  {
    id: 'hardware',
    label: '하드웨어',
    icon: <ComputerIcon />,
    filters: { asset_type: 'hardware' },
    color: 'info',
  },
  {
    id: 'software',
    label: '소프트웨어',
    icon: <ComputerIcon />,
    filters: { asset_type: 'software' },
    color: 'success',
  },
  {
    id: 'recent',
    label: '최근 7일',
    icon: <ScheduleIcon />,
    filters: {
      assigned_date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    color: 'primary',
  },
  {
    id: 'pending',
    label: '대기 중',
    icon: <ScheduleIcon />,
    filters: { status: '대기중' },
    color: 'warning',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AssignmentFilters({
  assignments,
  filters,
  onFiltersChange,
  showQuickFilters = true,
  showAdvancedFilters = true,
  variant = 'standard',
  onAdvancedSearch,
}: AssignmentFiltersProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(variant === 'expanded');

  // Extract unique values for autocomplete options
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

  // Quick filters
  const quickFilters = useMemo(
    () => createQuickFilters(assignments),
    [assignments]
  );

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      value => value !== undefined && value !== '' && value !== null
    ).length;
  }, [filters]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (key: keyof IAssignmentFilters, value: any) => {
      onFiltersChange({
        ...filters,
        [key]: value || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle quick filter click
  const handleQuickFilter = useCallback(
    (quickFilter: QuickFilter) => {
      // Toggle if already active, otherwise apply
      const isActive = Object.entries(quickFilter.filters).every(
        ([key, value]) => filters[key as keyof IAssignmentFilters] === value
      );

      if (isActive) {
        // Remove this quick filter
        const newFilters = { ...filters };
        Object.keys(quickFilter.filters).forEach(key => {
          delete newFilters[key as keyof IAssignmentFilters];
        });
        onFiltersChange(newFilters);
      } else {
        // Apply quick filter
        onFiltersChange({
          ...filters,
          ...quickFilter.filters,
        });
      }
    },
    [filters, onFiltersChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  // Check if quick filter is active
  const isQuickFilterActive = useCallback(
    (quickFilter: QuickFilter) => {
      return Object.entries(quickFilter.filters).every(
        ([key, value]) => filters[key as keyof IAssignmentFilters] === value
      );
    },
    [filters]
  );

  // Compact variant
  if (variant === 'compact') {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        {/* Active filter count */}
        {activeFilterCount > 0 && (
          <Badge badgeContent={activeFilterCount} color='primary'>
            <Chip
              icon={<FilterIcon />}
              label='필터 적용됨'
              variant='outlined'
              color='primary'
              onDelete={handleClearFilters}
            />
          </Badge>
        )}

        {/* Quick filters */}
        {showQuickFilters &&
          quickFilters
            .slice(0, 3)
            .map(filter => (
              <Chip
                key={filter.id}
                icon={filter.icon}
                label={filter.label}
                variant={isQuickFilterActive(filter) ? 'filled' : 'outlined'}
                color={
                  isQuickFilterActive(filter)
                    ? (filter.color as any)
                    : 'default'
                }
                onClick={() => handleQuickFilter(filter)}
                size='small'
              />
            ))}

        {/* Advanced search button */}
        {onAdvancedSearch && (
          <Button
            size='small'
            variant='outlined'
            startIcon={<FilterIcon />}
            onClick={onAdvancedSearch}
          >
            고급 필터
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Card>
      <CardContent sx={{ pb: expanded ? 2 : 1 }}>
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
            variant='subtitle1'
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon color='primary' />
            필터
            {activeFilterCount > 0 && (
              <Badge
                badgeContent={activeFilterCount}
                color='primary'
                sx={{ ml: 1 }}
              />
            )}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFilterCount > 0 && (
              <Button
                size='small'
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                color='inherit'
              >
                초기화
              </Button>
            )}

            {showAdvancedFilters && (
              <IconButton size='small' onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Quick Filters */}
        {showQuickFilters && (
          <Box sx={{ mb: expanded ? 3 : 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'
            >
              빠른 필터
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {quickFilters.map(filter => {
                const isActive = isQuickFilterActive(filter);
                const resultCount = getFilterResultCount(
                  assignments,
                  filter.filters
                );

                return (
                  <Tooltip
                    key={filter.id}
                    title={`${filter.label} (${resultCount}개)`}
                  >
                    <Chip
                      icon={filter.icon}
                      label={`${filter.label} (${resultCount})`}
                      variant={isActive ? 'filled' : 'outlined'}
                      color={isActive ? (filter.color as any) : 'default'}
                      onClick={() => handleQuickFilter(filter)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette[
                              filter.color as keyof typeof theme.palette
                            ]?.main || theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Advanced Filters */}
        <Collapse in={expanded}>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Asset Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>자산 유형</InputLabel>
                <Select
                  value={filters.asset_type || ''}
                  onChange={e =>
                    handleFilterChange('asset_type', e.target.value)
                  }
                  label='자산 유형'
                >
                  <MenuItem value=''>전체</MenuItem>
                  <MenuItem value='hardware'>하드웨어</MenuItem>
                  <MenuItem value='software'>소프트웨어</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>상태</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  label='상태'
                >
                  <MenuItem value=''>전체</MenuItem>
                  {Object.values(ASSIGNMENT_STATUSES).map(status => (
                    <MenuItem key={status} value={status}>
                      {ASSIGNMENT_STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Employee Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                size='small'
                options={uniqueEmployees}
                value={
                  uniqueEmployees.find(emp => emp === filters.employee_id) ||
                  null
                }
                onChange={(_, value) =>
                  handleFilterChange('employee_id', value)
                }
                renderInput={params => <TextField {...params} label='직원' />}
                renderOption={(props, option) => (
                  <Box component='li' {...props}>
                    <PersonIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                    {option}
                  </Box>
                )}
              />
            </Grid>

            {/* Department Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                size='small'
                options={uniqueDepartments}
                value={filters.department || null}
                onChange={(_, value) => handleFilterChange('department', value)}
                renderInput={params => <TextField {...params} label='부서' />}
                renderOption={(props, option) => (
                  <Box component='li' {...props}>
                    <BusinessIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                    {option}
                  </Box>
                )}
              />
            </Grid>

            {/* Date Range Filters */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                날짜 범위
              </Typography>
            </Grid>

            {/* Assignment Date From */}
            <Grid item xs={12} sm={6} md={3}>
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Assignment Date To */}
            <Grid item xs={12} sm={6} md={3}>
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Return Date From */}
            <Grid item xs={12} sm={6} md={3}>
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
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Return Date To */}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label='반납일 종료'
                value={
                  filters.return_date_to
                    ? new Date(filters.return_date_to)
                    : null
                }
                onChange={date =>
                  handleFilterChange(
                    'return_date_to',
                    date?.toISOString().split('T')[0]
                  )
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Additional Filters */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                추가 옵션
              </Typography>
            </Grid>

            {/* Asset ID Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                size='small'
                options={uniqueAssetIds}
                value={
                  uniqueAssetIds.find(id => id === filters.asset_id) || null
                }
                onChange={(_, value) => handleFilterChange('asset_id', value)}
                renderInput={params => (
                  <TextField {...params} label='자산 ID' />
                )}
                renderOption={(props, option) => (
                  <Box component='li' {...props}>
                    <ComputerIcon sx={{ mr: 1, fontSize: 16 }} color='action' />
                    {option}
                  </Box>
                )}
              />
            </Grid>

            {/* Manufacturer Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                size='small'
                options={uniqueManufacturers}
                value={
                  uniqueManufacturers.find(
                    mfg => mfg === filters.manufacturer
                  ) || null
                }
                onChange={(_, value) =>
                  handleFilterChange('manufacturer', value)
                }
                renderInput={params => <TextField {...params} label='제조사' />}
              />
            </Grid>

            {/* Overdue Toggle */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size='small'>
                <InputLabel>연체 상태</InputLabel>
                <Select
                  value={
                    filters.overdue === true
                      ? 'true'
                      : filters.overdue === false
                        ? 'false'
                        : ''
                  }
                  onChange={e =>
                    handleFilterChange(
                      'overdue',
                      e.target.value === 'true'
                        ? true
                        : e.target.value === 'false'
                          ? false
                          : undefined
                    )
                  }
                  label='연체 상태'
                >
                  <MenuItem value=''>전체</MenuItem>
                  <MenuItem value='true'>연체만</MenuItem>
                  <MenuItem value='false'>정상만</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Actions */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {getFilterResultCount(assignments, filters)}개 결과
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {onAdvancedSearch && (
                <Button
                  variant='outlined'
                  startIcon={<FilterIcon />}
                  onClick={onAdvancedSearch}
                  size='small'
                >
                  고급 검색
                </Button>
              )}

              {activeFilterCount > 0 && (
                <Button
                  variant='outlined'
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size='small'
                  color='inherit'
                >
                  필터 초기화
                </Button>
              )}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// QUICK FILTER BAR COMPONENT
// ============================================================================

interface QuickFilterBarProps {
  assignments: (Assignment | AssignmentWithDetails)[];
  filters: IAssignmentFilters;
  onFiltersChange: (filters: IAssignmentFilters) => void;
  onAdvancedSearch?: () => void;
}

export function QuickFilterBar({
  assignments,
  filters,
  onFiltersChange,
  onAdvancedSearch,
}: QuickFilterBarProps) {
  const quickFilters = useMemo(
    () => createQuickFilters(assignments),
    [assignments]
  );

  const handleQuickFilter = useCallback(
    (quickFilter: QuickFilter) => {
      const isActive = Object.entries(quickFilter.filters).every(
        ([key, value]) => filters[key as keyof IAssignmentFilters] === value
      );

      if (isActive) {
        const newFilters = { ...filters };
        Object.keys(quickFilter.filters).forEach(key => {
          delete newFilters[key as keyof IAssignmentFilters];
        });
        onFiltersChange(newFilters);
      } else {
        onFiltersChange({
          ...filters,
          ...quickFilter.filters,
        });
      }
    },
    [filters, onFiltersChange]
  );

  const isQuickFilterActive = useCallback(
    (quickFilter: QuickFilter) => {
      return Object.entries(quickFilter.filters).every(
        ([key, value]) => filters[key as keyof IAssignmentFilters] === value
      );
    },
    [filters]
  );

  return (
    <Box
      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}
    >
      {quickFilters.map(filter => {
        const isActive = isQuickFilterActive(filter);
        const resultCount = getFilterResultCount(assignments, filter.filters);

        return (
          <Chip
            key={filter.id}
            icon={filter.icon}
            label={`${filter.label} (${resultCount})`}
            variant={isActive ? 'filled' : 'outlined'}
            color={isActive ? (filter.color as any) : 'default'}
            onClick={() => handleQuickFilter(filter)}
            size='small'
          />
        );
      })}

      {onAdvancedSearch && (
        <Button
          size='small'
          variant='outlined'
          startIcon={<FilterIcon />}
          onClick={onAdvancedSearch}
        >
          더 많은 필터
        </Button>
      )}
    </Box>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AssignmentFilters;
