import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { CustomerPicker } from '../../components/customers/CustomerPicker';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { AllocationTable } from '../../components/payments/AllocationTable';
import { useGetCustomerOpenInvoicesQuery } from '../../store/api/customersApi';
import { useCreatePaymentMutation } from '../../store/api/paymentsApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { compareMoney, toFixed2 } from '../../utils/money';
import { generateClientToken } from '../../utils/id';
import {
  autoAllocateOldestFirst,
  isExactAllocation,
} from '../../utils/allocation';
import { createPaymentSchema } from '../../schemas/payment';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '../../constants/enums';
import type { Customer } from '../../types/api/customer';

export const PaymentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotify();

  // Idempotency token initialized once per form instance
  const clientTokenRef = useRef<string>(generateClientToken());

  const [customer, setCustomer] = useState<Customer | undefined>();
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [amount, setAmount] = useState<string>('0.00');
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHOD.BANK_TRANSFER);
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [allocations, setAllocations] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | undefined>();

  const { data: openInvoices, isLoading: isOpenInvoicesLoading } = useGetCustomerOpenInvoicesQuery(
    customer?.id ?? 0,
    { skip: !customer?.id }
  );

  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const handleAmountBlur = (val: string) => {
    const formatted = toFixed2(val || '0.00');
    setAmount(formatted);
    // Auto-allocate if user has already entered invoices
    if (openInvoices && openInvoices.length > 0) {
      const auto = autoAllocateOldestFirst(openInvoices, formatted);
      setAllocations(auto);
    }
  };

  const handleAutoAllocate = () => {
    if (openInvoices && openInvoices.length > 0) {
      const auto = autoAllocateOldestFirst(openInvoices, amount);
      setAllocations(auto);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.allocations;
        return next;
      });
    }
  };

  const handleAllocationChange = (invoiceId: number, val: string) => {
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: val,
    }));
    if (errors[`alloc_${invoiceId}`] || errors.allocations) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`alloc_${invoiceId}`];
        delete next.allocations;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(undefined);

    if (!customer) {
      setErrors({ customer: MESSAGES.validation.required });
      return;
    }

    // Filter out zero allocations
    const activeAllocations = Object.entries(allocations)
      .filter(([_, val]) => compareMoney(val, '0') > 0)
      .map(([invId, val]) => ({
        invoice: Number(invId),
        amount: toFixed2(val),
      }));

    const result = createPaymentSchema.safeParse({
      customer: customer.id,
      payment_date: paymentDate,
      amount: toFixed2(amount),
      method,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
      client_token: clientTokenRef.current,
      allocations: activeAllocations,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createPayment({
        customer: customer.id,
        payment_date: paymentDate,
        amount: toFixed2(amount),
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
        client_token: clientTokenRef.current,
        allocations: activeAllocations,
      }).unwrap();

      notifySuccess(MESSAGES.general.saveSuccess);
      navigate(ROUTES.payments.list);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setServerError(parsed.detail);
    }
  };

  const isBalanced = isExactAllocation(amount, allocations);

  return (
    <Box>
      <PageHeader
        title="Record Customer Payment"
        subtitle="Log incoming payments and settle outstanding customer invoices."
        breadcrumbs={[
          { label: 'Payments', path: ROUTES.payments.list },
          { label: 'New Payment' },
        ]}
      />

      {serverError && <ApiErrorAlert error={serverError} sx={{ mb: 3 }} />}
      {errors.allocations && <ApiErrorAlert error={errors.allocations} sx={{ mb: 3 }} />}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Customer & Payment Meta Card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Payment Header
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <CustomerPicker
                  value={customer}
                  onChange={(c) => {
                    setCustomer(c);
                    setAllocations({});
                    if (errors.customer) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.customer;
                        return next;
                      });
                    }
                  }}
                  error={Boolean(errors.customer)}
                  helperText={errors.customer}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Payment Date"
                  fullWidth
                  size="small"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Amount Received (₹)"
                  placeholder="0.00"
                  fullWidth
                  size="small"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={(e) => handleAmountBlur(e.target.value)}
                  error={Boolean(errors.amount)}
                  helperText={errors.amount}
                  inputProps={{
                    inputMode: 'decimal',
                    style: { textAlign: 'right', fontWeight: 600 },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-method-label"
                    value={method}
                    label="Payment Method"
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  >
                    <MenuItem value={PAYMENT_METHOD.BANK_TRANSFER}>
                      {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.BANK_TRANSFER]}
                    </MenuItem>
                    <MenuItem value={PAYMENT_METHOD.UPI}>
                      {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.UPI]}
                    </MenuItem>
                    <MenuItem value={PAYMENT_METHOD.CASH}>
                      {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CASH]}
                    </MenuItem>
                    <MenuItem value={PAYMENT_METHOD.CHEQUE}>
                      {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CHEQUE]}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Reference / UTR / Cheque #"
                  placeholder="e.g. UTR987654321"
                  fullWidth
                  size="small"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes (Optional)"
                  placeholder="e.g. Cleared via HDFC Bank"
                  fullWidth
                  size="small"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Invoice Allocations Card */}
        {customer && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              {isOpenInvoicesLoading ? (
                <LoadingScreen message="Loading open invoices..." />
              ) : openInvoices ? (
                <AllocationTable
                  invoices={openInvoices}
                  totalAmount={amount}
                  allocations={allocations}
                  onChangeAllocation={handleAllocationChange}
                  onAutoAllocate={handleAutoAllocate}
                  errors={errors}
                />
              ) : null}
            </CardContent>
          </Card>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            disabled={isCreating}
            onClick={() => navigate(ROUTES.payments.list)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isCreating || !customer || !isBalanced}
          >
            Record Payment & Settle
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PaymentCreatePage;
