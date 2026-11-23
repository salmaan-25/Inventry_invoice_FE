import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { StatCard } from '../data-display/StatCard';
import { FilterBar } from '../data-display/FilterBar';
import { MoneyText } from '../common/MoneyText';
import { DateText } from '../common/DateText';
import { StatusChip } from '../common/StatusChip';
import { EmptyState } from '../common/EmptyState';
import { FormDatePicker } from '../form/FormDatePicker';
import { useForm, FormProvider } from 'react-hook-form';
import type { CustomerStatement } from '../../types/api/customer';

export interface StatementTableProps {
  statement?: CustomerStatement;
  fromDate?: string;
  toDate?: string;
  onDateChange: (from?: string, to?: string) => void;
  dateError?: string;
}

export const StatementTable: React.FC<StatementTableProps> = ({
  statement,
  fromDate,
  toDate,
  onDateChange,
  dateError,
}) => {
  const methods = useForm({
    defaultValues: {
      from: fromDate ?? '',
      to: toDate ?? '',
    },
  });

  const handleApplyRange = (values: { from: string; to: string }) => {
    onDateChange(values.from || undefined, values.to || undefined);
  };

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Invoiced"
            value={<MoneyText amount={statement?.total_invoiced} variant="h5" fontWeight={600} />}
            icon={<ReceiptIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Paid"
            value={<MoneyText amount={statement?.total_paid} variant="h5" fontWeight={600} color="success.main" />}
            icon={<PaymentIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Outstanding Balance"
            value={<MoneyText amount={statement?.outstanding_balance} variant="h5" fontWeight={600} color="error.main" />}
            icon={<AccountBalanceWalletIcon />}
          />
        </Grid>
      </Grid>

      <FormProvider {...methods}>
        <Box component="form" onChange={methods.handleSubmit(handleApplyRange)}>
          <FilterBar>
            <Box sx={{ width: 180 }}>
              <FormDatePicker name="from" label="From Date" />
            </Box>
            <Box sx={{ width: 180 }}>
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

      {statement?.entries && statement.entries.length > 0 ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small" aria-label="statement ledger table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Debit (₹)</TableCell>
                  <TableCell align="right">Credit (₹)</TableCell>
                  <TableCell align="right">Running Balance (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statement.entries.map((entry, idx) => (
                  <TableRow key={`${entry.reference}-${idx}`} hover>
                    <TableCell>
                      <DateText value={entry.date} />
                    </TableCell>
                    <TableCell>
                      <StatusChip
                        label={entry.type}
                        color={entry.type === 'INVOICE' ? 'info' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {entry.reference}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={entry.debit} />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={entry.credit} color="success.main" />
                    </TableCell>
                    <TableCell align="right">
                      <MoneyText amount={entry.running_balance} fontWeight={600} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <EmptyState
          title="No Ledger Transactions"
          message="No invoices or payment entries recorded in this date range."
        />
      )}
    </Box>
  );
};
