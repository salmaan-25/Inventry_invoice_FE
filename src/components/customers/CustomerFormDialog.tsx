import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Alert } from '@mui/material';

import { FormDialog } from '../common/FormDialog';
import { FormTextField } from '../form/FormTextField';
import { customerSchema, type CustomerFormValues } from '../../schemas/customer';
import { useCreateCustomerMutation } from '../../store/api/customersApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { MESSAGES } from '../../constants/messages';
import type { Customer } from '../../types/api/customer';

export interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (createdCustomer: Customer) => void;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { notifySuccess } = useNotify();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      gstin: '',
      state: '',
      billing_address: '',
      is_active: true,
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);

  useEffect(() => {
    if (open) {
      methods.reset({
        name: '',
        phone: '',
        gstin: '',
        state: '',
        billing_address: '',
        is_active: true,
      });
      setGeneralError(null);
    }
  }, [open, methods]);

  const onSubmit = async (values: CustomerFormValues) => {
    setGeneralError(null);
    try {
      const created = await createCustomer({
        name: values.name.trim(),
        phone: values.phone.trim(),
        gstin: values.gstin?.trim() || undefined,
        state: values.state.trim(),
        billing_address: values.billing_address.trim(),
      }).unwrap();

      notifySuccess(MESSAGES.general.createSuccess);
      onSuccess?.(created);
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
      title="New Customer Profile"
      submitLabel="Create Customer"
      isSubmitting={isLoading}
      onSubmit={methods.handleSubmit(onSubmit)}
      onClose={onClose}
      maxWidth="sm"
    >
      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <FormTextField
              name="name"
              label="Customer / Business Name"
              required
              disabled={isLoading}
              autoFocus
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormTextField
              name="phone"
              label="Phone Number"
              required
              disabled={isLoading}
              placeholder="10 to 15 digits"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormTextField
              name="gstin"
              label="GSTIN (Optional)"
              placeholder="33ABCDE1234F1Z5"
              disabled={isLoading}
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormTextField
              name="state"
              label="State"
              required
              disabled={isLoading}
              placeholder="e.g. Tamil Nadu"
            />
          </Grid>

          <Grid item xs={12}>
            <FormTextField
              name="billing_address"
              label="Billing Address"
              multiline
              rows={3}
              required
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </FormProvider>
    </FormDialog>
  );
};
