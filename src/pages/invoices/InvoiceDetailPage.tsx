import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { ApiErrorAlert } from '../../components/feedback/ApiErrorAlert';
import { InvoiceStatusChip } from '../../components/invoices/InvoiceStatusChip';
import { PaymentStatusChip } from '../../components/common/PaymentStatusChip';
import { InvoiceActions } from '../../components/invoices/InvoiceActions';
import { InvoiceTotalsPanel } from '../../components/invoices/InvoiceTotalsPanel';
import { MoneyText } from '../../components/common/MoneyText';
import { DateText } from '../../components/common/DateText';
import { SectionCard } from '../../components/common/SectionCard';
import { useGetInvoiceQuery } from '../../store/api/invoicesApi';
import { parseApiError } from '../../utils/apiError';
import { ROUTES } from '../../constants/routes';
import { compareMoney } from '../../utils/money';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);

  const { data: invoice, isLoading, error, refetch } = useGetInvoiceQuery(invoiceId, {
    skip: !invoiceId,
  });

  const [issueError, setIssueError] = useState<string | undefined>();

  if (isLoading) {
    return <LoadingScreen message="Loading invoice..." />;
  }

  if (error || !invoice) {
    return <ApiErrorAlert error={error ? parseApiError(error) : 'Invoice not found'} />;
  }

  const isGst = invoice.invoice_type !== 'NON_GST';
  const hasAdvance = compareMoney(invoice.advance_amount || '0.00', '0.00') > 0;
  const hasDispatch = Boolean(
    invoice.motor_vehicle_no ||
    invoice.destination ||
    invoice.dispatched_through ||
    invoice.delivery_note ||
    invoice.payment_terms ||
    invoice.terms_of_delivery
  );

  return (
    <Box>
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        titleExtra={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={isGst ? 'GST INVOICE' : 'NON-GST INVOICE'}
              color={isGst ? 'primary' : 'default'}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <InvoiceStatusChip status={invoice.status} />
            <PaymentStatusChip status={invoice.payment_status} />
          </Stack>
        }
        subtitle={`Invoice Date: ${invoice.invoice_date}`}
        breadcrumbs={[
          { label: 'Invoices', path: ROUTES.invoices.list },
          { label: invoice.invoice_number },
        ]}
        action={
          <InvoiceActions
            invoice={invoice}
            onIssuedSuccess={() => {
              setIssueError(undefined);
              void refetch();
            }}
            onIssueError={(err) => setIssueError(err)}
          />
        }
      />

      {issueError && (
        <Box sx={{ mb: 3 }}>
          <ApiErrorAlert error={issueError} />
        </Box>
      )}

      {/* Snapshot Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Seller */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Seller (From)
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {invoice.business_snapshot?.name ?? 'Company Profile'}
              </Typography>
              {invoice.business_snapshot?.gstin && (
                <Typography variant="body2" color="text.secondary">
                  GSTIN: {invoice.business_snapshot.gstin}
                </Typography>
              )}
              {invoice.business_snapshot?.address && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {invoice.business_snapshot.address}
                </Typography>
              )}
              {invoice.business_snapshot?.state && (
                <Typography variant="body2" color="text.secondary">
                  State: {invoice.business_snapshot.state}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Buyer */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Buyer (Bill to)
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {invoice.customer_snapshot?.name ?? invoice.customer_name}
              </Typography>
              {invoice.customer_snapshot?.gstin && (
                <Typography variant="body2" color="text.secondary">
                  GSTIN: {invoice.customer_snapshot.gstin}
                </Typography>
              )}
              {invoice.customer_snapshot?.billing_address && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {invoice.customer_snapshot.billing_address}
                </Typography>
              )}
              {invoice.customer_snapshot?.state && (
                <Typography variant="body2" color="text.secondary">
                  State: {invoice.customer_snapshot.state}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Overview */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Invoice Overview
              </Typography>
              <Typography variant="body2">
                <strong>Invoice Date:</strong> <DateText value={invoice.invoice_date} />
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Created At:</strong> <DateText value={invoice.created_at} />
              </Typography>
              {invoice.issued_at && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Issued At:</strong> <DateText value={invoice.issued_at} />
                  {invoice.issued_by_name && ` by ${invoice.issued_by_name}`}
                </Typography>
              )}
              {invoice.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <em>Note: {invoice.notes}</em>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transport & Delivery Details (if any) */}
      {hasDispatch && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Transport &amp; Delivery Details
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              {invoice.motor_vehicle_no && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Vehicle No.</Typography>
                  <Typography variant="body2" fontWeight={600}>{invoice.motor_vehicle_no}</Typography>
                </Grid>
              )}
              {invoice.dispatched_through && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Dispatched Through</Typography>
                  <Typography variant="body2">{invoice.dispatched_through}</Typography>
                </Grid>
              )}
              {invoice.destination && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Destination</Typography>
                  <Typography variant="body2">{invoice.destination}</Typography>
                </Grid>
              )}
              {invoice.delivery_note && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Delivery Note</Typography>
                  <Typography variant="body2">{invoice.delivery_note}</Typography>
                </Grid>
              )}
              {invoice.payment_terms && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Payment Terms</Typography>
                  <Typography variant="body2">{invoice.payment_terms}</Typography>
                </Grid>
              )}
              {invoice.terms_of_delivery && (
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Terms of Delivery</Typography>
                  <Typography variant="body2">{invoice.terms_of_delivery}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Line Items Table */}
      <SectionCard title="Invoice Items">
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
          }}
        >
          <Table size="small" sx={{ minWidth: isGst ? 850 : 700 }} aria-label="invoice items table">
            <TableHead sx={{ backgroundColor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ width: 40 }}>#</TableCell>
                <TableCell>Description of Goods</TableCell>
                <TableCell>HSN/SAC</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Rate (₹)</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                {isGst && (
                  <>
                    <TableCell align="right">CGST (₹)</TableCell>
                    <TableCell align="right">SGST (₹)</TableCell>
                  </>
                )}
                <TableCell align="right">Line Total (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id} hover sx={{ verticalAlign: 'top' }}>
                  <TableCell>{item.line_no}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'pre-line' }}>
                      {item.description || item.product_name}
                    </Typography>
                    {isGst && item.gst_rate && (
                      <Typography variant="caption" color="text.secondary">
                        GST Rate: {item.gst_rate}%
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.hsn_sac || '—'}</TableCell>
                  <TableCell>{item.unit_name || 'PCS'}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    <MoneyText amount={item.rate} />
                  </TableCell>
                  <TableCell align="right">
                    <MoneyText amount={item.line_total} />
                  </TableCell>
                  {isGst && (
                    <>
                      <TableCell align="right">
                        <MoneyText amount={item.cgst_amount} />
                      </TableCell>
                      <TableCell align="right">
                        <MoneyText amount={item.sgst_amount} />
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <MoneyText amount={isGst ? (item as unknown as { line_grand_total?: string }).line_grand_total ?? item.line_total : item.line_total} fontWeight={600} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals & Payment Summary */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-start' },
            gap: 3,
            mt: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              maxWidth: { xs: '100%', md: 380 },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Invoiced:
                  </Typography>
                  <MoneyText amount={invoice.grand_total} fontWeight={600} />
                </Box>

                {hasAdvance && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      Advance Paid:
                    </Typography>
                    <MoneyText amount={invoice.advance_amount} color="primary.main" fontWeight={600} />
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Paid to Date:
                  </Typography>
                  <MoneyText amount={invoice.paid_amount} color="success.main" fontWeight={600} />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Balance Due:
                  </Typography>
                  <MoneyText
                    amount={invoice.balance_due}
                    variant="h6"
                    fontWeight={700}
                    color={compareMoney(invoice.balance_due, '0.00') > 0 ? 'error.main' : 'success.main'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <InvoiceTotalsPanel
            calculation={{
              is_gst: isGst,
              invoice_type: invoice.invoice_type,
              subtotal: invoice.subtotal,
              cgst_amount: invoice.total_cgst,
              sgst_amount: invoice.total_sgst,
              total_tax: invoice.total_tax,
              round_off: invoice.round_off,
              grand_total: invoice.grand_total,
              advance_amount: invoice.advance_amount,
              balance_amount: invoice.balance_amount,
              lines: [],
            }}
            invoiceType={invoice.invoice_type}
            advanceAmount={invoice.advance_amount}
            balanceAmount={invoice.balance_amount}
          />
        </Box>
      </SectionCard>
    </Box>
  );
};

export default InvoiceDetailPage;
