import React from 'react';
import { Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { CompanyProfileForm } from '../../components/company/CompanyProfileForm';
import { useGetCompanyQuery } from '../../store/api/companyApi';
import { useAuth } from '../../hooks/useAuth';
import { parseApiError } from '../../utils/apiError';

export const CompanySettingsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { data: company, isLoading, error, refetch, isFetching } = useGetCompanyQuery();

  if (isLoading) {
    return <LoadingScreen message="Loading company profile..." />;
  }

  const parsedError = error ? parseApiError(error) : null;

  return (
    <Box>
      <PageHeader
        title="Company Profile"
        subtitle={
          isAdmin
            ? 'Manage registered company profile and billing information.'
            : 'View registered company profile and billing information.'
        }
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
        }
      />

      {parsedError && (
        <ApiErrorAlert error={parsedError} onClose={() => void refetch()} />
      )}

      {company && (
        <CompanyProfileForm initialData={company} isEditable={isAdmin} />
      )}
    </Box>
  );
};

export default CompanySettingsPage;
