import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { useGetCustomerQuery } from '../../store/api/customersApi';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';

export const CustomerFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const { data: customer, isLoading, error } = useGetCustomerQuery(id as string, {
    skip: !isEdit,
  });

  if (isEdit && isLoading) {
    return <LoadingScreen message="Loading customer details..." />;
  }

  const parsedError = error ? parseApiError(error) : null;

  return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Customer' : 'Register New Customer'}
        subtitle={
          isEdit
            ? 'Update customer contact, billing address and tax registration.'
            : 'Register a new customer account for invoicing and sales dispatch.'
        }
        breadcrumbs={[
          { label: 'Customers', path: ROUTES.customers.list },
          {
            label: isEdit ? customer?.name ?? 'Edit Customer' : 'New Customer',
          },
        ]}
      />

      {parsedError && <ApiErrorAlert error={parsedError} />}

      {(!isEdit || customer) && <CustomerForm initialData={customer} />}
    </Box>
  );
};

export default CustomerFormPage;
