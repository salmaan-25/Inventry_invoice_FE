import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { MoneyText } from '../common/MoneyText';
import { DateText } from '../common/DateText';
import { InvoiceStatusChip } from '../invoices/InvoiceStatusChip';
import { PaymentStatusChip } from '../common/PaymentStatusChip';
import { EmptyState } from '../common/EmptyState';
import { ROUTES } from '../../constants/routes';
import type { InvoiceListItem } from '../../types/api/invoice';

export interface CustomerInvoicesTableProps {
  invoices?: readonly InvoiceListItem[];
  customerId?: number | string;
  isLoading?: boolean;
  onDownloadPdf?: (invoiceId: number) => void;
}

export const CustomerInvoicesTable: React.FC<CustomerInvoicesTableProps> = ({
  invoices = [],
  customerId,
  onDownloadPdf,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'PAID' | 'DRAFT'>('ALL');

  const counts = useMemo(() => {
    let open = 0;
    let paid = 0;
    let draft = 0;
    invoices.forEach((inv) => {
      if (inv.status === 'DRAFT') {
        draft++;
      }
      const bal = parseFloat(inv.balance_due || inv.balance_amount || '0');
      if (bal > 0.001) {
        open++;
      } else {
        paid++;
      }
    });
    return { all: invoices.length, open, paid, draft };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (filter === 'ALL') return invoices;
    if (filter === 'DRAFT') return invoices.filter((i) => i.status === 'DRAFT');
    if (filter === 'OPEN') {
      return invoices.filter((i) => {
        const bal = parseFloat(i.balance_due || i.balance_amount || '0');
        return bal > 0.001 && i.status !== 'DRAFT';
      });
    }
    if (filter === 'PAID') {
      return invoices.filter((i) => {
        const bal = parseFloat(i.balance_due || i.balance_amount || '0');
        return bal <= 0.001 && i.status !== 'DRAFT';
      });
    }
    return invoices;
  }, [invoices, filter]);

  if (invoices.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <EmptyState
          title="No Invoices Found"
          message="No invoices have been issued or drafted for this customer yet."
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate(
                  customerId
                    ? `${ROUTES.invoices.new}?customer=${customerId}`
                    : ROUTES.invoices.new
                )
              }
            >
              Create First Invoice
            </Button>
          }
        />
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filter Chips & Action Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Chip
            label={`All Invoices (${counts.all})`}
            color={filter === 'ALL' ? 'primary' : 'default'}
            variant={filter === 'ALL' ? 'filled' : 'outlined'}
            onClick={() => setFilter('ALL')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label={`Balance Due / Open (${counts.open})`}
            color={filter === 'OPEN' ? 'warning' : 'default'}
            variant={filter === 'OPEN' ? 'filled' : 'outlined'}
            onClick={() => setFilter('OPEN')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          <Chip
            label={`Fully Settled / Paid (${counts.paid})`}
            color={filter === 'PAID' ? 'success' : 'default'}
            variant={filter === 'PAID' ? 'filled' : 'outlined'}
            onClick={() => setFilter('PAID')}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
          {counts.draft > 0 && (
            <Chip
              label={`Drafts (${counts.draft})`}
              color={filter === 'DRAFT' ? 'info' : 'default'}
              variant={filter === 'DRAFT' ? 'filled' : 'outlined'}
              onClick={() => setFilter('DRAFT')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          )}
        </Stack>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate(
              customerId
                ? `${ROUTES.invoices.new}?customer=${customerId}`
                : ROUTES.invoices.new
            )
          }
        >
          New Invoice
        </Button>
      </Box>

      {/* Invoices Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" aria-label="customer invoices table">
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Grand Total</TableCell>
                <TableCell align="right">Advance</TableCell>
                <TableCell align="right">Total Paid</TableCell>
                <TableCell align="right">Balance Due</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((inv) => {
                const bal = parseFloat(inv.balance_due || inv.balance_amount || '0');
                const isPaid = bal <= 0.001;
                return (
                  <TableRow key={inv.id} hover>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={ROUTES.invoices.detail(inv.id)}
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                        sx={{
                          textDecoration: 'none',
                          fontFamily: 'monospace',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {inv.invoice_number || `#${inv.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <DateText value={inv.invoice_date} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={inv.invoice_type === 'NON_GST' ? 'Non-GST' : 'GST'}
                        variant="outlined"
                        color={inv.invoice_type === 'NON_GST' ? 'default' : 'primary'}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusChip status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusChip
                        status={
                          inv.payment_status || (isPaid ? 'PAID' : 'UNPAID')
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={inv.grand_total} fontWeight={600} />
                    </TableCell>
                    <TableCell align="right">
                      {parseFloat(inv.advance_amount || '0') > 0 ? (
                        <MoneyText amount={inv.advance_amount} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText
                        amount={inv.paid_amount || '0.00'}
                        color="success.main"
                        fontWeight={600}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText
                        amount={inv.balance_due || inv.balance_amount || '0.00'}
                        fontWeight={700}
                        color={isPaid ? 'success.main' : 'error.main'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="View Invoice Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              navigate(ROUTES.invoices.detail(inv.id))
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onDownloadPdf && (
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => onDownloadPdf(inv.id)}
                            >
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
