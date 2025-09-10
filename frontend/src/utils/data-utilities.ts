/**
 * Data Utility Functions
 *
 * Comprehensive utilities for data cleaning, formatting, validation,
 * sanitization, transformation, and migration operations.
 */

import type { ExportColumn } from '@/types/export';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface DataCleaningOptions {
  trimWhitespace?: boolean;
  removeEmptyFields?: boolean;
  normalizeText?: boolean;
  convertTypes?: boolean;
  handleNulls?: 'remove' | 'replace' | 'keep';
  nullReplacement?: any;
  customCleaners?: Record<string, (value: any) => any>;
}

export interface DataValidationRule {
  field: string;
  type: 'required' | 'type' | 'format' | 'range' | 'length' | 'custom';
  params?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface DataValidationResult {
  valid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationWarning[];
  cleanedData?: any[];
}

export interface DataValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  code: string;
}

export interface DataValidationWarning {
  row: number;
  field: string;
  value: any;
  message: string;
  suggestion?: string;
}

export interface DataTransformationRule {
  field: string;
  operation: 'map' | 'split' | 'combine' | 'extract' | 'convert' | 'format';
  params: any;
  newField?: string;
}

export interface DataMigrationConfig {
  source: {
    format: 'csv' | 'json' | 'excel';
    columns: string[];
    mapping: Record<string, string>;
  };
  target: {
    format: 'csv' | 'json' | 'excel';
    columns: ExportColumn[];
    validation: DataValidationRule[];
  };
  transformation: DataTransformationRule[];
  options: {
    batchSize?: number;
    skipErrors?: boolean;
    preserveOriginal?: boolean;
  };
}

export interface SanitizationOptions {
  htmlTags?: boolean;
  sqlInjection?: boolean;
  xss?: boolean;
  specialCharacters?: boolean;
  unicodeNormalization?: boolean;
  customSanitizers?: Record<string, (value: any) => any>;
}

export interface DataIntegrityCheck {
  name: string;
  description: string;
  checker: (data: any[]) => DataIntegrityResult;
}

export interface DataIntegrityResult {
  passed: boolean;
  issues: DataIntegrityIssue[];
  suggestions: string[];
  score: number; // 0-100
}

export interface DataIntegrityIssue {
  type: 'duplicate' | 'missing' | 'invalid' | 'inconsistent' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRows: number[];
  affectedFields: string[];
  suggestedFix?: string;
}

// ============================================================================
// DATA CLEANING UTILITIES
// ============================================================================

/**
 * Clean data based on specified options
 */
export function cleanData(
  data: any[],
  options: DataCleaningOptions = {}
): any[] {
  const {
    trimWhitespace = true,
    removeEmptyFields = false,
    normalizeText = true,
    convertTypes = true,
    handleNulls = 'keep',
    nullReplacement = null,
    customCleaners = {},
  } = options;

  return data.map(row => {
    const cleanedRow: any = {};

    Object.entries(row).forEach(([key, value]) => {
      let cleanedValue = value;

      // Handle nulls and undefined values
      if (
        cleanedValue === null ||
        cleanedValue === undefined ||
        cleanedValue === ''
      ) {
        switch (handleNulls) {
          case 'remove':
            return; // Skip this field
          case 'replace':
            cleanedValue = nullReplacement;
            break;
          case 'keep':
          default:
            break;
        }
      }

      // Apply custom cleaners first
      if (customCleaners[key]) {
        cleanedValue = customCleaners[key](cleanedValue);
      }

      // Trim whitespace
      if (trimWhitespace && typeof cleanedValue === 'string') {
        cleanedValue = cleanedValue.trim();
      }

      // Normalize text
      if (normalizeText && typeof cleanedValue === 'string') {
        cleanedValue = normalizeString(cleanedValue);
      }

      // Convert types
      if (convertTypes) {
        cleanedValue = convertToAppropriateType(cleanedValue);
      }

      // Remove empty fields if requested
      if (
        removeEmptyFields &&
        (cleanedValue === '' ||
          cleanedValue === null ||
          cleanedValue === undefined)
      ) {
        return;
      }

      cleanedRow[key] = cleanedValue;
    });

    return cleanedRow;
  });
}

/**
 * Normalize string values
 */
export function normalizeString(value: string): string {
  return value
    .normalize('NFKD') // Unicode normalization
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim();
}

