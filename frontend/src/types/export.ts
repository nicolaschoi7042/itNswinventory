/**
 * Export Types and Configurations
 *
 * Comprehensive type definitions for export functionality including
 * format types, configurations, templates, and validation schemas.
 */

// ============================================================================
// CORE EXPORT TYPES
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';

/**
 * Export data types for different modules
 */
export type ExportDataType =
  | 'employees'
  | 'hardware'
  | 'software'
  | 'assignments'
  | 'users'
  | 'activities'
  | 'reports'
  | 'statistics';

/**
 * Export status for tracking progress
 */
export type ExportStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Export priority levels
 */
export type ExportPriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// EXPORT CONFIGURATION INTERFACES
// ============================================================================

/**
 * Base export configuration
 */
export interface BaseExportConfig {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  includeMetadata?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  encoding?: 'utf-8' | 'utf-16' | 'iso-8859-1';
  locale?: string;
}

/**
 * Excel-specific configuration
 */
export interface ExcelExportConfig extends BaseExportConfig {
  format: 'excel';
  sheetName?: string;
  workbookName?: string;
  multipleSheets?: boolean;
  autoColumnWidth?: boolean;
  freezeHeader?: boolean;
  includeFormulas?: boolean;
  cellStyles?: {
    headerStyle?: CellStyle;
    dataStyle?: CellStyle;
    alternateRowStyle?: CellStyle;
  };
  charts?: ChartConfig[];
  protection?: {
    protectWorkbook?: boolean;
    protectSheets?: boolean;
    password?: string;
  };
}

/**
 * CSV-specific configuration
 */
export interface CSVExportConfig extends BaseExportConfig {
  format: 'csv';
  delimiter?: ',' | ';' | '\t' | '|';
  quoteChar?: '"' | "'";
  escapeChar?: '\\';
  lineTerminator?: '\n' | '\r\n' | '\r';
  bomEncoding?: boolean;
}

/**
 * PDF-specific configuration
 */
export interface PDFExportConfig extends BaseExportConfig {
  format: 'pdf';
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter' | 'legal' | 'tabloid';
  margins?: PageMargins;
  fontSize?: number;
  fontFamily?: string;
  title?: string;
  subtitle?: string;
  logo?: string;
  watermark?: string;
  pageNumbers?: boolean;
  tableStyles?: PDFTableStyles;
  headerFooter?: {
    header?: string;
    footer?: string;
    includeDate?: boolean;
    includePageNumbers?: boolean;
  };
}

/**
 * JSON-specific configuration
 */
export interface JSONExportConfig extends BaseExportConfig {
  format: 'json';
  indent?: number | string;
  pretty?: boolean;
  includeSchema?: boolean;
  compression?: 'none' | 'gzip' | 'deflate';
}

/**
 * Union type for all export configurations
 */
export type ExportConfig =
  | ExcelExportConfig
  | CSVExportConfig
  | PDFExportConfig
  | JSONExportConfig;

// ============================================================================
// COLUMN AND STYLING TYPES
// ============================================================================

/**
 * Export column definition with enhanced formatting options
 */
export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage';
  format?: (value: any, row?: any) => string;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
  hidden?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  validation?: ColumnValidation;
  conditional?: ConditionalFormatting[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

/**
 * Cell styling for Excel exports
 */
export interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  border?: BorderStyle;
  pattern?: PatternStyle;
}

/**
 * Border styling
 */
export interface BorderStyle {
  top?: LineStyle;
  right?: LineStyle;
  bottom?: LineStyle;
  left?: LineStyle;
  all?: LineStyle;
}

/**
 * Line style for borders
 */
export interface LineStyle {
  style: 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed';
  color?: string;
}

/**
 * Pattern styling for cells
 */
export interface PatternStyle {
  type:
    | 'solid'
    | 'gray125'
    | 'gray0625'
    | 'horizontal'
    | 'vertical'
    | 'diagonal';
  fgColor?: string;
  bgColor?: string;
}

/**
 * PDF-specific styling
 */
export interface PDFTableStyles {
  headerStyle?: {
    fillColor?: number[];
    textColor?: number[];
    fontStyle?: 'normal' | 'bold' | 'italic';
    fontSize?: number;
  };
  bodyStyle?: {
    fontSize?: number;
    cellPadding?: number;
    alternateRowColors?: boolean;
  };
  borderStyle?: {
    lineColor?: number[];
    lineWidth?: number;
  };
}

