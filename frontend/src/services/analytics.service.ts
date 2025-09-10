/**
 * Analytics Service
 *
 * Advanced reporting and analytics service for generating insights,
 * trend analysis, and custom reports from system data.
 */

import type { ExportColumn, ExportFormat, ExportResult } from '@/types/export';
import type {
  User,
  Employee,
  HardwareAsset,
  SoftwareLicense,
  Assignment,
  Activity,
} from '@/types';
import { ExportUtils } from '@/utils/export.utils';
import { createExcelExportService } from '@/services/excel-export.service';
import { createPDFExportService } from '@/services/pdf-export.service';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface AnalyticsData {
  employees: Employee[];
  hardware: HardwareAsset[];
  software: SoftwareLicense[];
  assignments: Assignment[];
  users: User[];
  activities: Activity[];
}

export interface DashboardMetrics {
  totalEmployees: number;
  totalHardware: number;
  totalSoftware: number;
  totalAssignments: number;
  activeAssignments: number;
  expiringSoftware: number;
  hardwareByStatus: Record<string, number>;
  softwareByVendor: Record<string, number>;
  assignmentsByType: Record<string, number>;
  recentActivities: Activity[];
  utilizationRates: {
    hardware: number;
    software: number;
  };
}

export interface TrendAnalysis {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    assignments: TrendDataPoint[];
    hardware: TrendDataPoint[];
    software: TrendDataPoint[];
    activities: TrendDataPoint[];
  };
  insights: AnalyticsInsight[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  change?: number;
  changePercentage?: number;
}

export interface AnalyticsInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'hardware' | 'software' | 'assignments' | 'users' | 'general';
  data?: any;
  action?: string;
}