/**
 * Convert string values to appropriate types
 */
export function convertToAppropriateType(value: any): any {
  if (typeof value !== 'string') return value;

  const trimmedValue = value.trim();

  // Empty string
  if (trimmedValue === '') return null;

  // Boolean values
  if (/^(true|false|yes|no|y|n|1|0)$/i.test(trimmedValue)) {
    return /^(true|yes|y|1)$/i.test(trimmedValue);
  }

  // Numbers
  if (/^\d+$/.test(trimmedValue)) {
    return parseInt(trimmedValue, 10);
  }

  if (/^\d*\.\d+$/.test(trimmedValue)) {
    return parseFloat(trimmedValue);
  }

  // Dates
  if (isValidDate(trimmedValue)) {
    return new Date(trimmedValue);
  }

  // JSON objects
  if (
    (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
    (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      // Keep as string if JSON parsing fails
    }
  }

  return trimmedValue;
}

/**
 * Check if string is a valid date
 */
export function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.length >= 8; // Minimum reasonable date length
}

// ============================================================================
// DATA VALIDATION UTILITIES
// ============================================================================

/**
 * Validate data against rules
 */
export function validateData(
  data: any[],
  rules: DataValidationRule[]
): DataValidationResult {
  const errors: DataValidationError[] = [];
  const warnings: DataValidationWarning[] = [];
  const cleanedData: any[] = [];

  data.forEach((row, rowIndex) => {
    const cleanedRow = { ...row };
    let rowValid = true;

    rules.forEach(rule => {
      const value = getNestedValue(row, rule.field);
      const validationResult = validateField(value, rule, rowIndex);

      if (validationResult.error) {
        errors.push(validationResult.error);
        rowValid = false;
      }

      if (validationResult.warning) {
        warnings.push(validationResult.warning);
      }

      if (validationResult.cleanedValue !== undefined) {
        setNestedValue(cleanedRow, rule.field, validationResult.cleanedValue);
      }
    });

    if (rowValid) {
      cleanedData.push(cleanedRow);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleanedData,
  };
}

/**
 * Validate individual field
 */
export function validateField(
  value: any,
  rule: DataValidationRule,
  rowIndex: number
): {
  error?: DataValidationError;
  warning?: DataValidationWarning;
  cleanedValue?: any;
} {
  const result: any = {};

  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        result.error = {
          row: rowIndex + 1,
          field: rule.field,
          value,
          message: rule.message || `필수 필드 '${rule.field}'가 비어있습니다.`,
          code: 'REQUIRED_FIELD_MISSING',
        };
      }
      break;

    case 'type':
      const expectedType = rule.params;
      const actualType = getValueType(value);
      if (actualType !== expectedType) {
        // Try to convert
        const convertedValue = convertToType(value, expectedType);
        if (convertedValue !== null) {
          result.cleanedValue = convertedValue;
          result.warning = {
            row: rowIndex + 1,
            field: rule.field,
            value,
            message: `값이 ${expectedType} 타입으로 변환되었습니다.`,
            suggestion: `원본: ${value}, 변환: ${convertedValue}`,
          };
        } else {
          result.error = {
            row: rowIndex + 1,
            field: rule.field,
            value,
            message:
              rule.message ||
              `타입이 올바르지 않습니다. 예상: ${expectedType}, 실제: ${actualType}`,
            code: 'INVALID_TYPE',
          };
        }
      }
      break;

    case 'format':
      const pattern = rule.params;
      if (value && !pattern.test(String(value))) {
        result.error = {
          row: rowIndex + 1,
          field: rule.field,
          value,
          message: rule.message || `형식이 올바르지 않습니다.`,
          code: 'INVALID_FORMAT',
        };
      }
      break;

    case 'range':
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        const { min, max } = rule.params;
        if (
          (min !== undefined && numValue < min) ||
          (max !== undefined && numValue > max)
        ) {
          result.error = {
            row: rowIndex + 1,
            field: rule.field,
            value,
            message:
              rule.message || `값이 범위를 벗어났습니다 (${min}-${max}).`,
            code: 'VALUE_OUT_OF_RANGE',
          };
        }
      }
      break;

    case 'length':
      const strValue = String(value);
      const { minLength, maxLength } = rule.params;
      if (
        (minLength !== undefined && strValue.length < minLength) ||
        (maxLength !== undefined && strValue.length > maxLength)
      ) {
        result.error = {
          row: rowIndex + 1,
          field: rule.field,
          value,
          message:
            rule.message ||
            `길이가 범위를 벗어났습니다 (${minLength}-${maxLength}).`,
          code: 'INVALID_LENGTH',
        };
      }
      break;

    case 'custom':
      if (rule.validator) {
        const validationResult = rule.validator(value);
        if (validationResult !== true) {
          result.error = {
            row: rowIndex + 1,
            field: rule.field,
            value,
            message:
              typeof validationResult === 'string'
                ? validationResult
                : rule.message || '사용자 정의 검증 실패',
            code: 'CUSTOM_VALIDATION_FAILED',
          };
        }
      }
      break;
  }

  return result;
}

