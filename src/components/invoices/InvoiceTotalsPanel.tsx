import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Stack } from '@mui/material';
import { MoneyText } from '../common/MoneyText';
import type { InvoiceCalculation, InvoiceType } from '../../types/api/invoice';
import { compareMoney } from '../../utils/money';

export interface InvoiceTotalsPanelProps {
  calculation?: InvoiceCalculation | null;
  invoiceType?: InvoiceType;
  advanceAmount?: string;
  balanceAmount?: string;
  isLoading?: boolean;
}

export const InvoiceTotalsPanel: React.FC<InvoiceTotalsPanelProps> = ({
  calculation,
  invoiceType = 'GST',
  advanceAmount,
  balanceAmount,
  isLoading = false,
}) => {
  const isGst = (calculation?.is_gst ?? (invoiceType === 'GST')) && invoiceType !== 'NON_GST';
  const advance = advanceAmount ?? calculation?.advance_amount ?? '0.00';
  const balance = balanceAmount ?? calculation?.balance_amount ?? calculation?.grand_total ?? '0.00';
  const hasAdvance = compareMoney(advance, '0.00') > 0;

  return (
    <Card variant="outlined" sx={{ minWidth: 280, maxWidth: 360, ml: 'auto' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Invoice Summary {isLoading && '(Calculating...)'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal:
            </Typography>
            <MoneyText amount={calculation?.subtotal ?? '0.00'} />
          </Box>

          {isGst && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  CGST:
                </Typography>
                <MoneyText amount={calculation?.cgst_amount ?? '0.00'} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  SGST:
                </Typography>
                <MoneyText amount={calculation?.sgst_amount ?? '0.00'} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Tax:
                </Typography>
                <MoneyText amount={calculation?.total_tax ?? '0.00'} />
              </Box>
            </>
          )}

          {calculation?.round_off && calculation.round_off !== '0.00' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Round Off:
              </Typography>
              <MoneyText amount={calculation.round_off} />
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Grand Total:
            </Typography>
            <MoneyText
              amount={calculation?.grand_total ?? '0.00'}
              variant="h6"
              fontWeight={700}
              color="primary.main"
            />
          </Box>

          {hasAdvance && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  Advance Paid:
                </Typography>
                <MoneyText amount={advance} color="primary.main" fontWeight={600} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} color="error.main">
                  Balance Amount:
                </Typography>
                <MoneyText
                  amount={balance}
                  variant="subtitle1"
                  fontWeight={700}
                  color="error.main"
                />
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
