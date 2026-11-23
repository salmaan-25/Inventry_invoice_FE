import React, { type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Skeleton,
  Box,
  Typography,
} from '@mui/material';
import { EmptyState } from '../common/EmptyState';
import { PAGE_SIZE_OPTIONS } from '../../constants/pagination';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: readonly Column<T>[];
  rows?: readonly T[];
  count?: number;
  page: number; // 1-based index from URL/state
  pageSize: number;
  isLoading?: boolean;
  error?: ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  getRowId?: (row: T) => string | number;
}

export function DataTable<T extends object>({
  columns,
  rows = [],
  count = 0,
  page,
  pageSize,
  isLoading = false,
  error,
  emptyTitle,
  emptyMessage,
  onPageChange,
  onPageSizeChange,
  getRowId,
}: DataTableProps<T>): React.ReactElement {
  const handleChangePage = (_: unknown, newPageIndex: number) => {
    onPageChange(newPageIndex + 1); // convert 0-based to 1-based
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align ?? 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align ?? 'left'}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const rowRecord = row as Record<string, unknown>;
                const rowKey = getRowId ? getRowId(row) : (rowRecord['id'] as string | number | undefined) ?? index;
                return (
                  <TableRow hover key={String(rowKey)}>
                    {columns.map((column) => {
                      const value = rowRecord[column.id];
                      return (
                        <TableCell key={column.id} align={column.align ?? 'left'}>
                          {column.render ? column.render(row) : (value as ReactNode ?? '-')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
        component="div"
        count={count}
        rowsPerPage={pageSize}
        page={Math.max(0, page - 1)} // convert 1-based to 0-based
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