/**
 * Get value type
 */
export function getValueType(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'string';
}

/**
 * Convert value to specified type
 */
export function convertToType(value: any, targetType: string): any {
  if (value === null || value === undefined) return null;

  switch (targetType) {
    case 'string':
      return String(value);
    case 'number':
      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return /^(true|yes|y|1)$/i.test(value.trim());
      }
      return Boolean(value);
    case 'date':
      const dateValue = new Date(value);
      return isNaN(dateValue.getTime()) ? null : dateValue;
    default:
      return value;
  }
}

// ============================================================================
// DATA SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitize data to prevent security issues
 */
export function sanitizeData(
  data: any[],
  options: SanitizationOptions = {}
): any[] {
  const {
    htmlTags = true,
    sqlInjection = true,
    xss = true,
    specialCharacters = false,
    unicodeNormalization = true,
    customSanitizers = {},
  } = options;

  return data.map(row => {
    const sanitizedRow: any = {};

    Object.entries(row).forEach(([key, value]) => {
      let sanitizedValue = value;

      // Apply custom sanitizers first
      if (customSanitizers[key]) {
        sanitizedValue = customSanitizers[key](sanitizedValue);
      }

      if (typeof sanitizedValue === 'string') {
        // HTML tags removal
        if (htmlTags) {
          sanitizedValue = removeHtmlTags(sanitizedValue);
        }

        // SQL injection prevention
        if (sqlInjection) {
          sanitizedValue = escapeSqlInjection(sanitizedValue);
        }

        // XSS prevention
        if (xss) {
          sanitizedValue = escapeXss(sanitizedValue);
        }

        // Special characters handling
        if (specialCharacters) {
          sanitizedValue = escapeSpecialCharacters(sanitizedValue);
        }

        // Unicode normalization
        if (unicodeNormalization) {
          sanitizedValue = sanitizedValue.normalize('NFKC');
        }
      }

      sanitizedRow[key] = sanitizedValue;
    });

    return sanitizedRow;
  });
}

/**
 * Remove HTML tags
 */
export function removeHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Escape SQL injection patterns
 */
