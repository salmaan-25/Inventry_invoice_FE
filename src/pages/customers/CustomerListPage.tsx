import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { FilterBar } from '../../components/data-display/FilterBar';
import { SearchField } from '../../components/common/SearchField';
import { StatusChip } from '../../components/common/StatusChip';
import { useGetCustomersQuery } from '../../store/api/customersApi';
import { usePaginationParams } from '../../hooks/usePaginationParams';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';
import type { Customer } from '../../types/api/customer';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, pageSize, search, setPage, setPageSize, setSearch } = usePaginationParams();
  const [activeFilter, setActiveFilter] = useState<string>('');

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      search: search || undefined,
      is_active: activeFilter === '' ? undefined : activeFilter === 'true',
    };
  }, [page, pageSize, search, activeFilter]);

  const { data, isLoading, error } = useGetCustomersQuery(queryParams);

  const columns: readonly Column<Customer>[] = [
    {
      id: 'code',
      label: 'Code',
      minWidth: 100,
      render: (row) => (
        <Typography
          component={RouterLink}
          to={ROUTES.customers.detail(row.id)}
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
      label: 'Customer Name',
      minWidth: 180,
      render: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.name}
        </Typography>
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'gstin',
      label: 'GSTIN',
      minWidth: 150,
      render: (row) => row.gstin || '-',
    },
    {
      id: 'state',
      label: 'State',
      minWidth: 120,
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
      minWidth: 130,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Invoices">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`${ROUTES.customers.detail(row.id)}?tab=invoices`)}
            >
              <ReceiptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Profile & Ledger">
            <IconButton
              size="small"
              onClick={() => navigate(ROUTES.customers.detail(row.id))}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Profile">
            <IconButton
              size="small"
              onClick={() => navigate(ROUTES.customers.edit(row.id))}
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
        title="Customers"
        subtitle="Customer profiles, billing records, and ledger statements."
        action={
          <Button
            component={RouterLink}
            to={ROUTES.customers.new}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            New Customer
          </Button>
        }
      />

      <FilterBar>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code or phone..."
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="customer-status-filter-label">Status</InputLabel>
          <Select
            labelId="customer-status-filter-label"
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
      </FilterBar>

      <DataTable<Customer>
        columns={columns}
        rows={data?.results}
        count={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error ? parseApiError(error).detail : undefined}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No customers found"
        emptyMessage="Try adjusting your search criteria or register a new customer profile."
      />
    </Box>
  );
};

export default CustomerListPage;
