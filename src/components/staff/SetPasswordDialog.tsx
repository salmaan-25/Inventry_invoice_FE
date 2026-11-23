import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, InputAdornment, IconButton, Alert, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { FormDialog } from '../common/FormDialog';
import { FormTextField } from '../form/FormTextField';
import { setPasswordSchema, type SetPasswordFormValues } from '../../schemas/staff';
import { useSetStaffPasswordMutation } from '../../store/api/staffApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import type { StaffMember } from '../../types/api/staff';

export interface SetPasswordDialogProps {
  open: boolean;
  staff?: StaffMember;
  onClose: () => void;
}

export const SetPasswordDialog: React.FC<SetPasswordDialogProps> = ({
  open,
  staff,
  onClose,
}) => {
  const { notifySuccess } = useNotify();
  const [setPassword, { isLoading }] = useSetStaffPasswordMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);

  useEffect(() => {
    methods.reset({
      new_password: '',
      confirm_password: '',
    });
    setGeneralError(null);
    setShowPassword(false);
  }, [staff, methods, open]);

  const onSubmit = async (values: SetPasswordFormValues) => {
    if (!staff) return;
    setGeneralError(null);
    try {
      const response = await setPassword({
        id: staff.id,
        ...values,
      }).unwrap();
      notifySuccess(response.detail || 'Password updated successfully.');
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
      title={`Set Password: ${staff?.name ?? staff?.employee_id ?? ''}`}
      submitLabel="Update Password"
      isSubmitting={isLoading}
      onSubmit={methods.handleSubmit(onSubmit)}
      onClose={onClose}
      maxWidth="xs"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Update login password for <strong>{staff?.name ?? staff?.employee_id}</strong>. Must be at least 8 characters.
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormTextField
              name="new_password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormTextField
              name="confirm_password"
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </FormProvider>
    </FormDialog>
  );
};
