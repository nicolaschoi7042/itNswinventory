/**
 * Excel Export Service
 *
 * Specialized service for Excel generation with advanced formatting,
 * styling, charts, and support for all data types.
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type {
  ExcelExportConfig,
  ExportColumn,
  ExportData,
  ExportResult,
  CellStyle,
  ChartConfig,
  BorderStyle,
  LineStyle,
  ConditionalFormatting,
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

interface ExcelWorksheetData {
  name: string;
  data: any[][];
  styles?: Record<string, CellStyle>;
  merges?: XLSX.Range[];
  columnWidths?: number[];
  charts?: ChartConfig[];
}

interface ExcelDataTypeConfig {
  sheetName: string;
  columns: ExportColumn[];
  headerStyle?: CellStyle;
  dataStyle?: CellStyle;
  groupBy?: string;
  enableAutoFilter?: boolean;
  summary?: {
    enabled: boolean;
    fields: string[];
  };
}

interface ConditionalFormattingRule {
  condition: ConditionalFormattingCondition;
  style: CellStyle;
  priority?: number;
}

interface ConditionalFormattingCondition {
  operator:
    | 'equals'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'greaterThan'
    | 'lessThan'
    | 'between';
  value: any;
  minValue?: any;
  maxValue?: any;
}

interface ExcelChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title?: string;
  dataRange: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ExcelChartOptions {
  charts?: ExcelChartConfig[];
  enableCharts?: boolean;
}

// ============================================================================
// EXCEL EXPORT SERVICE
// ============================================================================

export class ExcelExportService {
  // ============================================================================
  // DATA TYPE CONFIGURATIONS
  // ============================================================================

  private getDataTypeConfig(dataType: string): ExcelDataTypeConfig {
    const configs: Record<string, ExcelDataTypeConfig> = {
      employees: {
        sheetName: '직원 목록',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 80 },
          { key: 'name', label: '이름', type: 'string', width: 120 },
          { key: 'email', label: '이메일', type: 'string', width: 200 },
          { key: 'department', label: '부서', type: 'string', width: 120 },
          { key: 'position', label: '직급', type: 'string', width: 120 },
          { key: 'phone', label: '전화번호', type: 'string', width: 150 },
          { key: 'createdAt', label: '등록일', type: 'date', width: 120 },
        ],
        enableAutoFilter: true,
        groupBy: 'department',
        summary: {
          enabled: true,
          fields: ['department'],
        },
      },

      hardware: {
        sheetName: '하드웨어 자산',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 80 },
          { key: 'assetTag', label: '자산태그', type: 'string', width: 120 },
          { key: 'type', label: '유형', type: 'string', width: 100 },
          { key: 'brand', label: '브랜드', type: 'string', width: 120 },
          { key: 'model', label: '모델', type: 'string', width: 150 },
          {
            key: 'serialNumber',
            label: '일련번호',
            type: 'string',
            width: 150,
          },
          { key: 'status', label: '상태', type: 'string', width: 100 },
          { key: 'purchaseDate', label: '구매일', type: 'date', width: 120 },
          {
            key: 'warrantyExpiry',
            label: '보증만료일',
            type: 'date',
            width: 120,
          },
          { key: 'price', label: '가격', type: 'currency', width: 120 },
        ],
        enableAutoFilter: true,
        groupBy: 'type',
        summary: {
          enabled: true,
          fields: ['type', 'status'],
        },
      },

      software: {
        sheetName: '소프트웨어 라이선스',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 80 },
          { key: 'name', label: '소프트웨어명', type: 'string', width: 200 },
          { key: 'version', label: '버전', type: 'string', width: 100 },
          { key: 'vendor', label: '제조사', type: 'string', width: 150 },
          {
            key: 'licenseType',
            label: '라이선스 유형',
            type: 'string',
            width: 120,
          },
          {
            key: 'totalLicenses',
            label: '총 라이선스',
            type: 'number',
            width: 100,
          },
          {
            key: 'usedLicenses',
            label: '사용 라이선스',
            type: 'number',
            width: 100,
          },
          {
            key: 'availableLicenses',
            label: '가용 라이선스',
            type: 'number',
            width: 100,
          },
          { key: 'price', label: '가격', type: 'currency', width: 120 },
          { key: 'purchaseDate', label: '구매일', type: 'date', width: 120 },
          { key: 'expiryDate', label: '만료일', type: 'date', width: 120 },
        ],
        enableAutoFilter: true,
        groupBy: 'vendor',
        summary: {
          enabled: true,
          fields: ['vendor', 'licenseType'],
        },
      },

      assignments: {
        sheetName: '자산 할당',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 100 },
          { key: 'employeeName', label: '직원명', type: 'string', width: 120 },
          { key: 'assetType', label: '자산 유형', type: 'string', width: 100 },
          { key: 'assetName', label: '자산명', type: 'string', width: 200 },
          { key: 'status', label: '상태', type: 'string', width: 100 },
          { key: 'assignedDate', label: '할당일', type: 'date', width: 120 },
          { key: 'returnedDate', label: '반납일', type: 'date', width: 120 },
          { key: 'notes', label: '비고', type: 'string', width: 200 },
        ],
        enableAutoFilter: true,
        groupBy: 'assetType',
        summary: {
          enabled: true,
          fields: ['assetType', 'status'],
        },
      },

      users: {
        sheetName: '사용자 관리',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 80 },
          { key: 'username', label: '사용자명', type: 'string', width: 120 },
          { key: 'fullName', label: '이름', type: 'string', width: 120 },
          { key: 'email', label: '이메일', type: 'string', width: 200 },
          { key: 'role', label: '역할', type: 'string', width: 100 },
          { key: 'status', label: '상태', type: 'string', width: 100 },
          { key: 'department', label: '부서', type: 'string', width: 120 },
          {
            key: 'authenticationType',
            label: '인증방식',
            type: 'string',
            width: 100,
          },
          {
            key: 'lastLogin',
            label: '마지막 로그인',
            type: 'date',
            width: 150,
          },
          { key: 'createdAt', label: '생성일', type: 'date', width: 120 },
        ],
        enableAutoFilter: true,
        groupBy: 'role',
        summary: {
          enabled: true,
          fields: ['role', 'status', 'department'],
        },
      },

      activities: {
        sheetName: '활동 로그',
        columns: [
          { key: 'id', label: 'ID', type: 'string', width: 80 },
          { key: 'type', label: '유형', type: 'string', width: 100 },
          { key: 'description', label: '설명', type: 'string', width: 300 },
          { key: 'userName', label: '사용자', type: 'string', width: 120 },
          { key: 'entityType', label: '대상 유형', type: 'string', width: 100 },
          { key: 'entityId', label: '대상 ID', type: 'string', width: 100 },
          { key: 'createdAt', label: '발생시각', type: 'date', width: 150 },
        ],
        enableAutoFilter: true,
        groupBy: 'type',
        summary: {
          enabled: true,
          fields: ['type', 'userName', 'entityType'],
        },
      },
    };

    return configs[dataType] || configs.employees;
  }

  // ============================================================================
  // MAIN EXPORT METHODS
  // ============================================================================

  /**
   * Export data to Excel with advanced formatting
   */
  async exportToExcel(
    data: any[],
    dataType: string,
    config: ExcelExportConfig = {} as ExcelExportConfig
  ): Promise<ExportResult> {
    try {
      const typeConfig = this.getDataTypeConfig(dataType);
      const finalConfig = this.mergeConfigs(typeConfig, config);

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare main data sheet
      const mainSheet = await this.createDataSheet(data, finalConfig, config);
      XLSX.utils.book_append_sheet(
        workbook,
        mainSheet.worksheet,
        mainSheet.name
      );

      // Add summary sheet if enabled
      if (finalConfig.summary?.enabled && data.length > 0) {
        const summarySheet = this.createSummarySheet(data, finalConfig);
        XLSX.utils.book_append_sheet(
          workbook,
          summarySheet.worksheet,
          summarySheet.name
        );
      }

      // Add statistics sheet
      const statsSheet = this.createStatisticsSheet(data, finalConfig);
      XLSX.utils.book_append_sheet(
        workbook,
        statsSheet.worksheet,
        statsSheet.name
      );

      // Generate filename
      const filename =
        config.filename ||
        ExportUtils.generateExportFilename(dataType as any, 'excel');

      // Write workbook
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true,
      });

      // Save file
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, filename);

      return {
        success: true,
        filename,
        fileSize: blob.size,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('Excel export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Excel export failed',
      };
    }
  }

  /**
   * Export multiple data types to a single Excel file with multiple sheets
   */
  async exportMultipleDataTypes(
    datasets: Array<{
      data: any[];
      dataType: string;
      config?: Partial<ExcelExportConfig>;
    }>,
    config: ExcelExportConfig = {} as ExcelExportConfig
  ): Promise<ExportResult> {
    try {
      const workbook = XLSX.utils.book_new();
      let totalRecords = 0;

      // Add data sheets
      for (const dataset of datasets) {
        const typeConfig = this.getDataTypeConfig(dataset.dataType);
        const finalConfig = this.mergeConfigs(typeConfig, dataset.config || {});

        const sheet = await this.createDataSheet(
          dataset.data,
          finalConfig,
          config
        );
        XLSX.utils.book_append_sheet(workbook, sheet.worksheet, sheet.name);

        totalRecords += dataset.data.length;
      }

      // Add overview sheet
      const overviewSheet = this.createOverviewSheet(datasets);
      XLSX.utils.book_append_sheet(workbook, overviewSheet.worksheet, '개요');

      const filename =
        config.filename ||
        ExportUtils.generateExportFilename('comprehensive' as any, 'excel');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true,
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, filename);

      return {
        success: true,
        filename,
        fileSize: blob.size,
        recordCount: totalRecords,
      };
    } catch (error) {
      console.error('Multi-sheet Excel export failed:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Multi-sheet Excel export failed',
      };
    }
  }

  // ============================================================================
  // SHEET CREATION METHODS
  // ============================================================================

  private async createDataSheet(
    data: any[],
    config: ExcelDataTypeConfig & Partial<ExcelExportConfig>,
    excelConfig: ExcelExportConfig
  ): Promise<{ worksheet: XLSX.WorkSheet; name: string }> {
    // Transform data for export
    const transformedData = ExportUtils.transformDataForExport(
      data,
      config.columns
    );

    // Create worksheet data
    const worksheetData: any[][] = [];

    // Add title row if specified
    if (excelConfig.includeMetadata) {
      worksheetData.push([config.sheetName]);
      worksheetData.push([`생성일: ${new Date().toLocaleString('ko-KR')}`]);
      worksheetData.push([`총 ${data.length}개 항목`]);
      worksheetData.push([]); // Empty row
    }

    // Add headers
    const headers = config.columns.map(col => col.label);
    worksheetData.push(headers);

    // Add data rows
    transformedData.forEach(row => {
      const dataRow = config.columns.map(col => {
        const value = ExportUtils.getNestedValue(row, col.key);
        return ExportUtils.formatValueByType(value, col.type);
      });
      worksheetData.push(dataRow);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply advanced styling
    await this.applyExcelStyling(workbook, config.sheetName, config);

    // Set auto filter
    if (data.length > 0 && config.enableAutoFilter) {
      const headerRowIndex = excelConfig.includeMetadata ? 4 : 0;
      const range = XLSX.utils.encode_range({
        s: { c: 0, r: headerRowIndex },
        e: { c: config.columns.length - 1, r: headerRowIndex + data.length },
      });
      worksheet['!autofilter'] = { ref: range };
    }

    // Freeze header row
    if (excelConfig.freezeHeader) {
      const headerRowIndex = excelConfig.includeMetadata ? 5 : 1;
      worksheet['!freeze'] = { xSplit: 0, ySplit: headerRowIndex };
    }

    return {
      worksheet,
      name: config.sheetName,
    };
  }

  private createSummarySheet(
    data: any[],
    config: ExcelDataTypeConfig
  ): { worksheet: XLSX.WorkSheet; name: string } {
    const summaryData: any[][] = [['요약 정보'], [], ['항목', '개수', '비율']];

    if (config.summary?.fields) {
      config.summary.fields.forEach(field => {
        const groups = this.groupDataByField(data, field);

        summaryData.push([`${field} 별 분포`]);
        Object.entries(groups).forEach(([key, items]) => {
          const count = items.length;
          const percentage = ((count / data.length) * 100).toFixed(1);
          summaryData.push([key, count, `${percentage}%`]);
        });
        summaryData.push([]); // Empty row
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    worksheet['!cols'] = [
      { wpx: 200 }, // 항목
      { wpx: 100 }, // 개수
      { wpx: 100 }, // 비율
    ];

    return {
      worksheet,
      name: '요약',
    };
  }

  private createStatisticsSheet(
    data: any[],
    config: ExcelDataTypeConfig
  ): { worksheet: XLSX.WorkSheet; name: string } {
    const statsData: any[][] = [
      ['통계 정보'],
      [],
      ['총 레코드 수', data.length],
      ['생성일', new Date().toLocaleString('ko-KR')],
      [],
    ];

    // Add field statistics
    config.columns.forEach(col => {
      if (col.type === 'number' || col.type === 'currency') {
        const values = data
          .map(row => ExportUtils.getNestedValue(row, col.key))
          .filter(val => typeof val === 'number' && !isNaN(val));

        if (values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          statsData.push([`${col.label} 통계`]);
          statsData.push(['합계', sum]);
          statsData.push(['평균', avg.toFixed(2)]);
          statsData.push(['최소값', min]);
          statsData.push(['최대값', max]);
          statsData.push([]);
        }
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(statsData);

    worksheet['!cols'] = [{ wpx: 200 }, { wpx: 150 }];

    return {
      worksheet,
      name: '통계',
    };
  }

  private createOverviewSheet(
    datasets: Array<{
      data: any[];
      dataType: string;
    }>
  ): { worksheet: XLSX.WorkSheet; name: string } {
    const overviewData: any[][] = [
      ['종합 리포트'],
      [],
      ['데이터 유형', '레코드 수', '생성일'],
    ];

    let totalRecords = 0;
    datasets.forEach(dataset => {
      const config = this.getDataTypeConfig(dataset.dataType);
      overviewData.push([
        config.sheetName,
        dataset.data.length,
        new Date().toLocaleString('ko-KR'),
      ]);
      totalRecords += dataset.data.length;
    });

    overviewData.push([]);
    overviewData.push(['총 레코드 수', totalRecords]);

    const worksheet = XLSX.utils.aoa_to_sheet(overviewData);

    worksheet['!cols'] = [{ wpx: 200 }, { wpx: 100 }, { wpx: 150 }];

    return {
      worksheet,
      name: '개요',
    };
  }

  // ============================================================================
  // STYLING AND FORMATTING
  // ============================================================================

  private async applyExcelStyling(
    workbook: XLSX.WorkBook,
    worksheetName: string,
    config: ExcelDataTypeConfig
  ): Promise<void> {
    const worksheet = workbook.Sheets[worksheetName];
    if (!worksheet) return;

    // Apply column widths with auto-sizing capability
    if (!worksheet['!cols']) {
      worksheet['!cols'] = config.columns.map((col, index) => {
        const width =
          col.width || this.calculateOptimalColumnWidth(worksheet, index);
        return { wpx: Math.min(Math.max(width, 50), 300) }; // Min 50px, Max 300px
      });
    }

    // Apply header styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '366092' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    }

    // Apply data row styling with alternating colors
    for (let row = 1; row <= range.e.r; row++) {
      const isEvenRow = row % 2 === 0;
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            font: { color: { rgb: '000000' } },
            fill: { fgColor: { rgb: isEvenRow ? 'F8F9FA' : 'FFFFFF' } },
            alignment: this.getColumnAlignment(config.columns[col]),
            border: {
              top: { style: 'thin', color: { rgb: 'E0E0E0' } },
              bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
              left: { style: 'thin', color: { rgb: 'E0E0E0' } },
              right: { style: 'thin', color: { rgb: 'E0E0E0' } },
            },
            numFmt: this.getNumberFormat(config.columns[col]),
          };
        }
      }
    }

    // Apply conditional formatting for status columns
    this.applyConditionalFormatting(worksheet, config);

    // Apply auto filter if enabled
    if (config.enableAutoFilter) {
      worksheet['!autofilter'] = {
        ref: `A1:${XLSX.utils.encode_col(range.e.c)}1`,
      };
    }

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  private calculateOptimalColumnWidth(
    worksheet: XLSX.WorkSheet,
    columnIndex: number
  ): number {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    let maxWidth = 100; // Default width

    for (let row = range.s.r; row <= Math.min(range.e.r, 100); row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: columnIndex });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellValue = String(cell.v);
        const width = cellValue.length * 7; // Approximate character width
        maxWidth = Math.max(maxWidth, width);
      }
    }

    return Math.min(maxWidth, 300); // Cap at 300px
  }

  private getColumnAlignment(column: ExportColumn): any {
    const align = column.align || 'left';
    const typeAlignments = {
      number: 'right',
      date: 'center',
      boolean: 'center',
    };

    return {
      horizontal:
        (column.type &&
          typeAlignments[column.type as keyof typeof typeAlignments]) ||
        align,
      vertical: 'center',
    };
  }

  private getNumberFormat(column: ExportColumn): string {
    switch (column.type) {
      case 'number':
        return '#,##0';
      case 'date':
        return 'yyyy-mm-dd';
      case 'currency':
        return '#,##0"원"';
      case 'percentage':
        return '0.00%';
      default:
        return 'General';
    }
  }

  private applyConditionalFormatting(
    worksheet: XLSX.WorkSheet,
    config: ExcelDataTypeConfig
  ): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Find status columns and apply conditional formatting
    config.columns.forEach((column, colIndex) => {
      if (column.key.includes('status') || column.key.includes('상태')) {
        for (let row = 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
          const cell = worksheet[cellAddress];

          if (cell && cell.v) {
            const value = String(cell.v).toLowerCase();
            let fillColor = 'FFFFFF'; // Default white

            // Status-based coloring
            if (
              value.includes('활성') ||
              value.includes('사용중') ||
              value.includes('정상')
            ) {
              fillColor = 'D4EDDA'; // Light green
            } else if (
              value.includes('비활성') ||
              value.includes('만료') ||
              value.includes('중단')
            ) {
              fillColor = 'F8D7DA'; // Light red
            } else if (value.includes('대기') || value.includes('검토')) {
              fillColor = 'FFF3CD'; // Light yellow
            }

            if (cell.s) {
              cell.s.fill = { fgColor: { rgb: fillColor } };
            }
          }
        }
      }
    });
  }

  /**
   * Apply advanced Excel formatting with custom styling options
   */
  public async applyAdvancedFormatting(
    workbook: XLSX.WorkBook,
    worksheetName: string,
    options: {
      headerStyle?: CellStyle;
      dataStyle?: CellStyle;
      conditionalFormatting?: ConditionalFormattingRule[];
      chartOptions?: ExcelChartOptions;
    }
  ): Promise<void> {
    const worksheet = workbook.Sheets[worksheetName];
    if (!worksheet) return;

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Apply custom header styling
    if (options.headerStyle) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = this.convertStyleToExcel(
            options.headerStyle
          );
        }
      }
    }

    // Apply custom data styling
    if (options.dataStyle) {
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = this.convertStyleToExcel(
              options.dataStyle
            );
          }
        }
      }
    }

    // Apply conditional formatting rules
    if (options.conditionalFormatting) {
      this.applyConditionalFormattingRules(
        worksheet,
        options.conditionalFormatting
      );
    }
  }

  private convertStyleToExcel(style: CellStyle): any {
    return {
      font: {
        bold: style.fontWeight === 'bold',
        italic: style.fontStyle === 'italic',
        color: style.color ? { rgb: style.color.replace('#', '') } : undefined,
        sz: style.fontSize,
      },
      fill: style.backgroundColor
        ? {
            fgColor: { rgb: style.backgroundColor.replace('#', '') },
          }
        : undefined,
      alignment: {
        horizontal: style.textAlign,
        vertical: style.verticalAlign,
      },
      border: style.border
        ? this.convertBorderToExcel(style.border)
        : undefined,
    };
  }

  private convertBorderToExcel(border: BorderStyle): any {
    const convertLineStyle = (line?: LineStyle) => {
      if (!line) return undefined;
      return {
        style: line.style,
        color: line.color
          ? { rgb: line.color.replace('#', '') }
          : { rgb: '000000' },
      };
    };

    return {
      top: convertLineStyle(border.top || border.all),
      right: convertLineStyle(border.right || border.all),
      bottom: convertLineStyle(border.bottom || border.all),
      left: convertLineStyle(border.left || border.all),
    };
  }

  private applyConditionalFormattingRules(
    worksheet: XLSX.WorkSheet,
    rules: ConditionalFormattingRule[]
  ): void {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    rules.forEach(rule => {
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];

          if (cell && this.evaluateCondition(cell.v, rule.condition)) {
            cell.s = {
              ...cell.s,
              ...this.convertStyleToExcel(rule.style),
            };
          }
        }
      }
    });
  }

  private evaluateCondition(
    cellValue: any,
    condition: ConditionalFormattingCondition
  ): boolean {
    const value = String(cellValue || '').toLowerCase();
    const conditionValue = String(condition.value || '').toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return value === conditionValue;
      case 'contains':
        return value.includes(conditionValue);
      case 'startsWith':
        return value.startsWith(conditionValue);
      case 'endsWith':
        return value.endsWith(conditionValue);
      case 'greaterThan':
        return Number(cellValue) > Number(condition.value);
      case 'lessThan':
        return Number(cellValue) < Number(condition.value);
      case 'between':
        const numValue = Number(cellValue);
        return (
          numValue >= Number(condition.minValue) &&
          numValue <= Number(condition.maxValue)
        );
      default:
        return false;
    }
  }

  /**
   * Create Excel charts and visualizations
   */
  public async addExcelChart(
    workbook: XLSX.WorkBook,
    worksheetName: string,
    chartConfig: ExcelChartConfig
  ): Promise<void> {
    // Note: XLSX library has limited chart support
    // This would require a more advanced library like ExcelJS for full chart functionality
    const worksheet = workbook.Sheets[worksheetName];
    if (!worksheet) return;

    // Add chart data summary for now
    const chartSummary = this.generateChartSummary(worksheet, chartConfig);

    // Add chart summary to a new area in the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const chartStartRow = range.e.r + 3;

    XLSX.utils.sheet_add_aoa(worksheet, [['Chart Summary'], ...chartSummary], {
      origin: `A${chartStartRow}`,
    });
  }

  private generateChartSummary(
    worksheet: XLSX.WorkSheet,
    chartConfig: ExcelChartConfig
  ): string[][] {
    // Generate basic chart data summary
    const summary: string[][] = [];

    summary.push(['Chart Type', chartConfig.type]);
    summary.push(['Data Range', chartConfig.dataRange]);

    if (chartConfig.title) {
      summary.push(['Title', chartConfig.title]);
    }

    return summary;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private mergeConfigs(
    typeConfig: ExcelDataTypeConfig,
    userConfig: Partial<ExcelExportConfig>
  ): ExcelDataTypeConfig & Partial<ExcelExportConfig> {
    return {
      ...typeConfig,
      ...userConfig,
      columns: userConfig.columns || typeConfig.columns,
    };
  }

  private groupDataByField(data: any[], field: string): Record<string, any[]> {
    return data.reduce(
      (groups, item) => {
        const key = ExportUtils.getNestedValue(item, field) || '미지정';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      },
      {} as Record<string, any[]>
    );
  }

  /**
   * Get column configuration for data type
   */
  getColumnsForDataType(dataType: string): ExportColumn[] {
    return this.getDataTypeConfig(dataType).columns;
  }

  /**
   * Create custom export configuration
   */
  createCustomConfig(
    dataType: string,
    customColumns?: ExportColumn[],
    options?: Partial<ExcelExportConfig>
  ): ExcelDataTypeConfig & Partial<ExcelExportConfig> {
    const baseConfig = this.getDataTypeConfig(dataType);

    return {
      ...baseConfig,
      ...options,
      columns: customColumns || baseConfig.columns,
    };
  }
}

// ============================================================================
// FACTORY AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Create Excel export service instance
 */
export function createExcelExportService(): ExcelExportService {
  return new ExcelExportService();
}

/**
 * Quick Excel export for single data type
 */
export async function quickExcelExport(
  data: any[],
  dataType: string,
  config?: Partial<ExcelExportConfig>
): Promise<ExportResult> {
  const service = createExcelExportService();
  return service.exportToExcel(data, dataType, config as ExcelExportConfig);
}

/**
 * Export all data types to single Excel file
 */
export async function exportAllToExcel(
  employeesData: Employee[],
  hardwareData: HardwareAsset[],
  softwareData: SoftwareLicense[],
  assignmentsData: Assignment[],
  usersData?: User[],
  activitiesData?: Activity[]
): Promise<ExportResult> {
  const service = createExcelExportService();

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

  return service.exportMultipleDataTypes(datasets, {
    filename: ExportUtils.generateExportFilename(
      'comprehensive' as any,
      'excel'
    ),
    includeMetadata: true,
    multipleSheets: true,
  } as ExcelExportConfig);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ExcelExportService;
