import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useNavigate } from 'react-router-dom';

import { SectionCard } from '../common/SectionCard';
import { useGetAwaitingDispatchQuery } from '../../store/api/invoicesApi';
import { ROUTES } from '../../constants/routes';
import { compareMoney } from '../../utils/money';

export interface AwaitingDispatchPanelProps {
  invoiceId: number;
}

export const AwaitingDispatchPanel: React.FC<AwaitingDispatchPanelProps> = ({
  invoiceId,
}) => {
  const navigate = useNavigate();
  const { data: dispatchItems, isLoading } = useGetAwaitingDispatchQuery(invoiceId);

  if (isLoading || !dispatchItems || dispatchItems.length === 0) {
    return null;
  }

  const hasRemainingDispatch = dispatchItems.some(
    (item) => compareMoney(item.remaining_quantity, '0') > 0
  );

  return (
    <SectionCard
      title="Awaiting Dispatch (Physical Goods Fulfillment)"
      subheader="Track dispatched and remaining quantities for delivery challan documentation."
      action={
        hasRemainingDispatch && (
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<LocalShippingIcon />}
            onClick={() => navigate(ROUTES.challans.new(invoiceId))}
          >
            Create Delivery Challan
          </Button>
        )
      }
    >
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="awaiting dispatch table">
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="right">Invoiced Qty</TableCell>
              <TableCell align="right">Already Dispatched</TableCell>
              <TableCell align="right">Remaining Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dispatchItems.map((item) => (
              <TableRow key={item.invoice_item_id} hover>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell align="right">{item.invoiced_quantity}</TableCell>
                <TableCell align="right">{item.already_dispatched}</TableCell>
                <TableCell align="right">
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 600,
                      color: compareMoney(item.remaining_quantity, '0') > 0 ? 'warning.main' : 'success.main',
                    }}
                  >
                    {item.remaining_quantity}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!hasRemainingDispatch && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1.5, fontWeight: 500 }}>
          ✓ All goods in this invoice have been completely dispatched.
        </Typography>
      )}
    </SectionCard>
  );
};
