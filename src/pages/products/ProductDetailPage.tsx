import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TuneIcon from '@mui/icons-material/Tune';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { SectionCard } from '../../components/common/SectionCard';
import { KeyValueList } from '../../components/data-display/KeyValueList';
import { StatusChip } from '../../components/common/StatusChip';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { StockBadge } from '../../components/products/StockBadge';
import { StockInDialog } from '../../components/products/StockInDialog';
import { AdjustStockDialog } from '../../components/products/AdjustStockDialog';
import { DataTable, type Column } from '../../components/data-display/DataTable';

import { useGetProductQuery } from '../../store/api/productsApi';
import { useGetStockMovementsQuery } from '../../store/api/stockApi';
import { parseApiError } from '../../utils/apiError';
import { ITEM_TYPE, ITEM_TYPE_LABEL, MOVEMENT_TYPE_LABEL, MOVEMENT_TYPE_COLOR } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import type { StockMovement } from '../../types/api/product';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stockInOpen, setStockInOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useGetProductQuery(id as string);

  const {
    data: movementsData,
    isLoading: isMovementsLoading,
  } = useGetStockMovementsQuery(
    { product: id },
    { skip: !id || product?.item_type === ITEM_TYPE.SERVICE }
  );

  if (isProductLoading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (productError) {
    return <ApiErrorAlert error={parseApiError(productError)} />;
  }

  if (!product) {
    return null;
  }

  const isGoods = product.item_type !== ITEM_TYPE.SERVICE;

  const movementColumns: readonly Column<StockMovement>[] = [
    {
      id: 'created_at',
      label: 'Date & Time',
      minWidth: 160,
      render: (row) => <DateText value={row.created_at} includeTime />,
    },
    {
      id: 'movement_type',
      label: 'Type',
      minWidth: 120,
      render: (row) => (
        <StatusChip
          label={MOVEMENT_TYPE_LABEL[row.movement_type] ?? row.movement_type}
          color={MOVEMENT_TYPE_COLOR[row.movement_type] ?? 'default'}
        />
      ),
    },
    {
      id: 'quantity_change',
      label: 'Change',
      align: 'right',
      minWidth: 110,
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
      render: (row) => `${row.balance_after} ${product.unit_name}`,
    },
    {
      id: 'reason',
      label: 'Reason / Ref',
      minWidth: 180,
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
        title={`${product.name} (${product.code})`}
        subtitle="Item catalog specification, tax rate, and physical stock inventory."
        breadcrumbs={[
          { label: 'Products & Inventory', path: ROUTES.products.list },
          { label: product.name },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {isGoods && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => setStockInOpen(true)}
                >
                  Stock In
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<TuneIcon />}
                  onClick={() => setAdjustOpen(true)}
                >
                  Adjust Stock
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(ROUTES.products.edit(product.id))}
            >
              Edit Details
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Product Specifications">
            <KeyValueList
              items={[
                { label: 'Item Code', value: product.code },
                { label: 'Item Name', value: product.name },
                {
                  label: 'Item Type',
                  value: (
                    <StatusChip
                      label={ITEM_TYPE_LABEL[product.item_type] ?? product.item_type}
                    />
                  ),
                },
                { label: 'Unit', value: product.unit_name },
                { label: 'HSN / SAC', value: product.hsn_sac },
                { label: 'GST Rate', value: `${product.gst_rate}%` },
                {
                  label: 'Selling Price (Rate)',
                  value: <MoneyText amount={product.selling_price} fontWeight={600} />,
                },
                { label: 'Description', value: product.description || '-' },
                {
                  label: 'Catalog Status',
                  value: (
                    <StatusChip
                      label={product.is_active ? 'Active' : 'Inactive'}
                      color={product.is_active ? 'success' : 'default'}
                    />
                  ),
                },
              ]}
            />
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="Inventory & Stock Status">
            <KeyValueList
              items={[
                {
                  label: 'Current Physical Stock',
                  value: (
                    <StockBadge
                      itemType={product.item_type}
                      currentStock={product.current_stock}
                      isLowStock={product.is_low_stock}
                      unitName={product.unit_name}
                    />
                  ),
                },
                {
                  label: 'Reorder Alert Threshold',
                  value: isGoods ? `${product.reorder_level ?? '0.000'} ${product.unit_name}` : 'N/A (Service)',
                },
                {
                  label: 'Stock Health Alert',
                  value: isGoods ? (
                    product.is_low_stock ? (
                      <Typography variant="body2" color="warning.main" fontWeight={600}>
                        Low stock warning
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        Adequate inventory
                      </Typography>
                    )
                  ) : (
                    'N/A (Service)'
                  ),
                },
              ]}
            />
          </SectionCard>
        </Grid>
      </Grid>

      {isGoods && (
        <SectionCard title="Stock Movement Ledger (Audit History)">
          <DataTable<StockMovement>
            columns={movementColumns}
            rows={movementsData?.results}
            count={movementsData?.count ?? 0}
            page={1}
            pageSize={50}
            isLoading={isMovementsLoading}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
            emptyTitle="No stock movements recorded"
            emptyMessage="Stock movements will appear when physical stock is received or dispatched."
          />
        </SectionCard>
      )}

      <StockInDialog
        open={stockInOpen}
        product={product}
        onClose={() => setStockInOpen(false)}
      />

      <AdjustStockDialog
        open={adjustOpen}
        product={product}
        onClose={() => setAdjustOpen(false)}
      />
    </Box>
  );
};

export default ProductDetailPage;
