import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Alert, Typography, Box } from '@mui/material';

import { FormDialog } from '../common/FormDialog';
import { FormTextField } from '../form/FormTextField';
import { adjustStockSchema, type AdjustStockFormValues } from '../../schemas/product';
import { useAdjustStockMutation } from '../../store/api/productsApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { addMoney, compareMoney } from '../../utils/money';
import { MESSAGES } from '../../constants/messages';
import type { Product } from '../../types/api/product';

export interface AdjustStockDialogProps {
  open: boolean;
  product?: Product;
  onClose: () => void;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
  open,
  product,
  onClose,
}) => {
  const { notifySuccess } = useNotify();
  const [adjustStock, { isLoading }] = useAdjustStockMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      quantity_change: '',
      reason: '',
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);
  const qtyChange = methods.watch('quantity_change');

  useEffect(() => {
    methods.reset({ quantity_change: '', reason: '' });
    setGeneralError(null);
  }, [open, methods]);

  // Live preview of resulting stock
  const currentStock = product?.current_stock ?? '0.000';
  let previewStock = currentStock;
  let isNegativeResult = false;

  if (qtyChange && !Number.isNaN(Number(qtyChange))) {
    try {
      previewStock = addMoney(currentStock, qtyChange);
      if (compareMoney(previewStock, '0') < 0) {
        isNegativeResult = true;
      }
    } catch {
      // Ignore intermediate typing errors
    }
  }

  const onSubmit = async (values: AdjustStockFormValues) => {
    if (!product || isNegativeResult) return;
    setGeneralError(null);
    try {
      await adjustStock({
        id: product.id,
        quantity_change: values.quantity_change,
        reason: values.reason,
      }).unwrap();
      notifySuccess(MESSAGES.general.actionSuccess);
      onClose();
    } catch (err: unknown) {
      const detail = handleApiFormErrors(err);
      if (detail) {
        setGeneralError(detail);
      }
    }
  };

  return (
    <FormDialog
      open={open}
      title={`Adjust Stock: ${product?.name ?? ''}`}
      submitLabel="Apply Adjustment"
      isSubmitting={isLoading}
      onSubmit={methods.handleSubmit(onSubmit)}
      onClose={onClose}
      maxWidth="xs"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Record an inventory correction (e.g. audit loss or warehouse damage). Reason is required.
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      {isNegativeResult && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Resulting stock cannot fall below 0.000.
        </Alert>
      )}

      <FormProvider {...methods}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormTextField
              name="quantity_change"
              label="Quantity Change (Signed)"
              placeholder="e.g. -5.000 or +10.000"
              required
              disabled={isLoading}
              autoFocus
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Current Stock: {currentStock} {product?.unit_name}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isNegativeResult ? 'error.main' : 'text.primary'}
              >
                Projected Balance: {previewStock} {product?.unit_name}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormTextField
              name="reason"
              label="Adjustment Reason"
              placeholder="e.g. Damaged in warehouse audit"
              required
              multiline
              rows={2}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </FormProvider>
    </FormDialog>
  );
};
