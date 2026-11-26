import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/data-display/FilterBar';
import { DataTable, type Column } from '../../components/data-display/DataTable';
import { CustomerPicker } from '../../components/customers/CustomerPicker';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import {
  useGetPaymentsQuery,
  useGetPaymentQuery,
} from '../../store/api/paymentsApi';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';
import {
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '../../constants/enums';
import { DEFAULT_PAGE_SIZE } from '../../constants/pagination';
import type { PaymentListItem } from '../../types/api/payment';
import type { Customer } from '../../types/api/customer';

export const PaymentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [viewPaymentId, setViewPaymentId] = useState<number | null>(null);

  const { data, isLoading, error } = useGetPaymentsQuery({
    page,
    page_size: pageSize,
    customer: selectedCustomer?.id,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const { data: activePayment, isLoading: isDetailLoading } = useGetPaymentQuery(
    viewPaymentId ?? 0,
    { skip: !viewPaymentId }
  );

  const handleClearFilters = () => {
    setSelectedCustomer(undefined);
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasFilters = Boolean(selectedCustomer || fromDate || toDate);

  const columns: Column<PaymentListItem>[] = [
    {
      id: 'id',
      label: 'Receipt #',
      minWidth: 100,
      render: (row) => (
        <Box
          component="button"
          type="button"
          onClick={() => setViewPaymentId(row.id)}
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
          PMT-{String(row.id).padStart(4, '0')}
        </Box>
      ),
    },
    {
      id: 'customer_name',
      label: 'Customer',
      minWidth: 180,
    },
    {
      id: 'payment_date',
      label: 'Payment Date',
      minWidth: 120,
      render: (row) => <DateText value={row.payment_date} />,
    },
    {
      id: 'amount',
      label: 'Amount Paid',
      align: 'right',
      minWidth: 130,
      render: (row) => (
        <MoneyText amount={row.amount} fontWeight={700} color="success.main" />
      ),
    },
    {
      id: 'method',
      label: 'Payment Method',
      minWidth: 150,
      render: (row) => (
        <Chip
          size="small"
          label={PAYMENT_METHOD_LABEL[row.method as PaymentMethod] ?? row.method}
          variant="outlined"
        />
      ),
    },
    {
      id: 'reference',
      label: 'Reference / UTR',
      minWidth: 140,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.reference || '—'}
        </Typography>
      ),
    },
    {
      id: 'received_by_name',
      label: 'Received By',
      minWidth: 140,
    },
    {
      id: 'actions',
      label: 'Allocations',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <Tooltip title="View Settled Invoices">
          <IconButton size="small" onClick={() => setViewPaymentId(row.id)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Customer Payments"
        subtitle="Track incoming cash, NEFT/RTGS bank transfers, UPI, and invoice settlements."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.payments.new)}
          >
            Record Payment
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

      <DataTable<PaymentListItem>
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
        emptyTitle="No payments recorded"
        emptyMessage="No customer payments match the specified filters."
      />

      {/* Payment Allocations Dialog */}
      <Dialog
        open={Boolean(viewPaymentId)}
        onClose={() => setViewPaymentId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payment Settlement Details {activePayment && `(PMT-${String(activePayment.id).padStart(4, '0')})`}
        </DialogTitle>
        <DialogContent dividers>
          {isDetailLoading || !activePayment ? (
            <LoadingScreen message="Loading allocation breakdown..." />
          ) : (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Customer: <strong>{activePayment.customer_name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: <DateText value={activePayment.payment_date} /> • Method: {activePayment.method}
                  </Typography>
                  {activePayment.reference && (
                    <Typography variant="body2" color="text.secondary">
                      Ref: {activePayment.reference}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" fontWeight={700} color="success.main">
                    Total: ₹ {activePayment.amount}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Settled Invoices
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell align="right">Invoice Total</TableCell>
                      <TableCell align="right">Allocated Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activePayment.allocations.map((alloc) => (
                      <TableRow key={alloc.id} hover>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              setViewPaymentId(null);
                              navigate(ROUTES.invoices.detail(alloc.invoice));
                            }}
                            sx={{ p: 0, fontWeight: 600 }}
                          >
                            {alloc.invoice_number}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <DateText value={alloc.invoice_date} />
                        </TableCell>
                        <TableCell align="right">
                          <MoneyText amount={alloc.grand_total} />
                        </TableCell>
                        <TableCell align="right">
                          <MoneyText amount={alloc.amount} fontWeight={700} color="success.main" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewPaymentId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentListPage;
