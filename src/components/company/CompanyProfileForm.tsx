import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Grid, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import { companySchema, type CompanyFormValues } from '../../schemas/company';
import { FormTextField } from '../form/FormTextField';
import { LogoUploader } from './LogoUploader';
import { SectionCard } from '../common/SectionCard';
import { useUpdateCompanyMutation } from '../../store/api/companyApi';
import { useNotify } from '../../hooks/useNotify';
import { useApiFormErrors } from '../../hooks/useApiFormErrors';
import { MESSAGES } from '../../constants/messages';
import type { CompanyProfile } from '../../types/api/company';

export interface CompanyProfileFormProps {
  initialData: CompanyProfile;
  isEditable: boolean;
}

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialData,
  isEditable,
}) => {
  const { notifySuccess } = useNotify();
  const [updateCompany, { isLoading }] = useUpdateCompanyMutation();

  const [selectedLogo, setSelectedLogo] = useState<File | undefined>(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      business_name: initialData.business_name ?? '',
      address: initialData.address ?? '',
      phone: initialData.phone ?? '',
      email: initialData.email ?? '',
      gstin: initialData.gstin ?? '',
    },
  });

  const { handleApiFormErrors } = useApiFormErrors(methods.setError);

  const onSubmit = async (values: CompanyFormValues) => {
    setSubmitError(null);
    try {
      await updateCompany({
        ...values,
        logo: selectedLogo,
      }).unwrap();
      notifySuccess(MESSAGES.general.updateSuccess);
      setSelectedLogo(undefined);
    } catch (err: unknown) {
      const detail = handleApiFormErrors(err);
      if (detail) {
        setSubmitError(detail);
      }
    }
  };

  return (
    <SectionCard
      title="Business Information"
      subheader={
        isEditable
          ? 'Update business name, contact info, and tax credentials for invoices.'
          : 'Read-only view of current registered company profile.'
      }
    >
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
        >
          <LogoUploader
            currentLogoUrl={initialData.logo}
            selectedFile={selectedLogo}
            onChange={setSelectedLogo}
            disabled={!isEditable || isLoading}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormTextField
                name="business_name"
                label="Business Name"
                disabled={!isEditable || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                name="gstin"
                label="GSTIN (15 characters)"
                disabled={!isEditable || isLoading}
                placeholder="33AAAAA0000A1Z5"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                name="phone"
                label="Phone Number"
                disabled={!isEditable || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormTextField
                name="email"
                label="Email Address"
                type="email"
                disabled={!isEditable || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextField
                name="address"
                label="Registered Business Address"
                multiline
                rows={3}
                disabled={!isEditable || isLoading}
                required
              />
            </Grid>
          </Grid>

          {isEditable && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                }
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>
      </FormProvider>
    </SectionCard>
  );
};