export interface CustomReportConfig {
  title: string;
  description?: string;
  dataTypes: string[];
  filters: ReportFilter[];
  groupBy: string[];
  aggregations: ReportAggregation[];
  charts: ReportChart[];
  format: ExportFormat;
  includeInsights?: boolean;
  scheduledExport?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

export interface ReportFilter {
  field: string;
  operator:
    | 'equals'
    | 'contains'
    | 'greaterThan'
    | 'lessThan'
    | 'between'
    | 'in';
  value: any;
  dataType: string;
}

export interface ReportAggregation {
  field: string;
  operation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation?: string;
}

export interface AssetUtilizationReport {
  hardware: {
    total: number;
    assigned: number;
    available: number;
    maintenance: number;
    utilization: number;
    byType: Record<string, UtilizationData>;
    byLocation: Record<string, UtilizationData>;
  };
  software: {
    total: number;
    assigned: number;
    available: number;
    expired: number;
    utilization: number;
    byVendor: Record<string, UtilizationData>;
    byType: Record<string, UtilizationData>;
  };
  insights: AnalyticsInsight[];
}

export interface UtilizationData {
  total: number;
  used: number;
  available: number;
  utilization: number;
}

export interface ComplianceReport {
  software: {
    totalLicenses: number;
    underLicensed: SoftwareLicense[];
    overLicensed: SoftwareLicense[];
    expiring: SoftwareLicense[];
    expired: SoftwareLicense[];
    complianceScore: number;
  };
  hardware: {
    warrantyExpiring: HardwareAsset[];
    maintenanceOverdue: HardwareAsset[];
    complianceIssues: HardwareAsset[];
  };
  assignments: {
    overdueReturns: Assignment[];
    missingAssets: Assignment[];
    unauthorizedAssignments: Assignment[];
  };
  recommendations: AnalyticsInsight[];
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService {
  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  /**
   * Generate comprehensive dashboard metrics
   */
  generateDashboardMetrics(data: AnalyticsData): DashboardMetrics {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return {
      totalEmployees: data.employees.length,
      totalHardware: data.hardware.length,
      totalSoftware: data.software.length,
      totalAssignments: data.assignments.length,
      activeAssignments: data.assignments.filter(a => a.status === '사용중')
        .length,
      expiringSoftware: data.software.filter(
        s => s.expiryDate && new Date(s.expiryDate) <= thirtyDaysFromNow
      ).length,
      hardwareByStatus: this.groupByField(data.hardware, 'status'),
      softwareByVendor: this.groupByField(data.software, 'vendor'),
      assignmentsByType: this.groupByField(data.assignments, 'assetType'),
      recentActivities: data.activities
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
      utilizationRates: {
        hardware: this.calculateHardwareUtilization(
          data.hardware,
          data.assignments
        ),
        software: this.calculateSoftwareUtilization(data.software),
      },
    };
  }

  /**
   * Generate trend analysis for specified period
   */
  generateTrendAnalysis(
    data: AnalyticsData,
    period: TrendAnalysis['period'],
    startDate: Date,
    endDate: Date
  ): TrendAnalysis {
    const assignmentTrends = this.calculateTrends(
      data.assignments,
      period,
      startDate,
      endDate,
      'assignedDate'
    );
    const hardwareTrends = this.calculateTrends(
      data.hardware,
      period,
      startDate,
      endDate,
      'purchaseDate'
    );
    const softwareTrends = this.calculateTrends(
      data.software,
      period,
      startDate,
      endDate,
      'purchaseDate'
    );
    const activityTrends = this.calculateTrends(
      data.activities,
      period,
      startDate,
      endDate,
      'createdAt'
    );

    const insights = this.generateTrendInsights({
      assignments: assignmentTrends,
      hardware: hardwareTrends,
      software: softwareTrends,
      activities: activityTrends,
    });

    return {
      period,
      startDate,
      endDate,
      metrics: {
        assignments: assignmentTrends,
        hardware: hardwareTrends,
        software: softwareTrends,
        activities: activityTrends,
      },
      insights,
    };
  }

  // ============================================================================
  // ASSET UTILIZATION ANALYTICS
  // ============================================================================

  /**
   * Generate comprehensive asset utilization report
   */
  generateAssetUtilizationReport(data: AnalyticsData): AssetUtilizationReport {
    const hardwareUtilization = this.analyzeHardwareUtilization(
      data.hardware,
      data.assignments
    );
    const softwareUtilization = this.analyzeSoftwareUtilization(data.software);

    const insights = [
      ...this.generateUtilizationInsights(hardwareUtilization, 'hardware'),
      ...this.generateUtilizationInsights(softwareUtilization, 'software'),
    ];

    return {
      hardware: hardwareUtilization,
      software: softwareUtilization,
      insights,
    };
  }

  private analyzeHardwareUtilization(
    hardware: HardwareAsset[],
    assignments: Assignment[]
  ) {
    const activeAssignments = assignments.filter(
      a => a.status === '사용중' && a.assetType === 'hardware'
    );
    const assignedHardwareIds = new Set(activeAssignments.map(a => a.assetId));

    const assigned = hardware.filter(h => assignedHardwareIds.has(h.id)).length;
    const maintenance = hardware.filter(h => h.status === '수리중').length;
    const available = hardware.filter(
      h => h.status === '활성' && !assignedHardwareIds.has(h.id)
    ).length;

    return {
      total: hardware.length,
      assigned,
      available,
      maintenance,
      utilization: hardware.length > 0 ? (assigned / hardware.length) * 100 : 0,
      byType: this.groupUtilizationByField(hardware, assignments, 'type'),
      byLocation: this.groupUtilizationByField(
        hardware,
        assignments,
        'location'
      ),
    };
  }

  private analyzeSoftwareUtilization(software: SoftwareLicense[]) {
    const total = software.reduce((sum, s) => sum + (s.totalLicenses || 0), 0);
    const assigned = software.reduce(
      (sum, s) => sum + (s.usedLicenses || 0),
      0
    );
    const expired = software
      .filter(s => s.expiryDate && new Date(s.expiryDate) < new Date())
      .reduce((sum, s) => sum + (s.totalLicenses || 0), 0);

    return {
      total,
      assigned,
      available: total - assigned,
      expired,
      utilization: total > 0 ? (assigned / total) * 100 : 0,
      byVendor: this.groupSoftwareUtilizationByField(software, 'vendor'),
      byType: this.groupSoftwareUtilizationByField(software, 'licenseType'),
    };
  }

  // ============================================================================
  // COMPLIANCE ANALYTICS
  // ============================================================================

  /**
   * Generate compliance report with risks and recommendations
   */
  generateComplianceReport(data: AnalyticsData): ComplianceReport {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Software compliance analysis
    const underLicensed = data.software.filter(
      s => (s.usedLicenses || 0) > (s.totalLicenses || 0)
    );
    const overLicensed = data.software.filter(s => {
      const utilization = (s.usedLicenses || 0) / (s.totalLicenses || 1);
      return utilization < 0.5 && s.totalLicenses > 5; // Less than 50% utilization for licenses > 5
    });
    const expiring = data.software.filter(
      s =>
        s.expiryDate &&
        new Date(s.expiryDate) <= thirtyDaysFromNow &&
        new Date(s.expiryDate) > currentDate
    );
    const expired = data.software.filter(
      s => s.expiryDate && new Date(s.expiryDate) < currentDate
    );

    // Hardware compliance analysis
    const warrantyExpiring = data.hardware.filter(
      h =>
        h.warrantyExpiry &&
        new Date(h.warrantyExpiry) <= thirtyDaysFromNow &&
        new Date(h.warrantyExpiry) > currentDate
    );

    // Assignment compliance analysis
    const overdueReturns = data.assignments.filter(
      a =>
        a.dueDate && new Date(a.dueDate) < currentDate && a.status === '사용중'
    );

    const complianceScore = this.calculateComplianceScore({
      totalSoftware: data.software.length,
      underLicensed: underLicensed.length,
      expired: expired.length,
      overdueReturns: overdueReturns.length,
    });

    const recommendations = this.generateComplianceRecommendations({
      underLicensed,
      overLicensed,
      expiring,
      expired,
      warrantyExpiring,
      overdueReturns,
    });

    return {
      software: {
        totalLicenses: data.software.reduce(
          (sum, s) => sum + (s.totalLicenses || 0),
          0
        ),
        underLicensed,
        overLicensed,
        expiring,
        expired,
        complianceScore,
      },
      hardware: {
        warrantyExpiring,
        maintenanceOverdue: data.hardware.filter(h => h.status === '수리중'),
        complianceIssues: warrantyExpiring,
      },
      assignments: {
        overdueReturns,
        missingAssets: [],
        unauthorizedAssignments: [],
      },
      recommendations,
    };
  }

  // ============================================================================
  // CUSTOM REPORT BUILDER
  // ============================================================================

  /**
   * Generate custom report based on configuration
   */
  async generateCustomReport(
    data: AnalyticsData,
    config: CustomReportConfig
  ): Promise<ExportResult> {
    try {
      // Prepare data based on selected data types
      const reportData = this.prepareCustomReportData(data, config);

      // Apply filters
      const filteredData = this.applyReportFilters(reportData, config.filters);

      // Apply grouping and aggregations
      const aggregatedData = this.applyReportAggregations(filteredData, config);

      // Generate insights if requested
      const insights = config.includeInsights
        ? this.generateCustomReportInsights(aggregatedData, config)
        : [];

      // Create columns for export
      const columns = this.createReportColumns(aggregatedData, config);

      // Export based on format
      switch (config.format) {
        case 'excel':
          return this.exportCustomReportAsExcel(
            aggregatedData,
            columns,
            config,
            insights
          );
        case 'pdf':
          return this.exportCustomReportAsPDF(
            aggregatedData,
            columns,
            config,
            insights
          );
        default:
          throw new Error(`Unsupported format: ${config.format}`);
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Custom report generation failed',
      };
    }
  }

  // ============================================================================
  // EXPORT METHODS
  // ============================================================================

  /**
   * Export dashboard metrics
   */
  async exportDashboardReport(
    metrics: DashboardMetrics,
    format: ExportFormat = 'excel'
  ): Promise<ExportResult> {
    const reportData = this.prepareDashboardExportData(metrics);
    const columns = this.createDashboardColumns();

    if (format === 'excel') {
      const excelService = createExcelExportService();
      return excelService.exportMultipleDataTypes(
        [
          { data: reportData.summary, dataType: 'dashboard_summary' },
          { data: reportData.details, dataType: 'dashboard_details' },
        ],
        {
          filename: `dashboard_report_${new Date().toISOString().split('T')[0]}.xlsx`,
          includeMetadata: true,
        }
      );
    } else if (format === 'pdf') {
      const pdfService = createPDFExportService();
      return pdfService.exportToPDF(reportData.summary, 'dashboard_summary', {
        title: '대시보드 리포트',
        filename: `dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`,
      });
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export trend analysis report
   */
  async exportTrendAnalysisReport(
    analysis: TrendAnalysis,
    format: ExportFormat = 'excel'
  ): Promise<ExportResult> {
    const reportData = this.prepareTrendAnalysisExportData(analysis);

    if (format === 'excel') {
      const excelService = createExcelExportService();
      return excelService.exportMultipleDataTypes(
        [
          { data: reportData.trends, dataType: 'trend_data' },
          { data: reportData.insights, dataType: 'trend_insights' },
        ],
        {
          filename: `trend_analysis_${analysis.period}_${new Date().toISOString().split('T')[0]}.xlsx`,
          includeMetadata: true,
        }
      );
    } else {
      throw new Error(`Trend analysis export only supports Excel format`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private groupByField(data: any[], field: string): Record<string, number> {
    return data.reduce(
      (groups, item) => {
        const key = ExportUtils.getNestedValue(item, field) || '미지정';
        groups[key] = (groups[key] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>
    );
  }

  private calculateHardwareUtilization(
    hardware: HardwareAsset[],
    assignments: Assignment[]
  ): number {
    const activeAssignments = assignments.filter(
      a => a.status === '사용중' && a.assetType === 'hardware'
    );
    const assignedCount = new Set(activeAssignments.map(a => a.assetId)).size;
    const availableHardware = hardware.filter(h => h.status === '활성').length;

    return availableHardware > 0
      ? (assignedCount / availableHardware) * 100
      : 0;
  }

  private calculateSoftwareUtilization(software: SoftwareLicense[]): number {
    const totalLicenses = software.reduce(
      (sum, s) => sum + (s.totalLicenses || 0),
      0
    );
    const usedLicenses = software.reduce(
      (sum, s) => sum + (s.usedLicenses || 0),
      0
    );

    return totalLicenses > 0 ? (usedLicenses / totalLicenses) * 100 : 0;
  }

  private calculateTrends(
    data: any[],
    period: TrendAnalysis['period'],
    startDate: Date,
    endDate: Date,
    dateField: string
  ): TrendDataPoint[] {
    // Group data by time period
    const groupedData = this.groupDataByTimePeriod(
      data,
      period,
      startDate,
      endDate,
      dateField
    );

    // Convert to trend data points with change calculations
    const trends: TrendDataPoint[] = [];
    const sortedDates = Object.keys(groupedData).sort();

    sortedDates.forEach((date, index) => {
      const currentValue = groupedData[date];
      const previousValue = index > 0 ? groupedData[sortedDates[index - 1]] : 0;
      const change = currentValue - previousValue;
      const changePercentage =
        previousValue > 0 ? (change / previousValue) * 100 : 0;

      trends.push({
        date,
        value: currentValue,
        change,
        changePercentage,
      });
    });

    return trends;
  }

  private groupDataByTimePeriod(
    data: any[],
    period: TrendAnalysis['period'],
    startDate: Date,
    endDate: Date,
    dateField: string
  ): Record<string, number> {
    const groups: Record<string, number> = {};

    data.forEach(item => {
      const itemDate = new Date(ExportUtils.getNestedValue(item, dateField));
      if (itemDate >= startDate && itemDate <= endDate) {
        const periodKey = this.formatDateForPeriod(itemDate, period);
        groups[periodKey] = (groups[periodKey] || 0) + 1;
      }
    });

    return groups;
  }

  private formatDateForPeriod(
    date: Date,
    period: TrendAnalysis['period']
  ): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return String(date.getFullYear());
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private generateTrendInsights(
    trends: TrendAnalysis['metrics']
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Analyze assignment trends
    const recentAssignments = trends.assignments.slice(-5);
    if (recentAssignments.length >= 2) {
      const avgGrowth =
        recentAssignments
          .slice(1)
          .reduce((sum, point) => sum + (point.changePercentage || 0), 0) /
        (recentAssignments.length - 1);

      if (avgGrowth > 20) {
        insights.push({
          type: 'trend',
          title: '자산 할당 급증',
          description: `최근 할당 증가율이 평균 ${avgGrowth.toFixed(1)}%로 높습니다.`,
          severity: 'medium',
          category: 'assignments',
          action: '추가 자산 구매를 검토하세요.',
        });
      }
    }

    return insights;
  }

  private generateUtilizationInsights(
    utilization: any,
    type: 'hardware' | 'software'
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if (utilization.utilization > 90) {
      insights.push({
        type: 'alert',
        title: `높은 ${type} 사용률`,
        description: `${type} 사용률이 ${utilization.utilization.toFixed(1)}%로 매우 높습니다.`,
        severity: 'high',
        category: type,
        action: `추가 ${type} 구매를 고려하세요.`,
      });
    } else if (utilization.utilization < 30) {
      insights.push({
        type: 'recommendation',
        title: `낮은 ${type} 사용률`,
        description: `${type} 사용률이 ${utilization.utilization.toFixed(1)}%로 낮습니다.`,
        severity: 'low',
        category: type,
        action: `자산 재분배를 검토하세요.`,
      });
    }

    return insights;
  }

  private calculateComplianceScore(metrics: {
    totalSoftware: number;
    underLicensed: number;
    expired: number;
    overdueReturns: number;
  }): number {
    const totalIssues =
      metrics.underLicensed + metrics.expired + metrics.overdueReturns;
    const maxPossibleIssues = metrics.totalSoftware + 100; // Estimated max issues

    return Math.max(0, 100 - (totalIssues / maxPossibleIssues) * 100);
  }

  private generateComplianceRecommendations(data: any): AnalyticsInsight[] {
    const recommendations: AnalyticsInsight[] = [];

    if (data.underLicensed.length > 0) {
      recommendations.push({
        type: 'alert',
        title: '라이선스 부족',
        description: `${data.underLicensed.length}개 소프트웨어의 라이선스가 부족합니다.`,
        severity: 'critical',
        category: 'software',
        action: '즉시 추가 라이선스를 구매하세요.',
      });
    }

    if (data.expired.length > 0) {
      recommendations.push({
        type: 'alert',
        title: '만료된 라이선스',
        description: `${data.expired.length}개 소프트웨어 라이선스가 만료되었습니다.`,
        severity: 'high',
        category: 'software',
        action: '라이선스를 갱신하거나 소프트웨어 사용을 중단하세요.',
      });
    }

    return recommendations;
  }

  private prepareCustomReportData(
    data: AnalyticsData,
    config: CustomReportConfig
  ): any[] {
    let combinedData: any[] = [];

    config.dataTypes.forEach(dataType => {
      const typeData = (data as any)[dataType] || [];
      const enrichedData = typeData.map((item: any) => ({
        ...item,
        _dataType: dataType,
      }));
      combinedData = combinedData.concat(enrichedData);
    });

    return combinedData;
  }

  private applyReportFilters(data: any[], filters: ReportFilter[]): any[] {
    return data.filter(item => {
      return filters.every(filter => {
        const value = ExportUtils.getNestedValue(item, filter.field);
        return this.evaluateFilterCondition(value, filter);
      });
    });
  }

  private evaluateFilterCondition(value: any, filter: ReportFilter): boolean {
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return String(value)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase());
      case 'greaterThan':
        return Number(value) > Number(filter.value);
      case 'lessThan':
        return Number(value) < Number(filter.value);
      case 'between':
        return (
          Number(value) >= Number(filter.value[0]) &&
          Number(value) <= Number(filter.value[1])
        );
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      default:
        return true;
    }
  }

  private applyReportAggregations(
    data: any[],
    config: CustomReportConfig
  ): any[] {
    if (config.groupBy.length === 0) return data;

    // Group data by specified fields
    const grouped = data.reduce(
      (groups, item) => {
        const groupKey = config.groupBy
          .map(field => ExportUtils.getNestedValue(item, field) || '미지정')
          .join('|');

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);

        return groups;
      },
      {} as Record<string, any[]>
    );

    // Apply aggregations
    return Object.entries(grouped).map(([groupKey, groupData]) => {
      const groupValues = groupKey.split('|');
      const aggregatedItem: any = {};

      // Add group by fields
      config.groupBy.forEach((field, index) => {
        aggregatedItem[field] = groupValues[index];
      });

      // Apply aggregations
      config.aggregations.forEach(agg => {
        const fieldValues = groupData.map(item =>
          ExportUtils.getNestedValue(item, agg.field)
        );
        const alias = agg.alias || `${agg.operation}_${agg.field}`;

        switch (agg.operation) {
          case 'count':
            aggregatedItem[alias] = groupData.length;
            break;
          case 'sum':
            aggregatedItem[alias] = fieldValues.reduce(
              (sum, val) => sum + (Number(val) || 0),
              0
            );
            break;
          case 'avg':
            const numValues = fieldValues.filter(val => !isNaN(Number(val)));
            aggregatedItem[alias] =
              numValues.length > 0
                ? numValues.reduce((sum, val) => sum + Number(val), 0) /
                  numValues.length
                : 0;
            break;
          case 'min':
            aggregatedItem[alias] = Math.min(
              ...fieldValues.map(val => Number(val) || 0)
            );
            break;
          case 'max':
            aggregatedItem[alias] = Math.max(
              ...fieldValues.map(val => Number(val) || 0)
            );
            break;
          case 'distinct':
            aggregatedItem[alias] = [...new Set(fieldValues)].length;
            break;
        }
      });

      return aggregatedItem;
    });
  }

  private generateCustomReportInsights(
    data: any[],
    config: CustomReportConfig
  ): AnalyticsInsight[] {
    // Generate basic insights based on data patterns
    const insights: AnalyticsInsight[] = [];

    // Add more sophisticated insight generation logic here
    insights.push({
      type: 'recommendation',
      title: '커스텀 리포트 생성됨',
      description: `${data.length}개의 데이터 포인트가 포함된 리포트가 생성되었습니다.`,
      severity: 'low',
      category: 'general',
    });

    return insights;
  }

  private createReportColumns(
    data: any[],
    config: CustomReportConfig
  ): ExportColumn[] {
    if (data.length === 0) return [];

    const sampleItem = data[0];
    return Object.keys(sampleItem).map(key => ({
      key,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()),
      type: this.inferColumnType(sampleItem[key]),
    }));
  }

  private inferColumnType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))
      return 'date';
    return 'string';
  }

  private async exportCustomReportAsExcel(
    data: any[],
    columns: ExportColumn[],
    config: CustomReportConfig,
    insights: AnalyticsInsight[]
  ): Promise<ExportResult> {
    const excelService = createExcelExportService();

    const datasets = [{ data, dataType: 'custom_report' }];

    if (insights.length > 0) {
      datasets.push({ data: insights, dataType: 'insights' });
    }

    return excelService.exportMultipleDataTypes(datasets, {
      filename: `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
      includeMetadata: true,
    });
  }

  private async exportCustomReportAsPDF(
    data: any[],
    columns: ExportColumn[],
    config: CustomReportConfig,
    insights: AnalyticsInsight[]
  ): Promise<ExportResult> {
    const pdfService = createPDFExportService();

    return pdfService.exportToPDF(data, 'custom_report', {
      title: config.title,
      subtitle: config.description,
      filename: `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  }

  private prepareDashboardExportData(metrics: DashboardMetrics): any {
    return {
      summary: [
        { metric: '총 직원 수', value: metrics.totalEmployees },
        { metric: '총 하드웨어', value: metrics.totalHardware },
        { metric: '총 소프트웨어', value: metrics.totalSoftware },
        { metric: '총 할당', value: metrics.totalAssignments },
        { metric: '활성 할당', value: metrics.activeAssignments },
        { metric: '만료 예정 소프트웨어', value: metrics.expiringSoftware },
      ],
      details: [
        ...Object.entries(metrics.hardwareByStatus).map(([status, count]) => ({
          category: '하드웨어 상태',
          item: status,
          count,
        })),
        ...Object.entries(metrics.softwareByVendor).map(([vendor, count]) => ({
          category: '소프트웨어 제조사',
          item: vendor,
          count,
        })),
      ],
    };
  }

  private prepareTrendAnalysisExportData(analysis: TrendAnalysis): any {
    const trends = Object.entries(analysis.metrics).flatMap(
      ([category, dataPoints]) =>
        dataPoints.map(point => ({
          category,
          date: point.date,
          value: point.value,
          change: point.change || 0,
          changePercentage: point.changePercentage || 0,
        }))
    );

    return {
      trends,
      insights: analysis.insights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        category: insight.category,
        action: insight.action || '',
      })),
    };
  }

