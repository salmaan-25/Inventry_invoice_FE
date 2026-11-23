import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';
import { useCreateInvoiceMutation } from '../../store/api/invoicesApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import type { CreateInvoiceRequest } from '../../types/api/invoice';

export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotify();

  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const [serverError, setServerError] = useState<string | undefined>();

  const handleSubmit = async (data: CreateInvoiceRequest) => {
    try {
      setServerError(undefined);
      const created = await createInvoice(data).unwrap();
      notifySuccess(MESSAGES.general.saveSuccess);
      navigate(ROUTES.invoices.detail(created.id));
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setServerError(parsed.detail);
    }
  };

  return (
    <Box>
      <PageHeader
        title="New Invoice"
        breadcrumbs={[
          { label: 'Invoices', path: ROUTES.invoices.list },
          { label: 'New Invoice' },
        ]}
      />

      <InvoiceForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        serverError={serverError}
        submitLabel="Create Draft Invoice"
      />
    </Box>
  );
};

export default InvoiceCreatePage;
