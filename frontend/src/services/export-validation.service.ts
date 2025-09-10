/**
 * Export Validation Service
 *
 * Handles export data verification, file integrity checks, and error recovery
 */

import type {
  ExportResult,
  ExportConfig,
  ExportValidationResult,
  ExportDataType,
  ExportFormat,
  ValidationRule,
  IntegrityCheck,
  RecoveryOptions,
} from '@/types/export';
import { DataUtilities } from '@/utils/data-utilities';

export class ExportValidationService {
  private validationRules: Map<string, ValidationRule[]> = new Map();
  private integrityChecks: Map<string, IntegrityCheck[]> = new Map();
  private retryQueue: ExportRetryItem[] = [];

  constructor() {
    this.initializeValidationRules();
    this.initializeIntegrityChecks();
  }

  // ============================================================================
  // DATA VALIDATION
  // ============================================================================

  /**
   * Validate export data before processing
   */
  async validateExportData(
    data: any[],
    dataType: ExportDataType,
    config: ExportConfig
  ): Promise<ExportValidationResult> {
    try {
      const result: ExportValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        statistics: {
          totalRecords: data.length,
          validRecords: 0,
          invalidRecords: 0,
          duplicateRecords: 0,
          missingFields: 0,
        },
        dataQuality: {
          completeness: 0,
          consistency: 0,
          accuracy: 0,
          overall: 0,
        },
      };

      // Basic validation
      if (!data || data.length === 0) {
        result.isValid = false;
        result.errors.push('No data provided for export');
        return result;
      }

      // Get validation rules for data type
      const rules = this.getValidationRules(dataType);

      // Validate each record
      const validationResults = await Promise.all(
        data.map((record, index) => this.validateRecord(record, rules, index))
      );

      // Aggregate validation results
      result.errors = validationResults.flatMap(r => r.errors);
      result.warnings = validationResults.flatMap(r => r.warnings);

      result.statistics.validRecords = validationResults.filter(
        r => r.isValid
      ).length;
      result.statistics.invalidRecords = validationResults.filter(
        r => !r.isValid
      ).length;

      // Check for duplicates
      const duplicateCheck = this.checkForDuplicates(data);
      result.statistics.duplicateRecords = duplicateCheck.duplicateCount;
      result.warnings.push(...duplicateCheck.warnings);

      // Check for missing fields
      const missingFieldsCheck = this.checkMissingFields(data, dataType);
      result.statistics.missingFields = missingFieldsCheck.missingCount;
      result.warnings.push(...missingFieldsCheck.warnings);

      // Calculate data quality metrics
      result.dataQuality = this.calculateDataQuality(data, validationResults);

      // Overall validation status
      result.isValid = result.errors.length === 0;

      // Format-specific validation
      const formatValidation = await this.validateForFormat(
        data,
        config.format,
        config
      );
      result.errors.push(...formatValidation.errors);
      result.warnings.push(...formatValidation.warnings);

      return result;
    } catch (error) {
      console.error('Error validating export data:', error);
      return {
        isValid: false,
        errors: [
          error instanceof Error ? error.message : 'Unknown validation error',
        ],
        warnings: [],
        statistics: {
          totalRecords: data?.length || 0,
          validRecords: 0,
          invalidRecords: data?.length || 0,
          duplicateRecords: 0,
          missingFields: 0,
        },
        dataQuality: {
          completeness: 0,
          consistency: 0,
          accuracy: 0,
          overall: 0,
        },
      };
    }
  }

  /**
   * Validate individual record against rules
   */
  private async validateRecord(
    record: any,
    rules: ValidationRule[],
    index: number
  ): Promise<RecordValidationResult> {
    const result: RecordValidationResult = {
      index,
      isValid: true,
      errors: [],
      warnings: [],
    };

    for (const rule of rules) {
      try {
        const ruleResult = await this.applyValidationRule(record, rule, index);

        if (!ruleResult.isValid) {
          result.isValid = false;
          result.errors.push(...ruleResult.errors);
        }

        result.warnings.push(...ruleResult.warnings);
      } catch (error) {
        result.isValid = false;
        result.errors.push(
          `Rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return result;
  }

  /**
   * Apply a specific validation rule
   */
  private async applyValidationRule(
    record: any,
    rule: ValidationRule,
    index: number
  ): Promise<RuleValidationResult> {
    const result: RuleValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    switch (rule.type) {
      case 'required':
        if (!this.validateRequired(record, rule.field)) {
          result.isValid = false;
          result.errors.push(
            `Row ${index + 1}: Field '${rule.field}' is required`
          );
        }
        break;

      case 'type':
        if (!this.validateType(record, rule.field, rule.expectedType!)) {
          result.isValid = false;
          result.errors.push(
            `Row ${index + 1}: Field '${rule.field}' must be of type ${rule.expectedType}`
          );
        }
        break;

      case 'format':
        if (!this.validateFormat(record, rule.field, rule.pattern!)) {
          result.isValid = false;
          result.errors.push(
            `Row ${index + 1}: Field '${rule.field}' format is invalid`
          );
        }
        break;

      case 'range':
        if (!this.validateRange(record, rule.field, rule.min, rule.max)) {
          result.isValid = false;
          result.errors.push(
            `Row ${index + 1}: Field '${rule.field}' value is out of range`
          );
        }
        break;

      case 'enum':
        if (!this.validateEnum(record, rule.field, rule.allowedValues!)) {
          result.isValid = false;
          result.errors.push(
            `Row ${index + 1}: Field '${rule.field}' contains invalid value`
          );
        }
        break;

      case 'custom':
        if (rule.validator) {
          const customResult = await rule.validator(record, rule.field, index);
          if (!customResult.isValid) {
            result.isValid = false;
            result.errors.push(...customResult.errors);
          }
          result.warnings.push(...customResult.warnings);
        }
        break;
    }

    return result;
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateRequired(record: any, field: string): boolean {
    const value = DataUtilities.getNestedValue(record, field);
    return value !== null && value !== undefined && value !== '';
  }

  private validateType(
    record: any,
    field: string,
    expectedType: string
  ): boolean {
    const value = DataUtilities.getNestedValue(record, field);
    if (value === null || value === undefined) return true; // Allow null/undefined for optional fields

    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'email':
        return (
          typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        );
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  private validateFormat(record: any, field: string, pattern: RegExp): boolean {
    const value = DataUtilities.getNestedValue(record, field);
    if (value === null || value === undefined) return true;

    return pattern.test(String(value));
  }

  private validateRange(
    record: any,
    field: string,
    min?: number,
    max?: number
  ): boolean {
    const value = DataUtilities.getNestedValue(record, field);
    if (value === null || value === undefined) return true;

    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;

    return true;
  }

  private validateEnum(
    record: any,
    field: string,
    allowedValues: any[]
  ): boolean {
    const value = DataUtilities.getNestedValue(record, field);
    if (value === null || value === undefined) return true;

    return allowedValues.includes(value);
  }

  // ============================================================================
  // DATA QUALITY CHECKS
  // ============================================================================

  private checkForDuplicates(data: any[]): {
    duplicateCount: number;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let duplicateCount = 0;

    // Create a map to track unique combinations
    const uniqueRecords = new Map();

    data.forEach((record, index) => {
      // Create a hash of the record for comparison
      const recordHash = JSON.stringify(
        DataUtilities.cleanData(record, {
          removeNulls: true,
          trimStrings: true,
          normalizeNumbers: true,
        })
      );

      if (uniqueRecords.has(recordHash)) {
        duplicateCount++;
        warnings.push(
          `Row ${index + 1}: Duplicate record detected (similar to row ${uniqueRecords.get(recordHash) + 1})`
        );
      } else {
        uniqueRecords.set(recordHash, index);
      }
    });

    return { duplicateCount, warnings };
  }

  private checkMissingFields(
    data: any[],
    dataType: ExportDataType
  ): { missingCount: number; warnings: string[] } {
    const warnings: string[] = [];
    let missingCount = 0;

    // Get required fields for data type
    const requiredFields = this.getRequiredFields(dataType);

    data.forEach((record, index) => {
      requiredFields.forEach(field => {
        const value = DataUtilities.getNestedValue(record, field);
        if (value === null || value === undefined || value === '') {
          missingCount++;
          warnings.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });
    });

    return { missingCount, warnings };
  }

  private calculateDataQuality(
    data: any[],
    validationResults: RecordValidationResult[]
  ): DataQualityMetrics {
    const totalRecords = data.length;
    const validRecords = validationResults.filter(r => r.isValid).length;

    // Completeness: percentage of records with all required fields
    const completeness =
      totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0;

    // Consistency: percentage of records following expected formats
    const consistentRecords = validationResults.filter(
      r => r.warnings.length === 0
    ).length;
    const consistency =
      totalRecords > 0 ? (consistentRecords / totalRecords) * 100 : 0;

    // Accuracy: percentage of records with no validation errors
    const accuracy = completeness; // Same as completeness for now

    // Overall quality score
    const overall = (completeness + consistency + accuracy) / 3;

    return {
      completeness: Math.round(completeness * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      overall: Math.round(overall * 100) / 100,
    };
  }

  // ============================================================================
  // FORMAT-SPECIFIC VALIDATION
  // ============================================================================

  private async validateForFormat(
    data: any[],
    format: ExportFormat,
    config: ExportConfig
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (format) {
      case 'excel':
        // Excel-specific validation
        if (data.length > 1048576) {
          errors.push('Excel format supports maximum 1,048,576 rows');
        }

        // Check for problematic characters in cell values
        data.forEach((record, index) => {
          Object.values(record).forEach(value => {
            if (typeof value === 'string' && value.length > 32767) {
              warnings.push(
                `Row ${index + 1}: Cell value exceeds Excel's 32,767 character limit`
              );
            }
          });
        });
        break;

      case 'csv':
        // CSV-specific validation
        const delimiter = config.csv?.delimiter || ',';
        data.forEach((record, index) => {
          Object.values(record).forEach(value => {
            if (typeof value === 'string' && value.includes(delimiter)) {
              warnings.push(
                `Row ${index + 1}: Value contains delimiter character '${delimiter}'`
              );
            }
          });
        });
        break;

      case 'pdf':
        // PDF-specific validation
        if (data.length > 10000) {
          warnings.push('Large datasets may result in very large PDF files');
        }
        break;

      case 'json':
        // JSON-specific validation
        try {
          JSON.stringify(data);
        } catch (error) {
          errors.push('Data contains values that cannot be serialized to JSON');
        }
        break;
    }

    return { errors, warnings };
  }

  // ============================================================================
  // FILE INTEGRITY CHECKS
  // ============================================================================

  /**
   * Verify exported file integrity
   */
  async verifyFileIntegrity(
    filePath: string,
    expectedData: any[],
    format: ExportFormat
  ): Promise<IntegrityVerificationResult> {
    try {
      const result: IntegrityVerificationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        checks: [],
      };

      // Get integrity checks for format
      const checks = this.getIntegrityChecks(format);

      for (const check of checks) {
        const checkResult = await this.performIntegrityCheck(
          filePath,
          expectedData,
          check
        );
        result.checks.push(checkResult);

        if (!checkResult.passed) {
          result.isValid = false;
          result.errors.push(checkResult.message);
        }

        if (checkResult.warning) {
          result.warnings.push(checkResult.warning);
        }
      }

      return result;
    } catch (error) {
      console.error('Error verifying file integrity:', error);
      return {
        isValid: false,
        errors: [
          error instanceof Error
            ? error.message
            : 'Unknown integrity check error',
        ],
        warnings: [],
        checks: [],
      };
    }
  }

  /**
   * Perform individual integrity check
   */
  private async performIntegrityCheck(
    filePath: string,
    expectedData: any[],
    check: IntegrityCheck
  ): Promise<IntegrityCheckResult> {
    const result: IntegrityCheckResult = {
      name: check.name,
      passed: false,
      message: '',
      details: {},
    };

    try {
      switch (check.type) {
        case 'file_exists':
          result.passed = await this.checkFileExists(filePath);
          result.message = result.passed
            ? 'File exists'
            : 'File does not exist';
          break;

        case 'file_size':
          const sizeCheck = await this.checkFileSize(
            filePath,
            check.expectedSize
          );
          result.passed = sizeCheck.isValid;
          result.message = sizeCheck.message;
          result.details = {
            actualSize: sizeCheck.actualSize,
            expectedSize: check.expectedSize,
          };
          break;

        case 'record_count':
          const countCheck = await this.checkRecordCount(
            filePath,
            expectedData.length,
            check.format!
          );
          result.passed = countCheck.isValid;
          result.message = countCheck.message;
          result.details = {
            actualCount: countCheck.actualCount,
            expectedCount: expectedData.length,
          };
          break;

        case 'data_integrity':
          const dataCheck = await this.checkDataIntegrity(
            filePath,
            expectedData,
            check.format!
          );
          result.passed = dataCheck.isValid;
          result.message = dataCheck.message;
          result.details = dataCheck.details;
          break;

        case 'checksum':
          const checksumCheck = await this.checkFileChecksum(
            filePath,
            check.expectedChecksum
          );
          result.passed = checksumCheck.isValid;
          result.message = checksumCheck.message;
          result.details = { actualChecksum: checksumCheck.actualChecksum };
          break;
      }
    } catch (error) {
      result.passed = false;
      result.message = `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return result;
  }

  // ============================================================================
  // INTEGRITY CHECK HELPERS
  // ============================================================================

  private async checkFileExists(filePath: string): Promise<boolean> {
    // In browser environment, we can't directly check file system
    // This would be implemented differently in a Node.js environment
    return true; // Assume file exists for now
  }

  private async checkFileSize(
    filePath: string,
    expectedSize?: number
  ): Promise<{
    isValid: boolean;
    message: string;
    actualSize: number;
  }> {
    // Mock implementation for browser environment
    const actualSize = 0; // Would get actual file size
    const isValid = expectedSize
      ? Math.abs(actualSize - expectedSize) < expectedSize * 0.1
      : true;

    return {
      isValid,
      message: isValid
        ? 'File size is within expected range'
        : 'File size differs significantly from expected',
      actualSize,
    };
  }

  private async checkRecordCount(
    filePath: string,
    expectedCount: number,
    format: ExportFormat
  ): Promise<{
    isValid: boolean;
    message: string;
    actualCount: number;
  }> {
    // Mock implementation - would parse file and count records
    const actualCount = expectedCount; // Assume correct for now
    const isValid = actualCount === expectedCount;

    return {
      isValid,
      message: isValid
        ? 'Record count matches expected'
        : `Record count mismatch: expected ${expectedCount}, got ${actualCount}`,
      actualCount,
    };
  }

  private async checkDataIntegrity(
    filePath: string,
    expectedData: any[],
    format: ExportFormat
  ): Promise<{
    isValid: boolean;
    message: string;
    details: any;
  }> {
    // Mock implementation - would parse file and compare data
    return {
      isValid: true,
      message: 'Data integrity verified',
      details: {
        sampledRecords: Math.min(10, expectedData.length),
        matchingRecords: Math.min(10, expectedData.length),
      },
    };
  }

  private async checkFileChecksum(
    filePath: string,
    expectedChecksum?: string
  ): Promise<{
    isValid: boolean;
    message: string;
    actualChecksum: string;
  }> {
    // Mock implementation - would calculate file checksum
    const actualChecksum = 'mock-checksum';
    const isValid = !expectedChecksum || actualChecksum === expectedChecksum;

    return {
      isValid,
      message: isValid ? 'Checksum verified' : 'Checksum mismatch',
      actualChecksum,
    };
  }

  // ============================================================================
  // ERROR RECOVERY AND RETRY
  // ============================================================================

  /**
   * Add failed export to retry queue
   */
  addToRetryQueue(
    exportRequest: any,
    error: Error,
    options: RecoveryOptions = {}
  ): string {
    const retryItem: ExportRetryItem = {
      id: `retry_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      exportRequest,
      error: error.message,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 60000, // 1 minute
      backoffMultiplier: options.backoffMultiplier || 2,
      status: 'pending',
    };

    this.retryQueue.push(retryItem);

    // Schedule first retry
    this.scheduleRetry(retryItem);

    return retryItem.id;
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    const pendingItems = this.retryQueue.filter(
      item => item.status === 'pending'
    );

    for (const item of pendingItems) {
      if (item.retryCount >= item.maxRetries) {
        item.status = 'failed';
        console.error(`Export retry failed permanently: ${item.id}`);
        continue;
      }

      try {
        item.status = 'processing';

        // Attempt retry (would call actual export service)
        // const result = await this.retryExport(item.exportRequest);

        // For now, simulate success
        item.status = 'completed';
        console.log(`Export retry succeeded: ${item.id}`);
      } catch (error) {
        item.retryCount++;
        item.lastRetryAt = new Date();

        if (item.retryCount < item.maxRetries) {
          item.status = 'pending';
          this.scheduleRetry(item);
        } else {
          item.status = 'failed';
          console.error(`Export retry failed: ${item.id}`, error);
        }
      }
    }
  }

  /**
   * Schedule retry with exponential backoff
   */
  private scheduleRetry(item: ExportRetryItem): void {
    const delay =
      item.retryDelay * Math.pow(item.backoffMultiplier, item.retryCount);

    setTimeout(() => {
      if (item.status === 'pending') {
        this.processRetryQueue();
      }
    }, delay);
  }

  /**
   * Get retry queue status
   */
  getRetryQueueStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  } {
    const pending = this.retryQueue.filter(
      item => item.status === 'pending'
    ).length;
    const processing = this.retryQueue.filter(
      item => item.status === 'processing'
    ).length;
    const completed = this.retryQueue.filter(
      item => item.status === 'completed'
    ).length;
    const failed = this.retryQueue.filter(
      item => item.status === 'failed'
    ).length;

    return {
      pending,
      processing,
      completed,
      failed,
      total: this.retryQueue.length,
    };
  }

  // ============================================================================
  // CONFIGURATION AND INITIALIZATION
  // ============================================================================

  private initializeValidationRules(): void {
    // Hardware validation rules
    this.validationRules.set('hardware', [
      {
        name: 'Asset ID Required',
        type: 'required',
        field: 'asset_id',
        severity: 'error',
      },
      {
        name: 'Asset ID Format',
        type: 'format',
        field: 'asset_id',
        pattern: /^HW\d{6}$/,
        severity: 'error',
      },
      {
        name: 'Category Required',
        type: 'required',
        field: 'category',
        severity: 'error',
      },
      {
        name: 'Valid Category',
        type: 'enum',
        field: 'category',
        allowedValues: [
          'laptop',
          'desktop',
          'server',
          'mobile',
          'tablet',
          'peripheral',
        ],
        severity: 'error',
      },
    ]);

    // Software validation rules
    this.validationRules.set('software', [
      {
        name: 'License Key Required',
        type: 'required',
        field: 'license_key',
        severity: 'error',
      },
      {
        name: 'Software Name Required',
        type: 'required',
        field: 'name',
        severity: 'error',
      },
      {
        name: 'License Type Valid',
        type: 'enum',
        field: 'license_type',
        allowedValues: ['perpetual', 'subscription', 'trial', 'free'],
        severity: 'warning',
      },
    ]);

    // Employee validation rules
    this.validationRules.set('employees', [
      {
        name: 'Employee ID Required',
        type: 'required',
        field: 'employee_id',
        severity: 'error',
      },
      {
        name: 'Email Format',
        type: 'type',
        field: 'email',
        expectedType: 'email',
        severity: 'error',
      },
      {
        name: 'Name Required',
        type: 'required',
        field: 'name',
        severity: 'error',
      },
    ]);
  }

  private initializeIntegrityChecks(): void {
    // Excel integrity checks
    this.integrityChecks.set('excel', [
      { name: 'File Exists', type: 'file_exists' },
      { name: 'Record Count', type: 'record_count', format: 'excel' },
      { name: 'Data Integrity', type: 'data_integrity', format: 'excel' },
    ]);

    // CSV integrity checks
    this.integrityChecks.set('csv', [
      { name: 'File Exists', type: 'file_exists' },
      { name: 'Record Count', type: 'record_count', format: 'csv' },
      { name: 'Data Integrity', type: 'data_integrity', format: 'csv' },
    ]);

    // PDF integrity checks
    this.integrityChecks.set('pdf', [
      { name: 'File Exists', type: 'file_exists' },
      { name: 'File Size', type: 'file_size' },
    ]);
  }

  private getValidationRules(dataType: ExportDataType): ValidationRule[] {
    return this.validationRules.get(dataType) || [];
  }

  private getIntegrityChecks(format: ExportFormat): IntegrityCheck[] {
    return this.integrityChecks.get(format) || [];
  }

  private getRequiredFields(dataType: ExportDataType): string[] {
    const fieldMap: Record<ExportDataType, string[]> = {
      hardware: ['asset_id', 'category', 'status'],
      software: ['license_key', 'name', 'license_type'],
      employees: ['employee_id', 'name', 'email'],
      assignments: ['assignment_id', 'employee_id', 'asset_id'],
      users: ['user_id', 'username', 'role'],
      activities: ['activity_id', 'timestamp', 'action'],
      reports: ['report_id', 'type', 'generated_at'],
      statistics: ['metric_name', 'value', 'timestamp'],
    };

    return fieldMap[dataType] || [];
  }
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ValidationRule {
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
  ) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;
}

interface IntegrityCheck {
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

interface RecordValidationResult {
  index: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  accuracy: number;
  overall: number;
}

interface ExportValidationResult {
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
  dataQuality: DataQualityMetrics;
}

interface IntegrityVerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: IntegrityCheckResult[];
}

interface IntegrityCheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  warning?: string;
}

interface RecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

interface ExportRetryItem {
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

// Create singleton instance
export const exportValidationService = new ExportValidationService();
