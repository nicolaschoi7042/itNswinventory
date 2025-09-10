/**
 * Data Import Service
 *
 * Comprehensive service for importing data from various file formats (CSV, Excel)
 * with validation, error handling, and progress tracking.
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type {
  ExportColumn,
  ExportValidationResult,
  ExportValidationError,
} from '@/types/export';
import type {
  User,
  Employee,
  HardwareAsset,
  SoftwareLicense,
  Assignment,
} from '@/types';
import { ExportUtils } from '@/utils/export.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type ImportDataType =
  | 'employees'
  | 'hardware'
  | 'software'
  | 'assignments'
  | 'users';

export interface ImportConfig {
  dataType: ImportDataType;
  columns: ExportColumn[];
  requiredFields: string[];
  uniqueFields: string[];
  validationRules: ImportValidationRule[];
  transformRules?: ImportTransformRule[];
  batchSize?: number;
  skipHeader?: boolean;
  encoding?: 'utf-8' | 'utf-16' | 'iso-8859-1';
}

export interface ImportValidationRule {
  field: string;
  type: 'required' | 'unique' | 'format' | 'range' | 'custom';
  params?: any;
  message?: string;
  validator?: (value: any, row: any, index: number) => boolean | string;
}

export interface ImportTransformRule {
  field: string;
  transformer: (value: any, row: any, index: number) => any;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  skippedRows: number[];
  importedData?: any[];
  validationResults?: ImportValidationResult[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
  originalValue?: any;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  originalValue?: any;
  transformedValue?: any;
}

export interface ImportProgress {
  stage: 'parsing' | 'validation' | 'transformation' | 'import' | 'complete';
  progress: number; // 0-100
  currentRow: number;
  totalRows: number;
  message: string;
  errors: number;
  warnings: number;
}

export interface ImportValidationResult {
  row: number;
  data: any;
  valid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  transformed: any;
}

export interface ImportPreview {
  headers: string[];
  sampleData: any[][];
  detectedDataType?: ImportDataType;
  suggestedMapping: Record<string, string>;
  issues: ImportError[];
  estimatedRows: number;
}

// ============================================================================
// DATA IMPORT SERVICE
// ============================================================================

export class DataImportService {
  private progressCallback?: (progress: ImportProgress) => void;

  constructor(progressCallback?: (progress: ImportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  // ============================================================================
  // DATA TYPE CONFIGURATIONS
  // ============================================================================

  private getImportConfig(dataType: ImportDataType): ImportConfig {
    const configs: Record<ImportDataType, ImportConfig> = {
      employees: {
        dataType: 'employees',
        requiredFields: ['name', 'email', 'department'],
        uniqueFields: ['email'],
        batchSize: 100,
        columns: [
          { key: 'name', label: '이름', type: 'string' },
          { key: 'email', label: '이메일', type: 'string' },
          { key: 'department', label: '부서', type: 'string' },
          { key: 'position', label: '직급', type: 'string' },
          { key: 'phone', label: '전화번호', type: 'string' },
          { key: 'joinDate', label: '입사일', type: 'date' },
          { key: 'status', label: '상태', type: 'string' },
        ],
        validationRules: [
          {
            field: 'email',
            type: 'format',
            params: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '유효한 이메일 형식이 아닙니다.',
          },
          {
            field: 'phone',
            type: 'format',
            params: /^[\d\-\(\)\s]+$/,
            message: '유효한 전화번호 형식이 아닙니다.',
          },
          {
            field: 'status',
            type: 'custom',
            validator: value => ['재직', '퇴직', '휴직'].includes(value),
            message: '상태는 재직, 퇴직, 휴직 중 하나여야 합니다.',
          },
        ],
        transformRules: [
          {
            field: 'joinDate',
            transformer: value =>
              value ? new Date(value).toISOString() : null,
          },
          {
            field: 'status',
            transformer: value => value || '재직',
          },
        ],
      },

      hardware: {
        dataType: 'hardware',
        requiredFields: ['assetTag', 'type', 'brand', 'model'],
        uniqueFields: ['assetTag', 'serialNumber'],
        batchSize: 50,
        columns: [
          { key: 'assetTag', label: '자산태그', type: 'string' },
          { key: 'type', label: '유형', type: 'string' },
          { key: 'brand', label: '브랜드', type: 'string' },
          { key: 'model', label: '모델', type: 'string' },
          { key: 'serialNumber', label: '일련번호', type: 'string' },
          { key: 'status', label: '상태', type: 'string' },
          { key: 'location', label: '위치', type: 'string' },
          { key: 'purchaseDate', label: '구매일', type: 'date' },
          { key: 'warrantyExpiry', label: '보증만료일', type: 'date' },
          { key: 'price', label: '가격', type: 'currency' },
        ],
        validationRules: [
          {
            field: 'assetTag',
            type: 'format',
            params: /^[A-Z0-9\-]+$/,
            message: '자산태그는 영문 대문자와 숫자, 하이픈만 사용 가능합니다.',
          },
          {
            field: 'price',
            type: 'range',
            params: { min: 0, max: 10000000 },
            message: '가격은 0원 이상 1000만원 이하여야 합니다.',
          },
          {
            field: 'status',
            type: 'custom',
            validator: value =>
              ['활성', '비활성', '수리중', '폐기'].includes(value),
            message: '상태는 활성, 비활성, 수리중, 폐기 중 하나여야 합니다.',
          },
        ],
      },

      software: {
        dataType: 'software',
        requiredFields: ['name', 'vendor', 'licenseType', 'totalLicenses'],
        uniqueFields: ['name', 'version'],
        batchSize: 50,
        columns: [
          { key: 'name', label: '소프트웨어명', type: 'string' },
          { key: 'version', label: '버전', type: 'string' },
          { key: 'vendor', label: '제조사', type: 'string' },
          { key: 'licenseType', label: '라이선스유형', type: 'string' },
          { key: 'totalLicenses', label: '총라이선스', type: 'number' },
          { key: 'price', label: '가격', type: 'currency' },
          { key: 'purchaseDate', label: '구매일', type: 'date' },
          { key: 'expiryDate', label: '만료일', type: 'date' },
        ],
        validationRules: [
          {
            field: 'totalLicenses',
            type: 'range',
            params: { min: 1, max: 10000 },
            message: '라이선스 수는 1개 이상 10,000개 이하여야 합니다.',
          },
          {
            field: 'licenseType',
            type: 'custom',
            validator: value =>
              ['단일', '볼륨', '구독', '무료', '오픈소스'].includes(value),
            message: '라이선스 유형이 올바르지 않습니다.',
          },
        ],
      },

      assignments: {
        dataType: 'assignments',
        requiredFields: ['employeeId', 'assetType', 'assetId'],
        uniqueFields: [],
        batchSize: 100,
        columns: [
          { key: 'employeeId', label: '직원ID', type: 'string' },
          { key: 'assetType', label: '자산유형', type: 'string' },
          { key: 'assetId', label: '자산ID', type: 'string' },
          { key: 'assignedDate', label: '할당일', type: 'date' },
          { key: 'dueDate', label: '반납예정일', type: 'date' },
          { key: 'notes', label: '비고', type: 'string' },
        ],
        validationRules: [
          {
            field: 'assetType',
            type: 'custom',
            validator: value => ['hardware', 'software'].includes(value),
            message: '자산 유형은 hardware 또는 software여야 합니다.',
          },
        ],
      },

      users: {
        dataType: 'users',
        requiredFields: ['username', 'fullName', 'email', 'role'],
        uniqueFields: ['username', 'email'],
        batchSize: 50,
        columns: [
          { key: 'username', label: '사용자명', type: 'string' },
          { key: 'fullName', label: '이름', type: 'string' },
          { key: 'email', label: '이메일', type: 'string' },
          { key: 'role', label: '역할', type: 'string' },
          { key: 'department', label: '부서', type: 'string' },
          { key: 'status', label: '상태', type: 'string' },
        ],
        validationRules: [
          {
            field: 'role',
            type: 'custom',
            validator: value => ['admin', 'manager', 'user'].includes(value),
            message: '역할은 admin, manager, user 중 하나여야 합니다.',
          },
          {
            field: 'email',
            type: 'format',
            params: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '유효한 이메일 형식이 아닙니다.',
          },
        ],
      },
    };

    return configs[dataType];
  }

  // ============================================================================
  // FILE PARSING METHODS
  // ============================================================================

  /**
   * Parse file and return preview data
   */
  async parseFileForPreview(file: File): Promise<ImportPreview> {
    try {
      this.updateProgress('parsing', 0, '파일을 분석하는 중...');

      const extension = file.name.toLowerCase().split('.').pop();
      let rawData: any[][] = [];

      if (extension === 'csv') {
        rawData = await this.parseCSVFile(file);
      } else if (extension === 'xlsx' || extension === 'xls') {
        rawData = await this.parseExcelFile(file);
      } else {
        throw new Error(
          '지원하지 않는 파일 형식입니다. CSV 또는 Excel 파일만 지원됩니다.'
        );
      }

      const headers = rawData[0] || [];
      const sampleData = rawData.slice(1, 6); // First 5 rows for preview
      const detectedDataType = this.detectDataType(headers);
      const suggestedMapping = this.suggestColumnMapping(
        headers,
        detectedDataType
      );
      const issues = this.detectPreviewIssues(rawData, detectedDataType);

      this.updateProgress('parsing', 100, '파일 분석 완료');

      return {
        headers,
        sampleData,
        detectedDataType,
        suggestedMapping,
        issues,
        estimatedRows: rawData.length - 1,
      };
    } catch (error) {
      throw new Error(
        `파일 분석 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }

  /**
   * Import data from file with validation
   */
  async importFromFile(
    file: File,
    dataType: ImportDataType,
    columnMapping: Record<string, string>,
    config?: Partial<ImportConfig>
  ): Promise<ImportResult> {
    try {
      const importConfig = { ...this.getImportConfig(dataType), ...config };

      this.updateProgress('parsing', 0, '파일을 읽는 중...');

      // Parse file
      const extension = file.name.toLowerCase().split('.').pop();
      let rawData: any[][] = [];

      if (extension === 'csv') {
        rawData = await this.parseCSVFile(file);
      } else if (extension === 'xlsx' || extension === 'xls') {
        rawData = await this.parseExcelFile(file);
      } else {
        throw new Error('지원하지 않는 파일 형식입니다.');
      }

      const headers = rawData[0];
      const dataRows = rawData.slice(1);

      this.updateProgress('parsing', 100, '파일 읽기 완료');

      // Transform data using column mapping
      const mappedData = this.transformDataWithMapping(
        dataRows,
        headers,
        columnMapping
      );

      // Validate data
      this.updateProgress('validation', 0, '데이터 검증 중...');
      const validationResults = await this.validateImportData(
        mappedData,
        importConfig
      );

      // Process results
      const result = this.processValidationResults(
        validationResults,
        importConfig
      );

      this.updateProgress('complete', 100, '가져오기 완료');

      return result;
    } catch (error) {
      throw new Error(
        `가져오기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
  }

  // ============================================================================
  // FILE PARSING UTILITIES
  // ============================================================================

  private async parseCSVFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: results => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV 파싱 오류: ${results.errors[0].message}`));
          } else {
            resolve(results.data as any[][]);
          }
        },
        error: error => {
          reject(new Error(`CSV 파일 읽기 오류: ${error.message}`));
        },
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
      });
    });
  }

  private async parseExcelFile(file: File): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Use first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to 2D array
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as any[][];

          resolve(jsonData);
        } catch (error) {
          reject(
            new Error(
              `Excel 파일 읽기 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // ============================================================================
  // DATA PROCESSING METHODS
  // ============================================================================

  private transformDataWithMapping(
    dataRows: any[][],
    headers: string[],
    columnMapping: Record<string, string>
  ): any[] {
    return dataRows.map((row, index) => {
      const mappedRow: any = { _originalRowIndex: index + 2 }; // +2 for 1-based + header

      headers.forEach((header, colIndex) => {
        const mappedField = columnMapping[header];
        if (mappedField && row[colIndex] !== undefined) {
          mappedRow[mappedField] = row[colIndex];
        }
      });

      return mappedRow;
    });
  }

  private async validateImportData(
    data: any[],
    config: ImportConfig
  ): Promise<ImportValidationResult[]> {
    const results: ImportValidationResult[] = [];
    const uniqueValueSets: Record<string, Set<any>> = {};

    // Initialize unique value sets
    config.uniqueFields.forEach(field => {
      uniqueValueSets[field] = new Set();
    });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = row._originalRowIndex || i + 1;

      this.updateProgress(
        'validation',
        (i / data.length) * 100,
        `데이터 검증 중... (${i + 1}/${data.length})`
      );

      const errors: ImportError[] = [];
      const warnings: ImportWarning[] = [];
      const transformedRow = { ...row };

      // Validate required fields
      config.requiredFields.forEach(field => {
        if (!row[field] || String(row[field]).trim() === '') {
          errors.push({
            row: rowNumber,
            field,
            message: `필수 필드 '${field}'가 비어있습니다.`,
            code: 'REQUIRED_FIELD_MISSING',
            severity: 'error',
          });
        }
      });

      // Validate unique fields
      config.uniqueFields.forEach(field => {
        const value = row[field];
        if (value && uniqueValueSets[field].has(value)) {
          errors.push({
            row: rowNumber,
            field,
            message: `중복된 값입니다: ${value}`,
            code: 'DUPLICATE_VALUE',
            severity: 'error',
            originalValue: value,
          });
        } else if (value) {
          uniqueValueSets[field].add(value);
        }
      });

      // Apply validation rules
      config.validationRules.forEach(rule => {
        const value = row[rule.field];
        if (value !== undefined && value !== null && value !== '') {
          const validationResult = this.validateField(
            value,
            rule,
            row,
            rowNumber
          );
          if (validationResult !== true) {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message:
                typeof validationResult === 'string'
                  ? validationResult
                  : rule.message || '유효하지 않은 값입니다.',
              code: `VALIDATION_${rule.type.toUpperCase()}`,
              severity: 'error',
              originalValue: value,
            });
          }
        }
      });

      // Apply transformations
      config.transformRules?.forEach(rule => {
        try {
          const originalValue = transformedRow[rule.field];
          const transformedValue = rule.transformer(
            originalValue,
            transformedRow,
            rowNumber
          );

          if (transformedValue !== originalValue) {
            transformedRow[rule.field] = transformedValue;
            warnings.push({
              row: rowNumber,
              field: rule.field,
              message: `값이 변환되었습니다.`,
              originalValue,
              transformedValue,
            });
          }
        } catch (error) {
          errors.push({
            row: rowNumber,
            field: rule.field,
            message: `변환 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            code: 'TRANSFORMATION_ERROR',
            severity: 'error',
          });
        }
      });

      results.push({
        row: rowNumber,
        data: row,
        valid: errors.length === 0,
        errors,
        warnings,
        transformed: transformedRow,
      });
    }

    return results;
  }

  private validateField(
    value: any,
    rule: ImportValidationRule,
    row: any,
    rowNumber: number
  ): boolean | string {
    switch (rule.type) {
      case 'format':
        return rule.params.test(String(value));

      case 'range':
        const numValue = Number(value);
        return (
          !isNaN(numValue) &&
          numValue >= rule.params.min &&
          numValue <= rule.params.max
        );

      case 'custom':
        return rule.validator ? rule.validator(value, row, rowNumber) : true;

      default:
        return true;
    }
  }

  private processValidationResults(
    validationResults: ImportValidationResult[],
    config: ImportConfig
  ): ImportResult {
    const validRows = validationResults.filter(r => r.valid);
    const invalidRows = validationResults.filter(r => !r.valid);

    const allErrors = validationResults.flatMap(r => r.errors);
    const allWarnings = validationResults.flatMap(r => r.warnings);

    const skippedRows = invalidRows.map(r => r.row);
    const importedData = validRows.map(r => r.transformed);

    return {
      success: invalidRows.length === 0,
      totalRows: validationResults.length,
      processedRows: validationResults.length,
      successfulImports: validRows.length,
      failedImports: invalidRows.length,
      errors: allErrors,
      warnings: allWarnings,
      skippedRows,
      importedData,
      validationResults,
    };
  }

  // ============================================================================
  // DETECTION AND MAPPING UTILITIES
  // ============================================================================

  private detectDataType(headers: string[]): ImportDataType | undefined {
    const headerStr = headers.join(' ').toLowerCase();

    if (
      headerStr.includes('employee') ||
      headerStr.includes('직원') ||
      headerStr.includes('이름')
    ) {
      return 'employees';
    }
    if (
      headerStr.includes('asset') ||
      headerStr.includes('hardware') ||
      headerStr.includes('자산') ||
      headerStr.includes('하드웨어')
    ) {
      return 'hardware';
    }
    if (
      headerStr.includes('software') ||
      headerStr.includes('license') ||
      headerStr.includes('소프트웨어') ||
      headerStr.includes('라이선스')
    ) {
      return 'software';
    }
    if (headerStr.includes('assignment') || headerStr.includes('할당')) {
      return 'assignments';
    }
    if (
      headerStr.includes('user') ||
      headerStr.includes('username') ||
      headerStr.includes('사용자')
    ) {
      return 'users';
    }

    return undefined;
  }

  private suggestColumnMapping(
    headers: string[],
    dataType?: ImportDataType
  ): Record<string, string> {
    if (!dataType) return {};

    const config = this.getImportConfig(dataType);
    const mapping: Record<string, string> = {};

    // Create mapping suggestions based on column labels and common variations
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();

      config.columns.forEach(column => {
        const variations = this.getColumnVariations(column);
        if (
          variations.some(variation => normalizedHeader.includes(variation))
        ) {
          mapping[header] = column.key;
        }
      });
    });

    return mapping;
  }

  private getColumnVariations(column: ExportColumn): string[] {
    const variations = [column.key.toLowerCase(), column.label.toLowerCase()];

    // Add common variations based on field type
    switch (column.key) {
      case 'name':
        variations.push('이름', 'fullname', 'full_name');
        break;
      case 'email':
        variations.push('이메일', 'e-mail', 'mail');
        break;
      case 'phone':
        variations.push('전화', '전화번호', 'tel', 'telephone');
        break;
      case 'department':
        variations.push('부서', 'dept');
        break;
      case 'assetTag':
        variations.push('자산태그', 'asset_tag', 'tag');
        break;
      case 'serialNumber':
        variations.push('일련번호', 'serial_number', 'serial');
        break;
      // Add more variations as needed
    }

    return variations;
  }

  private detectPreviewIssues(
    rawData: any[][],
    dataType?: ImportDataType
  ): ImportError[] {
    const issues: ImportError[] = [];

    if (rawData.length < 2) {
      issues.push({
        row: 0,
        message:
          '데이터가 충분하지 않습니다. 최소 1개 이상의 데이터 행이 필요합니다.',
        code: 'INSUFFICIENT_DATA',
        severity: 'error',
      });
    }

    if (dataType) {
      const config = this.getImportConfig(dataType);
      const headers = rawData[0] || [];

      // Check for required columns
      const missingRequired = config.requiredFields.filter(
        field =>
          !headers.some(header =>
            this.getColumnVariations({
              key: field,
              label: field,
            } as ExportColumn).some(variation =>
              header.toLowerCase().includes(variation)
            )
          )
      );

      if (missingRequired.length > 0) {
        issues.push({
          row: 0,
          message: `필수 컬럼이 누락되었습니다: ${missingRequired.join(', ')}`,
          code: 'MISSING_REQUIRED_COLUMNS',
          severity: 'error',
        });
      }
    }

    return issues;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private updateProgress(
    stage: ImportProgress['stage'],
    progress: number,
    message: string,
    errors: number = 0,
    warnings: number = 0
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        currentRow: 0,
        totalRows: 0,
        message,
        errors,
        warnings,
      });
    }
  }

  /**
   * Get import configuration for data type
   */
  getImportConfigForDataType(dataType: ImportDataType): ImportConfig {
    return this.getImportConfig(dataType);
  }

  /**
   * Validate import configuration
   */
  validateImportConfig(config: ImportConfig): ExportValidationResult {
    const errors: ExportValidationError[] = [];

    if (!config.columns || config.columns.length === 0) {
      errors.push({
        field: 'columns',
        message: '최소 하나의 컬럼이 정의되어야 합니다.',
        code: 'MISSING_COLUMNS',
        severity: 'error',
      });
    }

    if (!config.requiredFields || config.requiredFields.length === 0) {
      errors.push({
        field: 'requiredFields',
        message: '최소 하나의 필수 필드가 정의되어야 합니다.',
        code: 'MISSING_REQUIRED_FIELDS',
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }
}

// ============================================================================
// FACTORY AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Create data import service instance
 */
export function createDataImportService(
  progressCallback?: (progress: ImportProgress) => void
): DataImportService {
  return new DataImportService(progressCallback);
}

/**
 * Quick file import with default settings
 */
export async function quickFileImport(
  file: File,
  dataType: ImportDataType,
  columnMapping: Record<string, string>
): Promise<ImportResult> {
  const service = createDataImportService();
  return service.importFromFile(file, dataType, columnMapping);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DataImportService;
