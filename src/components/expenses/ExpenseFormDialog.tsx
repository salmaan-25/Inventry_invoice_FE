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
  Typography,
  FormHelperText,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { ApiErrorAlert } from '../feedback/ApiErrorAlert';
import { useGetExpenseCategoriesQuery } from '../../store/api/expensesApi';
import { useGetStaffListQuery } from '../../store/api/staffApi';
import { expenseSchema } from '../../schemas/finance';
import { toFixed2 } from '../../utils/money';
import { parseApiError } from '../../utils/apiError';
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABEL,
  type PaymentMethod,
} from '../../constants/enums';
import type { Expense, CreateExpenseRequest } from '../../types/api/expense';

export interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  initialData?: Expense | null;
  isLoading?: boolean;
}

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const { data: categories = [] } = useGetExpenseCategoriesQuery();
  const { data: staffData } = useGetStaffListQuery({ page_size: 100 });
  const staffMembers = staffData?.results ?? [];

  const [date, setDate] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.BANK_TRANSFER);
  const [paidTo, setPaidTo] = useState('');
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
      setPaidTo(initialData.paid_to);
      setNotes(initialData.notes ?? '');
    } else {
      setDate(new Date().toISOString().split('T')[0] ?? '');
      setCategory(categories[0]?.id ?? '');
      setDescription('');
      setAmount('0.00');
      setPaymentMethod(PAYMENT_METHOD.BANK_TRANSFER);
      setPaidTo('');
      setNotes('');
    }
    setErrors({});
    setServerError(undefined);
  }, [initialData, open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(undefined);

    const result = expenseSchema.safeParse({
      date,
      category: Number(category),
      description: description.trim(),
      amount: toFixed2(amount),
      payment_method: paymentMethod,
      paid_to: paidTo.trim(),
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
        paid_to: paidTo.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setServerError(parseApiError(err).detail);
    }
  };

  const isEdit = Boolean(initialData);
  const selectedCategory = categories.find((c) => c.id === Number(category));
  const isSalary = selectedCategory?.name?.trim().toLowerCase() === 'salary';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {serverError && <ApiErrorAlert error={serverError} sx={{ mb: 2 }} />}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                label="Expense Date"
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
                <InputLabel id="expense-category-label">Category</InputLabel>
                <Select
                  labelId="expense-category-label"
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
                placeholder="e.g. Warehouse monthly lease"
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
                <InputLabel id="expense-payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="expense-payment-method-label"
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <MenuItem value={PAYMENT_METHOD.BANK_TRANSFER}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.BANK_TRANSFER]}
                  </MenuItem>
                  <MenuItem value={PAYMENT_METHOD.CASH}>
                    {PAYMENT_METHOD_LABEL[PAYMENT_METHOD.CASH]}
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
              {isSalary ? (
                <FormControl fullWidth size="small" error={Boolean(errors.paid_to)}>
                  <InputLabel id="expense-paid-to-label">Paid To (Employee)</InputLabel>
                  <Select
                    labelId="expense-paid-to-label"
                    value={paidTo}
                    label="Paid To (Employee)"
                    onChange={(e) => {
                      setPaidTo(e.target.value);
                      if (errors.paid_to) setErrors((prev) => ({ ...prev, paid_to: '' }));
                    }}
                  >
                    {staffMembers.length === 0 ? (
                      <MenuItem value="" disabled>
                        No employees added yet (Add in Staff Management)
                      </MenuItem>
                    ) : (
                      staffMembers.map((emp) => (
                        <MenuItem key={emp.id} value={emp.name}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              alignItems: 'center',
                            }}
                          >
                            <span>{emp.name}</span>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 2, fontFamily: 'monospace', fontWeight: 600 }}
                            >
                              {emp.employee_id}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                    {paidTo && !staffMembers.some((emp) => emp.name === paidTo) && (
                      <MenuItem value={paidTo}>{paidTo} (Custom)</MenuItem>
                    )}
                  </Select>
                  {errors.paid_to && <FormHelperText error>{errors.paid_to}</FormHelperText>}
                </FormControl>
              ) : (
                <TextField
                  label="Paid To (Vendor / Recipient)"
                  placeholder="e.g. Landlord Realtors / State Electricity Board"
                  fullWidth
                  size="small"
                  value={paidTo}
                  onChange={(e) => {
                    setPaidTo(e.target.value);
                    if (errors.paid_to) setErrors((prev) => ({ ...prev, paid_to: '' }));
                  }}
                  error={Boolean(errors.paid_to)}
                  helperText={errors.paid_to}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes / Reference (Optional)"
                placeholder="e.g. Bill #1234, UTR reference"
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
            {isEdit ? 'Update Expense' : 'Save Expense'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
