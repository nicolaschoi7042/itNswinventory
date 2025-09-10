/**
 * Advanced Search Modal Component
 *
 * Comprehensive search and filtering interface for assignments
 * with multiple criteria and saved searches.
 */

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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Import types and utilities
import {
  Assignment,
  AssignmentWithDetails,
  AssignmentFilters,
  AssignmentStatus,
} from '@/types/assignment';

import { ASSIGNMENT_STATUSES, ASSET_TYPE_LABELS } from '@/constants/assignment';

// ============================================================================
// INTERFACES
// ============================================================================

interface SavedSearch {
  id: string;
  name: string;
  filters: AssignmentFilters;
  searchQuery: string;
  created: string;
  used: number;
}

interface AdvancedSearchModalProps {
  open: boolean;
  assignments: (Assignment | AssignmentWithDetails)[];
  currentFilters: AssignmentFilters;
  currentSearchQuery: string;
  onClose: () => void;
  onApplyFilters: (filters: AssignmentFilters, searchQuery: string) => void;
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'created' | 'used'>) => void;
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

const getSavedSearches = (): SavedSearch[] => {
  try {
    const saved = localStorage.getItem('assignment_saved_searches');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveSavedSearches = (searches: SavedSearch[]) => {
  try {
    localStorage.setItem('assignment_saved_searches', JSON.stringify(searches));
  } catch {
    // Ignore localStorage errors
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdvancedSearchModal({
  open,
  assignments,
  currentFilters,
  currentSearchQuery,
  onClose,
  onApplyFilters,
  onSaveSearch,
}: AdvancedSearchModalProps) {
  const theme = useTheme();

  // State for filters
  const [filters, setFilters] = useState<AssignmentFilters>(currentFilters);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [searchName, setSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Extract unique values for autocomplete
  const uniqueEmployees = getUniqueValues(assignments, a => a.employee_name);
  const uniqueDepartments = getUniqueValues(assignments, a =>
    'employee' in a && a.employee ? a.employee.department : undefined
  );
  const uniqueAssetIds = getUniqueValues(assignments, a => a.asset_id);
  const uniqueManufacturers = getUniqueValues(assignments, a =>
    'asset' in a && a.asset ? a.asset.manufacturer : undefined
  );

  // Load saved searches on mount
  useEffect(() => {
    setSavedSearches(getSavedSearches());
  }, []);

  // Reset filters
  const handleReset = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Apply filters
  const handleApply = () => {
    onApplyFilters(filters, searchQuery);
    onClose();
  };

  // Save current search
  const handleSaveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters,
      searchQuery,
      created: new Date().toISOString(),
      used: 0,
    };

    const updatedSearches = [newSearch, ...savedSearches].slice(0, 10);
    setSavedSearches(updatedSearches);
    saveSavedSearches(updatedSearches);
    onSaveSearch?.(newSearch);
    setSearchName('');
  };

  // Load saved search
  const handleLoadSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    setSearchQuery(search.searchQuery);

    // Update usage count
    const updatedSearches = savedSearches.map(s =>
      s.id === search.id ? { ...s, used: s.used + 1 } : s
    );
    setSavedSearches(updatedSearches);
    saveSavedSearches(updatedSearches);
  };

  // Delete saved search
  const handleDeleteSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    saveSavedSearches(updatedSearches);
  };

  // Get result count preview
  const getResultCount = () => {
    // This would normally use the actual search/filter logic
    return assignments.length; // Placeholder
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color='primary' />
          <Typography variant='h6'>고급 검색 및 필터</Typography>
        </Box>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant='subtitle1'
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <BookmarkIcon fontSize='small' />
                저장된 검색 ({savedSearches.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {savedSearches.map(search => (
                  <Chip
                    key={search.id}
                    label={`${search.name} (${search.used}회 사용)`}
                    onClick={() => handleLoadSearch(search)}
                    onDelete={() => handleDeleteSearch(search.id)}
                    color='primary'
                    variant='outlined'
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Search Query */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              검색어
            </Typography>
            <TextField
              fullWidth
              placeholder='직원명, 자산 ID, 할당 ID, 제조사 등으로 검색...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color='action' sx={{ mr: 1 }} />,
                endAdornment: searchQuery && (
                  <IconButton size='small' onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize='small' />
                  </IconButton>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Basic Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              기본 필터
            </Typography>

            <Grid container spacing={2}>
              {/* Asset Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>자산 유형</InputLabel>
                  <Select
                    value={filters.asset_type || ''}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        asset_type: (e.target.value as any) || undefined,
                      }))
                    }
                    label='자산 유형'
                  >
                    <MenuItem value=''>전체</MenuItem>
                    <MenuItem value='hardware'>하드웨어</MenuItem>
                    <MenuItem value='software'>소프트웨어</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>상태</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={e =>
                      setFilters(prev => ({
                        ...prev,
                        status:
                          (e.target.value as AssignmentStatus) || undefined,
                      }))
                    }
                    label='상태'
                  >
                    <MenuItem value=''>전체</MenuItem>
                    {Object.values(ASSIGNMENT_STATUSES).map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Employee */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={uniqueEmployees}
                  value={
                    filters.employee_id
                      ? uniqueEmployees.find(
                          emp => emp === filters.employee_id
                        ) || null
                      : null
                  }
                  onChange={(_, value) =>
                    setFilters(prev => ({
                      ...prev,
                      employee_id: value || undefined,
                    }))
                  }
                  renderInput={params => <TextField {...params} label='직원' />}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={uniqueDepartments}
                  value={filters.department || null}
                  onChange={(_, value) =>
                    setFilters(prev => ({
                      ...prev,
                      department: value || undefined,
                    }))
                  }
                  renderInput={params => <TextField {...params} label='부서' />}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Date Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              날짜 필터
            </Typography>

            <Grid container spacing={2}>
              {/* Assignment Date Range */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label='할당일 시작'
                  value={
                    filters.assigned_date_from
                      ? new Date(filters.assigned_date_from)
                      : null
                  }
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      assigned_date_from: date?.toISOString().split('T')[0],
                    }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label='할당일 종료'
                  value={
                    filters.assigned_date_to
                      ? new Date(filters.assigned_date_to)
                      : null
                  }
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      assigned_date_to: date?.toISOString().split('T')[0],
                    }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              {/* Return Date Range */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label='반납일 시작'
                  value={
                    filters.return_date_from
                      ? new Date(filters.return_date_from)
                      : null
                  }
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      return_date_from: date?.toISOString().split('T')[0],
                    }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label='반납일 종료'
                  value={
                    filters.return_date_to
                      ? new Date(filters.return_date_to)
                      : null
                  }
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      return_date_to: date?.toISOString().split('T')[0],
                    }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              고급 옵션
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.overdue === true}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      overdue: e.target.checked ? true : undefined,
                    }))
                  }
                />
              }
              label='연체된 할당만 표시'
            />
          </CardContent>
        </Card>

        {/* Save Search */}
        <Card>
          <CardContent>
            <Typography variant='subtitle1' gutterBottom>
              검색 저장
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder='검색 조건 이름'
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                size='small'
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant='outlined'
                startIcon={<SaveIcon />}
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
              >
                저장
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Result Preview */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 1,
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            예상 결과: 약 {getResultCount()}개 항목
          </Typography>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, gap: 1 }}
      >
        <Button onClick={handleReset} color='inherit' startIcon={<ClearIcon />}>
          초기화
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Button onClick={onClose} color='inherit'>
          취소
        </Button>

        <Button
          variant='contained'
          onClick={handleApply}
          startIcon={<SearchIcon />}
        >
          검색 적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AdvancedSearchModal;
