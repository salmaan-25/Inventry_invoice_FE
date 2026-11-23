import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/data-display/FilterBar';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { StatCard } from '../../components/data-display/StatCard';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { SearchField } from '../../components/common/SearchField';
import { IncomeFormDialog } from '../../components/income/IncomeFormDialog';
import {
  useGetOtherIncomesQuery,
  useGetIncomeCategoriesQuery,
  useCreateOtherIncomeMutation,
  useUpdateOtherIncomeMutation,
  useLazyGetIncomeExportBlobQuery,
} from '../../store/api/incomeApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError, resolveApiError } from '../../utils/apiError';
import { saveBlob } from '../../utils/download';
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '../../constants/enums';
import { MESSAGES } from '../../constants/messages';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import type { OtherIncome, CreateOtherIncomeRequest } from '../../types/api/income';

export const OtherIncomeListPage: React.FC = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<OtherIncome | null>(null);

  const { data: categories = [] } = useGetIncomeCategoriesQuery();
  const { data, isLoading, error } = useGetOtherIncomesQuery({
    page,
    page_size: pageSize,
    search: search || undefined,
    category: categoryId || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const [createIncome, { isLoading: isCreating }] = useCreateOtherIncomeMutation();
  const [updateIncome, { isLoading: isUpdating }] = useUpdateOtherIncomeMutation();
  const [triggerExport, { isFetching: isExporting }] = useLazyGetIncomeExportBlobQuery();

  const handleClearFilters = () => {
    setSearch('');
    setCategoryId('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasFilters = Boolean(search || categoryId || fromDate || toDate);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (income: OtherIncome) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (formData: CreateOtherIncomeRequest) => {
    if (editingIncome) {
      await updateIncome({ id: editingIncome.id, ...formData }).unwrap();
      notifySuccess(MESSAGES.general.saveSuccess);
    } else {
      await createIncome(formData).unwrap();
      notifySuccess(MESSAGES.general.saveSuccess);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await triggerExport({
        from: fromDate || undefined,
        to: toDate || undefined,
      }).unwrap();
      saveBlob(blob, `other_income_${fromDate || 'start'}_to_${toDate || 'today'}.xlsx`);
      notifySuccess(MESSAGES.general.exportSuccess);
    } catch (err: unknown) {
      const parsed = await resolveApiError(err);
      notifyError(parsed.detail);
    }
  };

  const columns: Column<OtherIncome>[] = [
    {
      id: 'date',
      label: 'Date',
      minWidth: 110,
      render: (row) => <DateText value={row.date} />,
    },
    {
      id: 'category_name',
      label: 'Category',
      minWidth: 140,
      render: (row) => (
        <Chip size="small" label={row.category_name} variant="outlined" />
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
    },
    {
      id: 'received_from',
      label: 'Received From',
      minWidth: 160,
    },
    {
      id: 'payment_method',
      label: 'Payment Method',
      minWidth: 140,
      render: (row) => (
        <Chip
          size="small"
          label={PAYMENT_METHOD_LABEL[row.payment_method as PaymentMethod] ?? row.payment_method}
        />
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      minWidth: 120,
      render: (row) => (
        <MoneyText amount={row.amount} fontWeight={700} color="success.main" />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 80,
      render: (row) => {
        const isAutoSynced = Boolean(row.reference);
        return (
          <Tooltip title={isAutoSynced ? 'Auto-recorded from Invoice / Payment' : 'Edit Income'}>
            <span>
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(row)}
                disabled={isAutoSynced}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Other Income"
        subtitle="Miscellaneous earnings, scrap sales, asset liquidations, and interest income."
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => void handleExport()}
              disabled={isExporting}
            >
              Export (.xlsx)
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
            >
              Add Other Income
            </Button>
          </Box>
        }
      />

      {/* Server Filtered Total Summary Card */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Filtered Income"
            value={`₹ ${data?.total_amount ?? '0.00'}`}
            subtitle={hasFilters ? 'Sum for current filters' : 'Total across all recorded other income'}
          />
        </Grid>
      </Grid>

      <FilterBar
        actions={
          hasFilters ? (
            <Button size="small" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          ) : undefined
        }
      >
        <SearchField
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by description or payer..."
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="income-cat-filter-label">Category</InputLabel>
          <Select
            labelId="income-cat-filter-label"
            value={categoryId}
            label="Category"
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          label="From Date"
          size="small"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />

        <TextField
          type="date"
          label="To Date"
          size="small"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
      </FilterBar>

      <DataTable<OtherIncome>
        columns={columns}
        rows={data?.results}
        count={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error ? parseApiError(error).detail : undefined}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        emptyTitle="No income records found"
        emptyMessage="No other income records match the specified filters."
      />

      <IncomeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingIncome}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
};

export default OtherIncomeListPage;
