/**
 * User Search and Filter Components
 *
 * Comprehensive search and filtering functionality for user management
 * including text search, advanced filters, and saved search capabilities.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Menu,
  MenuList,
  ListItemText,
  Switch,
  useTheme,
  alpha,
  Autocomplete,
  Paper,
  Popover,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandIcon,
  Save as SaveIcon,
  BookmarkBorder as SavedSearchIcon,
  Delete as DeleteIcon,
  Tune as TuneIcon,
  DateRange as DateIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

import type {
  User,
  UserRole,
  UserStatus,
  UserFilters,
  UserSearchCriteria,
} from '@/types/user';
import {
  USER_ROLES,
  USER_STATUSES,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  AUTH_TYPES,
  AUTH_TYPE_LABELS,
  DEFAULT_DEPARTMENTS,
  SEARCH_CONSTANTS,
} from '@/constants/user.constants';
import { filterUsers, searchUsers } from '@/utils/user.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface UserSearchFilterProps {
  users: User[];
  onFilteredUsersChange: (filteredUsers: User[]) => void;
  onSearchCriteriaChange?: (criteria: UserSearchCriteria) => void;
  initialFilters?: Partial<UserFilters>;
  enableSavedSearches?: boolean;
  compact?: boolean;
}

interface AdvancedFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  users: User[];
}

interface SavedSearchProps {
  searches: SavedSearch[];
  onApplySearch: (search: SavedSearch) => void;
  onDeleteSearch: (searchId: string) => void;
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: UserSearchCriteria;
  createdAt: string;
}

interface QuickFiltersProps {
  onFilterApply: (filterType: string, value: any) => void;
  activeFilters: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create default filter state
 */
function createDefaultFilters(): UserFilters {
  return {
    roles: [],
    statuses: [],
    departments: [],
    authenticationTypes: [],
    showOnlyActive: false,
    showOnlyLocked: false,
    showRecentlyActive: false,
  };
}

/**
 * Get unique departments from users
 */
function getUniqueDepartments(users: User[]): string[] {
  const departments = new Set<string>();
  users.forEach(user => {
    if (user.department && user.department.trim()) {
      departments.add(user.department);
    }
  });
  return Array.from(departments).sort();
}

/**
 * Count active filters
 */
function countActiveFilters(filters: UserFilters): number {
  return (
    filters.roles.length +
    filters.statuses.length +
    filters.departments.length +
    filters.authenticationTypes.length +
    (filters.showOnlyActive ? 1 : 0) +
    (filters.showOnlyLocked ? 1 : 0) +
    (filters.showRecentlyActive ? 1 : 0)
  );
}

// ============================================================================
// QUICK FILTERS COMPONENT
// ============================================================================

function QuickFilters({ onFilterApply, activeFilters }: QuickFiltersProps) {
  const theme = useTheme();

  const quickFilterOptions = [
    { key: 'active', label: '활성 사용자', type: 'status', value: 'active' },
    { key: 'admin', label: '관리자', type: 'role', value: 'admin' },
    { key: 'manager', label: '매니저', type: 'role', value: 'manager' },
    { key: 'locked', label: '잠긴 계정', type: 'special', value: 'locked' },
    { key: 'recent', label: '최근 활성', type: 'special', value: 'recent' },
    { key: 'ldap', label: 'LDAP 사용자', type: 'auth', value: 'ldap' },
  ];

  return (
    <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ gap: 1 }}>
      {quickFilterOptions.map(option => (
        <Chip
          key={option.key}
          label={option.label}
          onClick={() => onFilterApply(option.type, option.value)}
          color={activeFilters.includes(option.key) ? 'primary' : 'default'}
          variant={activeFilters.includes(option.key) ? 'filled' : 'outlined'}
          size='small'
          clickable
        />
      ))}
    </Stack>
  );
}

// ============================================================================
// ADVANCED FILTERS COMPONENT
// ============================================================================

