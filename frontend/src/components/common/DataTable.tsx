/**
 * Common DataTable Component
 *
 * Reusable data table component with sorting, filtering, and pagination
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Box,
  Typography,
  TablePagination,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  format?: (value: any, row?: any) => React.ReactNode;
  type?:
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'chip'
    | 'avatar'
    | 'actions';
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: boolean;
  pageSize?: number;
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  emptyMessage?: string;
  rowKey?: string;
  stickyHeader?: boolean;
  maxHeight?: number;
  className?: string;
}

type Order = 'asc' | 'desc';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  pagination = true,
  pageSize = 25,
  totalCount,
  page = 0,
  onPageChange,
  onPageSizeChange,
  emptyMessage = 'No data available',
  rowKey = 'id',
  stickyHeader = false,
  maxHeight,
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [localPage, setLocalPage] = useState(page);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [localOrder, setLocalOrder] = useState<Order>(sortDirection);
  const [localOrderBy, setLocalOrderBy] = useState<string>(sortColumn || '');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isSelected = (id: string) => selectedRows.includes(id);
  const numSelected = selectedRows.length;
  const rowCount = data.length;

  // Local sorting if no external sort handler
  const sortedData = useMemo(() => {
    if (onSort || !localOrderBy) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = a[localOrderBy];
      const bVal = b[localOrderBy];

      if (aVal < bVal) {
        return localOrder === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return localOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, localOrder, localOrderBy, onSort]);

  // Local pagination if no external pagination
  const paginatedData = useMemo(() => {
    if (onPageChange) {
      return sortedData;
    }

    const start = localPage * localPageSize;
    return sortedData.slice(start, start + localPageSize);
  }, [sortedData, localPage, localPageSize, onPageChange]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRequestSort = (property: string) => {
    const isAsc = localOrderBy === property && localOrder === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    if (onSort) {
      onSort(property, newOrder);
    } else {
      setLocalOrder(newOrder);
      setLocalOrderBy(property);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;

    if (event.target.checked) {
      const newSelectedIds = data.map(row => row[rowKey]);
      onSelectionChange(newSelectedIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleRowSelect = (id: string) => {
    if (!onSelectionChange) return;

    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    onSelectionChange(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);

    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setLocalPageSize(newPageSize);
      setLocalPage(0);
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderCellContent = (column: Column, value: any, row: any) => {
    if (column.format) {
      return column.format(value, row);
    }

    switch (column.type) {
      case 'chip':
        return (
          <Chip
            label={value || 'N/A'}
            size='small'
            variant='outlined'
            color={getChipColor(value)}
          />
        );

      case 'avatar':
        return (
          <Avatar sx={{ width: 32, height: 32 }}>
            {value ? value.charAt(0).toUpperCase() : '?'}
          </Avatar>
        );

      case 'boolean':
        return (
          <Chip
            label={value ? 'Yes' : 'No'}
            size='small'
            color={value ? 'success' : 'default'}
          />
        );

      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'N/A';

      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;

      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onView && (
              <Tooltip title='View'>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation();
                    onView(row);
                  }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title='Edit'>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title='Delete'>
                <IconButton
                  size='small'
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(row);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );

      default:
        return value ?? 'N/A';
    }
  };

  const getChipColor = (
    value: any
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    if (typeof value !== 'string') return 'default';

    const lowercaseValue = value.toLowerCase();

    if (['active', 'available', 'online', 'success'].includes(lowercaseValue)) {
      return 'success';
    }
    if (
      ['inactive', 'unavailable', 'offline', 'error', 'failed'].includes(
        lowercaseValue
      )
    ) {
      return 'error';
    }
    if (['pending', 'processing', 'warning'].includes(lowercaseValue)) {
      return 'warning';
    }
    if (['info', 'information'].includes(lowercaseValue)) {
      return 'info';
    }

    return 'default';
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding='checkbox'>
            <Checkbox
              color='primary'
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={handleSelectAllClick}
            />
          </TableCell>
        )}
        {columns.map(column => (
          <TableCell
            key={column.id}
            align={column.align || 'left'}
            style={{ minWidth: column.minWidth, width: column.width }}
            sortDirection={localOrderBy === column.id ? localOrder : false}
          >
            {column.sortable !== false ? (
              <TableSortLabel
                active={localOrderBy === column.id}
                direction={localOrderBy === column.id ? localOrder : 'asc'}
                onClick={() => handleRequestSort(column.id)}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderTableBody = () => (
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell
            colSpan={columns.length + (selectable ? 1 : 0)}
            align='center'
          >
            <Typography variant='body2' color='text.secondary'>
              Loading...
            </Typography>
          </TableCell>
        </TableRow>
      ) : paginatedData.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={columns.length + (selectable ? 1 : 0)}
            align='center'
          >
            <Typography variant='body2' color='text.secondary'>
              {emptyMessage}
            </Typography>
          </TableCell>
        </TableRow>
      ) : (
        paginatedData.map((row, index) => {
          const rowId = row[rowKey] || index;
          const isItemSelected = isSelected(rowId);

          return (
            <TableRow
              hover
              key={rowId}
              selected={isItemSelected}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick
                  ? { backgroundColor: 'action.hover' }
                  : {},
              }}
            >
              {selectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    color='primary'
                    checked={isItemSelected}
                    onChange={() => handleRowSelect(rowId)}
                    onClick={e => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell key={column.id} align={column.align || 'left'}>
                  {renderCellContent(column, row[column.id], row)}
                </TableCell>
              ))}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Paper className={className} variant='outlined'>
      <TableContainer sx={{ maxHeight: maxHeight }}>
        <Table stickyHeader={stickyHeader} size='small'>
          {renderTableHeader()}
          {renderTableBody()}
        </Table>
      </TableContainer>

      {pagination && !loading && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          count={totalCount || data.length}
          rowsPerPage={onPageSizeChange ? pageSize : localPageSize}
          page={onPageChange ? page : localPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DataTable;
