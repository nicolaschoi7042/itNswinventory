// Dashboard Components
export { StatCard, CounterStatCard, PercentageStatCard, StatusStatCard, StatCardGrid } from './StatCard';
export type { StatCardProps } from './StatCard';

export { RecentActivities, ActivityTimeline, useActivities } from './RecentActivities';
export type { Activity, RecentActivitiesProps, ActivityTimelineProps } from './RecentActivities';

export { LicenseStatus, LicenseSummary, useLicenseStatus } from './LicenseStatus';
export type { SoftwareLicense, LicenseStatusProps, LicenseSummaryProps } from './LicenseStatus';

export { AssetChart, AssetSummary, AssetDashboard, useAssetChart } from './AssetChart';
export type { AssetData, AssetChartProps, AssetSummaryProps, AssetDashboardProps } from './AssetChart';

// Common dashboard utilities and configurations
export const dashboardConfig = {
  // Default colors for charts and visualizations
  colors: {
    primary: '#2196f3',
    secondary: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#00bcd4',
    success: '#4caf50',
  },

  // Chart configurations
  chart: {
    defaultHeight: 300,
    compactHeight: 200,
    colors: {
      default: ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548', '#607d8b'],
      category: {
        hardware: '#2196f3',
        software: '#4caf50',
        employee: '#ff9800',
        assignment: '#9c27b0',
      },
      status: {
        active: '#4caf50',
        inactive: '#9e9e9e',
        maintenance: '#ff9800',
        retired: '#f44336',
      },
    },
  },

  // Activity configurations
  activity: {
    maxItems: 10,
    refreshInterval: 30000, // 30 seconds
    groupByDate: true,
  },

  // License configurations
  license: {
    alertThreshold: 0.8, // 80% usage warning
    expiryWarningDays: 30,
    maxDisplayItems: 15,
  },

  // Statistics card configurations
  statCard: {
    sizes: {
      small: { padding: 2, iconSize: 24, titleVariant: 'body2' as const, valueVariant: 'h6' as const },
      medium: { padding: 3, iconSize: 32, titleVariant: 'body1' as const, valueVariant: 'h4' as const },
      large: { padding: 4, iconSize: 40, titleVariant: 'h6' as const, valueVariant: 'h3' as const },
    },
  },
};

// Common dashboard types
export interface DashboardStats {
  totalEmployees: number;
  totalHardware: number;
  totalSoftware: number;
  activeAssignments: number;
  hardwareUtilization: number;
  softwareUtilization: number;
  recentActivities: number;
  criticalLicenses: number;
}

export interface DashboardData {
  stats: DashboardStats;
  activities: Activity[];
  licenses: SoftwareLicense[];
  assetDistribution: {
    hardware: AssetData[];
    software: AssetData[];
    employees: AssetData[];
    assignments: AssetData[];
  };
  trends: {
    period: string;
    employeeGrowth: number;
    hardwareGrowth: number;
    softwareGrowth: number;
    assignmentGrowth: number;
  };
}

// Dashboard layout configurations
export const dashboardLayouts = {
  // Default 3-column layout
  default: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 3,
    responsive: {
      '@media (max-width: 1200px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
      },
    },
  },

  // Compact 4-column layout
  compact: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
    responsive: {
      '@media (max-width: 1200px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      '@media (max-width: 900px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr',
      },
    },
  },

  // Full-width layout
  fullWidth: {
    gridTemplateColumns: '1fr',
    gap: 3,
  },
};

// Utility functions for dashboard data processing
export const dashboardUtils = {
  // Calculate percentage with fallback
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  // Format numbers with locale
  formatNumber: (value: number, options?: Intl.NumberFormatOptions): string => {
    return value.toLocaleString('ko-KR', options);
  },

  // Format currency
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  },

  // Calculate trend direction
  getTrend: (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'stable' } => {
    if (previous === 0) return { value: 0, direction: 'stable' };
    
    const change = ((current - previous) / previous) * 100;
    
    return {
      value: Math.abs(Math.round(change)),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
    };
  },

  // Group data by category
  groupByCategory: <T extends { category: string }>(data: T[]): Record<string, T[]> => {
    return data.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Sort data by multiple criteria
  sortData: <T>(
    data: T[], 
    sortBy: keyof T, 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): T[] => {
    return [...data].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  },

  // Filter data by date range
  filterByDateRange: <T extends { timestamp: string }>(
    data: T[],
    startDate?: Date,
    endDate?: Date
  ): T[] => {
    if (!startDate && !endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      return true;
    });
  },

  // Generate color palette
  generateColorPalette: (count: number, baseColors: string[] = dashboardConfig.chart.colors.default): string[] => {
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    const colors = [...baseColors];
    const baseColorCount = baseColors.length;

    for (let i = baseColorCount; i < count; i++) {
      const baseColor = baseColors[i % baseColorCount];
      const variation = Math.floor((i - baseColorCount) / baseColorCount) * 20 + 20;
      
      // Create color variations by adjusting lightness
      colors.push(adjustColorLightness(baseColor, variation));
    }

    return colors;
  },
};

// Helper function to adjust color lightness
function adjustColorLightness(color: string, amount: number): string {
  // Simple implementation for hex colors
  if (color.startsWith('#')) {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}

// Common dashboard hooks
export const useDashboardRefresh = (
  refreshFunctions: (() => Promise<void>)[],
  interval: number = 300000 // 5 minutes
) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(refreshFunctions.map(fn => fn()));
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh setup
  useEffect(() => {
    if (interval > 0) {
      const intervalId = setInterval(refreshAll, interval);
      return () => clearInterval(intervalId);
    }
  }, [interval]);

  return { isRefreshing, refreshAll };
};

// Import React hooks
import { useState, useEffect } from 'react';