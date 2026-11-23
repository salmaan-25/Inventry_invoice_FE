import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  Stack,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';

import { CustomerPicker } from '../customers/CustomerPicker';
import { CustomerFormDialog } from '../customers/CustomerFormDialog';
import { InvoiceLineEditor } from './InvoiceLineEditor';
import { InvoiceTotalsPanel } from './InvoiceTotalsPanel';
import { ApiErrorAlert } from '../feedback/ApiErrorAlert';
import { useNotify } from '../../hooks/useNotify';
import { useDebounce } from '../../hooks/useDebounce';
import { useCalculateInvoiceMutation } from '../../store/api/invoicesApi';
import { invoiceFormSchema } from '../../schemas/invoice';
import { ROUTES } from '../../constants/routes';
import { compareMoney, toFixed2, toFixed3 } from '../../utils/money';
import type { Customer } from '../../types/api/customer';
import type {
  InvoiceLineInput,
  InvoiceCalculation,
  CreateInvoiceRequest,
  InvoiceType,
} from '../../types/api/invoice';

export interface InvoiceFormProps {
  initialValues?: {
    invoice_number?: string;
    customer?: number;
    customerObj?: Customer;
    invoice_date?: string;
    invoice_type?: InvoiceType;
    advance_amount?: string;
    notes?: string;
    lines?: InvoiceLineInput[];

    // Transport
    delivery_note?: string;
    payment_terms?: string;
    reference_no_date?: string;
    other_references?: string;
    delivery_note_date?: string | null;
    dispatched_through?: string;
    destination?: string;
    motor_vehicle_no?: string;
    terms_of_delivery?: string;
  };
  onSubmit: (data: CreateInvoiceRequest) => Promise<void>;
  isLoading?: boolean;
  serverError?: string;
  submitLabel?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  serverError,
  submitLabel = 'Save Invoice',
}) => {
  const navigate = useNavigate();
  const { notifyError } = useNotify();

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    initialValues?.invoice_number ?? ''
  );

  const [customer, setCustomer] = useState<Customer | undefined>(
    initialValues?.customerObj
  );
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialValues?.invoice_date ?? new Date().toISOString().split('T')[0] ?? ''
  );

  const [invoiceType, setInvoiceType] = useState<InvoiceType>(
    initialValues?.invoice_type ?? 'GST'
  );

  const [advanceAmount, setAdvanceAmount] = useState<string>(
    initialValues?.advance_amount ?? '0.00'
  );

  const [notes, setNotes] = useState<string>(initialValues?.notes ?? '');

  // Dispatch details (clean & essential)
  const [deliveryNote, setDeliveryNote] = useState<string>(initialValues?.delivery_note ?? '');
  const [deliveryNoteDate, setDeliveryNoteDate] = useState<string>(initialValues?.delivery_note_date ?? '');
  const [paymentTerms, setPaymentTerms] = useState<string>(initialValues?.payment_terms ?? '');
  const [motorVehicleNo, setMotorVehicleNo] = useState<string>(initialValues?.motor_vehicle_no ?? '');
  const [dispatchedThrough, setDispatchedThrough] = useState<string>(initialValues?.dispatched_through ?? '');
  const [destination, setDestination] = useState<string>(initialValues?.destination ?? '');
  const [referenceNoDate, setReferenceNoDate] = useState<string>(initialValues?.reference_no_date ?? '');
  const [otherReferences, setOtherReferences] = useState<string>(initialValues?.other_references ?? '');
  const [termsOfDelivery, setTermsOfDelivery] = useState<string>(initialValues?.terms_of_delivery ?? '');

  const [transportExpanded, setTransportExpanded] = useState<boolean>(
    Boolean(
      initialValues?.payment_terms ||
      initialValues?.motor_vehicle_no ||
      initialValues?.dispatched_through ||
      initialValues?.destination ||
      initialValues?.delivery_note
    )
  );

  const [lines, setLines] = useState<InvoiceLineInput[]>(
    initialValues?.lines && initialValues.lines.length > 0
      ? initialValues.lines
      : [
          {
            product: null,
            product_name: '',
            description: '',
            hsn_sac: '',
            unit_name: 'PCS',
            gst_rate: '18',
            quantity: '1.000',
            rate: '0.00',
          },
        ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculation, setCalculation] = useState<InvoiceCalculation | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const [calculateInvoice, { isLoading: isCalculating }] = useCalculateInvoiceMutation();

  const debouncedLines = useDebounce(lines, 350);
  const debouncedCustomerId = useDebounce(customer?.id, 350);
  const debouncedInvoiceType = useDebounce(invoiceType, 350);
  const debouncedAdvance = useDebounce(advanceAmount, 350);

  useEffect(() => {
    const validLines = debouncedLines.filter(
      (line) =>
        (line.description || line.product_name || (line.product && line.product > 0)) &&
        compareMoney(line.quantity, '0') > 0
    );

    if (validLines.length === 0) {
      setCalculation(null);
      setCalcError(null);
      return;
    }

    let isMounted = true;

    calculateInvoice({
      customer: debouncedCustomerId,
      invoice_type: debouncedInvoiceType,
      advance_amount: debouncedAdvance || '0.00',
      lines: validLines.map((line) => ({
        product: line.product,
        product_name: line.product_name,
        description: line.description,
        hsn_sac: line.hsn_sac,
        unit_name: line.unit_name,
        gst_rate: debouncedInvoiceType === 'NON_GST' ? '0' : line.gst_rate,
        quantity: toFixed3(line.quantity || '1.000'),
        rate: toFixed2(line.rate || '0.00'),
      })),
    })
      .unwrap()
      .then((res) => {
        if (isMounted) {
          setCalculation(res);
          setCalcError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const detail = (err as { data?: { detail?: string } })?.data?.detail;
          setCalcError(detail || null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedLines, debouncedCustomerId, debouncedInvoiceType, debouncedAdvance, calculateInvoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedLines = lines
      .filter((line) => line.description || line.product_name || (line.product && line.product > 0))
      .map((line) => ({
        product: line.product || null,
        product_name: line.product_name || line.description?.split('\n')[0] || 'Item',
        description: line.description || line.product_name || '',
        hsn_sac: line.hsn_sac || '',
        unit_name: line.unit_name || 'PCS',
        gst_rate: invoiceType === 'NON_GST' ? '0' : line.gst_rate || '0',
        quantity: toFixed3(line.quantity || '1.000'),
        rate: toFixed2(line.rate || '0.00'),
      }));

    if (formattedLines.length === 0) {
      const msg = 'Please enter at least one line item with a description and quantity.';
      setErrors({ lines: msg });
      notifyError(msg);
      return;
    }

    const result = invoiceFormSchema.safeParse({
      invoice_number: invoiceNumber || undefined,
      customer: customer?.id ?? 0,
      invoice_date: invoiceDate,
      invoice_type: invoiceType,
      advance_amount: advanceAmount || '0.00',
      notes: notes || undefined,
      delivery_note: deliveryNote || undefined,
      delivery_note_date: deliveryNoteDate || null,
      payment_terms: paymentTerms,
      motor_vehicle_no: motorVehicleNo || undefined,
      dispatched_through: dispatchedThrough || undefined,
      destination: destination || undefined,
      reference_no_date: referenceNoDate || undefined,
      other_references: otherReferences || undefined,
      terms_of_delivery: termsOfDelivery || undefined,
      lines: formattedLines,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      if (fieldErrors.payment_terms) {
        setTransportExpanded(true);
      }
      notifyError('Please check the highlighted errors in the form.');
      return;
    }

    setErrors({});
    await onSubmit({
      invoice_number: invoiceNumber.trim() || undefined,
      customer: customer!.id,
      invoice_date: invoiceDate,
      invoice_type: invoiceType,
      advance_amount: toFixed2(advanceAmount || '0.00'),
      notes: notes.trim() || undefined,
      delivery_note: deliveryNote.trim() || undefined,
      delivery_note_date: deliveryNoteDate || null,
      payment_terms: paymentTerms.trim(),
      motor_vehicle_no: motorVehicleNo.trim() || undefined,
      dispatched_through: dispatchedThrough.trim() || undefined,
      destination: destination.trim() || undefined,
      reference_no_date: referenceNoDate.trim() || undefined,
      other_references: otherReferences.trim() || undefined,
      terms_of_delivery: termsOfDelivery.trim() || undefined,
      lines: formattedLines,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Prominent Error Banner */}
      {serverError && (
        <Box sx={{ mb: 3 }}>
          <ApiErrorAlert error={serverError} />
        </Box>
      )}

      {calcError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Calculation Notice: {calcError}
        </Alert>
      )}

      {/* Primary Details Card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              mb: 2.5,
              pb: 1.5,
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Invoice Setup &amp; Customer
              </Typography>
            </Box>
            <RadioGroup
              row
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
            >
              <FormControlLabel
                value="GST"
                control={<Radio size="small" />}
                label={<Typography variant="body2" fontWeight={600}>GST Invoice (Tax Calculated)</Typography>}
              />
              <FormControlLabel
                value="NON_GST"
                control={<Radio size="small" />}
                label={<Typography variant="body2" fontWeight={600}>Non-GST Invoice (No Tax)</Typography>}
              />
            </RadioGroup>
          </Box>

          <Grid container spacing={2.5}>
            {/* Invoice Number */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Invoice No. (Optional)"
                fullWidth
                size="small"
                placeholder="e.g. 109/2026-27"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                helperText="Custom invoice number. Leave blank to auto-generate."
              />
            </Grid>

            {/* Customer Picker */}
            <Grid item xs={12} md={5}>
              <CustomerPicker
                value={customer}
                valueId={initialValues?.customer}
                onAddNew={() => setCreateCustomerOpen(true)}
                onChange={(cust) => {
                  setCustomer(cust);
                  if (errors.customer) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.customer;
                      return next;
                    });
                  }
                }}
                error={Boolean(errors.customer)}
                helperText={errors.customer}
              />
            </Grid>

            {/* Invoice Date */}
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="Invoice Date"
                fullWidth
                size="small"
                value={invoiceDate}
                onChange={(e) => {
                  setInvoiceDate(e.target.value);
                  if (errors.invoice_date) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.invoice_date;
                      return next;
                    });
                  }
                }}
                error={Boolean(errors.invoice_date)}
                helperText={errors.invoice_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Advance Amount */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Advance Paid by Client (₹)"
                fullWidth
                size="small"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                onBlur={(e) => setAdvanceAmount(toFixed2(e.target.value || '0.00'))}
                placeholder="0.00"
                helperText="Enter advance amount if client already paid; leave 0.00 if none."
              />
            </Grid>

            {/* Terms / Notes */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Terms / Notes (Optional)"
                fullWidth
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Goods once sold cannot be returned. Payment due within 15 days."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Line Items Editor */}
      {errors.lines && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{errors.lines}</Alert>
        </Box>
      )}

      <InvoiceLineEditor
        lines={lines}
        calculationLines={calculation?.lines}
        invoiceType={invoiceType}
        onChange={(newLines) => {
          setLines(newLines);
          if (errors.lines) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.lines;
              return next;
            });
          }
        }}
      />

      {/* Transport & Delivery Metadata Accordion */}
      <Accordion
        variant="outlined"
        sx={{ mb: 3 }}
        expanded={transportExpanded}
        onChange={(_, isExpanded) => setTransportExpanded(isExpanded)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="action" />
            <Typography variant="subtitle1" fontWeight={600}>
              Transport &amp; Delivery Details
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Motor Vehicle No."
                fullWidth
                size="small"
                placeholder="e.g. TN09AX0567"
                value={motorVehicleNo}
                onChange={(e) => setMotorVehicleNo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Dispatched Through"
                fullWidth
                size="small"
                placeholder="e.g. Road / VRL Logistics"
                value={dispatchedThrough}
                onChange={(e) => setDispatchedThrough(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Destination"
                fullWidth
                size="small"
                placeholder="e.g. KELAMBAKKAM"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Delivery Note"
                fullWidth
                size="small"
                placeholder="e.g. DN-104"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Delivery Note Date"
                type="date"
                fullWidth
                size="small"
                value={deliveryNoteDate}
                onChange={(e) => setDeliveryNoteDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Mode / Terms of Payment"
                required
                fullWidth
                size="small"
                placeholder="e.g. Immediate / 15 Days / Cash / Cheque"
                value={paymentTerms}
                onChange={(e) => {
                  setPaymentTerms(e.target.value);
                  if (errors.payment_terms) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.payment_terms;
                      return next;
                    });
                  }
                }}
                error={Boolean(errors.payment_terms)}
                helperText={errors.payment_terms}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Reference No. &amp; Date"
                fullWidth
                size="small"
                placeholder="e.g. REF-2026/01"
                value={referenceNoDate}
                onChange={(e) => setReferenceNoDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Other References"
                fullWidth
                size="small"
                placeholder="e.g. ORD-992"
                value={otherReferences}
                onChange={(e) => setOtherReferences(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Terms of Delivery"
                fullWidth
                size="small"
                placeholder="e.g. Door delivery as agreed"
                value={termsOfDelivery}
                onChange={(e) => setTermsOfDelivery(e.target.value)}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Totals Preview Panel */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <InvoiceTotalsPanel
          calculation={calculation}
          invoiceType={invoiceType}
          advanceAmount={advanceAmount}
          balanceAmount={calculation?.balance_amount}
          isLoading={isCalculating}
        />
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          color="inherit"
          disabled={isLoading}
          onClick={() => navigate(ROUTES.invoices.list)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={isLoading}
        >
          {submitLabel}
        </Button>
      </Stack>

      <CustomerFormDialog
        open={createCustomerOpen}
        onClose={() => setCreateCustomerOpen(false)}
        onSuccess={(newCustomer) => {
          setCustomer(newCustomer);
          if (errors.customer) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.customer;
              return next;
            });
          }
        }}
      />
    </Box>
  );
};
