import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { SectionCard } from '../../components/common/SectionCard';
import { DispatchLinesTable } from '../../components/challans/DispatchLinesTable';
import {
  useGetInvoiceQuery,
  useGetAwaitingDispatchQuery,
} from '../../store/api/invoicesApi';
import { useCreateChallanMutation } from '../../store/api/challansApi';
import { useNotify } from '../../hooks/useNotify';
import { parseApiError } from '../../utils/apiError';
import { compareMoney, toFixed3 } from '../../utils/money';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { INVOICE_STATUS } from '../../constants/enums';

const CHALLAN_MESSAGES = {
  deliveredByRequired: 'Delivered by (e.g. driver or courier name) is required.',
  receivedByRequired: 'Received by (e.g. gate or contact person) is required.',
  noItemsAvailable: 'No items available to dispatch for this invoice.',
  atLeastOneItem: 'At least one line item must have a quantity greater than zero.',
} as const;

export const ChallanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceParam = searchParams.get('invoice');
  const initialInvoiceId = invoiceParam ? Number(invoiceParam) : 0;

  const { notifySuccess } = useNotify();

  const [invoiceIdInput, setInvoiceIdInput] = useState<string>(
    initialInvoiceId ? String(initialInvoiceId) : ''
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>(initialInvoiceId);

  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0] ?? ''
  );
  const [deliveredBy, setDeliveredBy] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | undefined>();

  const { data: invoice, isLoading: isInvoiceLoading, error: invoiceError } = useGetInvoiceQuery(
    selectedInvoiceId,
    { skip: !selectedInvoiceId }
  );

  const {
    data: awaitingItems,
    isLoading: isDispatchLoading,
    error: dispatchError,
  } = useGetAwaitingDispatchQuery(selectedInvoiceId, {
    skip: !selectedInvoiceId || invoice?.status !== INVOICE_STATUS.ISSUED,
  });

  const [createChallan, { isLoading: isCreating }] = useCreateChallanMutation();

  useEffect(() => {
    if (awaitingItems && awaitingItems.length > 0) {
      const initialQtys: Record<number, string> = {};
      awaitingItems.forEach((item) => {
        initialQtys[item.invoice_item_id] = item.remaining_quantity;
      });
      setQuantities(initialQtys);
    }
  }, [awaitingItems]);

  const handleInvoiceSelect = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(invoiceIdInput.trim());
    if (id > 0) {
      setSelectedInvoiceId(id);
      setErrors({});
      setServerError(undefined);
    }
  };

  const handleQuantityChange = (invoiceItemId: number, val: string) => {
    setQuantities((prev) => ({
      ...prev,
      [invoiceItemId]: val,
    }));
    if (errors[`qty_${invoiceItemId}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`qty_${invoiceItemId}`];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(undefined);

    const newErrors: Record<string, string> = {};
    if (!deliveryDate) {
      newErrors.delivery_date = MESSAGES.validation.required;
    }
    if (!deliveredBy.trim()) {
      newErrors.delivered_by = CHALLAN_MESSAGES.deliveredByRequired;
    }
    if (!receivedBy.trim()) {
      newErrors.received_by = CHALLAN_MESSAGES.receivedByRequired;
    }

    if (!awaitingItems || awaitingItems.length === 0) {
      newErrors.general = CHALLAN_MESSAGES.noItemsAvailable;
    } else {
      let nonZeroCount = 0;
      for (const item of awaitingItems) {
        const qty = quantities[item.invoice_item_id] ?? item.remaining_quantity;
        if (compareMoney(qty, item.remaining_quantity) > 0) {
          newErrors[`qty_${item.invoice_item_id}`] = `Cannot dispatch more than remaining (${item.remaining_quantity} ${item.unit}).`;
        }
        if (compareMoney(qty, '0') > 0) {
          nonZeroCount += 1;
        }
      }

      if (nonZeroCount === 0) {
        newErrors.general = CHALLAN_MESSAGES.atLeastOneItem;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const itemsToDispatch = (awaitingItems ?? [])
      .filter((item) => {
        const qty = quantities[item.invoice_item_id] ?? item.remaining_quantity;
        return compareMoney(qty, '0') > 0;
      })
      .map((item) => ({
        invoice_item: item.invoice_item_id,
        quantity: toFixed3(quantities[item.invoice_item_id] ?? item.remaining_quantity),
      }));

    try {
      const res = await createChallan({
        invoice: selectedInvoiceId,
        delivery_date: deliveryDate,
        delivered_by: deliveredBy.trim(),
        received_by: receivedBy.trim(),
        items: itemsToDispatch,
      }).unwrap();

      notifySuccess(MESSAGES.general.saveSuccess);
      navigate(ROUTES.challans.detail(res.id));
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setServerError(parsed.detail);
    }
  };

  const isDraft = invoice?.status === INVOICE_STATUS.DRAFT;
  const hasNoRemaining = awaitingItems && awaitingItems.length > 0 && awaitingItems.every((item) => compareMoney(item.remaining_quantity, '0') <= 0);

  return (
    <Box>
      <PageHeader
        title="Create Delivery Challan"
        subtitle="Generate material dispatch challan and vehicle gate pass."
        breadcrumbs={[
          { label: 'Delivery Challans', path: ROUTES.challans.list },
          { label: 'New Challan' },
        ]}
      />

      {serverError && <ApiErrorAlert error={serverError} sx={{ mb: 3 }} />}
      {errors.general && <ApiErrorAlert error={errors.general} sx={{ mb: 3 }} />}

      {/* Invoice Reference Selection */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Linked Invoice
          </Typography>
          <Box
            component="form"
            onSubmit={handleInvoiceSelect}
            sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}
          >
            <TextField
              size="small"
              label="Invoice ID"
              placeholder="e.g. 1"
              value={invoiceIdInput}
              onChange={(e) => setInvoiceIdInput(e.target.value)}
              sx={{ width: 160 }}
            />
            <Button type="submit" variant="outlined" size="medium">
              Load Invoice
            </Button>
            {invoice && (
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {invoice.invoice_number} ({invoice.customer_name})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Date: {invoice.invoice_date} • Status: {invoice.status} • Delivery:{' '}
                  {invoice.delivery_status}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {isInvoiceLoading && <LoadingScreen message="Loading invoice..." />}
      {invoiceError && (
        <ApiErrorAlert error={parseApiError(invoiceError)} sx={{ mb: 3 }} />
      )}

      {isDraft && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This invoice is still in <strong>DRAFT</strong> status. Delivery challans can only be generated for <strong>ISSUED</strong> invoices.
        </Alert>
      )}

      {hasNoRemaining && (
        <Alert severity="info" sx={{ mb: 3 }}>
          All goods in invoice #{invoice?.invoice_number} have already been fully dispatched.
        </Alert>
      )}

      {invoice && !isDraft && (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Dispatch Meta Information */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Transport & Dispatch Details
              </Typography>
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    type="date"
                    label="Delivery Date"
                    fullWidth
                    size="small"
                    value={deliveryDate}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      if (errors.delivery_date) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.delivery_date;
                          return next;
                        });
                      }
                    }}
                    error={Boolean(errors.delivery_date)}
                    helperText={errors.delivery_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Delivered By (Driver / Courier)"
                    placeholder="e.g. Ramesh (Driver - TN09-1234)"
                    fullWidth
                    size="small"
                    value={deliveredBy}
                    onChange={(e) => {
                      setDeliveredBy(e.target.value);
                      if (errors.delivered_by) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.delivered_by;
                          return next;
                        });
                      }
                    }}
                    error={Boolean(errors.delivered_by)}
                    helperText={errors.delivered_by}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Received By (Recipient / Gate)"
                    placeholder="e.g. Security Gate #2 / Mr. Kumar"
                    fullWidth
                    size="small"
                    value={receivedBy}
                    onChange={(e) => {
                      setReceivedBy(e.target.value);
                      if (errors.received_by) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.received_by;
                          return next;
                        });
                      }
                    }}
                    error={Boolean(errors.received_by)}
                    helperText={errors.received_by}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Dispatch Items Table */}
          <SectionCard
            title="Dispatch Line Items"
            subheader="Specify the exact quantities loaded onto the transport vehicle."
          >
            {isDispatchLoading ? (
              <LoadingScreen message="Loading awaiting dispatch quantities..." />
            ) : dispatchError ? (
              <ApiErrorAlert error={parseApiError(dispatchError)} />
            ) : awaitingItems && awaitingItems.length > 0 ? (
              <DispatchLinesTable
                items={awaitingItems}
                quantities={quantities}
                onChangeQuantity={handleQuantityChange}
                errors={errors}
                disabled={hasNoRemaining}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No physical goods found in this invoice.
              </Typography>
            )}
          </SectionCard>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="inherit"
              disabled={isCreating}
              onClick={() => navigate(ROUTES.challans.list)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isCreating || hasNoRemaining}
            >
              Issue Delivery Challan
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ChallanCreatePage;
