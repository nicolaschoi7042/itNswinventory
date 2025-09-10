/**
 * Export Service
 *
 * Unified export service infrastructure for handling data export
 * in multiple formats (Excel, CSV, PDF) across all modules.
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ApiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type ExportFormat = 'excel' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  encoding?: string;
  delimiter?: string; // For CSV
  orientation?: 'portrait' | 'landscape'; // For PDF
  pageSize?: 'a4' | 'letter' | 'legal'; // For PDF
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }; // For PDF
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  format?: (value: any) => string;
  type?: 'string' | 'number' | 'date' | 'boolean';
  align?: 'left' | 'center' | 'right';
}

export interface ExportData {
  data: any[];
  columns: ExportColumn[];
  title?: string;
  metadata?: {
    exportedBy?: string;
    exportDate?: string;
    totalRecords?: number;
    filters?: string[];
    [key: string]: any;
  };
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  downloadUrl?: string;
  error?: string;
  fileSize?: number;
  recordCount?: number;
}

export interface BulkExportRequest {
  exports: Array<{
    name: string;
    data: ExportData;
    options: ExportOptions;
  }>;
  zipFilename?: string;
}

// ============================================================================
// EXPORT SERVICE CLASS
// ============================================================================

export class ExportService {
  constructor(private apiClient?: ApiClient) {}

  // ============================================================================
  // EXCEL EXPORT
  // ============================================================================

  /**
   * Export data to Excel format
   */
  async exportToExcel(
    exportData: ExportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const { data, columns, title, metadata } = exportData;
      const {
        filename = `export_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName = 'Data',
        includeHeaders = true,
      } = options;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare data for Excel
      const excelData = this.prepareExcelData(data, columns, includeHeaders);

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const columnWidths = columns.map(col => ({
        wpx: col.width || 100,
      }));
      worksheet['!cols'] = columnWidths;

      // Add metadata if provided
      if (metadata || title) {
        this.addExcelMetadata(worksheet, title, metadata);
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
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

  private prepareExcelData(
    data: any[],
    columns: ExportColumn[],
    includeHeaders: boolean
  ): any[][] {
    const excelData: any[][] = [];

    // Add headers if requested
    if (includeHeaders) {
      excelData.push(columns.map(col => col.label));
    }

    // Add data rows
    data.forEach(row => {
      const excelRow = columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        return col.format
          ? col.format(value)
          : this.formatCellValue(value, col.type);
      });
      excelData.push(excelRow);
    });

    return excelData;
  }

  private addExcelMetadata(
    worksheet: XLSX.WorkSheet,
    title?: string,
    metadata?: any
  ): void {
    if (title) {
      // Add title in the first row
      XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
    }

    if (metadata) {
      // Add metadata starting from the second row
      const metadataRows: any[][] = [];
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          metadataRows.push([key, String(value)]);
        }
      });

      if (metadataRows.length > 0) {
        XLSX.utils.sheet_add_aoa(worksheet, metadataRows, { origin: 'A2' });
      }
    }
  }

  // ============================================================================
  // CSV EXPORT
  // ============================================================================

  /**
   * Export data to CSV format
   */
  async exportToCSV(
    exportData: ExportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const { data, columns } = exportData;
      const {
        filename = `export_${new Date().toISOString().split('T')[0]}.csv`,
        includeHeaders = true,
        delimiter = ',',
        encoding = 'utf-8',
      } = options;

      // Prepare CSV content
      const csvContent = this.prepareCSVData(
        data,
        columns,
        includeHeaders,
        delimiter
      );

      // Create blob and save
      const blob = new Blob([csvContent], {
        type: `text/csv;charset=${encoding}`,
      });

      saveAs(blob, filename);

      return {
        success: true,
        filename,
        fileSize: blob.size,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CSV export failed',
      };
    }
  }

  private prepareCSVData(
    data: any[],
    columns: ExportColumn[],
    includeHeaders: boolean,
    delimiter: string
  ): string {
    const csvRows: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
      const headerRow = columns
        .map(col => this.escapeCSVField(col.label))
        .join(delimiter);
      csvRows.push(headerRow);
    }

    // Add data rows
    data.forEach(row => {
      const csvRow = columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        const formattedValue = col.format
          ? col.format(value)
          : this.formatCellValue(value, col.type);
        return this.escapeCSVField(String(formattedValue));
      });
      csvRows.push(csvRow.join(delimiter));
    });

    return csvRows.join('\n');
  }

  private escapeCSVField(field: string): string {
    // Escape CSV fields containing commas, quotes, or newlines
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  // ============================================================================
  // PDF EXPORT
  // ============================================================================

  /**
   * Export data to PDF format
   */
  async exportToPDF(
    exportData: ExportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const { data, columns, title, metadata } = exportData;
      const {
        filename = `export_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation = 'landscape',
        pageSize = 'a4',
        margins = { top: 20, right: 20, bottom: 20, left: 20 },
      } = options;

      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      });

      // Add title
      if (title) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margins.left, margins.top);
      }

      // Add metadata
      let currentY = margins.top + (title ? 15 : 0);
      if (metadata) {
        currentY = this.addPDFMetadata(pdf, metadata, margins.left, currentY);
        currentY += 10;
      }

      // Prepare table data
      const tableColumns = columns.map(col => col.label);
      const tableData = data.map(row =>
        columns.map(col => {
          const value = this.getNestedValue(row, col.key);
          return col.format
            ? col.format(value)
            : this.formatCellValue(value, col.type);
        })
      );

      // Add table
      (pdf as any).autoTable({
        head: [tableColumns],
        body: tableData,
        startY: currentY,
        margin: margins,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        columnStyles: this.getPDFColumnStyles(columns),
        didDrawPage: (data: any) => {
          // Add page numbers
          const pageCount = pdf.getNumberOfPages();
          pdf.setFontSize(10);
          pdf.text(
            `페이지 ${data.pageNumber} / ${pageCount}`,
            data.settings.margin.left,
            pdf.internal.pageSize.height - 10
          );
        },
      });

      // Save PDF
      pdf.save(filename);

      return {
        success: true,
        filename,
        recordCount: data.length,
      };
    } catch (error) {
      console.error('PDF export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF export failed',
      };
    }
  }

  private addPDFMetadata(
    pdf: jsPDF,
    metadata: any,
    x: number,
    y: number
  ): number {
    let currentY = y;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        pdf.text(`${key}: ${String(value)}`, x, currentY);
        currentY += 5;
      }
    });

    return currentY;
  }

  private getPDFColumnStyles(columns: ExportColumn[]): any {
    const styles: any = {};

    columns.forEach((col, index) => {
      if (col.align) {
        styles[index] = { halign: col.align };
      }
    });

    return styles;
  }

  // ============================================================================
  // BULK EXPORT
  // ============================================================================

  /**
   * Export multiple datasets as a ZIP file
   */
  async bulkExport(request: BulkExportRequest): Promise<ExportResult> {
    try {
      const { exports, zipFilename = `bulk_export_${Date.now()}.zip` } =
        request;

      // This would require a ZIP library like JSZip
      // For now, export each file individually
      const results: ExportResult[] = [];

      for (const exportItem of exports) {
        const result = await this.exportData(
          exportItem.data,
          exportItem.options
        );
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;

      return {
        success: successCount === exports.length,
        filename: zipFilename,
        recordCount: results.reduce((sum, r) => sum + (r.recordCount || 0), 0),
      };
    } catch (error) {
      console.error('Bulk export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk export failed',
      };
    }
  }

  // ============================================================================
  // MAIN EXPORT METHOD
  // ============================================================================

  /**
   * Main export method that delegates to format-specific handlers
   */
  async exportData(
    exportData: ExportData,
    options: ExportOptions
  ): Promise<ExportResult> {
    switch (options.format) {
      case 'excel':
        return this.exportToExcel(exportData, options);
      case 'csv':
        return this.exportToCSV(exportData, options);
      case 'pdf':
        return this.exportToPDF(exportData, options);
      default:
        return {
          success: false,
          error: `Unsupported export format: ${options.format}`,
        };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatCellValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString('ko-KR')
          : String(value);
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString('ko-KR')
          : String(value);
      case 'boolean':
        return value ? '예' : '아니오';
      default:
        return String(value);
    }
  }

  /**
   * Generate export filename with timestamp
   */
  generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${format === 'excel' ? 'xlsx' : format}`;
  }

  /**
   * Validate export data before processing
   */
  validateExportData(exportData: ExportData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!exportData.data || !Array.isArray(exportData.data)) {
      errors.push('Export data must be an array');
    }

    if (!exportData.columns || !Array.isArray(exportData.columns)) {
      errors.push('Export columns must be an array');
    }

    if (exportData.columns && exportData.columns.length === 0) {
      errors.push('At least one column must be specified');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get export statistics
   */
  getExportStats(exportData: ExportData): {
    recordCount: number;
    columnCount: number;
    estimatedSize: number;
  } {
    const recordCount = exportData.data?.length || 0;
    const columnCount = exportData.columns?.length || 0;

    // Rough estimation of file size (in bytes)
    const avgCellSize = 20; // Average characters per cell
    const estimatedSize = recordCount * columnCount * avgCellSize;

    return {
      recordCount,
      columnCount,
      estimatedSize,
    };
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Create export service instance
 */
export function createExportService(apiClient?: ApiClient): ExportService {
  return new ExportService(apiClient);
}

/**
 * Quick export helper for common use cases
 */
export async function quickExport(
  data: any[],
  columns: ExportColumn[],
  format: ExportFormat,
  filename?: string
): Promise<ExportResult> {
  const exportService = createExportService();

  const exportData: ExportData = {
    data,
    columns,
    metadata: {
      exportDate: new Date().toLocaleString('ko-KR'),
      totalRecords: data.length,
    },
  };

  const options: ExportOptions = {
    format,
    filename: filename || exportService.generateFilename('export', format),
  };

  return exportService.exportData(exportData, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ExportService;
