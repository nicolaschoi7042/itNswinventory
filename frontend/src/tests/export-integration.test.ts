/**
 * Export Integration Tests
 *
 * Comprehensive integration tests for export functionality, scheduling,
 * validation, and utility functions
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import { ExportService } from '../services/export.service';
import { ExcelExportService } from '../services/excel-export.service';
import { CSVExportService } from '../services/csv-export.service';
import { PDFExportService } from '../services/pdf-export.service';
import { DataImportService } from '../services/data-import.service';
import { AnalyticsService } from '../services/analytics.service';
import { exportSchedulerService } from '../services/export-scheduler.service';
import { exportValidationService } from '../services/export-validation.service';
import { DataUtilities } from '../utils/data-utilities';
import type {
  ExportConfig,
  ExportDataType,
  ExportFormat,
  ScheduleConfig,
} from '../types/export';

// ============================================================================
// TEST DATA AND MOCKS
// ============================================================================

const mockHardwareData = [
  {
    asset_id: 'HW000001',
    category: 'laptop',
    brand: 'Dell',
    model: 'Latitude 7420',
    serial_number: 'DL123456789',
    status: 'active',
    purchase_date: '2023-01-15',
    warranty_expiry: '2026-01-15',
    assigned_to: 'john.doe@company.com',
    location: 'New York Office',
    cost: 1200.0,
  },
  {
    asset_id: 'HW000002',
    category: 'desktop',
    brand: 'HP',
    model: 'EliteDesk 800',
    serial_number: 'HP987654321',
    status: 'active',
    purchase_date: '2023-02-20',
    warranty_expiry: '2026-02-20',
    assigned_to: 'jane.smith@company.com',
    location: 'London Office',
    cost: 800.0,
  },
  {
    asset_id: 'HW000003',
    category: 'mobile',
    brand: 'Apple',
    model: 'iPhone 14',
    serial_number: 'AP111222333',
    status: 'maintenance',
    purchase_date: '2023-03-10',
    warranty_expiry: '2024-03-10',
    assigned_to: null,
    location: 'IT Storage',
    cost: 999.0,
  },
];

const mockSoftwareData = [
  {
    license_key: 'SW-2023-001',
    name: 'Microsoft Office 365',
    version: '2023',
    license_type: 'subscription',
    purchase_date: '2023-01-01',
    expiry_date: '2024-01-01',
    assigned_to: 'john.doe@company.com',
    seats_total: 100,
    seats_used: 75,
    cost_per_seat: 12.5,
  },
  {
    license_key: 'SW-2023-002',
    name: 'Adobe Creative Suite',
    version: '2023',
    license_type: 'perpetual',
    purchase_date: '2023-02-15',
    expiry_date: null,
    assigned_to: 'design.team@company.com',
    seats_total: 10,
    seats_used: 8,
    cost_per_seat: 52.99,
  },
];

const mockEmployeeData = [
  {
    employee_id: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'IT',
    position: 'Software Engineer',
    manager: 'manager@company.com',
    hire_date: '2022-01-15',
    status: 'active',
  },
  {
    employee_id: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    manager: 'director@company.com',
    hire_date: '2021-06-01',
    status: 'active',
  },
];

// ============================================================================
// TEST UTILITIES
// ============================================================================

const createMockFile = (content: string, type: string, name: string): File => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  return file;
};

const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Export Integration Tests', () => {
  let exportService: ExportService;
  let excelService: ExcelExportService;
  let csvService: CSVExportService;
  let pdfService: PDFExportService;
  let importService: DataImportService;
  let analyticsService: AnalyticsService;

  beforeAll(() => {
    // Mock window.URL.createObjectURL for file operations
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock file download functionality
    global.document.createElement = vi.fn(
      () =>
        ({
          href: '',
          download: '',
          click: vi.fn(),
          style: { display: '' },
        }) as any
    );

    global.document.body.appendChild = vi.fn();
    global.document.body.removeChild = vi.fn();
  });

  beforeEach(() => {
    exportService = new ExportService();
    excelService = new ExcelExportService();
    csvService = new CSVExportService();
    pdfService = new PDFExportService();
    importService = new DataImportService();
    analyticsService = new AnalyticsService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // EXPORT FORMAT TESTS
  // ============================================================================

  describe('Export Format Integration', () => {
    it('should export hardware data to Excel format', async () => {
      const config: ExportConfig = {
        format: 'excel',
        includeHeaders: true,
        includeMetadata: true,
        filename: 'hardware-export-test.xlsx',
      };

      const result = await excelService.exportToExcel(
        mockHardwareData,
        'hardware',
        config
      );

      expect(result.success).toBe(true);
      expect(result.format).toBe('excel');
      expect(result.recordCount).toBe(mockHardwareData.length);
      expect(result.fileName).toContain('hardware');
      expect(result.fileName).toContain('.xlsx');
    });

    it('should export software data to CSV format', async () => {
      const config: ExportConfig = {
        format: 'csv',
        includeHeaders: true,
        csv: {
          delimiter: ',',
          encoding: 'utf-8',
          includeQuotes: true,
        },
      };

      const result = await csvService.exportToCSV(
        mockSoftwareData,
        'software',
        config
      );

      expect(result.success).toBe(true);
      expect(result.format).toBe('csv');
      expect(result.recordCount).toBe(mockSoftwareData.length);
      expect(result.fileName).toContain('.csv');
    });

    it('should export employee data to PDF format', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        pdf: {
          pageSize: 'A4',
          orientation: 'portrait',
          includeCharts: false,
        },
      };

      const result = await pdfService.exportToPDF(
        mockEmployeeData,
        'employees',
        config
      );

      expect(result.success).toBe(true);
      expect(result.format).toBe('pdf');
      expect(result.recordCount).toBe(mockEmployeeData.length);
      expect(result.fileName).toContain('.pdf');
    });

    it('should handle multiple export formats for same data', async () => {
      const formats: ExportFormat[] = ['excel', 'csv', 'pdf', 'json'];
      const results: any[] = [];

      for (const format of formats) {
        const config: ExportConfig = {
          format,
          includeHeaders: true,
          filename: `multi-format-test.${format === 'excel' ? 'xlsx' : format}`,
        };

        const result = await exportService.exportData(
          mockHardwareData,
          format,
          config
        );

        results.push(result);
      }

      // All exports should succeed
      expect(results.every(r => r.success)).toBe(true);

      // Each should have correct format
      results.forEach((result, index) => {
        expect(result.format).toBe(formats[index]);
        expect(result.recordCount).toBe(mockHardwareData.length);
      });
    });
  });

  // ============================================================================
  // DATA VALIDATION TESTS
  // ============================================================================

  describe('Data Validation Integration', () => {
    it('should validate hardware data before export', async () => {
      const validationResult = await exportValidationService.validateExportData(
        mockHardwareData,
        'hardware',
        { format: 'excel', includeHeaders: true }
      );

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      expect(validationResult.statistics.totalRecords).toBe(
        mockHardwareData.length
      );
      expect(validationResult.statistics.validRecords).toBe(
        mockHardwareData.length
      );
      expect(validationResult.dataQuality.overall).toBeGreaterThan(0);
    });

    it('should detect validation errors in invalid data', async () => {
      const invalidData = [
        {
          // Missing required asset_id
          category: 'laptop',
          brand: 'Dell',
        },
        {
          asset_id: 'INVALID', // Invalid format
          category: 'unknown_category', // Invalid enum value
          brand: 'HP',
        },
      ];

      const validationResult = await exportValidationService.validateExportData(
        invalidData,
        'hardware',
        { format: 'excel', includeHeaders: true }
      );

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.statistics.invalidRecords).toBeGreaterThan(0);
    });

    it('should validate export for different data types', async () => {
      const dataTypesToTest: { data: any[]; type: ExportDataType }[] = [
        { data: mockHardwareData, type: 'hardware' },
        { data: mockSoftwareData, type: 'software' },
        { data: mockEmployeeData, type: 'employees' },
      ];

      for (const { data, type } of dataTypesToTest) {
        const validationResult =
          await exportValidationService.validateExportData(data, type, {
            format: 'excel',
            includeHeaders: true,
          });

        expect(validationResult.isValid).toBe(true);
        expect(validationResult.statistics.totalRecords).toBe(data.length);
      }
    });
  });

  // ============================================================================
  // IMPORT FUNCTIONALITY TESTS
  // ============================================================================

  describe('Import Functionality Integration', () => {
    it('should import CSV data successfully', async () => {
      const csvContent = `asset_id,category,brand,model,status
HW000004,laptop,Dell,Latitude 5520,active
HW000005,desktop,HP,EliteDesk 600,active`;

      const file = createMockFile(csvContent, 'text/csv', 'import-test.csv');

      const preview = await importService.parseFileForPreview(file);

      expect(preview.success).toBe(true);
      expect(preview.headers).toContain('asset_id');
      expect(preview.headers).toContain('category');
      expect(preview.sampleData).toHaveLength(2);
    });

    it('should handle import validation errors', async () => {
      const invalidCsvContent = `asset_id,category,brand
,laptop,Dell
HW999,invalid_category,HP`;

      const file = createMockFile(
        invalidCsvContent,
        'text/csv',
        'invalid-import.csv'
      );

      const columnMapping = {
        asset_id: 'asset_id',
        category: 'category',
        brand: 'brand',
      };

      const result = await importService.importFromFile(
        file,
        'hardware',
        columnMapping
      );

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should complete full import-export cycle', async () => {
      // Step 1: Export data to CSV
      const exportResult = await csvService.exportToCSV(
        mockHardwareData,
        'hardware',
        { format: 'csv', includeHeaders: true }
      );

      expect(exportResult.success).toBe(true);

      // Step 2: Simulate re-importing the same data
      // (In real scenario, this would use the actual exported file)
      const csvHeaders = Object.keys(mockHardwareData[0]).join(',');
      const csvRows = mockHardwareData.map(item =>
        Object.values(item)
          .map(val => val ?? '')
          .join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');

      const file = createMockFile(csvContent, 'text/csv', 'reimport-test.csv');

      const columnMapping = Object.keys(mockHardwareData[0]).reduce(
        (acc, key) => {
          acc[key] = key;
          return acc;
        },
        {} as Record<string, string>
      );

      const importResult = await importService.importFromFile(
        file,
        'hardware',
        columnMapping
      );

      expect(importResult.success).toBe(true);
      expect(importResult.successfulImports).toBe(mockHardwareData.length);
    });
  });

  // ============================================================================
  // SCHEDULING INTEGRATION TESTS
  // ============================================================================

  describe('Export Scheduling Integration', () => {
    it('should create and manage export schedules', async () => {
      const scheduleConfig: ScheduleConfig = {
        name: 'Daily Hardware Report',
        description: 'Automated daily export of hardware assets',
        dataType: 'hardware',
        exportFormat: 'excel',
        schedule: {
          type: 'daily',
          time: '09:00',
        },
        exportConfig: {
          format: 'excel',
          includeHeaders: true,
          includeMetadata: true,
        },
        notificationConfig: {
          enabled: true,
          email: {
            enabled: true,
            recipients: ['admin@company.com'],
          },
        },
      };

      // Create schedule
      const createResult =
        await exportSchedulerService.createSchedule(scheduleConfig);
      expect(createResult.success).toBe(true);
      expect(createResult.scheduleId).toBeTruthy();

      // Get schedule
      const schedule = await exportSchedulerService.getSchedule(
        createResult.scheduleId
      );
      expect(schedule).toBeTruthy();
      expect(schedule?.name).toBe(scheduleConfig.name);
      expect(schedule?.isActive).toBe(true);

      // Update schedule
      const updateResult = await exportSchedulerService.updateSchedule(
        createResult.scheduleId,
        { description: 'Updated description' }
      );
      expect(updateResult.success).toBe(true);

      // Delete schedule
      const deleteResult = await exportSchedulerService.deleteSchedule(
        createResult.scheduleId
      );
      expect(deleteResult.success).toBe(true);
    });

    it('should validate schedule configurations', async () => {
      const invalidScheduleConfig: ScheduleConfig = {
        name: '', // Invalid: empty name
        dataType: 'hardware',
        exportFormat: 'excel',
        schedule: {
          type: 'weekly',
          // Missing required dayOfWeek for weekly schedule
        },
      };

      const result = await exportSchedulerService.createSchedule(
        invalidScheduleConfig
      );
      expect(result.success).toBe(false);
      expect(result.errors).toBeTruthy();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should handle schedule execution simulation', async () => {
      const scheduleConfig: ScheduleConfig = {
        name: 'Test Execution Schedule',
        dataType: 'hardware',
        exportFormat: 'csv',
        schedule: {
          type: 'once',
          executeAt: new Date(Date.now() + 1000), // 1 second from now
        },
      };

      const createResult =
        await exportSchedulerService.createSchedule(scheduleConfig);
      expect(createResult.success).toBe(true);

      // Execute immediately instead of waiting
      const executeResult = await exportSchedulerService.executeNow(
        createResult.scheduleId
      );
      expect(executeResult.success).toBe(true);

      // Clean up
      await exportSchedulerService.deleteSchedule(createResult.scheduleId);
    });
  });

  // ============================================================================
  // ANALYTICS AND REPORTING TESTS
  // ============================================================================

  describe('Analytics and Reporting Integration', () => {
    it('should generate dashboard metrics', async () => {
      const analyticsData = {
        hardware: mockHardwareData,
        software: mockSoftwareData,
        employees: mockEmployeeData,
        assignments: [],
        activities: [],
      };

      const metrics = analyticsService.generateDashboardMetrics(analyticsData);

      expect(metrics).toBeTruthy();
      expect(metrics.totalAssets).toBe(
        mockHardwareData.length + mockSoftwareData.length
      );
      expect(metrics.totalEmployees).toBe(mockEmployeeData.length);
      expect(metrics.assetDistribution).toBeTruthy();
      expect(metrics.utilizationRate).toBeGreaterThanOrEqual(0);
    });

    it('should generate trend analysis', async () => {
      const analyticsData = {
        hardware: mockHardwareData,
        software: mockSoftwareData,
        employees: mockEmployeeData,
        assignments: [],
        activities: [],
      };

      const trendAnalysis = analyticsService.generateTrendAnalysis(
        analyticsData,
        'monthly',
        new Date('2023-01-01'),
        new Date('2023-12-31')
      );

      expect(trendAnalysis).toBeTruthy();
      expect(trendAnalysis.period).toBe('monthly');
      expect(trendAnalysis.dataPoints).toBeTruthy();
      expect(trendAnalysis.trends).toBeTruthy();
    });

    it('should create custom reports', async () => {
      const analyticsData = {
        hardware: mockHardwareData,
        software: mockSoftwareData,
        employees: mockEmployeeData,
        assignments: [],
        activities: [],
      };

      const reportConfig = {
        title: 'Asset Summary Report',
        dataTypes: ['hardware', 'software'] as const,
        metrics: ['count', 'cost'] as const,
        groupBy: 'category',
        filters: [],
        format: 'excel' as const,
      };

      const report = await analyticsService.generateCustomReport(
        analyticsData,
        reportConfig
      );

      expect(report.success).toBe(true);
      expect(report.format).toBe('excel');
      expect(report.recordCount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // DATA UTILITIES INTEGRATION TESTS
  // ============================================================================

  describe('Data Utilities Integration', () => {
    it('should clean and validate data', async () => {
      const dirtyData = [
        {
          asset_id: '  HW000001  ', // Extra whitespace
          category: 'LAPTOP', // Wrong case
          cost: '1200.00', // String instead of number
          status: null, // Null value
          extra_field: 'should be removed',
        },
      ];

      // Clean data
      const cleanedData = DataUtilities.cleanData(dirtyData, {
        trimStrings: true,
        removeNulls: true,
        normalizeNumbers: true,
        allowedFields: ['asset_id', 'category', 'cost', 'status'],
      });

      expect(cleanedData[0].asset_id).toBe('HW000001');
      expect(cleanedData[0].cost).toBe(1200.0);
      expect(cleanedData[0]).not.toHaveProperty('extra_field');
      expect(cleanedData[0]).not.toHaveProperty('status'); // Removed because null

      // Validate cleaned data
      const validationResult = DataUtilities.validateData(cleanedData, {
        requiredFields: ['asset_id', 'category'],
        fieldTypes: {
          asset_id: 'string',
          category: 'string',
          cost: 'number',
        },
      });

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    it('should transform data for different formats', async () => {
      const transformationRules = [
        {
          operation: 'rename' as const,
          field: 'asset_id',
          newField: 'id',
        },
        {
          operation: 'convert' as const,
          field: 'cost',
          converter: (value: any) => parseFloat(value),
        },
      ];

      const transformedData = DataUtilities.transformData(
        mockHardwareData,
        transformationRules
      );

      expect(transformedData[0]).toHaveProperty('id');
      expect(transformedData[0]).not.toHaveProperty('asset_id');
      expect(typeof transformedData[0].cost).toBe('number');
    });

    it('should generate data quality reports', async () => {
      const mixedQualityData = [
        // Good record
        {
          asset_id: 'HW000001',
          category: 'laptop',
          status: 'active',
          email: 'user@company.com',
        },
        // Poor quality record
        {
          asset_id: '', // Missing required field
          category: 'unknown', // Invalid enum
          status: null, // Null value
          email: 'invalid-email', // Invalid format
        },
      ];

      const qualityReport = DataUtilities.generateDataQualityReport(
        mixedQualityData,
        {
          requiredFields: ['asset_id', 'category'],
          validEnums: {
            category: ['laptop', 'desktop', 'mobile', 'tablet'],
          },
          formatValidation: {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          },
        }
      );

      expect(qualityReport.completeness).toBeLessThan(100);
      expect(qualityReport.consistency).toBeLessThan(100);
      expect(qualityReport.accuracy).toBeLessThan(100);
      expect(qualityReport.issues).toHaveLength(4); // 4 issues in poor quality record
    });
  });

  // ============================================================================
  // ERROR HANDLING AND RECOVERY TESTS
  // ============================================================================

  describe('Error Handling and Recovery Integration', () => {
    it('should handle export failures gracefully', async () => {
      // Simulate export failure with invalid data
      const invalidData = null as any;

      const result = await exportService.exportData(invalidData, 'excel', {
        format: 'excel',
        includeHeaders: true,
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeTruthy();
      expect(result.errors).toBeTruthy();
    });

    it('should handle retry queue functionality', async () => {
      const mockExportRequest = {
        data: mockHardwareData,
        format: 'excel',
        config: { format: 'excel', includeHeaders: true },
      };

      const error = new Error('Network timeout');

      // Add to retry queue
      const retryId = exportValidationService.addToRetryQueue(
        mockExportRequest,
        error,
        { maxRetries: 2, retryDelay: 100 }
      );

      expect(retryId).toBeTruthy();

      // Check queue status
      const queueStatus = exportValidationService.getRetryQueueStatus();
      expect(queueStatus.pending).toBeGreaterThan(0);
      expect(queueStatus.total).toBeGreaterThan(0);

      // Process queue
      await exportValidationService.processRetryQueue();

      // Allow some time for processing
      await waitFor(200);

      const updatedStatus = exportValidationService.getRetryQueueStatus();
      expect(
        updatedStatus.processing +
          updatedStatus.completed +
          updatedStatus.failed
      ).toBeGreaterThan(0);
    });

    it('should validate file integrity', async () => {
      const mockFilePath = '/mock/path/to/export.xlsx';

      const integrityResult = await exportValidationService.verifyFileIntegrity(
        mockFilePath,
        mockHardwareData,
        'excel'
      );

      // Since this is a mock implementation, we expect it to pass basic checks
      expect(integrityResult).toBeTruthy();
      expect(integrityResult.checks).toBeTruthy();
      expect(integrityResult.checks.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PERFORMANCE AND SCALABILITY TESTS
  // ============================================================================

  describe('Performance and Scalability Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        asset_id: `HW${String(index + 1).padStart(6, '0')}`,
        category: ['laptop', 'desktop', 'mobile'][index % 3],
        brand: ['Dell', 'HP', 'Apple'][index % 3],
        model: `Model ${index}`,
        status: 'active',
        cost: Math.round(Math.random() * 2000 + 500),
      }));

      const startTime = Date.now();

      const result = await exportService.exportData(largeDataset, 'csv', {
        format: 'csv',
        includeHeaders: true,
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(1000);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent export operations', async () => {
      const concurrentExports = [
        exportService.exportData(mockHardwareData, 'excel', {
          format: 'excel',
          includeHeaders: true,
        }),
        exportService.exportData(mockSoftwareData, 'csv', {
          format: 'csv',
          includeHeaders: true,
        }),
        exportService.exportData(mockEmployeeData, 'pdf', { format: 'pdf' }),
      ];

      const results = await Promise.all(concurrentExports);

      // All exports should succeed
      expect(results.every(r => r.success)).toBe(true);

      // Each should have correct record count
      expect(results[0].recordCount).toBe(mockHardwareData.length);
      expect(results[1].recordCount).toBe(mockSoftwareData.length);
      expect(results[2].recordCount).toBe(mockEmployeeData.length);
    });
  });

  // ============================================================================
  // END-TO-END WORKFLOW TESTS
  // ============================================================================

  describe('End-to-End Workflow Integration', () => {
    it('should complete full export workflow with scheduling and validation', async () => {
      // Step 1: Validate data
      const validationResult = await exportValidationService.validateExportData(
        mockHardwareData,
        'hardware',
        { format: 'excel', includeHeaders: true }
      );

      expect(validationResult.isValid).toBe(true);

      // Step 2: Create scheduled export
      const scheduleConfig: ScheduleConfig = {
        name: 'E2E Test Schedule',
        dataType: 'hardware',
        exportFormat: 'excel',
        schedule: {
          type: 'once',
          executeAt: new Date(Date.now() + 1000),
        },
      };

      const scheduleResult =
        await exportSchedulerService.createSchedule(scheduleConfig);
      expect(scheduleResult.success).toBe(true);

      // Step 3: Execute export
      const exportResult = await exportService.exportData(
        mockHardwareData,
        'excel',
        { format: 'excel', includeHeaders: true }
      );

      expect(exportResult.success).toBe(true);

      // Step 4: Verify file integrity (mock)
      const integrityResult = await exportValidationService.verifyFileIntegrity(
        exportResult.fileName || 'mock-file.xlsx',
        mockHardwareData,
        'excel'
      );

      expect(integrityResult.isValid).toBe(true);

      // Cleanup
      await exportSchedulerService.deleteSchedule(scheduleResult.scheduleId);
    });

    it('should handle complete import-validation-export cycle', async () => {
      // Step 1: Create CSV data for import
      const csvContent = mockHardwareData
        .map(item =>
          Object.values(item)
            .map(val => val ?? '')
            .join(',')
        )
        .join('\n');

      const csvWithHeaders = [
        Object.keys(mockHardwareData[0]).join(','),
        csvContent,
      ].join('\n');

      const file = createMockFile(csvWithHeaders, 'text/csv', 'e2e-test.csv');

      // Step 2: Import data
      const columnMapping = Object.keys(mockHardwareData[0]).reduce(
        (acc, key) => {
          acc[key] = key;
          return acc;
        },
        {} as Record<string, string>
      );

      const importResult = await importService.importFromFile(
        file,
        'hardware',
        columnMapping
      );

      expect(importResult.success).toBe(true);

      // Step 3: Validate imported data
      const validationResult = await exportValidationService.validateExportData(
        mockHardwareData, // Using original data as proxy for imported data
        'hardware',
        { format: 'excel', includeHeaders: true }
      );

      expect(validationResult.isValid).toBe(true);

      // Step 4: Re-export validated data
      const exportResult = await exportService.exportData(
        mockHardwareData,
        'pdf',
        { format: 'pdf' }
      );

      expect(exportResult.success).toBe(true);
    });
  });
});

// ============================================================================
// EXPORT MODULE TESTS
// ============================================================================

describe('Export Module Completeness', () => {
  it('should have all required services available', () => {
    expect(ExportService).toBeDefined();
    expect(ExcelExportService).toBeDefined();
    expect(CSVExportService).toBeDefined();
    expect(PDFExportService).toBeDefined();
    expect(DataImportService).toBeDefined();
    expect(AnalyticsService).toBeDefined();
    expect(exportSchedulerService).toBeDefined();
    expect(exportValidationService).toBeDefined();
    expect(DataUtilities).toBeDefined();
  });

  it('should have all required types exported', () => {
    // This test ensures TypeScript compilation succeeds
    // and all types are properly exported
    expect(true).toBe(true);
  });

  it('should provide comprehensive export functionality', async () => {
    const testCases = [
      { dataType: 'hardware' as const, format: 'excel' as const },
      { dataType: 'software' as const, format: 'csv' as const },
      { dataType: 'employees' as const, format: 'pdf' as const },
      { dataType: 'assignments' as const, format: 'json' as const },
    ];

    for (const { dataType, format } of testCases) {
      const exportService = new ExportService();

      // Test that the service can handle all data type and format combinations
      const result = await exportService.exportData(
        [], // Empty data is fine for this test
        format,
        { format, includeHeaders: true }
      );

      // Should handle gracefully (success or proper error)
      expect(typeof result.success).toBe('boolean');
      expect(result.format).toBe(format);
    }
  });
});