export function escapeSqlInjection(value: string): string {
  return value
    .replace(/'/g, "''")
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\--')
    .replace(/\/\*/g, '\\/*')
    .replace(/\*\//g, '\\*/');
}

/**
 * Escape XSS patterns
 */
export function escapeXss(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Escape special characters
 */
export function escapeSpecialCharacters(value: string): string {
  return value.replace(/[^\w\s가-힣]/g, '\\$&');
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform data based on rules
 */
export function transformData(
  data: any[],
  rules: DataTransformationRule[]
): any[] {
  return data.map(row => {
    const transformedRow = { ...row };

    rules.forEach(rule => {
      const value = getNestedValue(row, rule.field);
      const transformedValue = applyTransformation(value, rule, row);

      const targetField = rule.newField || rule.field;
      setNestedValue(transformedRow, targetField, transformedValue);
    });

    return transformedRow;
  });
}

/**
 * Apply transformation rule
 */
export function applyTransformation(
  value: any,
  rule: DataTransformationRule,
  row: any
): any {
  switch (rule.operation) {
    case 'map':
      return rule.params[value] || value;

    case 'split':
      if (typeof value === 'string') {
        const parts = value.split(rule.params.delimiter);
        return rule.params.index !== undefined
          ? parts[rule.params.index]
          : parts;
      }
      return value;

    case 'combine':
      const fields = rule.params.fields as string[];
      const delimiter = rule.params.delimiter || ' ';
      return fields.map(field => getNestedValue(row, field)).join(delimiter);

    case 'extract':
      if (typeof value === 'string' && rule.params.pattern) {
        const match = value.match(rule.params.pattern);
        return match ? match[rule.params.group || 0] : null;
      }
      return value;

    case 'convert':
      return convertToType(value, rule.params.targetType);

    case 'format':
      return formatValue(value, rule.params);

    default:
      return value;
  }
}

/**
 * Format value based on parameters
 */
export function formatValue(value: any, params: any): string {
  switch (params.type) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString('ko-KR', params.options || {});
      }
      return String(value);

    case 'number':
      if (typeof value === 'number') {
        return value.toLocaleString('ko-KR', params.options || {});
      }
      return String(value);

    case 'currency':
      if (typeof value === 'number') {
        return `${value.toLocaleString('ko-KR')}원`;
      }
      return String(value);

    case 'percentage':
      if (typeof value === 'number') {
        return `${(value * 100).toFixed(params.decimals || 1)}%`;
      }
      return String(value);

    default:
      return String(value);
  }
}

// ============================================================================
// DATA INTEGRITY UTILITIES
// ============================================================================

/**
 * Check data integrity
 */
export function checkDataIntegrity(
  data: any[],
  checks: DataIntegrityCheck[]
): DataIntegrityResult {
  const allIssues: DataIntegrityIssue[] = [];
  const allSuggestions: string[] = [];
  let totalScore = 0;

  checks.forEach(check => {
    const result = check.checker(data);
    allIssues.push(...result.issues);
    allSuggestions.push(...result.suggestions);
    totalScore += result.score;
  });

  const averageScore = checks.length > 0 ? totalScore / checks.length : 100;

  return {
    passed:
      allIssues.filter(
        issue => issue.severity === 'critical' || issue.severity === 'high'
      ).length === 0,
    issues: allIssues,
    suggestions: [...new Set(allSuggestions)], // Remove duplicates
    score: Math.round(averageScore),
  };
}

/**
 * Built-in integrity checks
 */
export const BUILT_IN_INTEGRITY_CHECKS: DataIntegrityCheck[] = [
  {
    name: 'duplicate_detection',
    description: '중복 레코드 검출',
    checker: (data: any[]) => {
      const seen = new Set();
      const duplicates: number[] = [];

      data.forEach((row, index) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
          duplicates.push(index);
        } else {
          seen.add(key);
        }
      });

      const issues: DataIntegrityIssue[] =
        duplicates.length > 0
          ? [
              {
                type: 'duplicate',
                severity: 'medium',
                description: `${duplicates.length}개의 중복 레코드가 발견되었습니다.`,
                affectedRows: duplicates,
                affectedFields: [],
                suggestedFix:
                  '중복 레코드를 제거하거나 고유 식별자를 추가하세요.',
              },
            ]
          : [];

      return {
        passed: duplicates.length === 0,
        issues,
        suggestions: duplicates.length > 0 ? ['중복 레코드를 제거하세요.'] : [],
        score: Math.max(0, 100 - (duplicates.length / data.length) * 100),
      };
    },
  },

  {
    name: 'missing_data_detection',
    description: '누락 데이터 검출',
    checker: (data: any[]) => {
      const fieldCounts: Record<string, number> = {};
      const totalRows = data.length;

      // Count missing values per field
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          if (row[key] === null || row[key] === undefined || row[key] === '') {
            fieldCounts[key] = (fieldCounts[key] || 0) + 1;
          }
        });
      });

      const issues: DataIntegrityIssue[] = [];
      Object.entries(fieldCounts).forEach(([field, missingCount]) => {
        const missingPercentage = (missingCount / totalRows) * 100;
        if (missingPercentage > 10) {
          // More than 10% missing
          issues.push({
            type: 'missing',
            severity: missingPercentage > 50 ? 'high' : 'medium',
            description: `필드 '${field}'에서 ${missingCount}개 값이 누락되었습니다 (${missingPercentage.toFixed(1)}%).`,
            affectedRows: [],
            affectedFields: [field],
            suggestedFix:
              '누락된 값을 채우거나 필드가 선택사항인지 확인하세요.',
          });
        }
      });

      const avgMissingPercentage =
        (Object.values(fieldCounts).reduce((sum, count) => sum + count, 0) /
          (Object.keys(fieldCounts).length * totalRows)) *
        100;

      return {
        passed: issues.length === 0,
        issues,
        suggestions:
          issues.length > 0 ? ['누락된 데이터를 확인하고 보완하세요.'] : [],
        score: Math.max(0, 100 - avgMissingPercentage),
      };
    },
  },

  {
    name: 'data_consistency',
    description: '데이터 일관성 검사',
    checker: (data: any[]) => {
      const issues: DataIntegrityIssue[] = [];
      const typeConsistency: Record<string, Record<string, number>> = {};

      // Check type consistency for each field
      data.forEach((row, rowIndex) => {
        Object.entries(row).forEach(([field, value]) => {
          const type = getValueType(value);
          if (!typeConsistency[field]) {
            typeConsistency[field] = {};
          }
          typeConsistency[field][type] =
            (typeConsistency[field][type] || 0) + 1;
        });
      });

      // Identify fields with inconsistent types
      Object.entries(typeConsistency).forEach(([field, types]) => {
        const typeCount = Object.keys(types).length;
        if (typeCount > 1) {
          const dominantType = Object.entries(types).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];
          const inconsistentCount = Object.entries(types)
            .filter(([type]) => type !== dominantType)
            .reduce((sum, [, count]) => sum + count, 0);

          issues.push({
            type: 'inconsistent',
            severity: inconsistentCount > data.length * 0.1 ? 'high' : 'low',
            description: `필드 '${field}'의 데이터 타입이 일관되지 않습니다. 주요 타입: ${dominantType}`,
            affectedRows: [],
            affectedFields: [field],
            suggestedFix: `모든 값을 ${dominantType} 타입으로 통일하세요.`,
          });
        }
      });

      return {
        passed: issues.length === 0,
        issues,
        suggestions:
          issues.length > 0 ? ['데이터 타입을 일관되게 유지하세요.'] : [],
        score: Math.max(
          0,
          100 - (issues.length / Object.keys(typeConsistency).length) * 100
        ),
      };
    },
  },
];

