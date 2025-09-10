/**
 * Export Utility Functions
 *
 * Comprehensive utility functions for data export operations including
 * data transformation, validation, formatting, and template management.
 */

import type {
  ExportColumn,
  ExportConfig,
  ExportRequest,
  ExportTemplate,
  ExportFilter,
  ExportSort,
  ExportValidationResult,
  ExportValidationError,
  ExportStatistics,
  ExportFormat,
  ExportDataType,
  ExportPreset,
  DEFAULT_EXPORT_CONFIGS,
} from '@/types/export';

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform raw data for export based on column configuration
 */
export function transformDataForExport(
  data: any[],
  columns: ExportColumn[]
): any[] {
  return data.map(row => {
    const transformedRow: any = {};

    columns.forEach(column => {
      if (column.hidden) return;

      const value = getNestedValue(row, column.key);
      transformedRow[column.key] = column.format
        ? column.format(value, row)
        : formatValueByType(value, column.type);
    });

    return transformedRow;
  });
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

/**
 * Format value based on its type
 */
export function formatValueByType(value: any, type?: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (type) {
    case 'date':
      return formatDate(value);
    case 'number':
      return formatNumber(value);
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'boolean':
      return formatBoolean(value);
    default:
      return String(value);
  }
}

/**
 * Format date values for export
 */
export function formatDate(value: any, format?: string): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return String(value);

  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'short':
      return date.toLocaleDateString('ko-KR');
    case 'long':
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'datetime':
      return date.toLocaleString('ko-KR');
    default:
      return date.toLocaleDateString('ko-KR');
  }
}

/**
 * Format number values for export
 */
export function formatNumber(value: any, decimals?: number): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);

  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency values for export
 */
export function formatCurrency(value: any, currency = 'KRW'): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);

  return num.toLocaleString('ko-KR', {
    style: 'currency',
    currency,
  });
}

/**
 * Format percentage values for export
 */
export function formatPercentage(value: any, decimals = 2): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);

  return (num * 100).toFixed(decimals) + '%';
}

/**
 * Format boolean values for export
 */
export function formatBoolean(value: any): string {
  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }

  const str = String(value).toLowerCase();
  return ['true', '1', 'yes', 'y', '예'].includes(str) ? '예' : '아니오';
}

// ============================================================================
// FILTERING AND SORTING UTILITIES
// ============================================================================

/**
 * Apply filters to data array
 */
export function applyFilters(data: any[], filters: ExportFilter[]): any[] {
  if (!filters || filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => applyFilter(row, filter));
  });
}

/**
 * Apply single filter to a row
 */
export function applyFilter(row: any, filter: ExportFilter): boolean {
  const value = getNestedValue(row, filter.column);
  const filterValue = filter.value;

  if (value === null || value === undefined) {
    return (
      filter.operator === 'notIn' ||
      (filter.operator === 'equals' && filterValue === null)
    );
  }

  const compareValue = filter.caseSensitive
    ? value
    : String(value).toLowerCase();
  const compareFilter = filter.caseSensitive
    ? filterValue
    : String(filterValue).toLowerCase();

  switch (filter.operator) {
    case 'equals':
      return compareValue === compareFilter;
    case 'contains':
      return String(compareValue).includes(String(compareFilter));
    case 'startsWith':
      return String(compareValue).startsWith(String(compareFilter));
    case 'endsWith':
      return String(compareValue).endsWith(String(compareFilter));
    case 'greaterThan':
      return Number(value) > Number(filterValue);
    case 'lessThan':
      return Number(value) < Number(filterValue);
    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const num = Number(value);
        return num >= Number(filterValue[0]) && num <= Number(filterValue[1]);
      }
      return false;
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value);
    case 'notIn':
      return !Array.isArray(filterValue) || !filterValue.includes(value);
    default:
      return true;
  }
}

/**
 * Apply sorting to data array
 */
export function applySorting(data: any[], sorting: ExportSort[]): any[] {
  if (!sorting || sorting.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const sort of sorting.sort(
      (x, y) => (x.priority || 0) - (y.priority || 0)
    )) {
      const aValue = getNestedValue(a, sort.column);
      const bValue = getNestedValue(b, sort.column);

      const comparison = compareValues(aValue, bValue);
      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
}

/**
 * Compare two values for sorting
 */
export function compareValues(a: any, b: any): number {
  if (a === null || a === undefined)
    return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b), 'ko-KR');
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate export request before processing
 */