  private createDashboardColumns(): ExportColumn[] {
    return [
      { key: 'metric', label: '지표', type: 'string' },
      { key: 'value', label: '값', type: 'number' },
    ];
  }

  private groupUtilizationByField(
    hardware: HardwareAsset[],
    assignments: Assignment[],
    field: string
  ): Record<string, UtilizationData> {
    const groups = this.groupByField(hardware, field);
    const activeAssignments = assignments.filter(
      a => a.status === '사용중' && a.assetType === 'hardware'
    );
    const assignedHardwareIds = new Set(activeAssignments.map(a => a.assetId));

    const result: Record<string, UtilizationData> = {};

    Object.entries(groups).forEach(([key, total]) => {
      const groupHardware = hardware.filter(
        h => ExportUtils.getNestedValue(h, field) === key
      );
      const used = groupHardware.filter(h =>
        assignedHardwareIds.has(h.id)
      ).length;
      const available = total - used;

      result[key] = {
        total,
        used,
        available,
        utilization: total > 0 ? (used / total) * 100 : 0,
      };
    });

    return result;
  }

  private groupSoftwareUtilizationByField(
    software: SoftwareLicense[],
    field: string
  ): Record<string, UtilizationData> {
    const groups: Record<string, SoftwareLicense[]> = {};

    software.forEach(s => {
      const key = ExportUtils.getNestedValue(s, field) || '미지정';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const result: Record<string, UtilizationData> = {};

    Object.entries(groups).forEach(([key, groupSoftware]) => {
      const total = groupSoftware.reduce(
        (sum, s) => sum + (s.totalLicenses || 0),
        0
      );
      const used = groupSoftware.reduce(
        (sum, s) => sum + (s.usedLicenses || 0),
        0
      );
      const available = total - used;

      result[key] = {
        total,
        used,
        available,
        utilization: total > 0 ? (used / total) * 100 : 0,
      };
    });

    return result;
  }
}

// ============================================================================
// FACTORY AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Create analytics service instance
 */
export function createAnalyticsService(): AnalyticsService {
  return new AnalyticsService();
}

/**
 * Quick dashboard metrics generation
 */
export function generateQuickDashboardMetrics(
  data: AnalyticsData
): DashboardMetrics {
  const service = createAnalyticsService();
  return service.generateDashboardMetrics(data);
}

/**
 * Quick trend analysis generation
 */
export function generateQuickTrendAnalysis(
  data: AnalyticsData,
  period: TrendAnalysis['period'] = 'monthly',
  days: number = 90
): TrendAnalysis {
  const service = createAnalyticsService();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  return service.generateTrendAnalysis(data, period, startDate, endDate);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AnalyticsService;
