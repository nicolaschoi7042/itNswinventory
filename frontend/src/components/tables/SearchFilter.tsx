import { 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  Autocomplete,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { ChangeEvent, ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface AdvancedFilter {
  key: string;
  label: string;
  type: 'select' | 'autocomplete' | 'date' | 'number';
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options?: FilterOption[];
  multiple?: boolean;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }>;
  advancedFilters?: AdvancedFilter[];
  showClearAll?: boolean;
  onClearAll?: () => void;
  activeFilterCount?: number;
  searchFullWidth?: boolean;
  dense?: boolean;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  advancedFilters = [],
  showClearAll = false,
  onClearAll,
  activeFilterCount = 0,
  searchFullWidth = false,
  dense = false
}: SearchFilterProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const renderAdvancedFilter = (filter: AdvancedFilter, index: number) => {
    switch (filter.type) {
      case 'autocomplete':
        return (
          <Autocomplete
            key={index}
            multiple={filter.multiple}
            size={dense ? 'small' : 'medium'}
            options={filter.options || []}
            getOptionLabel={(option) => option.label}
            value={filter.multiple 
              ? (filter.options || []).filter(opt => (filter.value as string[]).includes(opt.value))
              : (filter.options || []).find(opt => opt.value === filter.value) || null
            }
            onChange={(_, value) => {
              if (filter.multiple) {
                const values = Array.isArray(value) ? value.map(v => v.value) : [];
                filter.onChange(values);
              } else {
                const singleValue = value as FilterOption | null;
                filter.onChange(singleValue ? singleValue.value : '');
              }
            }}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  label={option.label}
                  size="small"
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={filter.label}
                placeholder={filter.placeholder}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      {filter.startAdornment}
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      {filter.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ minWidth: 200 }}
          />
        );
      
      case 'date':
      case 'number':
        return (
          <TextField
            key={index}
            type={filter.type}
            label={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            placeholder={filter.placeholder}
            size={dense ? 'small' : 'medium'}
            InputProps={{
              startAdornment: filter.startAdornment,
              endAdornment: filter.endAdornment,
            }}
            sx={{ minWidth: 150 }}
          />
        );
      
      case 'select':
      default:
        return (
          <FormControl key={index} size={dense ? 'small' : 'medium'} sx={{ minWidth: 150 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={filter.value}
              label={filter.label}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {(filter.options || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
    }
  };

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <TextField
          value={searchValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          variant="outlined"
          size={dense ? 'small' : 'medium'}
          sx={{ 
            minWidth: searchFullWidth ? '100%' : 250, 
            flex: searchFullWidth ? 1 : 'none' 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {filters.map((filter, index) => (
          <FormControl key={index} size={dense ? 'small' : 'medium'} sx={{ minWidth: 150 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={filter.value}
              label={filter.label}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {showClearAll && activeFilterCount > 0 && (
          <Button
            variant="outlined"
            size={dense ? 'small' : 'medium'}
            onClick={onClearAll}
            startIcon={<ClearIcon />}
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </Box>

      {advancedFilters.length > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            alignItems: 'center',
            pl: 1
          }}
        >
          <FilterListIcon color="action" fontSize="small" />
          {advancedFilters.map(renderAdvancedFilter)}
        </Box>
      )}
    </Stack>
  );
}

// Utility function to create filter options from array
export function createFilterOptions<T>(
  data: T[],
  key: keyof T,
  labelFormatter?: (value: T[keyof T]) => string
): FilterOption[] {
  const uniqueValues = Array.from(new Set(data.map(item => item[key])));
  return uniqueValues
    .filter(value => value != null && value !== '')
    .map(value => ({
      value: String(value),
      label: labelFormatter ? labelFormatter(value) : String(value)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}