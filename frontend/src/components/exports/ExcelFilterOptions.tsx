/**
 * Excel Filter Options Component
 *
 * Provides advanced filtering and date range selection capabilities
 * for Excel exports with real-time data preview.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  Autocomplete,
  DatePicker,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import type { ExportFilter, ExportSort, ExportColumn } from '@/types/export';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface FilterRule {
  id: string;
  column: string;
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'in'
    | 'notIn';
  value: any;
  minValue?: any;
  maxValue?: any;
  caseSensitive?: boolean;
}

interface DateRangeFilter {
  enabled: boolean;
  column: string;
  startDate: Date | null;
  endDate: Date | null;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

interface SortRule {
  column: string;
  direction: 'asc' | 'desc';
  priority: number;
}

interface ExcelFilterOptionsProps {
  data: any[];
  columns: ExportColumn[];
  onFiltersChange: (filters: ExportFilter[]) => void;
  onSortingChange: (sorting: ExportSort[]) => void;
  onDateRangeChange: (dateRange: DateRangeFilter) => void;
  previewData?: any[];
  loading?: boolean;
}

// ============================================================================
// FILTER OPERATORS CONFIGURATION
// ============================================================================

const FILTER_OPERATORS = {
  text: [
    { value: 'equals', label: '같음' },
    { value: 'contains', label: '포함' },
    { value: 'startsWith', label: '시작함' },
    { value: 'endsWith', label: '끝남' },
    { value: 'in', label: '목록에 포함' },
    { value: 'notIn', label: '목록에 없음' },
  ],
  number: [
    { value: 'equals', label: '같음' },
    { value: 'greaterThan', label: '초과' },
    { value: 'lessThan', label: '미만' },
    { value: 'between', label: '범위' },
  ],
  date: [
    { value: 'equals', label: '같음' },
    { value: 'greaterThan', label: '이후' },
    { value: 'lessThan', label: '이전' },
    { value: 'between', label: '기간' },
  ],
  boolean: [{ value: 'equals', label: '같음' }],
};

const DATE_PRESETS = [
  { value: 'today', label: '오늘', days: 0 },
  { value: 'week', label: '이번 주', days: 7 },
  { value: 'month', label: '이번 달', days: 30 },
  { value: 'quarter', label: '이번 분기', days: 90 },
  { value: 'year', label: '올해', days: 365 },
  { value: 'custom', label: '사용자 정의', days: null },
];

// ============================================================================
// EXCEL FILTER OPTIONS COMPONENT
// ============================================================================

export const ExcelFilterOptions: React.FC<ExcelFilterOptionsProps> = ({
  data,
  columns,
  onFiltersChange,
  onSortingChange,
  onDateRangeChange,
  previewData = [],
  loading = false,
}) => {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    enabled: false,
    column: '',
    startDate: null,
    endDate: null,
    preset: 'month',
  });
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const dateColumns = useMemo(
    () => columns.filter(col => col.type === 'date'),
    [columns]
  );

  const filteredDataCount = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return applyFiltersToData(data, filterRules, dateRange).length;
  }, [data, filterRules, dateRange]);

  const uniqueValues = useMemo(() => {
    const values: Record<string, any[]> = {};
    columns.forEach(column => {
      values[column.key] = [
        ...new Set(
          data
            .map(row => getNestedValue(row, column.key))
            .filter(val => val !== null && val !== undefined)
        ),
      ].slice(0, 100); // Limit to 100 unique values for performance
    });
    return values;
  }, [data, columns]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const applyFiltersToData = (
    sourceData: any[],
    filters: FilterRule[],
    dateFilter: DateRangeFilter
  ): any[] => {
    let filtered = [...sourceData];

    // Apply filter rules
    filters.forEach(filter => {
      filtered = filtered.filter(row => {
        const value = getNestedValue(row, filter.column);
        return evaluateFilterCondition(value, filter);
      });
    });

    // Apply date range filter
    if (dateFilter.enabled && dateFilter.column && dateFilter.startDate) {
      filtered = filtered.filter(row => {
        const value = getNestedValue(row, dateFilter.column);
        const date = new Date(value);

        if (isNaN(date.getTime())) return false;

        if (dateFilter.startDate && date < dateFilter.startDate) return false;
        if (dateFilter.endDate && date > dateFilter.endDate) return false;

        return true;
      });
    }

    return filtered;
  };

  const evaluateFilterCondition = (value: any, filter: FilterRule): boolean => {
    const stringValue = String(value || '');
    const filterValue = String(filter.value || '');

    const compareString = filter.caseSensitive
      ? stringValue
      : stringValue.toLowerCase();
    const compareFilter = filter.caseSensitive
      ? filterValue
      : filterValue.toLowerCase();

    switch (filter.operator) {
      case 'equals':
        return compareString === compareFilter;
      case 'contains':
        return compareString.includes(compareFilter);
      case 'startsWith':
        return compareString.startsWith(compareFilter);
      case 'endsWith':
        return compareString.endsWith(compareFilter);
      case 'greaterThan':
        return Number(value) > Number(filter.value);
      case 'lessThan':
        return Number(value) < Number(filter.value);
      case 'between':
        const numValue = Number(value);
        return (
          numValue >= Number(filter.minValue) &&
          numValue <= Number(filter.maxValue)
        );
      case 'in':
        const inValues = String(filter.value)
          .split(',')
          .map(v => v.trim());
        return inValues.some(v =>
          filter.caseSensitive
            ? stringValue === v
            : stringValue.toLowerCase() === v.toLowerCase()
        );
      case 'notIn':
        const notInValues = String(filter.value)
          .split(',')
          .map(v => v.trim());
        return !notInValues.some(v =>
          filter.caseSensitive
            ? stringValue === v
            : stringValue.toLowerCase() === v.toLowerCase()
        );
      default:
        return true;
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const addFilterRule = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      column: columns[0]?.key || '',
      operator: 'contains',
      value: '',
      caseSensitive: false,
    };

    const updatedRules = [...filterRules, newFilter];
    setFilterRules(updatedRules);
    updateFilters(updatedRules);
  };

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    const updatedRules = filterRules.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    );
    setFilterRules(updatedRules);
    updateFilters(updatedRules);
  };

  const removeFilterRule = (id: string) => {
    const updatedRules = filterRules.filter(rule => rule.id !== id);
    setFilterRules(updatedRules);
    updateFilters(updatedRules);
  };

  const updateFilters = (rules: FilterRule[]) => {
    const filters: ExportFilter[] = rules.map(rule => ({
      column: rule.column,
      operator: rule.operator,
      value:
        rule.operator === 'between'
          ? [rule.minValue, rule.maxValue]
          : rule.value,
      caseSensitive: rule.caseSensitive,
    }));
    onFiltersChange(filters);
  };

  const updateSortRule = (index: number, updates: Partial<SortRule>) => {
    const updatedRules = [...sortRules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    setSortRules(updatedRules);

    const sorting: ExportSort[] = updatedRules.map(rule => ({
      column: rule.column,
      direction: rule.direction,
      priority: rule.priority,
    }));
    onSortingChange(sorting);
  };

  const addSortRule = () => {
    const newSort: SortRule = {
      column: columns[0]?.key || '',
      direction: 'asc',
      priority: sortRules.length + 1,
    };

    const updatedRules = [...sortRules, newSort];
    setSortRules(updatedRules);
    updateSortRule(sortRules.length, newSort);
  };

  const removeSortRule = (index: number) => {
    const updatedRules = sortRules.filter((_, i) => i !== index);
    setSortRules(updatedRules);

    const sorting: ExportSort[] = updatedRules.map(rule => ({
      column: rule.column,
      direction: rule.direction,
      priority: rule.priority,
    }));
    onSortingChange(sorting);
  };

  const handleDateRangeChange = (updates: Partial<DateRangeFilter>) => {
    const updatedRange = { ...dateRange, ...updates };

    // Apply preset dates
    if (updates.preset && updates.preset !== 'custom') {
      const preset = DATE_PRESETS.find(p => p.value === updates.preset);
      if (preset && preset.days !== null) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - preset.days);

        updatedRange.startDate = startDate;
        updatedRange.endDate = endDate;
      }
    }

    setDateRange(updatedRange);
    onDateRangeChange(updatedRange);
  };

  const clearAllFilters = () => {
    setFilterRules([]);
    setSortRules([]);
    setDateRange({
      enabled: false,
      column: '',
      startDate: null,
      endDate: null,
      preset: 'month',
    });
    onFiltersChange([]);
    onSortingChange([]);
    onDateRangeChange({
      enabled: false,
      column: '',
      startDate: null,
      endDate: null,
    });
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderFilterRule = (filter: FilterRule, index: number) => {
    const column = columns.find(col => col.key === filter.column);
    const operators =
      FILTER_OPERATORS[column?.type as keyof typeof FILTER_OPERATORS] ||
      FILTER_OPERATORS.text;

    return (
      <Card key={filter.id} variant='outlined' sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>컬럼</InputLabel>
                <Select
                  value={filter.column}
                  onChange={e =>
                    updateFilterRule(filter.id, { column: e.target.value })
                  }
                >
                  {columns.map(col => (
                    <MenuItem key={col.key} value={col.key}>
                      {col.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size='small'>
                <InputLabel>조건</InputLabel>
                <Select
                  value={filter.operator}
                  onChange={e =>
                    updateFilterRule(filter.id, {
                      operator: e.target.value as any,
                    })
                  }
                >
                  {operators.map(op => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              {filter.operator === 'between' ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size='small'
                    placeholder='최소값'
                    value={filter.minValue || ''}
                    onChange={e =>
                      updateFilterRule(filter.id, { minValue: e.target.value })
                    }
                  />
                  <TextField
                    size='small'
                    placeholder='최대값'
                    value={filter.maxValue || ''}
                    onChange={e =>
                      updateFilterRule(filter.id, { maxValue: e.target.value })
                    }
                  />
                </Box>
              ) : filter.operator === 'in' || filter.operator === 'notIn' ? (
                <Autocomplete
                  size='small'
                  multiple
                  freeSolo
                  options={uniqueValues[filter.column] || []}
                  value={String(filter.value || '')
                    .split(',')
                    .filter(v => v.trim())}
                  onChange={(_, newValue) =>
                    updateFilterRule(filter.id, {
                      value: newValue.join(','),
                    })
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      placeholder='값 입력 (쉼표로 구분)'
                    />
                  )}
                />
              ) : (
                <Autocomplete
                  size='small'
                  freeSolo
                  options={uniqueValues[filter.column] || []}
                  value={filter.value || ''}
                  onChange={(_, newValue) =>
                    updateFilterRule(filter.id, { value: newValue })
                  }
                  renderInput={params => (
                    <TextField {...params} placeholder='값 입력' />
                  )}
                />
              )}
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    size='small'
                    checked={filter.caseSensitive || false}
                    onChange={e =>
                      updateFilterRule(filter.id, {
                        caseSensitive: e.target.checked,
                      })
                    }
                  />
                }
                label='대소문자 구분'
              />
            </Grid>

            <Grid item xs={12} sm={1}>
              <IconButton
                size='small'
                color='error'
                onClick={() => removeFilterRule(filter.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSortRule = (sort: SortRule, index: number) => (
    <Card key={index} variant='outlined' sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth size='small'>
              <InputLabel>컬럼</InputLabel>
              <Select
                value={sort.column}
                onChange={e =>
                  updateSortRule(index, { column: e.target.value })
                }
              >
                {columns.map(col => (
                  <MenuItem key={col.key} value={col.key}>
                    {col.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size='small'>
              <InputLabel>방향</InputLabel>
              <Select
                value={sort.direction}
                onChange={e =>
                  updateSortRule(index, {
                    direction: e.target.value as 'asc' | 'desc',
                  })
                }
              >
                <MenuItem value='asc'>오름차순</MenuItem>
                <MenuItem value='desc'>내림차순</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              size='small'
              label='순서'
              type='number'
              value={sort.priority}
              onChange={e =>
                updateSortRule(index, { priority: Number(e.target.value) })
              }
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <IconButton
              size='small'
              color='error'
              onClick={() => removeSortRule(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h6'>필터 및 정렬 옵션</Typography>
          <Box>
            <Badge
              badgeContent={filteredDataCount}
              color='primary'
              sx={{ mr: 2 }}
            >
              <Chip
                icon={<FilterIcon />}
                label={`${filterRules.length + (dateRange.enabled ? 1 : 0)}개 필터`}
                variant='outlined'
              />
            </Badge>
            <Button
              variant='outlined'
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
              disabled={
                filterRules.length === 0 &&
                sortRules.length === 0 &&
                !dateRange.enabled
              }
            >
              모두 초기화
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Data Summary */}
        <Alert severity='info' sx={{ mb: 3 }}>
          전체 {data.length}개 중 {filteredDataCount}개 레코드가 선택됨
          {filteredDataCount !== data.length && (
            <span>
              {' '}
              ({((filteredDataCount / data.length) * 100).toFixed(1)}%)
            </span>
          )}
        </Alert>

        {/* Filter Rules */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='subtitle1'>
              데이터 필터 ({filterRules.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {filterRules.map(renderFilterRule)}

            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={addFilterRule}
              sx={{ mt: 1 }}
            >
              필터 추가
            </Button>
          </AccordionDetails>
        </Accordion>

        {/* Date Range Filter */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='subtitle1'>
              날짜 범위 필터
              {dateRange.enabled && (
                <Chip
                  size='small'
                  label='활성'
                  color='primary'
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dateRange.enabled}
                      onChange={e =>
                        handleDateRangeChange({ enabled: e.target.checked })
                      }
                    />
                  }
                  label='날짜 범위 필터 사용'
                />
              </Grid>

              {dateRange.enabled && (
                <>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>날짜 컬럼</InputLabel>
                      <Select
                        value={dateRange.column}
                        onChange={e =>
                          handleDateRangeChange({ column: e.target.value })
                        }
                      >
                        {dateColumns.map(col => (
                          <MenuItem key={col.key} value={col.key}>
                            {col.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>프리셋</InputLabel>
                      <Select
                        value={dateRange.preset}
                        onChange={e =>
                          handleDateRangeChange({
                            preset: e.target.value as any,
                          })
                        }
                      >
                        {DATE_PRESETS.map(preset => (
                          <MenuItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {dateRange.preset === 'custom' && (
                    <>
                      <Grid item xs={12} sm={2}>
                        <DatePicker
                          label='시작일'
                          value={dateRange.startDate}
                          onChange={date =>
                            handleDateRangeChange({ startDate: date })
                          }
                          slotProps={{
                            textField: { size: 'small', fullWidth: true },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <DatePicker
                          label='종료일'
                          value={dateRange.endDate}
                          onChange={date =>
                            handleDateRangeChange({ endDate: date })
                          }
                          slotProps={{
                            textField: { size: 'small', fullWidth: true },
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Sort Rules */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='subtitle1'>
              정렬 옵션 ({sortRules.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {sortRules.map(renderSortRule)}

            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={addSortRule}
              sx={{ mt: 1 }}
            >
              정렬 규칙 추가
            </Button>
          </AccordionDetails>
        </Accordion>

        {/* Preview Section */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant='contained'
            startIcon={<PreviewIcon />}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '미리보기 숨기기' : '필터링된 데이터 미리보기'}
          </Button>
        </Box>

        {showPreview && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                필터링된 데이터 미리보기 (최대 10개 행)
              </Typography>

              {filteredDataCount === 0 ? (
                <Alert severity='warning'>
                  현재 필터 조건에 맞는 데이터가 없습니다.
                </Alert>
              ) : (
                <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {columns.slice(0, 6).map(col => (
                          <th
                            key={col.key}
                            style={{
                              border: '1px solid #ddd',
                              padding: '8px',
                              backgroundColor: '#f5f5f5',
                              fontWeight: 'bold',
                              textAlign: 'left',
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {applyFiltersToData(data, filterRules, dateRange)
                        .slice(0, 10)
                        .map((row, index) => (
                          <tr key={index}>
                            {columns.slice(0, 6).map(col => (
                              <td
                                key={col.key}
                                style={{
                                  border: '1px solid #ddd',
                                  padding: '8px',
                                  backgroundColor:
                                    index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                                }}
                              >
                                {String(getNestedValue(row, col.key) || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {filteredDataCount > 10 && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 1, display: 'block' }}
                    >
                      ... 및 {filteredDataCount - 10}개 추가 행
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ExcelFilterOptions;