/**
 * Page margins for PDF
 */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ============================================================================
// CHART AND VISUALIZATION TYPES
// ============================================================================

/**
 * Chart configuration for Excel exports
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title?: string;
  dataRange: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  series?: ChartSeries[];
  axes?: ChartAxes;
  legend?: ChartLegend;
}

/**
 * Chart series configuration
 */
export interface ChartSeries {
  name: string;
  values: string;
  categories?: string;
  color?: string;
}

/**
 * Chart axes configuration
 */
export interface ChartAxes {
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  title?: string;
  min?: number;
  max?: number;
  format?: string;
  gridlines?: boolean;
}

/**
 * Chart legend configuration
 */
export interface ChartLegend {
  position: 'top' | 'bottom' | 'left' | 'right' | 'none';
  showKeys?: boolean;
}

// ============================================================================
// FILTERING AND VALIDATION TYPES
// ============================================================================

/**
 * Column validation rules
 */
export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean | string;
}

/**
 * Conditional formatting rules
 */
export interface ConditionalFormatting {
  condition:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between';
  value: any;
  style: CellStyle;
  priority?: number;
}

/**
 * Export filter configuration
 */
export interface ExportFilter {
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
  caseSensitive?: boolean;
}

/**
 * Sort configuration for exports
 */
export interface ExportSort {
  column: string;
  direction: 'asc' | 'desc';
  priority?: number;
}

// ============================================================================
// EXPORT REQUEST AND RESPONSE TYPES
// ============================================================================

/**
 * Export request payload
 */
export interface ExportRequest {
  dataType: ExportDataType;
  config: ExportConfig;
  columns: ExportColumn[];
  filters?: ExportFilter[];
  sorting?: ExportSort[];
  pagination?: {
    page?: number;
    limit?: number;
    offset?: number;
  };
  metadata?: ExportMetadata;
  scheduled?: ScheduledExportConfig;
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  title?: string;
  description?: string;
  author?: string;
  department?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  exportReason?: string;
  confidentiality?: 'public' | 'internal' | 'confidential' | 'restricted';
}

/**
 * Export response
 */
export interface ExportResponse {
  success: boolean;
  exportId?: string;
  status: ExportStatus;
  filename?: string;
  downloadUrl?: string;
  fileSize?: number;
  recordCount?: number;
  columnCount?: number;
  processingTime?: number;
  error?: ExportError;
  warnings?: string[];
  metadata?: ExportMetadata;
  expiresAt?: string;
}

/**
 * Export error details
 */
export interface ExportError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
  suggestedAction?: string;
}

// ============================================================================
// SCHEDULED AND BULK EXPORT TYPES
// ============================================================================

/**
 * Scheduled export configuration
 */
export interface ScheduledExportConfig {
  enabled: boolean;
  schedule: CronSchedule | IntervalSchedule;
  timezone?: string;
  retryPolicy?: RetryPolicy;
  notifications?: NotificationConfig[];
  autoDelete?: {
    enabled: boolean;
    afterDays: number;
  };
}

/**
 * Cron schedule configuration
 */
export interface CronSchedule {
  type: 'cron';
  expression: string;
  description?: string;
}

/**
 * Interval schedule configuration
 */
export interface IntervalSchedule {
  type: 'interval';
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  description?: string;
}

/**
 * Retry policy for failed exports
 */
export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
  multiplier?: number;
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  type: 'email' | 'webhook' | 'slack';
  recipients: string[];
  triggers: ('success' | 'failure' | 'retry' | 'cancelled')[];
  template?: string;
  customData?: Record<string, any>;
}

/**
 * Bulk export request
 */
export interface BulkExportRequest {
  exports: ExportRequest[];
  bundleConfig?: BundleConfig;
  priority?: ExportPriority;
  metadata?: ExportMetadata;
}

/**
 * Bundle configuration for bulk exports
 */
export interface BundleConfig {
  createBundle: boolean;
  bundleFormat: 'zip' | 'tar' | 'tar.gz';
  bundleName?: string;
  includeManifest?: boolean;
  compression?: 'none' | 'fast' | 'best';
}

// ============================================================================
// TEMPLATE AND PRESET TYPES
// ============================================================================

/**
 * Export template for reusable configurations
 */
export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  dataType: ExportDataType;
  config: ExportConfig;
  columns: ExportColumn[];
  defaultFilters?: ExportFilter[];
  defaultSorting?: ExportSort[];
  tags?: string[];
  isPublic?: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