function AdvancedFilters({
  filters,
  onFiltersChange,
  users,
}: AdvancedFiltersProps) {
  const departments = useMemo(() => getUniqueDepartments(users), [users]);

  const handleRoleChange = (roles: UserRole[]) => {
    onFiltersChange({ ...filters, roles });
  };

  const handleStatusChange = (statuses: UserStatus[]) => {
    onFiltersChange({ ...filters, statuses });
  };

  const handleDepartmentChange = (departments: string[]) => {
    onFiltersChange({ ...filters, departments });
  };

  const handleAuthTypeChange = (authTypes: string[]) => {
    onFiltersChange({
      ...filters,
      authenticationTypes: authTypes as ('ldap' | 'local')[],
    });
  };

  const handleSpecialFilterChange = (
    field: keyof UserFilters,
    value: boolean
  ) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <Stack spacing={3}>
      {/* Role Filter */}
      <FormControl fullWidth>
        <InputLabel>역할</InputLabel>
        <Select
          multiple
          value={filters.roles}
          onChange={e => handleRoleChange(e.target.value as UserRole[])}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip
                  key={value}
                  label={USER_ROLE_LABELS[value]}
                  size='small'
                />
              ))}
            </Box>
          )}
        >
          {Object.values(USER_ROLES).map(role => (
            <MenuItem key={role} value={role}>
              <Checkbox checked={filters.roles.includes(role)} />
              <ListItemText primary={USER_ROLE_LABELS[role]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Status Filter */}
      <FormControl fullWidth>
        <InputLabel>상태</InputLabel>
        <Select
          multiple
          value={filters.statuses}
          onChange={e => handleStatusChange(e.target.value as UserStatus[])}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip
                  key={value}
                  label={USER_STATUS_LABELS[value]}
                  size='small'
                />
              ))}
            </Box>
          )}
        >
          {Object.values(USER_STATUSES).map(status => (
            <MenuItem key={status} value={status}>
              <Checkbox checked={filters.statuses.includes(status)} />
              <ListItemText primary={USER_STATUS_LABELS[status]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Department Filter */}
      <FormControl fullWidth>
        <Autocomplete
          multiple
          options={departments}
          value={filters.departments}
          onChange={(_, newValue) => handleDepartmentChange(newValue)}
          renderInput={params => (
            <TextField {...params} label='부서' placeholder='부서 선택' />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant='outlined'
                label={option}
                size='small'
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          limitTags={3}
          size='small'
        />
      </FormControl>

      {/* Authentication Type Filter */}
      <FormControl fullWidth>
        <InputLabel>인증 방식</InputLabel>
        <Select
          multiple
          value={filters.authenticationTypes}
          onChange={e => handleAuthTypeChange(e.target.value as string[])}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip
                  key={value}
                  label={
                    AUTH_TYPE_LABELS[value as keyof typeof AUTH_TYPE_LABELS]
                  }
                  size='small'
                />
              ))}
            </Box>
          )}
        >
          {Object.values(AUTH_TYPES).map(authType => (
            <MenuItem key={authType} value={authType}>
              <Checkbox
                checked={filters.authenticationTypes.includes(authType)}
              />
              <ListItemText primary={AUTH_TYPE_LABELS[authType]} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider />

      {/* Special Filters */}
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={filters.showOnlyActive}
              onChange={e =>
                handleSpecialFilterChange('showOnlyActive', e.target.checked)
              }
            />
          }
          label='활성 사용자만 표시'
        />
        <FormControlLabel
          control={
            <Switch
              checked={filters.showOnlyLocked}
              onChange={e =>
                handleSpecialFilterChange('showOnlyLocked', e.target.checked)
              }
            />
          }
          label='잠긴 계정만 표시'
        />
        <FormControlLabel
          control={
            <Switch
              checked={filters.showRecentlyActive}
              onChange={e =>
                handleSpecialFilterChange(
                  'showRecentlyActive',
                  e.target.checked
                )
              }
            />
          }
          label='최근 활성 사용자만 표시'
        />
      </FormGroup>
    </Stack>
  );
}

// ============================================================================
// SAVED SEARCHES COMPONENT
// ============================================================================

