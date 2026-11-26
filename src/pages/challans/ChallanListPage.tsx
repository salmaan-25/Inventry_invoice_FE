import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/data-display/FilterBar';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { DateText } from '../../components/common/DateText';
import { CustomerPicker } from '../../components/customers/CustomerPicker';
import {
  useGetChallansQuery,
  useLazyGetChallanDocumentBlobQuery,
} from '../../store/api/challansApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { openBlobInNewTab } from '../../utils/download';
import { ROUTES } from '../../constants/routes';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import type { ChallanListItem } from '../../types/api/challan';
import type { Customer } from '../../types/api/customer';

export const ChallanListPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifyError } = useNotify();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [triggerDocumentQuery] = useLazyGetChallanDocumentBlobQuery();

  const { data, isLoading, error } = useGetChallansQuery({
    page,
    page_size: pageSize,
    invoice: invoiceQuery || undefined,
    customer: selectedCustomer?.id,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const handleDownloadPdf = async (challanId: number) => {
    try {
      const blob = await triggerDocumentQuery(challanId).unwrap();
      openBlobInNewTab(blob);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notifyError(parsed.detail);
    }
  };

  const handleClearFilters = () => {
    setInvoiceQuery('');
    setSelectedCustomer(undefined);
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasFilters = Boolean(invoiceQuery || selectedCustomer || fromDate || toDate);

  const columns: Column<ChallanListItem>[] = [
    {
      id: 'id',
      label: 'Challan #',
      minWidth: 100,
      render: (row) => (
        <Box
          component="button"
          type="button"
          onClick={() => navigate(ROUTES.challans.detail(row.id))}
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
          DC-{String(row.id).padStart(4, '0')}
        </Box>
      ),
    },
    {
      id: 'invoice_number',
      label: 'Invoice #',
      minWidth: 140,
      render: (row) => (
        <Box
          component="button"
          type="button"
          onClick={() => navigate(ROUTES.invoices.detail(row.invoice))}
          sx={{
            background: 'none',
            border: 'none',
            p: 0,
            cursor: 'pointer',
            color: 'primary.main',
            textAlign: 'left',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {row.invoice_number}
        </Box>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      minWidth: 180,
    },
    {
      id: 'delivery_date',
      label: 'Delivery Date',
      minWidth: 120,
      render: (row) => <DateText value={row.delivery_date} />,
    },
    {
      id: 'delivered_by',
      label: 'Delivered By',
      minWidth: 150,
    },
    {
      id: 'received_by',
      label: 'Received By',
      minWidth: 150,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Challan Details">
            <IconButton
              size="small"
              onClick={() => navigate(ROUTES.challans.detail(row.id))}
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
        title="Delivery Challans"
        subtitle="Manage shipment fulfillment, material dispatches, and gate passes."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.challans.new())}
          >
            Create Challan
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
        <TextField
          size="small"
          label="Invoice #"
          placeholder="Filter by invoice..."
          value={invoiceQuery}
          onChange={(e) => {
            setInvoiceQuery(e.target.value);
            setPage(1);
          }}
          sx={{
            minWidth: { xs: '100%', sm: 160 },
            width: { xs: '100%', sm: 'auto' },
          }}
        />

        <Box
          sx={{
            minWidth: { xs: '100%', sm: 260 },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
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
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            width: { xs: '100%', sm: 'auto' },
          }}
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
          sx={{
            minWidth: { xs: '100%', sm: 150 },
            width: { xs: '100%', sm: 'auto' },
          }}
        />
      </FilterBar>

      <DataTable<ChallanListItem>
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
        emptyTitle="No delivery challans found"
        emptyMessage="No dispatch records match the selected filters."
      />
    </Box>
  );
};

export default ChallanListPage;