/**
 * Predefined export presets
 */
export interface ExportPreset {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  dataTypes: ExportDataType[];
  config: Partial<ExportConfig>;
  recommendedColumns?: string[];
}

// ============================================================================
// STATISTICS AND ANALYTICS TYPES
// ============================================================================

/**
 * Export statistics
 */
export interface ExportStatistics {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  totalRecordsExported: number;
  totalFileSizeExported: number;
  averageProcessingTime: number;
  popularFormats: Record<ExportFormat, number>;
  popularDataTypes: Record<ExportDataType, number>;
  exportsByUser: Record<string, number>;
  exportsByDate: Record<string, number>;
}

/**
 * Export analytics data
 */
export interface ExportAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: {
    date: string;
    exportCount: number;
    successRate: number;
    averageFileSize: number;
    averageProcessingTime: number;
  }[];
}

// ============================================================================
// UTILITY AND HELPER TYPES
// ============================================================================

/**
 * Export progress tracking
 */
export interface ExportProgress {
  exportId: string;
  status: ExportStatus;
  progress: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  estimatedTimeRemaining?: number;
  message?: string;
}

/**
 * Export file info
 */
export interface ExportFileInfo {
  filename: string;
  size: number;
  format: ExportFormat;
  mimeType: string;
  downloadUrl: string;
  expiresAt: string;
  metadata?: ExportMetadata;
}

/**
 * Export validation result
 */
export interface ExportValidationResult {
  valid: boolean;
  errors: ExportValidationError[];
  warnings: string[];
  estimatedSize?: number;
  estimatedTime?: number;
}

/**
 * Export validation error
 */
export interface ExportValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// PREDEFINED CONFIGURATIONS
// ============================================================================

/**
 * Default export configurations for each format
 */
export const DEFAULT_EXPORT_CONFIGS: Record<
  ExportFormat,
  Partial<ExportConfig>
> = {
  excel: {
    format: 'excel',
    includeHeaders: true,
    includeMetadata: true,
    sheetName: 'Data',
    autoColumnWidth: true,
    freezeHeader: true,
  } as Partial<ExcelExportConfig>,

  csv: {
    format: 'csv',
    includeHeaders: true,
    delimiter: ',',
    quoteChar: '"',
    encoding: 'utf-8',
    bomEncoding: true,
  } as Partial<CSVExportConfig>,

  pdf: {
    format: 'pdf',
    includeHeaders: true,
    orientation: 'landscape',
    pageSize: 'a4',
    fontSize: 8,
    pageNumbers: true,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
  } as Partial<PDFExportConfig>,

  json: {
    format: 'json',
    includeHeaders: false,
    pretty: true,
    indent: 2,
    compression: 'none',
  } as Partial<JSONExportConfig>,
};

/**
 * Common export presets
 */
export const EXPORT_PRESETS: ExportPreset[] = [
  {
    key: 'basic_excel',
    label: '기본 Excel',
    description: '표준 Excel 형식으로 내보내기',
    icon: 'excel',
    dataTypes: ['employees', 'hardware', 'software', 'assignments'],
    config: DEFAULT_EXPORT_CONFIGS.excel,
  },
  {
    key: 'detailed_report',
    label: '상세 보고서',
    description: '모든 필드를 포함한 상세 보고서',
    icon: 'report',
    dataTypes: ['employees', 'hardware', 'software', 'assignments'],
    config: {
      ...DEFAULT_EXPORT_CONFIGS.excel,
      includeMetadata: true,
      multipleSheets: true,
    },
  },
  {
    key: 'summary_pdf',
    label: '요약 PDF',
    description: '주요 정보만 포함한 PDF 요약',
    icon: 'pdf',
    dataTypes: ['employees', 'hardware', 'software'],
    config: DEFAULT_EXPORT_CONFIGS.pdf,
  },
  {
    key: 'data_backup',
    label: '데이터 백업',
    description: '전체 데이터 백업용 JSON',
    icon: 'backup',
    dataTypes: ['employees', 'hardware', 'software', 'assignments', 'users'],
    config: DEFAULT_EXPORT_CONFIGS.json,
  },
];

// ============================================================================
// EXPORT SCHEDULING TYPES
// ============================================================================

/**
 * Schedule types for automated exports
 */
export type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';

/**
 * Export schedule configuration
 */