function SavedSearches({
  searches,
  onApplySearch,
  onDeleteSearch,
}: SavedSearchProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title='저장된 검색'>
        <IconButton onClick={handleMenuOpen} size='small'>
          <SavedSearchIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 250, maxWidth: 350 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='subtitle2' fontWeight={600}>
            저장된 검색 ({searches.length})
          </Typography>
        </Box>

        <MenuList dense>
          {searches.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                저장된 검색이 없습니다.
              </Typography>
            </Box>
          ) : (
            searches.map(search => (
              <MenuItem
                key={search.id}
                onClick={() => {
                  onApplySearch(search);
                  handleMenuClose();
                }}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant='body2' fontWeight={500}>
                    {search.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {new Date(search.createdAt).toLocaleDateString('ko-KR')}
                  </Typography>
                </Box>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteSearch(search.id);
                  }}
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </MenuItem>
            ))
          )}
        </MenuList>
      </Menu>
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UserSearchFilter({
  users,
  onFilteredUsersChange,
  onSearchCriteriaChange,
  initialFilters,
  enableSavedSearches = true,
  compact = false,
}: UserSearchFilterProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>(() => ({
    ...createDefaultFilters(),
    ...initialFilters,
  }));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, SEARCH_CONSTANTS.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, users]);

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filteredUsers = users;

    // Apply text search
    if (searchQuery.trim().length >= SEARCH_CONSTANTS.MIN_SEARCH_LENGTH) {
      filteredUsers = searchUsers(filteredUsers, searchQuery);
    }

    // Apply filters
    filteredUsers = filterUsers(filteredUsers, filters);

    // Apply date range filter if set
    if (dateRange.start || dateRange.end) {
      filteredUsers = filteredUsers.filter(user => {
        if (!user.lastLogin) return !dateRange.start; // Include if no start date
        const loginDate = new Date(user.lastLogin);
        if (dateRange.start && loginDate < dateRange.start) return false;
        if (dateRange.end && loginDate > dateRange.end) return false;
        return true;
      });
    }

    onFilteredUsersChange(filteredUsers);

    // Update search criteria
    if (onSearchCriteriaChange) {
      const criteria: UserSearchCriteria = {
        query: searchQuery,
        role: filters.roles.length === 1 ? filters.roles[0] : undefined,
        status: filters.statuses.length === 1 ? filters.statuses[0] : undefined,
        department:
          filters.departments.length === 1 ? filters.departments[0] : undefined,
        authenticationType:
          filters.authenticationTypes.length === 1
            ? filters.authenticationTypes[0]
            : undefined,
        dateRange:
          dateRange.start || dateRange.end
            ? {
                start: dateRange.start?.toISOString() || '',
                end: dateRange.end?.toISOString() || '',
                field: 'lastLogin',
              }
            : undefined,
      };
      onSearchCriteriaChange(criteria);
    }
  }, [
    searchQuery,
    filters,
    users,
    dateRange,
    onFilteredUsersChange,
    onSearchCriteriaChange,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleQuickFilter = (filterType: string, value: any) => {
    const newFilters = { ...filters };

    switch (filterType) {
      case 'role':
        newFilters.roles = newFilters.roles.includes(value)
          ? newFilters.roles.filter(r => r !== value)
          : [...newFilters.roles, value];
        break;
      case 'status':
        newFilters.statuses = newFilters.statuses.includes(value)
          ? newFilters.statuses.filter(s => s !== value)
          : [...newFilters.statuses, value];
        break;
      case 'auth':
        newFilters.authenticationTypes =
          newFilters.authenticationTypes.includes(value)
            ? newFilters.authenticationTypes.filter(a => a !== value)
            : [...newFilters.authenticationTypes, value];
        break;
      case 'special':
        if (value === 'locked') {
          newFilters.showOnlyLocked = !newFilters.showOnlyLocked;
        } else if (value === 'recent') {
          newFilters.showRecentlyActive = !newFilters.showRecentlyActive;
        }
        break;
    }

    setFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilters(createDefaultFilters());
    setDateRange({ start: null, end: null });
  };

  const handleSaveSearch = () => {
    const searchName = prompt('검색 저장 이름을 입력하세요:');
    if (searchName) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name: searchName,
        criteria: {
          query: searchQuery,
          role: filters.roles.length === 1 ? filters.roles[0] : undefined,
          status:
            filters.statuses.length === 1 ? filters.statuses[0] : undefined,
          department:
            filters.departments.length === 1
              ? filters.departments[0]
              : undefined,
          authenticationType:
            filters.authenticationTypes.length === 1
              ? filters.authenticationTypes[0]
              : undefined,
          dateRange:
            dateRange.start || dateRange.end
              ? {
                  start: dateRange.start?.toISOString() || '',
                  end: dateRange.end?.toISOString() || '',
                  field: 'lastLogin',
                }
              : undefined,
        },
        createdAt: new Date().toISOString(),
      };
      setSavedSearches(prev => [...prev, newSearch]);
    }
  };

  const handleApplySavedSearch = (search: SavedSearch) => {
    const { criteria } = search;
    setSearchQuery(criteria.query || '');
    setFilters({
      roles: criteria.role ? [criteria.role] : [],
      statuses: criteria.status ? [criteria.status] : [],
      departments: criteria.department ? [criteria.department] : [],
      authenticationTypes: criteria.authenticationType
        ? [criteria.authenticationType]
        : [],
      showOnlyActive: false,
      showOnlyLocked: false,
      showRecentlyActive: false,
    });
    if (criteria.dateRange) {
      setDateRange({
        start: criteria.dateRange.start
          ? new Date(criteria.dateRange.start)
          : null,
        end: criteria.dateRange.end ? new Date(criteria.dateRange.end) : null,
      });
    }
  };

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters =
    activeFilterCount > 0 ||
    searchQuery.trim().length > 0 ||
    dateRange.start ||
    dateRange.end;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Card variant='outlined'>
        <CardContent sx={{ pb: compact ? 2 : 3 }}>
          {/* Search Input */}
          <TextField
            fullWidth
            placeholder='사용자명, 이름, 이메일, 부서로 검색...'
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Quick Filters */}
          {!compact && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                빠른 필터
              </Typography>
              <QuickFilters
                onFilterApply={handleQuickFilter}
                activeFilters={[
                  ...filters.roles.map(r => r),
                  ...filters.statuses.map(s => s),
                  ...(filters.showOnlyLocked ? ['locked'] : []),
                  ...(filters.showRecentlyActive ? ['recent'] : []),
                  ...filters.authenticationTypes.map(a => a),
                ]}
              />
            </Box>
          )}

          {/* Filter Controls */}
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ mb: 2 }}
          >
            <Stack direction='row' alignItems='center' spacing={1}>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                startIcon={<TuneIcon />}
                endIcon={
                  <ExpandIcon
                    sx={{
                      transform: showAdvancedFilters
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                }
              >
                고급 필터
                {activeFilterCount > 0 && (
                  <Chip
                    label={activeFilterCount}
                    size='small'
                    color='primary'
                    sx={{ ml: 1, minWidth: 20, height: 20 }}
                  />
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant='text'
                  size='small'
                  onClick={handleClearAllFilters}
                  startIcon={<ClearIcon />}
                  color='secondary'
                >
                  모든 필터 지우기
                </Button>
              )}
            </Stack>

            <Stack direction='row' spacing={1}>
              {enableSavedSearches && (
                <>
                  <SavedSearches
                    searches={savedSearches}
                    onApplySearch={handleApplySavedSearch}
                    onDeleteSearch={id =>
                      setSavedSearches(prev => prev.filter(s => s.id !== id))
                    }
                  />

                  {hasActiveFilters && (
                    <Tooltip title='검색 저장'>
                      <IconButton size='small' onClick={handleSaveSearch}>
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}
            </Stack>
          </Stack>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Box
              sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                users={users}
              />

              {/* Date Range Filter */}
              <Box sx={{ mt: 3 }}>
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  로그인 날짜 범위
                </Typography>
                <Stack direction='row' spacing={2}>
                  <DatePicker
                    label='시작 날짜'
                    value={dateRange.start}
                    onChange={newValue =>
                      setDateRange(prev => ({ ...prev, start: newValue }))
                    }
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />
                  <DatePicker
                    label='종료 날짜'
                    value={dateRange.end}
                    onChange={newValue =>
                      setDateRange(prev => ({ ...prev, end: newValue }))
                    }
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />
                </Stack>
              </Box>
            </Box>
          </Collapse>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mt: 2 }}>
              <Stack
                direction='row'
                spacing={1}
                flexWrap='wrap'
                sx={{ gap: 1 }}
              >
                {searchQuery && (
                  <Chip
                    label={`검색: "${searchQuery}"`}
                    onDelete={handleClearSearch}
                    size='small'
                    variant='filled'
                    color='primary'
                  />
                )}

                {filters.roles.map(role => (
                  <Chip
                    key={`role-${role}`}
                    label={`역할: ${USER_ROLE_LABELS[role]}`}
                    onDelete={() => handleQuickFilter('role', role)}
                    size='small'
                    variant='outlined'
                  />
                ))}

                {filters.statuses.map(status => (
                  <Chip
                    key={`status-${status}`}
                    label={`상태: ${USER_STATUS_LABELS[status]}`}
                    onDelete={() => handleQuickFilter('status', status)}
                    size='small'
                    variant='outlined'
                  />
                ))}

                {filters.departments.map(dept => (
                  <Chip
                    key={`dept-${dept}`}
                    label={`부서: ${dept}`}
                    onDelete={() => {
                      setFilters(prev => ({
                        ...prev,
                        departments: prev.departments.filter(d => d !== dept),
                      }));
                    }}
                    size='small'
                    variant='outlined'
                  />
                ))}

                {(dateRange.start || dateRange.end) && (
                  <Chip
                    label='날짜 범위 설정됨'
                    onDelete={() => setDateRange({ start: null, end: null })}
                    size='small'
                    variant='outlined'
                    icon={<DateIcon />}
                  />
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UserSearchFilter;
