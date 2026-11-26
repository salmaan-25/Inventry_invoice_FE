import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { FilterBar } from '../../components/data-display/FilterBar';
import { SearchField } from '../../components/common/SearchField';
import { StatusChip } from '../../components/common/StatusChip';
import { MoneyText } from '../../components/common/MoneyText';
import { StockBadge } from '../../components/products/StockBadge';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import { parseApiError } from '../../utils/apiError';
import { ITEM_TYPE, ITEM_TYPE_LABEL, type ItemType } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import type { Product } from '../../types/api/product';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, pageSize, search, setPage, setPageSize, setSearch } = usePaginationParams();

  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | ''>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      item_type: itemTypeFilter || undefined,
      is_active: activeFilter === '' ? undefined : activeFilter === 'true',
      low_stock: lowStockFilter ? true : undefined,
    };
  }, [page, pageSize, search, itemTypeFilter, activeFilter, lowStockFilter]);

  const { data, isLoading, error } = useGetProductsQuery(queryParams);

  const columns: readonly Column<Product>[] = [
    {
      id: 'code',
      label: 'Code',
      minWidth: 100,
      render: (row) => (
        <Typography
          component={RouterLink}
          to={ROUTES.products.detail(row.id)}
          variant="body2"
          fontWeight={600}
          color="primary.main"
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Product Name',
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'item_type',
      label: 'Type',
      minWidth: 120,
      render: (row) => (
        <StatusChip
          label={ITEM_TYPE_LABEL[row.item_type] ?? row.item_type}
          color={row.item_type === ITEM_TYPE.SERVICE ? 'info' : 'default'}
        />
      ),
    },
    {
      id: 'selling_price',
      label: 'Rate (₹)',
      align: 'right',
      minWidth: 120,
      render: (row) => (
        <Box sx={{ textAlign: 'right' }}>
          <MoneyText amount={row.selling_price} fontWeight={600} />
          <Typography variant="caption" color="text.secondary" display="block">
            GST: {row.gst_rate}%
          </Typography>
        </Box>
      ),
    },
    {
      id: 'current_stock',
      label: 'Current Stock',
      minWidth: 150,
      render: (row) => (
        <StockBadge
          itemType={row.item_type}
          currentStock={row.current_stock}
          isLowStock={row.is_low_stock}
          unitName={row.unit_name}
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      render: (row) => (
        <StatusChip
          label={row.is_active ? 'Active' : 'Inactive'}
          color={row.is_active ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Details & Ledger">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(ROUTES.products.detail(row.id))}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Product">
            <IconButton
              size="small"
              onClick={() => navigate(ROUTES.products.edit(row.id))}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Products & Inventory"
        subtitle="Catalog goods, service items, live stock levels, and pricing."
        action={
          <Button
            component={RouterLink}
            to={ROUTES.products.new}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            New Product
          </Button>
        }
      />

      <FilterBar>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by name or code..."
        />

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <InputLabel id="product-type-filter-label">Item Type</InputLabel>
          <Select
            labelId="product-type-filter-label"
            label="Item Type"
            value={itemTypeFilter}
            onChange={(e) => {
              setItemTypeFilter(e.target.value as ItemType | '');
              setPage(1);
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value={ITEM_TYPE.GOODS}>Goods</MenuItem>
            <MenuItem value={ITEM_TYPE.GOODS_HARDWARE}>Hardware Goods</MenuItem>
            <MenuItem value={ITEM_TYPE.SERVICE}>Service</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: '100%', sm: 130 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <InputLabel id="product-status-filter-label">Status</InputLabel>
          <Select
            labelId="product-status-filter-label"
            label="Status"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={lowStockFilter}
              onChange={(e) => {
                setLowStockFilter(e.target.checked);
                setPage(1);
              }}
              color="warning"
            />
          }
          label="Low Stock Only"
        />
      </FilterBar>

      <DataTable<Product>
        columns={columns}
        rows={data?.results}
        count={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error ? parseApiError(error).detail : undefined}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No products found"
        emptyMessage="Try adjusting your search filters or create a new catalog item."
      />
    </Box>
  );
};

export default ProductListPage;
