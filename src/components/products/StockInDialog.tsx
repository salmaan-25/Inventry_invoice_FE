import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Alert, Typography } from '@mui/material';

import { FormDialog } from '../common/FormDialog';
import { FormQuantityField } from '../form/FormQuantityField';
import { FormTextField } from '../form/FormTextField';
import { stockInSchema, type StockInFormValues } from '../../schemas/product';
import { useStockInMutation } from '../../store/api/productsApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { MESSAGES } from '../../constants/messages';
import type { Product } from '../../types/api/product';

export interface StockInDialogProps {
  open: boolean;
  product?: Product;
  onClose: () => void;
}

export const StockInDialog: React.FC<StockInDialogProps> = ({
  open,
  product,
  onClose,
}) => {
  const { notifySuccess } = useNotify();
  const [stockIn, { isLoading }] = useStockInMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      quantity: '',
      reason: '',
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);

  useEffect(() => {
    methods.reset({ quantity: '', reason: '' });
    setGeneralError(null);
  }, [open, methods]);

  const onSubmit = async (values: StockInFormValues) => {
    if (!product) return;
    setGeneralError(null);
    try {
      await stockIn({
        id: product.id,
        quantity: values.quantity,
        reason: values.reason || undefined,
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
      title={`Add Stock (Stock-In): ${product?.name ?? ''}`}
      submitLabel="Confirm Stock-In"
      isSubmitting={isLoading}
      onSubmit={methods.handleSubmit(onSubmit)}
      onClose={onClose}
      maxWidth="xs"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Record receipt of goods into warehouse. Current stock: <strong>{product?.current_stock} {product?.unit_name}</strong>.
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormQuantityField
              name="quantity"
              label="Quantity Received"
              unitName={product?.unit_name}
              required
              disabled={isLoading}
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <FormTextField
              name="reason"
              label="Reason / PO Reference"
              placeholder="e.g. PO #1043 Vendor Delivery"
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </FormProvider>
    </FormDialog>
  );
};
