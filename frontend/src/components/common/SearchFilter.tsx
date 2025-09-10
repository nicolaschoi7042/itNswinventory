/**
 * Common SearchFilter Component
 *
 * Reusable search and filter component with multiple filter types
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Button,
  Popover,
  Paper,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FilterOption {
  id: string;
  label: string;
  type:
    | 'text'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'daterange'
    | 'number'
    | 'boolean'
    | 'range';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterValue {
  [key: string]: any;
}

export interface SearchFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  filterValues?: FilterValue;
  onFilterChange?: (filters: FilterValue) => void;
  onClear?: () => void;
  showFilterCount?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClear,
  showFilterCount = true,
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [filterAnchorEl, setFilterAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [localFilterValues, setLocalFilterValues] =
    useState<FilterValue>(filterValues);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isFilterOpen = Boolean(filterAnchorEl);
  const activeFilterCount = Object.keys(filterValues).filter(key => {
    const value = filterValues[key];
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }).length;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocalSearchValue(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterValueChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilterValues, [filterId]: value };
    setLocalFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearSearch = () => {
    setLocalSearchValue('');
    onSearchChange?.('');
  };

  const handleClearAll = () => {
    setLocalSearchValue('');
    setLocalFilterValues({});
    onSearchChange?.('');
    onFilterChange?.({});
    onClear?.();
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderFilterControl = (filter: FilterOption) => {
    const value = localFilterValues[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            key={filter.id}
            fullWidth
            size='small'
            label={filter.label}
            value={value || ''}
            onChange={e => handleFilterValueChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            sx={{ mb: 2 }}
          />
        );

      case 'select':
        return (
          <FormControl key={filter.id} fullWidth size='small' sx={{ mb: 2 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value || ''}
              label={filter.label}
              onChange={e => handleFilterValueChange(filter.id, e.target.value)}
            >
              <MenuItem value=''>
                <em>All</em>
              </MenuItem>
              {filter.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <Box key={filter.id} sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              {filter.label}
            </Typography>
            <FormGroup>
              {filter.options?.map(option => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      size='small'
                      checked={(value || []).includes(option.value)}
                      onChange={e => {
                        const currentValues = value || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(
                              (v: any) => v !== option.value
                            );
                        handleFilterValueChange(filter.id, newValues);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 'date':
        return (
          <DatePicker
            key={filter.id}
            label={filter.label}
            value={value ? new Date(value) : null}
            onChange={date =>
              handleFilterValueChange(filter.id, date?.toISOString())
            }
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                sx: { mb: 2 },
              },
            }}
          />
        );

      case 'daterange':
        return (
          <Box key={filter.id} sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              {filter.label}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <DatePicker
                  label='From'
                  value={value?.from ? new Date(value.from) : null}
                  onChange={date =>
                    handleFilterValueChange(filter.id, {
                      ...value,
                      from: date?.toISOString(),
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label='To'
                  value={value?.to ? new Date(value.to) : null}
                  onChange={date =>
                    handleFilterValueChange(filter.id, {
                      ...value,
                      to: date?.toISOString(),
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 'number':
        return (
          <TextField
            key={filter.id}
            fullWidth
            size='small'
            type='number'
            label={filter.label}
            value={value || ''}
            onChange={e =>
              handleFilterValueChange(
                filter.id,
                parseFloat(e.target.value) || undefined
              )
            }
            inputProps={{
              min: filter.min,
              max: filter.max,
              step: filter.step || 1,
            }}
            sx={{ mb: 2 }}
          />
        );

      case 'range':
        return (
          <Box key={filter.id} sx={{ mb: 2 }}>
            <Typography variant='subtitle2' gutterBottom>
              {filter.label}
            </Typography>
            <Slider
              value={value || [filter.min || 0, filter.max || 100]}
              onChange={(e, newValue) =>
                handleFilterValueChange(filter.id, newValue)
              }
              valueLabelDisplay='auto'
              min={filter.min || 0}
              max={filter.max || 100}
              step={filter.step || 1}
              marks={[
                { value: filter.min || 0, label: String(filter.min || 0) },
                { value: filter.max || 100, label: String(filter.max || 100) },
              ]}
            />
          </Box>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={filter.id}
            control={
              <Checkbox
                checked={value === true}
                onChange={e =>
                  handleFilterValueChange(
                    filter.id,
                    e.target.checked || undefined
                  )
                }
              />
            }
            label={filter.label}
            sx={{ mb: 2, display: 'block' }}
          />
        );

      default:
        return null;
    }
  };

  const renderActiveFilters = () => {
    const activeFilters: React.ReactNode[] = [];

    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return;
      }

      const filter = filters.find(f => f.id === key);
      if (!filter) return;

      let displayValue: string;

      if (Array.isArray(value)) {
        displayValue =
          value.length === 1 ? String(value[0]) : `${value.length} items`;
      } else if (typeof value === 'object' && value.from && value.to) {
        displayValue = `${new Date(value.from).toLocaleDateString()} - ${new Date(value.to).toLocaleDateString()}`;
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else {
        displayValue = String(value);
      }

      activeFilters.push(
        <Chip
          key={key}
          size='small'
          label={`${filter.label}: ${displayValue}`}
          onDelete={() => handleFilterValueChange(key, undefined)}
          sx={{ mr: 1, mb: 1 }}
        />
      );
    });

    return activeFilters;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box className={className}>
      {/* Search and Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        {/* Search Field */}
        <TextField
          fullWidth
          size='small'
          placeholder={searchPlaceholder}
          value={localSearchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: localSearchValue && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Button */}
        {filters.length > 0 && (
          <Button
            variant='outlined'
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            Filter
            {showFilterCount && activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size='small'
                color='primary'
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Button>
        )}

        {/* Clear All Button */}
        {(localSearchValue || activeFilterCount > 0) && (
          <Button
            variant='text'
            color='secondary'
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <Box sx={{ mb: 2 }}>{renderActiveFilters()}</Box>
      )}

      {/* Filter Popover */}
      <Popover
        open={isFilterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 3, minWidth: 300, maxWidth: 400 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='h6'>Filters</Typography>
            <IconButton size='small' onClick={handleFilterClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {filters.map(renderFilterControl)}

          {filters.length > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size='small'
                  onClick={() => {
                    setLocalFilterValues({});
                    onFilterChange?.({});
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  size='small'
                  variant='contained'
                  onClick={handleFilterClose}
                >
                  Apply
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Popover>
    </Box>
  );
};

export default SearchFilter;
