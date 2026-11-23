import React from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { MoneyText } from '../common/MoneyText';
import { DateText } from '../common/DateText';
import { toFixed2, compareMoney, sumMoney } from '../../utils/money';
import { calculateUnallocated } from '../../utils/allocation';
import type { CustomerOpenInvoice } from '../../types/api/customer';

export interface AllocationTableProps {
  invoices: CustomerOpenInvoice[];
  totalAmount: string;
  allocations: Record<number, string>;
  onChangeAllocation: (invoiceId: number, val: string) => void;
  onAutoAllocate: () => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  invoices,
  totalAmount,
  allocations,
  onChangeAllocation,
  onAutoAllocate,
  errors = {},
  disabled = false,
}) => {
  const invoiceList = Array.isArray(invoices)
    ? invoices
    : (invoices && typeof invoices === 'object' && 'results' in (invoices as Record<string, unknown>))
    ? ((invoices as { results: CustomerOpenInvoice[] }).results ?? [])
    : [];

  const allocatedTotal = sumMoney(Object.values(allocations));
  const unallocated = calculateUnallocated(totalAmount, allocations);
  const unallocatedComp = compareMoney(unallocated, '0.00');

  const handleBlur = (invoice: CustomerOpenInvoice, val: string) => {
    onChangeAllocation(invoice.id, toFixed2(val || '0.00'));
  };

  const handleSetMax = (invoice: CustomerOpenInvoice) => {
    onChangeAllocation(invoice.id, invoice.balance_due);
  };

  const handleSetZero = (invoice: CustomerOpenInvoice) => {
    onChangeAllocation(invoice.id, '0.00');
  };

  return (
    <Box sx={{ my: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" fontWeight={600}>
            Invoice Allocations
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighIcon />}
            onClick={onAutoAllocate}
            disabled={disabled || invoiceList.length === 0 || compareMoney(totalAmount, '0.00') <= 0}
          >
            Auto-allocate (Oldest First)
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            variant="outlined"
            label={`Allocated: ₹ ${allocatedTotal} / ₹ ${toFixed2(totalAmount || '0.00')}`}
          />
          <Chip
            size="small"
            label={
              unallocatedComp === 0
                ? '✓ Balanced'
                : unallocatedComp > 0
                ? `Unallocated: ₹ ${unallocated}`
                : `Overallocated: ₹ ${unallocated.replace('-', '')}`
            }
            color={unallocatedComp === 0 ? 'success' : unallocatedComp > 0 ? 'warning' : 'error'}
          />
        </Stack>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="invoice allocations table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40 }}>#</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Invoice #</TableCell>
              <TableCell sx={{ width: 110 }}>Date</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Total (₹)</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Paid (₹)</TableCell>
              <TableCell align="right" sx={{ width: 130 }}>Balance Due (₹)</TableCell>
              <TableCell align="right" sx={{ width: 160 }}>Allocate Amount (₹)</TableCell>
              {!disabled && <TableCell align="center" sx={{ width: 100 }}>Quick Fill</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={disabled ? 7 : 8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No open invoices available for this customer.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              invoiceList.map((inv, index) => {
                const currentAlloc = allocations[inv.id] ?? '0.00';
                const isOverDue = compareMoney(currentAlloc, inv.balance_due) > 0;
                const rowError =
                  errors[`alloc_${inv.id}`] ||
                  (isOverDue ? `Exceeds balance due (₹ ${inv.balance_due})` : undefined);

                return (
                  <TableRow key={inv.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {inv.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <DateText value={inv.invoice_date} />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={inv.grand_total} />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={inv.total_paid} color="text.secondary" />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={inv.balance_due} fontWeight={600} color="warning.main" />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        disabled={disabled}
                        value={currentAlloc}
                        onChange={(e) => onChangeAllocation(inv.id, e.target.value)}
                        onBlur={(e) => handleBlur(inv, e.target.value)}
                        error={Boolean(rowError)}
                        helperText={rowError}
                        inputProps={{
                          inputMode: 'decimal',
                          style: { textAlign: 'right' },
                        }}
                      />
                    </TableCell>
                    {!disabled && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleSetMax(inv)}
                            sx={{ minWidth: 35, p: 0.5, fontSize: '0.75rem' }}
                          >
                            Full
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            onClick={() => handleSetZero(inv)}
                            sx={{ minWidth: 25, p: 0.5, fontSize: '0.75rem' }}
                          >
                            0
                          </Button>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