export function validateExportRequest(
  request: ExportRequest
): ExportValidationResult {
  const errors: ExportValidationError[] = [];
  const warnings: string[] = [];

  // Validate basic structure
  if (!request.columns || request.columns.length === 0) {
    errors.push({
      field: 'columns',
      message: '최소 하나의 컬럼을 선택해야 합니다',
      code: 'MISSING_COLUMNS',
      severity: 'error',
    });
  }

  if (!request.config) {
    errors.push({
      field: 'config',
      message: '내보내기 설정이 필요합니다',
      code: 'MISSING_CONFIG',
      severity: 'error',
    });
  }

  // Validate columns
  if (request.columns) {
    request.columns.forEach((column, index) => {
      if (!column.key) {
        errors.push({
          field: `columns[${index}].key`,
          message: '컬럼 키가 필요합니다',
          code: 'MISSING_COLUMN_KEY',
          severity: 'error',
        });
      }

      if (!column.label) {
        warnings.push(`컬럼 ${column.key}에 라벨이 없습니다`);
      }
    });
  }

  // Validate filters
  if (request.filters) {
    request.filters.forEach((filter, index) => {
      if (!filter.column) {
        errors.push({
          field: `filters[${index}].column`,
          message: '필터 컬럼이 필요합니다',
          code: 'MISSING_FILTER_COLUMN',
          severity: 'error',
        });
      }

      if (filter.value === undefined || filter.value === null) {
        warnings.push(`필터 ${filter.column}에 값이 없습니다`);
      }
    });
  }

  // Estimate file size and processing time
  const columnCount = request.columns?.length || 0;
  const estimatedRecords = request.pagination?.limit || 1000;
  const avgCellSize = 20; // bytes per cell
  const estimatedSize = estimatedRecords * columnCount * avgCellSize;
  const estimatedTime = Math.max(1, estimatedRecords / 100); // seconds

  // Add warnings for large exports
  if (estimatedSize > 10 * 1024 * 1024) {
    // 10MB
    warnings.push(
      '내보내기 파일이 클 수 있습니다. 필터를 사용하여 데이터를 줄이는 것을 고려하세요.'
    );
  }

  if (estimatedTime > 30) {
    // 30 seconds
    warnings.push('내보내기 처리에 시간이 오래 걸릴 수 있습니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedSize,
    estimatedTime,
  };
}

/**
 * Validate column configuration
 */
export function validateColumn(column: ExportColumn): ExportValidationError[] {
  const errors: ExportValidationError[] = [];

  if (!column.key) {
    errors.push({
      field: 'key',
      message: '컬럼 키가 필요합니다',
      code: 'MISSING_KEY',
      severity: 'error',
    });
  }

  if (!column.label) {
    errors.push({
      field: 'label',
      message: '컬럼 라벨이 필요합니다',
      code: 'MISSING_LABEL',
      severity: 'warning',
    });
  }

  if (column.width && column.width < 0) {
    errors.push({
      field: 'width',
      message: '컬럼 너비는 양수여야 합니다',
      code: 'INVALID_WIDTH',
      severity: 'error',
    });
  }

  return errors;
}

// ============================================================================
// TEMPLATE UTILITIES
// ============================================================================

/**
 * Create export template from request
 */
export function createTemplateFromRequest(
  request: ExportRequest,
  name: string,
  description?: string
): ExportTemplate {
  return {
    id: generateTemplateId(),
    name,
    description,
    dataType: request.dataType,
    config: request.config,
    columns: request.columns,
    defaultFilters: request.filters,
    defaultSorting: request.sorting,
    tags: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
  };
}

/**
 * Apply template to create export request
 */
export function applyTemplate(
  template: ExportTemplate,
  overrides?: Partial<ExportRequest>
): ExportRequest {
  return {
    dataType: template.dataType,
    config: { ...template.config, ...overrides?.config },
    columns: overrides?.columns || template.columns,
    filters: overrides?.filters || template.defaultFilters,
    sorting: overrides?.sorting || template.defaultSorting,
    ...overrides,
  };
}

/**
 * Generate unique template ID
 */
export function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get recommended templates for data type
 */
export function getRecommendedTemplates(
  dataType: ExportDataType,
  templates: ExportTemplate[]
): ExportTemplate[] {
  return templates
    .filter(template => template.dataType === dataType)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5);
}

// ============================================================================
// PRESET UTILITIES
// ============================================================================

/**
 * Get export preset by key
 */
export function getExportPreset(
  key: string,
  presets: ExportPreset[]
): ExportPreset | undefined {
  return presets.find(preset => preset.key === key);
}

/**
 * Get presets for data type
 */
export function getPresetsForDataType(
  dataType: ExportDataType,
  presets: ExportPreset[]
): ExportPreset[] {
  return presets.filter(preset => preset.dataTypes.includes(dataType));
}

/**
 * Apply preset to create base configuration
 */
