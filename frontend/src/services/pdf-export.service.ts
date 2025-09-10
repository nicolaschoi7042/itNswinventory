/**
 * PDF Export Service
 *
 * Specialized service for PDF report generation with advanced formatting,
 * charts, headers/footers, and professional layout options.
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import type {
  PDFExportConfig,
  ExportColumn,
  ExportData,
  ExportResult,
  PDFTableStyles,
  PageMargins,
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

interface PDFDataTypeConfig {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  fontSize: number;
  margins: PageMargins;
  tableStyles: PDFTableStyles;
  includeCharts?: boolean;
  groupBy?: string;
}

interface PDFSection {
  title: string;
  data: any[];
  columns: ExportColumn[];
  config?: Partial<PDFDataTypeConfig>;
}

interface PDFChartData {
  type: 'bar' | 'pie' | 'line';
  title: string;
  data: { label: string; value: number; color?: string }[];
  position: { x: number; y: number; width: number; height: number };
}

interface PDFHeaderFooter {
  header?: {
    text: string;
    logo?: string;
    includeDate?: boolean;
  };
  footer?: {
    text: string;
    includePageNumbers?: boolean;
    includeDate?: boolean;
  };
}

// ============================================================================
// PDF EXPORT SERVICE
// ============================================================================

export class PDFExportService {
  private doc: jsPDF | null = null;
  private currentY: number = 0;

  // ============================================================================
  // DATA TYPE CONFIGURATIONS
  // ============================================================================

  private getDataTypeConfig(dataType: string): PDFDataTypeConfig {
    const configs: Record<string, PDFDataTypeConfig> = {
      employees: {
        title: '직원 목록 보고서',
        subtitle: '전체 직원 정보 및 현황',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 8,
        margins: { top: 30, right: 20, bottom: 30, left: 20 },
        includeCharts: true,
        groupBy: 'department',
        tableStyles: {
          headerStyle: {
            fillColor: [54, 96, 146],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyle: {
            fontSize: 8,
            cellPadding: 3,
            alternateRowColors: true,
          },
          borderStyle: {
            lineColor: [200, 200, 200],
            lineWidth: 0.5,
          },
        },
        columns: [
          { key: 'id', label: 'ID', width: 40, align: 'center' },
          { key: 'name', label: '이름', width: 60, align: 'left' },
          { key: 'department', label: '부서', width: 60, align: 'center' },
          { key: 'position', label: '직급', width: 50, align: 'center' },
          { key: 'email', label: '이메일', width: 80, align: 'left' },
          { key: 'phone', label: '전화번호', width: 70, align: 'center' },
          { key: 'status', label: '상태', width: 40, align: 'center' },
        ],
      },

      hardware: {
        title: '하드웨어 자산 보고서',
        subtitle: '하드웨어 자산 현황 및 관리 정보',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 7,
        margins: { top: 30, right: 15, bottom: 30, left: 15 },
        includeCharts: true,
        groupBy: 'type',
        tableStyles: {
          headerStyle: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
          },
          bodyStyle: {
            fontSize: 7,
            cellPadding: 2,
            alternateRowColors: true,
          },
        },
        columns: [
          { key: 'assetTag', label: '자산태그', width: 50, align: 'center' },
          { key: 'type', label: '유형', width: 40, align: 'center' },
          { key: 'brand', label: '브랜드', width: 45, align: 'center' },
          { key: 'model', label: '모델', width: 60, align: 'left' },
          {
            key: 'serialNumber',
            label: '일련번호',
            width: 60,
            align: 'center',
          },
          { key: 'status', label: '상태', width: 35, align: 'center' },
          { key: 'location', label: '위치', width: 50, align: 'center' },
          {
            key: 'purchaseDate',
            label: '구매일',
            width: 45,
            align: 'center',
            type: 'date',
          },
        ],
      },

      software: {
        title: '소프트웨어 라이선스 보고서',
        subtitle: '소프트웨어 라이선스 현황 및 사용률',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 8,
        margins: { top: 30, right: 20, bottom: 30, left: 20 },
        includeCharts: true,
        groupBy: 'vendor',
        tableStyles: {
          headerStyle: {
            fillColor: [155, 89, 182],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyle: {
            fontSize: 8,
            cellPadding: 3,
            alternateRowColors: true,
          },
        },
        columns: [
          { key: 'name', label: '소프트웨어명', width: 80, align: 'left' },
          { key: 'version', label: '버전', width: 40, align: 'center' },
          { key: 'vendor', label: '제조사', width: 60, align: 'center' },
          {
            key: 'licenseType',
            label: '라이선스유형',
            width: 50,
            align: 'center',
          },
          {
            key: 'totalLicenses',
            label: '총라이선스',
            width: 35,
            align: 'right',
            type: 'number',
          },
          {
            key: 'usedLicenses',
            label: '사용',
            width: 30,
            align: 'right',
            type: 'number',
          },
          {
            key: 'availableLicenses',
            label: '가용',
            width: 30,
            align: 'right',
            type: 'number',
          },
          {
            key: 'expiryDate',
            label: '만료일',
            width: 45,
            align: 'center',
            type: 'date',
          },
        ],
      },

      assignments: {
        title: '자산 할당 보고서',
        subtitle: '자산 할당 현황 및 반납 정보',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 8,
        margins: { top: 30, right: 20, bottom: 30, left: 20 },
        includeCharts: true,
        groupBy: 'assetType',
        tableStyles: {
          headerStyle: {
            fillColor: [46, 204, 113],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyle: {
            fontSize: 8,
            cellPadding: 3,
            alternateRowColors: true,
          },
        },
        columns: [
          { key: 'id', label: 'ID', width: 40, align: 'center' },
          { key: 'employeeName', label: '직원명', width: 60, align: 'left' },
          { key: 'assetType', label: '자산유형', width: 50, align: 'center' },
          { key: 'assetName', label: '자산명', width: 80, align: 'left' },
          { key: 'status', label: '상태', width: 40, align: 'center' },
          {
            key: 'assignedDate',
            label: '할당일',
            width: 50,
            align: 'center',
            type: 'date',
          },
          {
            key: 'returnedDate',
            label: '반납일',
            width: 50,
            align: 'center',
            type: 'date',
          },
        ],
      },

      users: {
        title: '사용자 관리 보고서',
        subtitle: '시스템 사용자 현황 및 권한 정보',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 8,
        margins: { top: 30, right: 20, bottom: 30, left: 20 },
        includeCharts: true,
        groupBy: 'role',
        tableStyles: {
          headerStyle: {
            fillColor: [230, 126, 34],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyle: {
            fontSize: 8,
            cellPadding: 3,
            alternateRowColors: true,
          },
        },
        columns: [
          { key: 'username', label: '사용자명', width: 60, align: 'left' },
          { key: 'fullName', label: '이름', width: 60, align: 'left' },
          { key: 'email', label: '이메일', width: 80, align: 'left' },
          { key: 'role', label: '역할', width: 40, align: 'center' },
          { key: 'department', label: '부서', width: 60, align: 'center' },
          { key: 'status', label: '상태', width: 40, align: 'center' },
          {
            key: 'lastLogin',
            label: '마지막로그인',
            width: 60,
            align: 'center',
            type: 'date',
          },
        ],
      },

      activities: {
        title: '활동 로그 보고서',
        subtitle: '시스템 활동 기록 및 감사 정보',
        orientation: 'landscape',
        pageSize: 'a4',
        fontSize: 7,
        margins: { top: 30, right: 15, bottom: 30, left: 15 },
        includeCharts: false,
        groupBy: 'type',
        tableStyles: {
          headerStyle: {
            fillColor: [231, 76, 60],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
          },
          bodyStyle: {
            fontSize: 7,
            cellPadding: 2,
            alternateRowColors: true,
          },
        },
        columns: [
          { key: 'type', label: '유형', width: 40, align: 'center' },
          { key: 'description', label: '설명', width: 120, align: 'left' },
          { key: 'userName', label: '사용자', width: 50, align: 'center' },
          { key: 'entityType', label: '대상유형', width: 40, align: 'center' },
          { key: 'entityId', label: '대상ID', width: 40, align: 'center' },
          {
            key: 'createdAt',
            label: '발생시각',
            width: 60,
            align: 'center',
            type: 'date',
          },
        ],
      },
    };

    return configs[dataType] || configs.employees;
  }

  // ============================================================================
  // MAIN EXPORT METHODS
  // ============================================================================

  /**
   * Export data to PDF format with professional layout
   */
  async exportToPDF(
    data: any[],
    dataType: string,
    config: PDFExportConfig = {} as PDFExportConfig
  ): Promise<ExportResult> {
    try {
      const typeConfig = this.getDataTypeConfig(dataType);
      const finalConfig = this.mergeConfigs(typeConfig, config);

      // Initialize PDF document
      this.doc = new jsPDF({
        orientation: finalConfig.orientation,
        unit: 'mm',
        format: finalConfig.pageSize,
      });

      this.currentY = finalConfig.margins.top;

      // Add header if specified
      if (config.headerFooter?.header) {
        this.addHeader(config.headerFooter.header, finalConfig);
      }

      // Add title and subtitle
      this.addTitle(finalConfig.title, finalConfig.subtitle, finalConfig);

      // Add summary statistics
      this.addSummarySection(data, finalConfig);

      // Add charts if enabled
      if (finalConfig.includeCharts && data.length > 0) {
        this.addChartsSection(data, finalConfig);
      }

      // Add main data table
      this.addDataTable(data, finalConfig);

      // Add footer if specified
      if (config.headerFooter?.footer) {
        this.addFooter(config.headerFooter.footer, finalConfig);
      }

      // Generate filename and save
      const filename =
        config.filename ||
        ExportUtils.generateExportFilename(dataType as any, 'pdf');

      this.doc.save(filename);

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

  /**
   * Export multiple datasets to a comprehensive PDF report
   */
  async exportMultipleToPDF(
    sections: PDFSection[],
    config: PDFExportConfig = {} as PDFExportConfig
  ): Promise<ExportResult> {
    try {
      this.doc = new jsPDF({
        orientation: config.orientation || 'landscape',
        unit: 'mm',
        format: config.pageSize || 'a4',
      });

      const margins = config.margins || {
        top: 30,
        right: 20,
        bottom: 30,
        left: 20,
      };
      this.currentY = margins.top;

      // Add cover page
      this.addCoverPage(config.title || '종합 리포트', sections, margins);

      // Add table of contents
      this.addTableOfContents(sections, margins);

      // Add each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionConfig = this.getDataTypeConfig(
          this.inferDataTypeFromSection(section)
        );

        this.addNewPage();
        this.addSectionHeader(section.title, margins);

        if (section.data.length > 0) {
          this.addSummarySection(section.data, sectionConfig);
          this.addDataTable(section.data, sectionConfig);
        } else {
          this.addNoDataMessage();
        }
      }

      const filename =
        config.filename ||
        ExportUtils.generateExportFilename('comprehensive' as any, 'pdf');

      this.doc.save(filename);

      const totalRecords = sections.reduce(
        (sum, section) => sum + section.data.length,
        0
      );

      return {
        success: true,
        filename,
        recordCount: totalRecords,
      };
    } catch (error) {
      console.error('Multi-section PDF export failed:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Multi-section PDF export failed',
      };
    }
  }

  // ============================================================================
  // PDF LAYOUT METHODS
  // ============================================================================

  private addHeader(
    header: NonNullable<PDFHeaderFooter['header']>,
    config: PDFDataTypeConfig
  ): void {
    if (!this.doc) return;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Add header text
    this.doc.text(header.text, config.margins.left, 15);

    // Add date if requested
    if (header.includeDate) {
      const date = new Date().toLocaleDateString('ko-KR');
      const pageWidth = this.doc.internal.pageSize.width;
      this.doc.text(
        `생성일: ${date}`,
        pageWidth - config.margins.right - 40,
        15
      );
    }

    // Add horizontal line
    this.doc.setLineWidth(0.5);
    this.doc.line(
      config.margins.left,
      20,
      this.doc.internal.pageSize.width - config.margins.right,
      20
    );
  }

  private addTitle(
    title: string,
    subtitle?: string,
    config: PDFDataTypeConfig
  ): void {
    if (!this.doc) return;

    // Main title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, config.margins.left, this.currentY);
    this.currentY += 10;

    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, config.margins.left, this.currentY);
      this.currentY += 8;
    }

    this.currentY += 5;
  }

  private addSummarySection(data: any[], config: PDFDataTypeConfig): void {
    if (!this.doc || data.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('요약 정보', config.margins.left, this.currentY);
    this.currentY += 10;

    // Basic statistics
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const stats = this.calculateStatistics(data, config);
    stats.forEach(stat => {
      this.doc!.text(
        `• ${stat.label}: ${stat.value}`,
        config.margins.left + 5,
        this.currentY
      );
      this.currentY += 6;
    });

    this.currentY += 5;
  }

  private addChartsSection(data: any[], config: PDFDataTypeConfig): void {
    if (!this.doc || !config.groupBy) return;

    // Generate chart data
    const chartData = this.generateChartData(data, config.groupBy);
    if (chartData.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('데이터 분석', config.margins.left, this.currentY);
    this.currentY += 15;

    // Simple bar chart representation
    this.addSimpleBarChart(chartData, config);
  }

  private addDataTable(data: any[], config: PDFDataTypeConfig): void {
    if (!this.doc || data.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('상세 데이터', config.margins.left, this.currentY);
    this.currentY += 10;

    // Prepare table data
    const headers = config.columns.map(col => col.label);
    const tableData = data.map(row =>
      config.columns.map(col => {
        const value = ExportUtils.getNestedValue(row, col.key);
        return this.formatPDFValue(value, col.type);
      })
    );

    // AutoTable configuration
    const autoTableConfig = {
      head: [headers],
      body: tableData,
      startY: this.currentY,
      margin: config.margins,
      styles: {
        fontSize: config.tableStyles.bodyStyle?.fontSize || 8,
        cellPadding: config.tableStyles.bodyStyle?.cellPadding || 3,
      },
      headStyles: {
        fillColor: config.tableStyles.headerStyle?.fillColor || [70, 130, 180],
        textColor: config.tableStyles.headerStyle?.textColor || [255, 255, 255],
        fontStyle: 'bold',
        fontSize: config.tableStyles.headerStyle?.fontSize || 9,
      },
      alternateRowStyles: config.tableStyles.bodyStyle?.alternateRowColors
        ? {
            fillColor: [248, 249, 250],
          }
        : undefined,
      columnStyles: this.getColumnStyles(config.columns),
      didDrawPage: (data: any) => {
        this.addPageNumbers(data.settings.margin);
      },
    };

    // Add table
    (this.doc as any).autoTable(autoTableConfig);
  }

  private addFooter(
    footer: NonNullable<PDFHeaderFooter['footer']>,
    config: PDFDataTypeConfig
  ): void {
    if (!this.doc) return;

    const pageHeight = this.doc.internal.pageSize.height;
    const footerY = pageHeight - 15;

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');

    // Add footer text
    this.doc.text(footer.text, config.margins.left, footerY);

    // Add date and page numbers if requested
    if (footer.includeDate || footer.includePageNumbers) {
      let rightText = '';
      if (footer.includeDate) {
        rightText += new Date().toLocaleDateString('ko-KR');
      }
      if (footer.includePageNumbers) {
        if (rightText) rightText += ' | ';
        rightText += `페이지 ${this.doc.getNumberOfPages()}`;
      }

      const pageWidth = this.doc.internal.pageSize.width;
      this.doc.text(rightText, pageWidth - config.margins.right - 40, footerY);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private addNewPage(): void {
    if (!this.doc) return;
    this.doc.addPage();
    this.currentY = 30;
  }

  private addPageNumbers(margin: any): void {
    if (!this.doc) return;

    const pageCount = this.doc.getNumberOfPages();
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;

    this.doc.setFontSize(8);
    this.doc.text(`${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });
  }

  private calculateStatistics(
    data: any[],
    config: PDFDataTypeConfig
  ): Array<{ label: string; value: string }> {
    const stats = [
      {
        label: '총 레코드 수',
        value: data.length.toLocaleString('ko-KR') + '개',
      },
      { label: '생성 일시', value: new Date().toLocaleString('ko-KR') },
    ];

    // Add grouped statistics if groupBy is specified
    if (config.groupBy) {
      const groups = this.groupDataByField(data, config.groupBy);
      const groupCount = Object.keys(groups).length;
      stats.push({
        label: `${config.groupBy} 그룹 수`,
        value: groupCount.toLocaleString('ko-KR') + '개',
      });
    }

    return stats;
  }

  private generateChartData(
    data: any[],
    groupBy: string
  ): Array<{ label: string; value: number }> {
    const groups = this.groupDataByField(data, groupBy);
    return Object.entries(groups)
      .map(([key, items]) => ({
        label: key || '미지정',
        value: items.length,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private addSimpleBarChart(
    chartData: Array<{ label: string; value: number }>,
    config: PDFDataTypeConfig
  ): void {
    if (!this.doc) return;

    const chartWidth = 150;
    const chartHeight = 80;
    const chartX = config.margins.left;
    const chartY = this.currentY;

    const maxValue = Math.max(...chartData.map(d => d.value));

    // Draw chart title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${config.groupBy} 별 분포`, chartX, chartY - 5);

    // Draw bars
    const barWidth = chartWidth / chartData.length;
    chartData.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const barX = chartX + index * barWidth;
      const barY = chartY + chartHeight - barHeight;

      // Draw bar
      this.doc!.setFillColor(70 + ((index * 30) % 200), 130, 180);
      this.doc!.rect(barX, barY, barWidth * 0.8, barHeight, 'F');

      // Add label
      this.doc!.setFontSize(7);
      this.doc!.text(
        item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label,
        barX + barWidth * 0.4,
        chartY + chartHeight + 8,
        { align: 'center' }
      );

      // Add value
      this.doc!.text(item.value.toString(), barX + barWidth * 0.4, barY - 2, {
        align: 'center',
      });
    });

    this.currentY += chartHeight + 20;
  }

  private addCoverPage(
    title: string,
    sections: PDFSection[],
    margins: PageMargins
  ): void {
    if (!this.doc) return;

    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;

    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, pageWidth / 2, pageHeight / 3, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      '종합 데이터 분석 보고서',
      pageWidth / 2,
      pageHeight / 3 + 15,
      { align: 'center' }
    );

    // Date
    this.doc.setFontSize(12);
    this.doc.text(
      `생성일: ${new Date().toLocaleDateString('ko-KR')}`,
      pageWidth / 2,
      pageHeight / 3 + 30,
      { align: 'center' }
    );

    // Section summary
    let summaryY = pageHeight / 2;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('포함된 데이터:', margins.left, summaryY);

    summaryY += 10;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    sections.forEach(section => {
      this.doc!.text(
        `• ${section.title}: ${section.data.length}개 레코드`,
        margins.left + 10,
        summaryY
      );
      summaryY += 8;
    });
  }

  private addTableOfContents(
    sections: PDFSection[],
    margins: PageMargins
  ): void {
    if (!this.doc) return;

    this.addNewPage();

    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('목차', margins.left, this.currentY);
    this.currentY += 15;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');

    sections.forEach((section, index) => {
      this.doc!.text(
        `${index + 1}. ${section.title}`,
        margins.left + 5,
        this.currentY
      );
      this.currentY += 8;
    });
  }

  private addSectionHeader(title: string, margins: PageMargins): void {
    if (!this.doc) return;

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, margins.left, this.currentY);
    this.currentY += 15;
  }

  private addNoDataMessage(): void {
    if (!this.doc) return;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text('이 섹션에는 표시할 데이터가 없습니다.', 30, this.currentY);
    this.currentY += 20;
  }

  private formatPDFValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (type) {
      case 'date':
        return value instanceof Date
          ? value.toLocaleDateString('ko-KR')
          : String(value);
      case 'number':
      case 'currency':
        return typeof value === 'number'
          ? value.toLocaleString('ko-KR')
          : String(value);
      case 'boolean':
        return value ? '예' : '아니오';
      default:
        return String(value);
    }
  }

  private getColumnStyles(columns: ExportColumn[]): any {
    const styles: any = {};
    columns.forEach((col, index) => {
      styles[index] = {
        halign: col.align || 'left',
        cellWidth: col.width || 'auto',
      };
    });
    return styles;
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

  private mergeConfigs(
    typeConfig: PDFDataTypeConfig,
    userConfig: Partial<PDFExportConfig>
  ): PDFDataTypeConfig {
    return {
      ...typeConfig,
      ...userConfig,
      columns: userConfig.columns || typeConfig.columns,
    };
  }

  private inferDataTypeFromSection(section: PDFSection): string {
    // Simple inference based on section title
    const title = section.title.toLowerCase();
    if (title.includes('직원')) return 'employees';
    if (title.includes('하드웨어')) return 'hardware';
    if (title.includes('소프트웨어')) return 'software';
    if (title.includes('할당')) return 'assignments';
    if (title.includes('사용자')) return 'users';
    if (title.includes('활동')) return 'activities';
    return 'employees';
  }
}