export interface ExportSchedule {
  type: ScheduleType;
  executeAt?: Date; // For 'once' type
  time?: string; // Format: "HH:MM" for recurring schedules
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  cronExpression?: string; // For cron type
  timezone?: string; // Timezone for schedule execution
}

/**
 * Notification configuration for scheduled exports
 */
export interface NotificationConfig {
  enabled: boolean;
  email?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    template?: string;
  };
  push?: {
    enabled: boolean;
    title?: string;
    message?: string;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    method?: 'POST' | 'PUT';
    headers?: Record<string, string>;
    payload?: Record<string, any>;
  };
}

/**
 * Schedule configuration for creating/updating schedules
 */
export interface ScheduleConfig {
  name: string;
  description?: string;
  dataType: ExportDataType;
  exportFormat: ExportFormat;
  schedule: ExportSchedule;
  exportConfig?: ExportConfig;
  notificationConfig?: NotificationConfig;
  isActive?: boolean;
}

/**
 * Scheduled export entity
 */
export interface ScheduledExport extends ScheduleConfig {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date | null;
  runCount: number;
  successCount: number;
  failureCount: number;
  lastResult?: {
    success: boolean;
    executedAt: Date;
    fileName?: string;
    fileSize?: number;
    recordCount?: number;
    executionTime?: number;
    error?: string;
    message?: string;
  };
  isActive: boolean;
}

/**
 * Schedule operation result
 */
export interface ScheduleResult {
  success: boolean;
  scheduleId: string;
  message: string;
  nextRun?: Date | null;
  errors?: string[];
  schedule?: ScheduledExport;
}

/**
 * Schedule validation result
 */
export interface ScheduleValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Export notification
 */
export interface ExportNotification {
  id: string;
  scheduleId: string;
  scheduleName: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    fileName?: string;
    fileSize?: number;
    recordCount?: number;
    executionTime?: number;
    error?: string;
    [key: string]: any;
  };
}

/**
 * Recurring export configuration
 */
export interface RecurringExportConfig {
  scheduleId: string;
  enabled: boolean;
  maxRetries?: number;
  retryDelay?: number; // in minutes
  failureThreshold?: number; // max consecutive failures before disabling
}

/**
 * Analytics data for export scheduling
 */
export interface ExportAnalytics {
  totalSchedules: number;
  activeSchedules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  mostUsedFormat: ExportFormat;
  mostUsedDataType: ExportDataType;
  upcomingExecutions: Array<{
    scheduleId: string;
    scheduleName: string;
    nextRun: Date;
    dataType: ExportDataType;
    format: ExportFormat;
  }>;
  recentExecutions: Array<{
    scheduleId: string;
    scheduleName: string;
    executedAt: Date;
    success: boolean;
    executionTime?: number;
    recordCount?: number;
  }>;
}

// ============================================================================
// EXPORT VALIDATION TYPES
// ============================================================================

/**
 * Export validation result
 */
export interface ExportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    duplicateRecords: number;
    missingFields: number;
  };
  dataQuality: {
    completeness: number;
    consistency: number;
    accuracy: number;
    overall: number;
  };
}

/**
 * Validation rule configuration
 */
export interface ValidationRule {
  name: string;
  type: 'required' | 'type' | 'format' | 'range' | 'enum' | 'custom';
  field: string;
  severity: 'error' | 'warning';
  expectedType?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  allowedValues?: any[];
  validator?: (
    record: any,
    field: string,
    index: number
  ) => Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

/**
 * File integrity check configuration
 */
export interface IntegrityCheck {
  name: string;
  type:
    | 'file_exists'
    | 'file_size'
    | 'record_count'
    | 'data_integrity'
    | 'checksum';
  expectedSize?: number;
  expectedChecksum?: string;
  format?: ExportFormat;
}

/**
 * Integrity verification result
 */
export interface IntegrityVerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: IntegrityCheckResult[];
}

/**
 * Individual integrity check result
 */
export interface IntegrityCheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  warning?: string;
}

/**
 * Recovery options for failed exports
 */
export interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryConditions?: string[];
}

/**
 * Export retry queue item
 */
export interface ExportRetryItem {
  id: string;
  exportRequest: any;
  error: string;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastRetryAt?: Date;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Re-export commonly used types
  ExportConfig as Config,
  ExportRequest as Request,
  ExportResponse as Response,
  ExportColumn as Column,
  ExportTemplate as Template,
};