// ============================================================================
// UTILITY HELPER FUNCTIONS
// ============================================================================

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * Compare two datasets for differences
 */
export function compareDatasets(
  dataset1: any[],
  dataset2: any[],
  keyField: string = 'id'
): {
  added: any[];
  removed: any[];
  modified: Array<{ original: any; updated: any; changes: string[] }>;
  unchanged: any[];
} {
  const result = {
    added: [] as any[],
    removed: [] as any[],
    modified: [] as Array<{ original: any; updated: any; changes: string[] }>,
    unchanged: [] as any[],
  };

  const dataset1Map = new Map(
    dataset1.map(item => [getNestedValue(item, keyField), item])
  );
  const dataset2Map = new Map(
    dataset2.map(item => [getNestedValue(item, keyField), item])
  );

  // Find added items (in dataset2 but not in dataset1)
  dataset2.forEach(item => {
    const key = getNestedValue(item, keyField);
    if (!dataset1Map.has(key)) {
      result.added.push(item);
    }
  });

  // Find removed items (in dataset1 but not in dataset2)
  dataset1.forEach(item => {
    const key = getNestedValue(item, keyField);
    if (!dataset2Map.has(key)) {
      result.removed.push(item);
    }
  });

  // Find modified and unchanged items
  dataset1.forEach(originalItem => {
    const key = getNestedValue(originalItem, keyField);
    const updatedItem = dataset2Map.get(key);

    if (updatedItem) {
      const changes = findObjectChanges(originalItem, updatedItem);
      if (changes.length > 0) {
        result.modified.push({
          original: originalItem,
          updated: updatedItem,
          changes,
        });
      } else {
        result.unchanged.push(originalItem);
      }
    }
  });

  return result;
}

/**
 * Find changes between two objects
 */
export function findObjectChanges(
  obj1: any,
  obj2: any,
  prefix: string = ''
): string[] {
  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (val1 === undefined && val2 !== undefined) {
      changes.push(`Added: ${fullKey} = ${val2}`);
    } else if (val1 !== undefined && val2 === undefined) {
      changes.push(`Removed: ${fullKey}`);
    } else if (val1 !== val2) {
      if (
        typeof val1 === 'object' &&
        typeof val2 === 'object' &&
        val1 !== null &&
        val2 !== null
      ) {
        changes.push(...findObjectChanges(val1, val2, fullKey));
      } else {
        changes.push(`Changed: ${fullKey} from ${val1} to ${val2}`);
      }
    }
  });

  return changes;
}

