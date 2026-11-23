import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/data-display/FilterBar';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { InvoiceStatusChip } from '../../components/invoices/InvoiceStatusChip';
import { PaymentStatusChip } from '../../components/common/PaymentStatusChip';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { CustomerPicker } from '../../components/customers/CustomerPicker';
import {
  useGetInvoicesQuery,
  useLazyGetInvoiceDocumentBlobQuery,
} from '../../store/api/invoicesApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { openBlobInNewTab } from '../../utils/download';
import { ROUTES } from '../../constants/routes';
import { INVOICE_STATUS, type InvoiceStatus } from '../../constants/enums';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import type { InvoiceListItem } from '../../types/api/invoice';
import type { Customer } from '../../types/api/customer';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customer');
  const { notifyError } = useNotify();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const effectiveCustomerId = selectedCustomer?.id || (customerIdParam ? Number(customerIdParam) : undefined);

  const [triggerDocumentQuery] = useLazyGetInvoiceDocumentBlobQuery();

  const { data, isLoading, error } = useGetInvoicesQuery({
    page,
    page_size: pageSize,
    status: (status as InvoiceStatus) || undefined,
    customer: effectiveCustomerId,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const handleDownloadPdf = async (invoiceId: number) => {
    try {
      const blob = await triggerDocumentQuery(invoiceId).unwrap();
      openBlobInNewTab(blob);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
    }
  };

  const handleClearFilters = () => {
    setStatus('');
    setSelectedCustomer(undefined);
    setFromDate('');
    setToDate('');
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = Boolean(status || selectedCustomer || fromDate || toDate || customerIdParam);

  const columns: Column<InvoiceListItem>[] = [
    {
      id: 'invoice_number',
      label: 'Invoice #',
      minWidth: 140,
      render: (row) => (
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Box
            component="button"
            type="button"
            onClick={() => navigate(ROUTES.invoices.detail(row.id))}
            sx={{
              background: 'none',
              border: 'none',
              p: 0,
              cursor: 'pointer',
              color: 'primary.main',
              fontWeight: 600,
              textAlign: 'left',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {row.invoice_number}
          </Box>
          {row.invoice_type === 'NON_GST' && (
            <Chip
              label="Non-GST"
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600 }}
            />
          )}
        </Stack>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      minWidth: 180,
    },
    {
      id: 'invoice_date',
      label: 'Date',
      minWidth: 110,
      render: (row) => <DateText value={row.invoice_date} />,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (row) => <InvoiceStatusChip status={row.status} />,
    },
    {
      id: 'payment_status',
      label: 'Payment',
      minWidth: 130,
      render: (row) => <PaymentStatusChip status={row.payment_status} />,
    },
    {
      id: 'grand_total',
      label: 'Grand Total',
      align: 'right',
      minWidth: 130,
      render: (row) => <MoneyText amount={row.grand_total} fontWeight={600} />,
    },
    {
      id: 'balance_due',
      label: 'Balance Due',
      align: 'right',
      minWidth: 130,
      render: (row) => <MoneyText amount={row.balance_due} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Invoice">
            <IconButton
              size="small"
              onClick={() => navigate(ROUTES.invoices.detail(row.id))}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="PDF Document">
            <IconButton
              size="small"
              color="primary"
              onClick={() => void handleDownloadPdf(row.id)}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Invoices"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.invoices.new)}
          >
            Create Invoice
          </Button>
        }
      />

      <FilterBar
        actions={
          hasFilters ? (
            <Button size="small" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          ) : undefined
        }
      >
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="invoice-status-filter-label">Status</InputLabel>
          <Select
            labelId="invoice-status-filter-label"
            value={status}
            label="Status"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value={INVOICE_STATUS.DRAFT}>Draft</MenuItem>
            <MenuItem value={INVOICE_STATUS.ISSUED}>Issued</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ minWidth: 260 }}>
          <CustomerPicker
            value={selectedCustomer}
            onChange={(cust) => {
              setSelectedCustomer(cust);
              setPage(1);
            }}
            placeholder="Filter by customer..."
          />
        </Box>

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

      <DataTable<InvoiceListItem>
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
        emptyTitle="No invoices found"
        emptyMessage="No invoices found matching criteria."
      />
    </Box>
  );
};

export default InvoiceListPage;
