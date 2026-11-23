import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';
import {
  useGetInvoiceQuery,
  useUpdateInvoiceMutation,
} from '../../store/api/invoicesApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { INVOICE_STATUS } from '../../constants/enums';
import type { CreateInvoiceRequest } from '../../types/api/invoice';

export const InvoiceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifySuccess } = useNotify();

  const invoiceId = Number(id);
  const { data: invoice, isLoading, error } = useGetInvoiceQuery(invoiceId, {
    skip: !invoiceId,
  });

  const [updateInvoice, { isLoading: isUpdating }] = useUpdateInvoiceMutation();
  const [serverError, setServerError] = useState<string | undefined>();

  if (isLoading) {
    return <LoadingScreen message="Loading invoice..." />;
  }

  if (error || !invoice) {
    return <ApiErrorAlert error={error ? parseApiError(error) : 'Invoice not found'} />;
  }

  const isDraft = invoice.status === INVOICE_STATUS.DRAFT;

  const initialValues = {
    invoice_number: invoice.invoice_number || '',
    customer: invoice.customer,
    invoice_date: invoice.invoice_date,
    invoice_type: invoice.invoice_type || 'GST',
    advance_amount: invoice.advance_amount || '0.00',
    notes: invoice.notes ?? '',

    // Consignee
    consignee_name: invoice.consignee_name || '',
    consignee_address: invoice.consignee_address || '',
    consignee_gstin: invoice.consignee_gstin || '',
    consignee_state: invoice.consignee_state || '',
    consignee_state_code: invoice.consignee_state_code || '',

    // Dispatch
    e_way_bill_no: invoice.e_way_bill_no || '',
    delivery_note: invoice.delivery_note || '',
    payment_terms: invoice.payment_terms || '',
    reference_no_date: invoice.reference_no_date || '',
    other_references: invoice.other_references || '',
    buyer_order_no: invoice.buyer_order_no || '',
    order_date: invoice.order_date || null,
    dispatch_doc_no: invoice.dispatch_doc_no || '',
    delivery_note_date: invoice.delivery_note_date || null,
    dispatched_through: invoice.dispatched_through || '',
    destination: invoice.destination || '',
    bill_of_lading_no: invoice.bill_of_lading_no || '',
    motor_vehicle_no: invoice.motor_vehicle_no || '',
    terms_of_delivery: invoice.terms_of_delivery || '',

    lines: invoice.items.map((item) => ({
      product: item.product,
      product_name: item.product_name,
      description: item.description || item.product_name,
      hsn_sac: item.hsn_sac,
      unit_name: item.unit_name || 'PCS',
      gst_rate: item.gst_rate,
      quantity: item.quantity,
      rate: item.rate,
    })),
  };

  const handleSubmit = async (data: CreateInvoiceRequest) => {
    try {
      setServerError(undefined);
      await updateInvoice({
        id: invoice.id,
        ...data,
      }).unwrap();
      notifySuccess(MESSAGES.general.saveSuccess);
      navigate(ROUTES.invoices.detail(invoice.id));
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setServerError(parsed.detail);
    }
  };

  return (
    <Box>
      <PageHeader
        title={`Edit Invoice ${invoice.invoice_number}`}
        breadcrumbs={[
          { label: 'Invoices', path: ROUTES.invoices.list },
          { label: invoice.invoice_number, path: ROUTES.invoices.detail(invoice.id) },
          { label: 'Edit' },
        ]}
      />

      <InvoiceForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        serverError={serverError}
        submitLabel={isDraft ? 'Update Draft' : 'Save Changes'}
      />
    </Box>
  );
};

export default InvoiceEditPage;