/**
 * Generate data quality report
 */
export function generateDataQualityReport(data: any[]): {
  overview: {
    totalRows: number;
    totalFields: number;
    completeness: number;
    consistency: number;
    accuracy: number;
    overall: number;
  };
  fieldAnalysis: Array<{
    field: string;
    completeness: number;
    uniqueness: number;
    consistency: number;
    dataType: string;
    issues: string[];
  }>;
  recommendations: string[];
} {
  if (data.length === 0) {
    return {
      overview: {
        totalRows: 0,
        totalFields: 0,
        completeness: 0,
        consistency: 0,
        accuracy: 0,
        overall: 0,
      },
      fieldAnalysis: [],
      recommendations: ['데이터가 없습니다.'],
    };
  }

  const totalRows = data.length;
  const allFields = new Set<string>();

  // Collect all unique fields
  data.forEach(row => {
    Object.keys(row).forEach(key => allFields.add(key));
  });

  const totalFields = allFields.size;
  const fieldAnalysis: any[] = [];
  let totalCompleteness = 0;
  let totalConsistency = 0;

  // Analyze each field
  allFields.forEach(field => {
    const values = data.map(row => row[field]);
    const nonEmptyValues = values.filter(
      val => val !== null && val !== undefined && val !== ''
    );
    const uniqueValues = new Set(nonEmptyValues);

    const completeness = (nonEmptyValues.length / totalRows) * 100;
    const uniqueness =
      nonEmptyValues.length > 0
        ? (uniqueValues.size / nonEmptyValues.length) * 100
        : 0;

    // Check type consistency
    const types = new Set(nonEmptyValues.map(val => getValueType(val)));
    const consistency =
      types.size <= 1 ? 100 : Math.max(0, 100 - (types.size - 1) * 25);

    const issues: string[] = [];
    if (completeness < 95)
      issues.push(`${(100 - completeness).toFixed(1)}% 데이터 누락`);
    if (consistency < 90) issues.push('데이터 타입 불일치');
    if (uniqueness < 10 && nonEmptyValues.length > 10)
      issues.push('중복 값 과다');

    fieldAnalysis.push({
      field,
      completeness,
      uniqueness,
      consistency,
      dataType: types.size === 1 ? Array.from(types)[0] : 'mixed',
      issues,
    });

    totalCompleteness += completeness;
    totalConsistency += consistency;
  });

  const avgCompleteness = totalCompleteness / totalFields;
  const avgConsistency = totalConsistency / totalFields;
  const accuracy = 95; // Placeholder - would need actual accuracy checks
  const overall = (avgCompleteness + avgConsistency + accuracy) / 3;

  const recommendations: string[] = [];
  if (avgCompleteness < 90) recommendations.push('누락된 데이터를 보완하세요.');
  if (avgConsistency < 90)
    recommendations.push('데이터 타입을 일관되게 유지하세요.');
  if (overall < 80)
    recommendations.push('전반적인 데이터 품질 개선이 필요합니다.');

  return {
    overview: {
      totalRows,
      totalFields,
      completeness: Math.round(avgCompleteness),
      consistency: Math.round(avgConsistency),
      accuracy: Math.round(accuracy),
      overall: Math.round(overall),
    },
    fieldAnalysis,
    recommendations,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const DataUtilities = {
  // Cleaning
  cleanData,
  normalizeString,
  convertToAppropriateType,
  isValidDate,

  // Validation
  validateData,
  validateField,
  getValueType,
  convertToType,

  // Sanitization
  sanitizeData,
  removeHtmlTags,
  escapeSqlInjection,
  escapeXss,
  escapeSpecialCharacters,

  // Transformation
  transformData,
  applyTransformation,
  formatValue,

  // Integrity
  checkDataIntegrity,
  BUILT_IN_INTEGRITY_CHECKS,

  // Helpers
  getNestedValue,
  setNestedValue,
  deepClone,
  compareDatasets,
  findObjectChanges,
  generateDataQualityReport,
};
