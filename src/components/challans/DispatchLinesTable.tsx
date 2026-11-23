import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { toFixed3, compareMoney } from '../../utils/money';
import type { AwaitingDispatchItem } from '../../types/api/invoice';

export interface DispatchLinesTableProps {
  items: AwaitingDispatchItem[];
  quantities: Record<number, string>;
  onChangeQuantity: (invoiceItemId: number, quantity: string) => void;
  errors?: Record<number, string>;
  disabled?: boolean;
}

export const DispatchLinesTable: React.FC<DispatchLinesTableProps> = ({
  items,
  quantities,
  onChangeQuantity,
  errors = {},
  disabled = false,
}) => {
  const handleQuantityBlur = (item: AwaitingDispatchItem, val: string) => {
    const formatted = toFixed3(val || '0.000');
    onChangeQuantity(item.invoice_item_id, formatted);
  };

  const handleSetMax = (item: AwaitingDispatchItem) => {
    onChangeQuantity(item.invoice_item_id, item.remaining_quantity);
  };

  const handleSetZero = (item: AwaitingDispatchItem) => {
    onChangeQuantity(item.invoice_item_id, '0.000');
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="dispatch lines table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 40 }}>#</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Product / Goods</TableCell>
            <TableCell sx={{ width: 90 }}>Unit</TableCell>
            <TableCell align="right" sx={{ width: 120 }}>Invoiced Qty</TableCell>
            <TableCell align="right" sx={{ width: 130 }}>Already Dispatched</TableCell>
            <TableCell align="right" sx={{ width: 130 }}>Remaining Qty</TableCell>
            <TableCell align="right" sx={{ width: 160 }}>Dispatch Now</TableCell>
            {!disabled && <TableCell align="center" sx={{ width: 110 }}>Quick Fill</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const currentQty = quantities[item.invoice_item_id] ?? item.remaining_quantity;
            const isExceeded = compareMoney(currentQty, item.remaining_quantity) > 0;
            const errorText = errors[item.invoice_item_id] || (isExceeded ? 'Exceeds remaining' : undefined);

            return (
              <TableRow key={item.invoice_item_id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.product_name}
                  </Typography>
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell align="right">{item.invoiced_quantity}</TableCell>
                <TableCell align="right">{item.already_dispatched}</TableCell>
                <TableCell align="right">
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 600,
                      color: compareMoney(item.remaining_quantity, '0') > 0 ? 'warning.main' : 'text.disabled',
                    }}
                  >
                    {item.remaining_quantity}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    disabled={disabled || compareMoney(item.remaining_quantity, '0') <= 0}
                    value={currentQty}
                    onChange={(e) => onChangeQuantity(item.invoice_item_id, e.target.value)}
                    onBlur={(e) => handleQuantityBlur(item, e.target.value)}
                    error={Boolean(errorText)}
                    helperText={errorText}
                    inputProps={{
                      inputMode: 'decimal',
                      style: { textAlign: 'right' },
                    }}
                  />
                </TableCell>
                {!disabled && (
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleSetMax(item)}
                        disabled={compareMoney(item.remaining_quantity, '0') <= 0}
                        sx={{ minWidth: 40, p: 0.5, fontSize: '0.75rem' }}
                      >
                        Max
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        color="inherit"
                        onClick={() => handleSetZero(item)}
                        sx={{ minWidth: 30, p: 0.5, fontSize: '0.75rem' }}
                      >
                        0
                      </Button>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
