/**
 * CSV Export Service
 *
 * Specialized service for CSV export with advanced options including
 * custom delimiters, encoding, data transformation, and bulk export capabilities.
 */

import { saveAs } from 'file-saver';
import type {
  CSVExportConfig,
  ExportColumn,
  ExportData,
  ExportResult,
  ExportFilter,
  ExportSort,
} from '@/types/export';
import type {
  User,
  Employee,
  HardwareAsset,
  SoftwareLicense,
  Assignment,
  Activity,
} from '@/types';
import { ExportUtils } from '@/utils/export.utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CSVDataTypeConfig {
  filename: string;
  columns: ExportColumn[];
  delimiter: string;
  includeHeaders: boolean;
  dateFormat: string;
  numberFormat: string;
  encoding: 'utf-8' | 'utf-16' | 'iso-8859-1';
}

interface CSVBulkExportRequest {
  datasets: Array<{
    data: any[];
    dataType: string;
    config?: Partial<CSVExportConfig>;
  }>;
  zipFilename?: string;
  bundleFormat?: 'zip' | 'individual';
}

interface CSVTransformOptions {
  flattenObjects?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  booleanFormat?: 'yesno' | 'truefalse' | '10' | 'korean';
  nullFormat?: string;
  customTransforms?: Record<string, (value: any) => string>;
}

// ============================================================================
// CSV EXPORT SERVICE
// ============================================================================

export class CSVExportService {
  // ============================================================================
  // DATA TYPE CONFIGURATIONS
  // ============================================================================

  private getDataTypeConfig(dataType: string): CSVDataTypeConfig {
    const configs: Record<string, CSVDataTypeConfig> = {
      employees: {
        filename: '직원목록',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'name', label: '이름', type: 'string' },
          { key: 'email', label: '이메일', type: 'string' },
          { key: 'department', label: '부서', type: 'string' },
          { key: 'position', label: '직급', type: 'string' },
          { key: 'phone', label: '전화번호', type: 'string' },
          { key: 'joinDate', label: '입사일', type: 'date' },
          { key: 'status', label: '상태', type: 'string' },
          { key: 'createdAt', label: '등록일', type: 'date' },
        ],
      },

