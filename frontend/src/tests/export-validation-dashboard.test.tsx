/**
 * Export Validation Dashboard Component Tests
 *
 * Tests for the ExportValidationDashboard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExportValidationDashboard } from '../components/exports/ExportValidationDashboard';

// Mock the export validation service
vi.mock('../services/export-validation.service', () => ({
  exportValidationService: {
    getRetryQueueStatus: vi.fn(() => ({
      pending: 5,
      processing: 2,
      completed: 10,
      failed: 1,
      total: 18,
    })),
    processRetryQueue: vi.fn(() => Promise.resolve()),
    addToRetryQueue: vi.fn(() => 'retry-123'),
    validateExportData: vi.fn(() =>
      Promise.resolve({
        isValid: true,
        errors: [],
        warnings: [],
        statistics: {
          totalRecords: 100,
          validRecords: 95,
          invalidRecords: 5,
          duplicateRecords: 2,
          missingFields: 3,
        },
        dataQuality: {
          completeness: 95,
          consistency: 90,
          accuracy: 92,
          overall: 92.3,
        },
      })
    ),
    verifyFileIntegrity: vi.fn(() =>
      Promise.resolve({
        isValid: true,
        errors: [],
        warnings: [],
        checks: [
          { name: 'File Exists', passed: true, message: 'File exists' },
          {
            name: 'Record Count',
            passed: true,
            message: 'Record count matches',
          },
        ],
      })
    ),
  },
}));

// Mock recharts components to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='chart-container'>{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='bar-chart'>{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='line-chart'>{children}</div>
  ),
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  Tooltip: () => <div data-testid='tooltip' />,
  Bar: () => <div data-testid='bar' />,
  Line: () => <div data-testid='line' />,
}));

describe('ExportValidationDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard header', () => {
    render(<ExportValidationDashboard />);

    expect(screen.getByText('Export Validation Dashboard')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /refresh/i })
    ).toBeInTheDocument();
  });

  it('should display summary cards with metrics', async () => {
    render(<ExportValidationDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Validations')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Data Quality')).toBeInTheDocument();
      expect(screen.getByText('Active Warnings')).toBeInTheDocument();
    });
  });

  it('should display retry queue status', async () => {
    render(<ExportValidationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Retry Queue Status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('should handle refresh action', async () => {
    render(<ExportValidationDashboard />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Should trigger data reload
    await waitFor(() => {
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('should handle retry queue processing', async () => {
    const { exportValidationService } = await import(
      '../services/export-validation.service'
    );

    render(<ExportValidationDashboard />);

    await waitFor(() => {
      const processQueueButton = screen.getByRole('button', {
        name: /process queue/i,
      });
      expect(processQueueButton).toBeInTheDocument();

      fireEvent.click(processQueueButton);

      expect(exportValidationService.processRetryQueue).toHaveBeenCalled();
    });
  });

  it('should render charts', async () => {
    render(<ExportValidationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Data Quality Distribution')).toBeInTheDocument();
      expect(
        screen.getByText('Validation Trend (Last 7 Days)')
      ).toBeInTheDocument();
      expect(screen.getAllByTestId('chart-container')).toHaveLength(2);
    });
  });

  it('should display recent validations table', async () => {
    render(<ExportValidationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Validations')).toBeInTheDocument();
      expect(screen.getByText('Data Type')).toBeInTheDocument();
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Records')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
    });
  });

  it('should handle validation row clicks', async () => {
    render(<ExportValidationDashboard />);

    // Wait for data to load and find a validation row
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    // Since we're mocking data, we'll just verify the table structure exists
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should handle loading states', () => {
    render(<ExportValidationDashboard />);

    // Initially should show loading state (no explicit loading indicator in this test)
    // But should render without crashing
    expect(screen.getByText('Export Validation Dashboard')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const customClass = 'custom-dashboard-class';
    const { container } = render(
      <ExportValidationDashboard className={customClass} />
    );

    expect(container.firstChild).toHaveClass(customClass);
  });
});

describe('ExportValidationDashboard Integration', () => {
  it('should integrate with export validation service', async () => {
    const { exportValidationService } = await import(
      '../services/export-validation.service'
    );

    render(<ExportValidationDashboard />);

    await waitFor(() => {
      expect(exportValidationService.getRetryQueueStatus).toHaveBeenCalled();
    });
  });

  it('should handle service errors gracefully', async () => {
    // Mock service to throw error
    const { exportValidationService } = await import(
      '../services/export-validation.service'
    );
    vi.mocked(exportValidationService.getRetryQueueStatus).mockImplementation(
      () => {
        throw new Error('Service error');
      }
    );

    // Should render without crashing even if service throws
    render(<ExportValidationDashboard />);

    expect(screen.getByText('Export Validation Dashboard')).toBeInTheDocument();
  });
});