export function applyPreset(
  preset: ExportPreset,
  dataType: ExportDataType
): Partial<ExportRequest> {
  return {
    dataType,
    config: preset.config as ExportConfig,
  };
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Generate filename for export
 */
export function generateExportFilename(
  dataType: ExportDataType,
  format: ExportFormat,
  options?: {
    prefix?: string;
    suffix?: string;
    includeTimestamp?: boolean;
    timestamp?: Date;
  }
): string {
  const {
    prefix = '',
    suffix = '',
    includeTimestamp = true,
    timestamp = new Date(),
  } = options || {};

  const parts: string[] = [];

  if (prefix) parts.push(prefix);
  parts.push(dataType);
  if (suffix) parts.push(suffix);

  if (includeTimestamp) {
    const dateStr = timestamp.toISOString().split('T')[0];
    parts.push(dateStr);
  }

  const extension = getFileExtension(format);
  return `${parts.join('_')}.${extension}`;
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'excel':
      return 'xlsx';
    case 'csv':
      return 'csv';
    case 'pdf':
      return 'pdf';
    case 'json':
      return 'json';
    default:
      return 'txt';
  }
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    case 'json':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Calculate estimated file size
 */
export function estimateFileSize(
  recordCount: number,
  columnCount: number,
  format: ExportFormat
): number {
  const avgCellSize = 20; // bytes per cell
  const baseSize = recordCount * columnCount * avgCellSize;

  // Format-specific multipliers
  const formatMultipliers: Record<ExportFormat, number> = {
    excel: 1.5, // Excel has overhead
    csv: 0.8, // CSV is more compact
    pdf: 2.0, // PDF has layout overhead
    json: 1.2, // JSON has structure overhead
  };

  return Math.round(baseSize * (formatMultipliers[format] || 1));
}

// ============================================================================
// STATISTICS UTILITIES
// ============================================================================

/**
 * Calculate export statistics
 */
export function calculateExportStatistics(exports: any[]): ExportStatistics {
  const totalExports = exports.length;
  const successfulExports = exports.filter(exp => exp.success).length;
  const failedExports = totalExports - successfulExports;

  const totalRecordsExported = exports
    .filter(exp => exp.success)
    .reduce((sum, exp) => sum + (exp.recordCount || 0), 0);

  const totalFileSizeExported = exports
    .filter(exp => exp.success)
    .reduce((sum, exp) => sum + (exp.fileSize || 0), 0);

  const processingTimes = exports
    .filter(exp => exp.success && exp.processingTime)
    .map(exp => exp.processingTime);

  const averageProcessingTime =
    processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) /
        processingTimes.length
      : 0;

  // Calculate format popularity
  const popularFormats: Record<ExportFormat, number> = {
    excel: 0,
    csv: 0,
    pdf: 0,
    json: 0,
  };
  exports.forEach(exp => {
    if (exp.format && popularFormats.hasOwnProperty(exp.format)) {
      popularFormats[exp.format]++;
    }
  });

  // Calculate data type popularity
  const popularDataTypes: Record<ExportDataType, number> = {
    employees: 0,
    hardware: 0,
    software: 0,
    assignments: 0,
    users: 0,
    activities: 0,
    reports: 0,
    statistics: 0,
  };
  exports.forEach(exp => {
    if (exp.dataType && popularDataTypes.hasOwnProperty(exp.dataType)) {
      popularDataTypes[exp.dataType]++;
    }
  });

  // Calculate exports by user
  const exportsByUser: Record<string, number> = {};
  exports.forEach(exp => {
    if (exp.userId) {
      exportsByUser[exp.userId] = (exportsByUser[exp.userId] || 0) + 1;
    }
  });

  // Calculate exports by date
  const exportsByDate: Record<string, number> = {};
  exports.forEach(exp => {
    if (exp.createdAt) {
      const date = new Date(exp.createdAt).toISOString().split('T')[0];
      exportsByDate[date] = (exportsByDate[date] || 0) + 1;
    }
  });

  return {
    totalExports,
    successfulExports,
    failedExports,
    totalRecordsExported,
    totalFileSizeExported,
    averageProcessingTime,
    popularFormats,
    popularDataTypes,
    exportsByUser,
    exportsByDate,
  };
}

// ============================================================================
// PROGRESS UTILITIES
// ============================================================================

/**
 * Calculate export progress percentage
 */
export function calculateProgress(
  currentStep: number,
  totalSteps: number,
  stepProgress = 0
): number {
  if (totalSteps === 0) return 0;

  const baseProgress = (currentStep / totalSteps) * 100;
  const stepProgressPercent = (stepProgress / totalSteps) * 100;

  return Math.min(100, Math.round(baseProgress + stepProgressPercent));
}

/**
 * Estimate remaining time
 */
export function estimateRemainingTime(
  startTime: Date,
  currentProgress: number
): number {
  if (currentProgress <= 0) return 0;

  const elapsedTime = Date.now() - startTime.getTime();
  const totalEstimatedTime = (elapsedTime / currentProgress) * 100;
  const remainingTime = totalEstimatedTime - elapsedTime;

  return Math.max(0, Math.round(remainingTime / 1000)); // seconds
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const ExportUtils = {
  // Data transformation
  transformDataForExport,
  getNestedValue,
  formatValueByType,
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatBoolean,

  // Filtering and sorting
  applyFilters,
  applyFilter,
  applySorting,
  compareValues,

  // Validation
  validateExportRequest,
  validateColumn,

  // Templates
  createTemplateFromRequest,
  applyTemplate,
  generateTemplateId,
  getRecommendedTemplates,

  // Presets
  getExportPreset,
  getPresetsForDataType,
  applyPreset,

  // Files
  generateExportFilename,
  getFileExtension,
  getMimeType,
  estimateFileSize,

  // Statistics
  calculateExportStatistics,

  // Progress
  calculateProgress,
  estimateRemainingTime,
};

export default ExportUtils;