      hardware: {
        filename: '하드웨어자산',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
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
          { key: 'vendor', label: '공급업체', type: 'string' },
        ],
      },

      software: {
        filename: '소프트웨어라이선스',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'name', label: '소프트웨어명', type: 'string' },
          { key: 'version', label: '버전', type: 'string' },
          { key: 'vendor', label: '제조사', type: 'string' },
          { key: 'licenseType', label: '라이선스유형', type: 'string' },
          { key: 'totalLicenses', label: '총라이선스', type: 'number' },
          { key: 'usedLicenses', label: '사용라이선스', type: 'number' },
          { key: 'availableLicenses', label: '가용라이선스', type: 'number' },
          { key: 'price', label: '가격', type: 'currency' },
          { key: 'purchaseDate', label: '구매일', type: 'date' },
          { key: 'expiryDate', label: '만료일', type: 'date' },
          { key: 'status', label: '상태', type: 'string' },
        ],
      },

      assignments: {
        filename: '자산할당',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'employeeId', label: '직원ID', type: 'string' },
          { key: 'employeeName', label: '직원명', type: 'string' },
          { key: 'assetType', label: '자산유형', type: 'string' },
          { key: 'assetId', label: '자산ID', type: 'string' },
          { key: 'assetName', label: '자산명', type: 'string' },
          { key: 'status', label: '상태', type: 'string' },
          { key: 'assignedDate', label: '할당일', type: 'date' },
          { key: 'returnedDate', label: '반납일', type: 'date' },
          { key: 'dueDate', label: '반납예정일', type: 'date' },
          { key: 'notes', label: '비고', type: 'string' },
        ],
      },

      users: {
        filename: '사용자관리',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'username', label: '사용자명', type: 'string' },
          { key: 'fullName', label: '이름', type: 'string' },
          { key: 'email', label: '이메일', type: 'string' },
          { key: 'role', label: '역할', type: 'string' },
          { key: 'status', label: '상태', type: 'string' },
          { key: 'department', label: '부서', type: 'string' },
          { key: 'authenticationType', label: '인증방식', type: 'string' },
          { key: 'lastLogin', label: '마지막로그인', type: 'date' },
          { key: 'createdAt', label: '생성일', type: 'date' },
        ],
      },

      activities: {
        filename: '활동로그',
        delimiter: ',',
        includeHeaders: true,
        dateFormat: 'yyyy-mm-dd hh:mm:ss',
        numberFormat: '#,##0',
        encoding: 'utf-8',
        columns: [
          { key: 'id', label: 'ID', type: 'string' },
          { key: 'type', label: '유형', type: 'string' },
          { key: 'description', label: '설명', type: 'string' },
          { key: 'userId', label: '사용자ID', type: 'string' },
          { key: 'userName', label: '사용자명', type: 'string' },
          { key: 'entityType', label: '대상유형', type: 'string' },
          { key: 'entityId', label: '대상ID', type: 'string' },
          { key: 'ipAddress', label: 'IP주소', type: 'string' },
          { key: 'userAgent', label: '사용자에이전트', type: 'string' },
          { key: 'createdAt', label: '발생시각', type: 'date' },
        ],
      },
    };

    return configs[dataType] || configs.employees;
  }

  // ============================================================================
  // MAIN EXPORT METHODS
  // ============================================================================

  /**
   * Export data to CSV format with advanced options
   */
  async exportToCSV(
    data: any[],
    dataType: string,
    config: CSVExportConfig = {} as CSVExportConfig
  ): Promise<ExportResult> {
    try {
      const typeConfig = this.getDataTypeConfig(dataType);
      const finalConfig = this.mergeConfigs(typeConfig, config);

      // Transform and filter data
      const transformedData = this.transformDataForCSV(data, finalConfig);

      // Generate CSV content
      const csvContent = this.generateCSVContent(transformedData, finalConfig);

      // Create filename
      const filename =
        config.filename ||
        ExportUtils.generateExportFilename(dataType as any, 'csv');

      // Create and save blob
      const blob = this.createCSVBlob(csvContent, finalConfig.encoding);
      saveAs(blob, filename);

      return {
        success: true,
        filename,
        fileSize: blob.size,
        recordCount: transformedData.length,
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CSV export failed',
      };
    }
  }

  /**
   * Export multiple datasets to separate CSV files
   */
  async exportMultipleToCSV(
    request: CSVBulkExportRequest
  ): Promise<ExportResult> {
    try {
      const results: ExportResult[] = [];
      let totalRecords = 0;

      for (const dataset of request.datasets) {
        const result = await this.exportToCSV(
          dataset.data,
          dataset.dataType,
          dataset.config as CSVExportConfig
        );
        results.push(result);
        totalRecords += result.recordCount || 0;
      }

      const successCount = results.filter(r => r.success).length;

      // If bundling is requested, create a ZIP file
      if (request.bundleFormat === 'zip') {
        // This would require JSZip for actual implementation
        console.log('ZIP bundling not implemented in this example');
      }

      return {
        success: successCount === request.datasets.length,
        filename: request.zipFilename || 'bulk_csv_export.zip',
        recordCount: totalRecords,
      };
    } catch (error) {
      console.error('Bulk CSV export failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Bulk CSV export failed',
      };
    }
  }

  /**
   * Export data to CSV with custom transformation
   */
  async exportToCSVWithTransform(
    data: any[],
    columns: ExportColumn[],
    transformOptions: CSVTransformOptions,
    config: CSVExportConfig = {} as CSVExportConfig
  ): Promise<ExportResult> {
    try {
      // Apply custom transformations
      const transformedData = this.applyCustomTransforms(
        data,
        columns,
        transformOptions
      );

      const csvContent = this.generateCSVContent(transformedData, {
        ...config,
        columns,
        delimiter: config.delimiter || ',',
        includeHeaders: config.includeHeaders !== false,
        encoding: config.encoding || 'utf-8',
      } as CSVDataTypeConfig);

      const filename =
        config.filename ||
        ExportUtils.generateExportFilename('custom' as any, 'csv');

      const blob = this.createCSVBlob(csvContent, config.encoding || 'utf-8');
      saveAs(blob, filename);

      return {
        success: true,
        filename,
        fileSize: blob.size,
        recordCount: transformedData.length,
      };
    } catch (error) {
      console.error('Custom CSV export failed:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Custom CSV export failed',
      };
    }
  }

  // ============================================================================
  // DATA TRANSFORMATION METHODS
  // ============================================================================

  private transformDataForCSV(
    data: any[],
    config: CSVDataTypeConfig & Partial<CSVExportConfig>
  ): any[][] {
    const transformedData: any[][] = [];

    // Add headers if enabled
    if (config.includeHeaders) {
      transformedData.push(config.columns.map(col => col.label));
    }

    // Transform data rows
    data.forEach(row => {
      const transformedRow = config.columns.map(col => {
        const value = ExportUtils.getNestedValue(row, col.key);
        return this.formatCSVValue(value, col, config);
      });
      transformedData.push(transformedRow);
    });

    return transformedData;
  }

  private applyCustomTransforms(
    data: any[],
    columns: ExportColumn[],
    transformOptions: CSVTransformOptions
  ): any[][] {
    const transformedData: any[][] = [];

    // Add headers
    transformedData.push(columns.map(col => col.label));

    // Transform data with custom options
    data.forEach(row => {
      const transformedRow = columns.map(col => {
        let value = ExportUtils.getNestedValue(row, col.key);

        // Apply custom transforms
        if (transformOptions.customTransforms?.[col.key]) {
          value = transformOptions.customTransforms[col.key](value);
        } else {
          value = this.applyStandardTransforms(
            value,
            col.type,
            transformOptions
          );
        }

        // Flatten objects if requested
        if (
          transformOptions.flattenObjects &&
          typeof value === 'object' &&
          value !== null
        ) {
          value = JSON.stringify(value);
        }

        return value;
      });
      transformedData.push(transformedRow);
    });

    return transformedData;
  }

  private applyStandardTransforms(
    value: any,
    type: string | undefined,
    options: CSVTransformOptions
  ): string {
    if (value === null || value === undefined) {
      return options.nullFormat || '';
    }

    switch (type) {
      case 'date':
        if (value instanceof Date) {
          return this.formatDate(value, options.dateFormat || 'yyyy-mm-dd');
        }
        return String(value);

      case 'number':
      case 'currency':
        if (typeof value === 'number') {
          return this.formatNumber(value, options.numberFormat || '#,##0');
        }
        return String(value);

      case 'boolean':
        if (typeof value === 'boolean') {
          return this.formatBoolean(value, options.booleanFormat || 'yesno');
        }
        return String(value);

      default:
        return String(value);
    }
  }

  private formatCSVValue(
    value: any,
    column: ExportColumn,
    config: CSVDataTypeConfig & Partial<CSVExportConfig>
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Use custom formatter if provided
    if (column.format) {
      return column.format(value);
    }

    // Apply type-based formatting
    switch (column.type) {
      case 'date':
        return this.formatDate(value, config.dateFormat);
      case 'number':
        return this.formatNumber(value, config.numberFormat);
      case 'currency':
        return this.formatCurrency(value);
      case 'boolean':
        return this.formatBoolean(value, 'korean');
      default:
        return String(value);
    }
  }

  // ============================================================================
  // CSV CONTENT GENERATION
  // ============================================================================

  private generateCSVContent(
    data: any[][],
    config: CSVDataTypeConfig & Partial<CSVExportConfig>
  ): string {
    const delimiter = config.delimiter || ',';
    const quoteChar = config.quoteChar || '"';
    const lineTerminator = config.lineTerminator || '\n';

    return data
      .map(row =>
        row
          .map(cell => this.escapeCSVField(String(cell), delimiter, quoteChar))
          .join(delimiter)
      )
      .join(lineTerminator);
  }

  private escapeCSVField(
    field: string,
    delimiter: string,
    quoteChar: string
  ): string {
    // Check if field needs quoting
    const needsQuoting =
      field.includes(delimiter) ||
      field.includes(quoteChar) ||
      field.includes('\n') ||
      field.includes('\r');

    if (needsQuoting) {
      // Escape quote characters by doubling them
      const escapedField = field.replace(
        new RegExp(quoteChar, 'g'),
        quoteChar + quoteChar
      );
      return quoteChar + escapedField + quoteChar;
    }

    return field;
  }

  private createCSVBlob(content: string, encoding: string): Blob {
    const mimeType = `text/csv;charset=${encoding}`;

    // Add BOM for UTF-8/UTF-16 if needed
    let bom = '';
    if (encoding.toLowerCase().includes('utf-8')) {
      bom = '\uFEFF'; // UTF-8 BOM
    } else if (encoding.toLowerCase().includes('utf-16')) {
      bom = '\uFEFF'; // UTF-16 BOM
    }

    return new Blob([bom + content], { type: mimeType });
  }

  // ============================================================================
  // FORMATTING UTILITIES
  // ============================================================================

  private formatDate(value: any, format: string): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);

    // Simple date formatting - in real implementation, use a proper date library
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', String(year))
      .replace('mm', month)
      .replace('dd', day)
      .replace('hh', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  private formatNumber(value: any, format: string): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return String(value);
    }

    // Simple number formatting
    if (format.includes(',')) {
      return value.toLocaleString('ko-KR');
    }

    return String(value);
  }

  private formatCurrency(value: any): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return String(value);
    }

    return value.toLocaleString('ko-KR') + '원';
  }

  private formatBoolean(
    value: any,
    format: 'yesno' | 'truefalse' | '10' | 'korean'
  ): string {
    if (typeof value !== 'boolean') {
      return String(value);
    }

    switch (format) {
      case 'yesno':
        return value ? 'Yes' : 'No';
      case 'truefalse':
        return value ? 'True' : 'False';
      case '10':
        return value ? '1' : '0';
      case 'korean':
        return value ? '예' : '아니오';
      default:
        return String(value);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private mergeConfigs(
    typeConfig: CSVDataTypeConfig,
    userConfig: Partial<CSVExportConfig>
  ): CSVDataTypeConfig & Partial<CSVExportConfig> {
    return {
      ...typeConfig,
      ...userConfig,
      columns: userConfig.columns || typeConfig.columns,
    };
  }

  /**
   * Get column configuration for data type
   */
  getColumnsForDataType(dataType: string): ExportColumn[] {
    return this.getDataTypeConfig(dataType).columns;
  }

  /**
   * Validate CSV configuration
   */
  validateCSVConfig(config: CSVExportConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.columns || config.columns.length === 0) {
      errors.push('At least one column must be specified');
    }

    if (config.delimiter && config.delimiter.length !== 1) {
      errors.push('Delimiter must be a single character');
    }

    if (
      config.encoding &&
      !['utf-8', 'utf-16', 'iso-8859-1'].includes(config.encoding)
    ) {
      errors.push('Invalid encoding specified');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estimate CSV file size
   */
  estimateCSVSize(data: any[], columns: ExportColumn[]): number {
    if (!data || data.length === 0) return 0;

    // Sample first few rows to estimate average row size
    const sampleSize = Math.min(data.length, 10);
    let totalSize = 0;

    for (let i = 0; i < sampleSize; i++) {
      const row = data[i];
      const rowSize = columns.reduce((size, col) => {
        const value = ExportUtils.getNestedValue(row, col.key);
        return size + String(value || '').length + 1; // +1 for delimiter
      }, 0);
      totalSize += rowSize + 1; // +1 for line terminator
    }

    const averageRowSize = totalSize / sampleSize;
    const headerSize = columns.reduce(
      (size, col) => size + col.label.length + 1,
      0
    );

    return Math.round(averageRowSize * data.length + headerSize);
  }
}

// ============================================================================
// FACTORY AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Create CSV export service instance
 */
export function createCSVExportService(): CSVExportService {
  return new CSVExportService();
}

/**
 * Quick CSV export for single data type
 */
export async function quickCSVExport(
  data: any[],
  dataType: string,
  config?: Partial<CSVExportConfig>
): Promise<ExportResult> {
  const service = createCSVExportService();
  return service.exportToCSV(data, dataType, config as CSVExportConfig);
}

/**
 * Export all data types to separate CSV files
 */
export async function exportAllToCSV(
  employeesData: Employee[],
  hardwareData: HardwareAsset[],
  softwareData: SoftwareLicense[],
  assignmentsData: Assignment[],
  usersData?: User[],
  activitiesData?: Activity[]
): Promise<ExportResult> {
  const service = createCSVExportService();

  const datasets = [
    { data: employeesData, dataType: 'employees' },
    { data: hardwareData, dataType: 'hardware' },
    { data: softwareData, dataType: 'software' },
    { data: assignmentsData, dataType: 'assignments' },
  ];

  if (usersData) {
    datasets.push({ data: usersData, dataType: 'users' });
  }

  if (activitiesData) {
    datasets.push({ data: activitiesData, dataType: 'activities' });
  }

  return service.exportMultipleToCSV({
    datasets,
    bundleFormat: 'individual',
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CSVExportService;
