import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { FilterBar } from '../../components/data-display/FilterBar';
import { StatusChip } from '../../components/common/StatusChip';
import { DateText } from '../../components/common/DateText';
import { FormDatePicker } from '../../components/form/FormDatePicker';
import { useForm, FormProvider } from 'react-hook-form';

import { useGetStockMovementsQuery } from '../../store/api/stockApi';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import { useDateRangeFilter } from '../../hooks/useDateRangeFilter';
import { parseApiError } from '../../utils/apiError';
import { MOVEMENT_TYPE_LABEL, MOVEMENT_TYPE_COLOR } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import type { StockMovement } from '../../types/api/product';

export const StockMovementsPage: React.FC = () => {
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const { from, to, setRange, error: dateError } = useDateRangeFilter();
  const [productFilter] = useState<string>('');

  const dateMethods = useForm({
    defaultValues: {
      from: '',
      to: '',
    },
  });

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      product: productFilter || undefined,
      from: from || undefined,
      to: to || undefined,
    };
  }, [page, pageSize, productFilter, from, to]);

  const { data, isLoading, error } = useGetStockMovementsQuery(queryParams);

  const columns: readonly Column<StockMovement>[] = [
    {
      id: 'created_at',
      label: 'Date & Time',
      minWidth: 160,
      render: (row) => <DateText value={row.created_at} includeTime />,
    },
    {
      id: 'product',
      label: 'Product',
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography
            component={RouterLink}
            to={ROUTES.products.detail(row.product)}
            variant="body2"
            fontWeight={600}
            color="primary.main"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {row.product_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Code: {row.product_code}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'movement_type',
      label: 'Movement Type',
      minWidth: 140,
      render: (row) => (
        <StatusChip
          label={MOVEMENT_TYPE_LABEL[row.movement_type] ?? row.movement_type}
          color={MOVEMENT_TYPE_COLOR[row.movement_type] ?? 'default'}
        />
      ),
    },
    {
      id: 'quantity_change',
      label: 'Quantity Change',
      align: 'right',
      minWidth: 130,
      render: (row) => {
        const isPositive = !row.quantity_change.startsWith('-');
        return (
          <Typography
            variant="body2"
            fontWeight={600}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {isPositive ? `+${row.quantity_change}` : row.quantity_change}
          </Typography>
        );
      },
    },
    {
      id: 'balance_after',
      label: 'Balance After',
      align: 'right',
      minWidth: 120,
      render: (row) => row.balance_after,
    },
    {
      id: 'reason',
      label: 'Reason / Document',
      minWidth: 200,
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.reason}</Typography>
          {row.invoice && (
            <Typography
              component={RouterLink}
              to={ROUTES.invoices.detail(row.invoice)}
              variant="caption"
              color="primary.main"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Invoice #{row.invoice}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'created_by_name',
      label: 'Logged By',
      minWidth: 120,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Stock Movements"
        subtitle="Complete audit ledger of inventory additions, deductions, and adjustments."
      />

      <FormProvider {...dateMethods}>
        <Box
          component="form"
          onChange={dateMethods.handleSubmit((vals) =>
            setRange(vals.from || undefined, vals.to || undefined)
          )}
        >
          <FilterBar>
            <Box sx={{ width: { xs: '100%', sm: 180 } }}>
              <FormDatePicker name="from" label="From Date" />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 180 } }}>
              <FormDatePicker name="to" label="To Date" />
            </Box>
            {dateError && (
              <Typography variant="caption" color="error" sx={{ alignSelf: 'center' }}>
                {dateError}
              </Typography>
            )}
          </FilterBar>
        </Box>
      </FormProvider>

      <DataTable<StockMovement>
        columns={columns}
        rows={data?.results}
        count={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error ? parseApiError(error).detail : undefined}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No stock movements found"
        emptyMessage="Try adjusting your date range filter."
      />
    </Box>
  );
};

export default StockMovementsPage;
