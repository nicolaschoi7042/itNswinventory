// Table components exports
export { DataTable } from './DataTable';
export { SearchFilter, createFilterOptions } from './SearchFilter';
export {
  TableActions,
  commonTableActions,
  commonRowActions,
  useUserRole,
  checkRole,
} from './TableActions';

// Type exports
export type { Column } from './DataTable';
export type { UserRole } from './TableActions';

// Import Column type for use in interfaces below
import type { Column } from './DataTable';

// Re-export commonly used interfaces for convenience
export interface TableData {
  id: string | number;
  [key: string]: any;
}

export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export interface TableConfig<T = any> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  dense?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
}

// Utility functions for table management
export const tableUtils = {
  /**
   * Create columns configuration from object keys
   */
  createColumnsFromKeys<T extends Record<string, any>>(
    sample: T,
    config?: Partial<Record<keyof T, Partial<Column<T>>>>
  ): Column<T>[] {
    return Object.keys(sample).map(key => ({
      key: key as keyof T,
      label:
        config?.[key as keyof T]?.label ||
        key.charAt(0).toUpperCase() + key.slice(1),
      sortable: config?.[key as keyof T]?.sortable !== false,
      align: config?.[key as keyof T]?.align || 'left',
      width: config?.[key as keyof T]?.width,
      render: config?.[key as keyof T]?.render,
      headerRender: config?.[key as keyof T]?.headerRender,
    }));
  },

  /**
   * Filter data based on search term
   */
  filterData<T extends Record<string, any>>(
    data: T[],
    searchTerm: string,
    searchKeys?: (keyof T)[]
  ): T[] {
    if (!searchTerm || data.length === 0) return data;

    const keys = searchKeys || (Object.keys(data[0]) as (keyof T)[]);
    const lowercaseSearch = searchTerm.toLowerCase();

    return data.filter(item =>
      keys.some(key => {
        const value = item[key];
        return (
          value != null && String(value).toLowerCase().includes(lowercaseSearch)
        );
      })
    );
  },

  /**
   * Sort data by column
   */
  sortData<T>(data: T[], orderBy: keyof T, order: 'asc' | 'desc'): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return order === 'asc' ? comparison : -comparison;
    });
  },

  /**
   * Get unique values for filter options
   */
  getUniqueValues<T>(data: T[], key: keyof T): string[] {
    const values = Array.from(
      new Set(
        data
          .map(item => item[key])
          .filter(value => value != null && value !== '')
          .map(value => String(value))
      )
    );
    return values.sort();
  },

  /**
   * Paginate data
   */
  paginateData<T>(data: T[], page: number, rowsPerPage: number): T[] {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  },

  /**
   * Format data for export (e.g., Excel)
   */
  formatForExport<T extends Record<string, any>>(
    data: T[],
    columns: Column<T>[],
    includeHeaders: boolean = true
  ): string[][] {
    const headers = includeHeaders ? [columns.map(col => col.label)] : [];

    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key as keyof T];
        return value != null ? String(value) : '';
      })
    );

    return [...headers, ...rows];
  },
};