// ============================================================================
// FACTORY AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Create PDF export service instance
 */
export function createPDFExportService(): PDFExportService {
  return new PDFExportService();
}

/**
 * Quick PDF export for single data type
 */
export async function quickPDFExport(
  data: any[],
  dataType: string,
  config?: Partial<PDFExportConfig>
): Promise<ExportResult> {
  const service = createPDFExportService();
  return service.exportToPDF(data, dataType, config as PDFExportConfig);
}

/**
 * Export comprehensive PDF report with all data types
 */
export async function exportComprehensivePDFReport(
  employeesData: Employee[],
  hardwareData: HardwareAsset[],
  softwareData: SoftwareLicense[],
  assignmentsData: Assignment[],
  usersData?: User[],
  activitiesData?: Activity[]
): Promise<ExportResult> {
  const service = createPDFExportService();

  const sections: PDFSection[] = [
    { title: '직원 현황', data: employeesData, columns: [] },
    { title: '하드웨어 자산', data: hardwareData, columns: [] },
    { title: '소프트웨어 라이선스', data: softwareData, columns: [] },
    { title: '자산 할당', data: assignmentsData, columns: [] },
  ];

  if (usersData) {
    sections.push({ title: '시스템 사용자', data: usersData, columns: [] });
  }

  if (activitiesData) {
    sections.push({
      title: '시스템 활동',
      data: activitiesData.slice(-100),
      columns: [],
    });
  }

  return service.exportMultipleToPDF(sections, {
    title: 'IT 자산 관리 시스템 종합 보고서',
    filename: ExportUtils.generateExportFilename('comprehensive' as any, 'pdf'),
    orientation: 'landscape',
    pageSize: 'a4',
    margins: { top: 30, right: 20, bottom: 30, left: 20 },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PDFExportService;
