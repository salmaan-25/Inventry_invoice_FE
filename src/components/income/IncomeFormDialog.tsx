import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { ApiErrorAlert } from '../feedback/ApiErrorAlert';
import { useGetIncomeCategoriesQuery } from '../../store/api/incomeApi';
import { otherIncomeSchema } from '../../schemas/finance';
import { toFixed2 } from '../../utils/money';
import { parseApiError } from '../../utils/apiError';
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '../../constants/enums';
import type { OtherIncome, CreateOtherIncomeRequest } from '../../types/api/income';

export interface IncomeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOtherIncomeRequest) => Promise<void>;
  initialData?: OtherIncome | null;
  isLoading?: boolean;
}

export const IncomeFormDialog: React.FC<IncomeFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { data: categories = [] } = useGetIncomeCategoriesQuery();

  const [date, setDate] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.CASH);
  const [receivedFrom, setReceivedFrom] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | undefined>();

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setAmount(initialData.amount);
      setPaymentMethod(initialData.payment_method);
      setReceivedFrom(initialData.received_from);
      setNotes(initialData.notes ?? '');
    } else {
      setDate(new Date().toISOString().split('T')[0] ?? '');
      setCategory(categories[0]?.id ?? '');
      setDescription('');
      setAmount('0.00');
      setPaymentMethod(PAYMENT_METHOD.CASH);
      setReceivedFrom('');
      setNotes('');
    }
    setErrors({});
    setServerError(undefined);
  }, [initialData, open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(undefined);

    const result = otherIncomeSchema.safeParse({
      date,
      category: Number(category),
      description: description.trim(),
      amount: toFixed2(amount),
      payment_method: paymentMethod,
      received_from: receivedFrom.trim(),
      notes: notes.trim() || undefined,
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
      await onSubmit({
        date,
        category: Number(category),
        description: description.trim(),
        amount: toFixed2(amount),
        payment_method: paymentMethod,
        received_from: receivedFrom.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setServerError(parseApiError(err).detail);
    }
  };

  const isEdit = Boolean(initialData);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Other Income' : 'Add Other Income'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {serverError && <ApiErrorAlert error={serverError} sx={{ mb: 2 }} />}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Date"
                fullWidth
                size="small"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={Boolean(errors.date)}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" error={Boolean(errors.category)}>
                <InputLabel id="income-category-label">Category</InputLabel>
                <Select
                  labelId="income-category-label"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(Number(e.target.value))}
                >
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                placeholder="e.g. Sold scrap packaging cartons"
                fullWidth
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount (₹)"
                placeholder="0.00"
                fullWidth
                size="small"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={(e) => setAmount(toFixed2(e.target.value || '0.00'))}
                error={Boolean(errors.amount)}
                helperText={errors.amount}
                inputProps={{
                  inputMode: 'decimal',
                  style: { textAlign: 'right', fontWeight: 600 },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="income-payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="income-payment-method-label"
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <MenuItem value={PAYMENT_METHOD.CASH}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CASH]}
                  </MenuItem>
                  <MenuItem value={PAYMENT_METHOD.BANK_TRANSFER}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.BANK_TRANSFER]}
                  </MenuItem>
                  <MenuItem value={PAYMENT_METHOD.UPI}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.UPI]}
                  </MenuItem>
                  <MenuItem value={PAYMENT_METHOD.CHEQUE}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CHEQUE]}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Received From (Source / Payer)"
                placeholder="e.g. Local Recycler / Bank Interest"
                fullWidth
                size="small"
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value)}
                error={Boolean(errors.received_from)}
                helperText={errors.received_from}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes / Reference (Optional)"
                placeholder="e.g. Receipt #5432"
                fullWidth
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isLoading}
          >
            {isEdit ? 'Update Income' : 'Save Income'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
