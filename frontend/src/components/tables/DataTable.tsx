import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TablePagination,
  TableSortLabel,
  Skeleton,
} from '@mui/material';
import { ReactNode, useState } from 'react';

export interface Column<T = any> {
  key: keyof T;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => ReactNode;
  headerRender?: () => ReactNode;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  actions?: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  dense?: boolean;
}

export function DataTable<T = any>({
  data,
  columns,
  title,
  actions,
  loading = false,
  emptyMessage = 'No data available',
  pagination = true,
  pageSize = 10,
  sortable = true,
  stickyHeader = false,
  maxHeight,
  onRowClick,
  rowKey,
  dense = false
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [orderBy, setOrderBy] = useState<keyof T | ''>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = sortable && orderBy
    ? [...data].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order === 'asc' ? comparison : -comparison;
      })
    : data;

  const paginatedData = pagination 
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    if (rowKey && row[rowKey] != null) {
      return String(row[rowKey]);
    }
    return index;
  };

  return (
    <Box>
      {(title || actions) && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}
        >
          {title && (
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {actions && <Box>{actions}</Box>}
        </Box>
      )}
      
      <TableContainer 
        component={Paper}
        sx={{ maxHeight, ...(maxHeight && { overflow: 'auto' }) }}
      >
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key as string}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.key ? order : false}
                  sx={{ 
                    width: column.width,
                    minWidth: column.width,
                    fontWeight: 600,
                    backgroundColor: 'grey.50'
                  }}
                >
                  {column.headerRender ? (
                    column.headerRender()
                  ) : sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={() => handleRequestSort(column.key)}
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
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key as string}>
                      <Skeleton variant="text" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const actualIndex = pagination ? page * rowsPerPage + index : index;
                return (
                  <TableRow 
                    key={getRowKey(row, actualIndex)} 
                    hover
                    onClick={onRowClick ? () => onRowClick(row, actualIndex) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: onRowClick ? 'action.hover' : 'inherit'
                      }
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key as string}
                        align={column.align || 'left'}
                      >
                        {column.render
                          ? column.render(row[column.key], row, actualIndex)
                          : String(row[column.key] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {pagination && sortedData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count !== -1 ? count : `more than ${to}`}`}
          />
        )}
      </TableContainer>
    </Box>
  );
}