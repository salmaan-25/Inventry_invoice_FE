import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InventoryIcon from '@mui/icons-material/Inventory';

import { ProductPicker } from '../products/ProductPicker';
import { MoneyText } from '../common/MoneyText';
import { toFixed2, toFixed3, multiplyMoney } from '../../utils/money';
import type { InvoiceLineInput, CalculationLine, InvoiceType } from '../../types/api/invoice';
import type { Product } from '../../types/api/product';

const COMMON_UNITS = ['PCS', 'CBM', 'SQFT', 'NOS', 'KGS', 'BOX', 'MTR', 'TON', 'SET'];
const GST_RATES = ['0', '5', '12', '18', '28'];

export interface InvoiceLineEditorProps {
  lines: InvoiceLineInput[];
  calculationLines?: CalculationLine[];
  invoiceType?: InvoiceType;
  onChange: (newLines: InvoiceLineInput[]) => void;
  disabled?: boolean;
}

export const InvoiceLineEditor: React.FC<InvoiceLineEditorProps> = ({
  lines,
  calculationLines = [],
  invoiceType = 'GST',
  onChange,
  disabled = false,
}) => {
  const [catalogPickerIndex, setCatalogPickerIndex] = useState<number | null>(null);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | undefined>();

  const isGst = invoiceType === 'GST';

  const handleAddLine = () => {
    onChange([
      ...lines,
      {
        product: null,
        product_name: '',
        description: '',
        hsn_sac: '',
        unit_name: 'PCS',
        gst_rate: isGst ? '18' : '0',
        quantity: '1.000',
        rate: '0.00',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    const updated = lines.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const updateLineField = <K extends keyof InvoiceLineInput>(
    index: number,
    field: K,
    val: InvoiceLineInput[K]
  ) => {
    const updated = [...lines];
    const target = updated[index];
    if (!target) return;
    target[field] = val;
    onChange(updated);
  };

  const handleApplyCatalogProduct = () => {
    if (catalogPickerIndex !== null && selectedCatalogProduct) {
      const updated = [...lines];
      const target = updated[catalogPickerIndex];
      if (target) {
        target.product = selectedCatalogProduct.id;
        target.product_name = selectedCatalogProduct.name;
        target.description = selectedCatalogProduct.name;
        target.hsn_sac = selectedCatalogProduct.hsn_sac || '';
        target.unit_name = selectedCatalogProduct.unit_name || 'PCS';
        target.rate = toFixed2(selectedCatalogProduct.selling_price || '0.00');
        if (isGst && selectedCatalogProduct.gst_rate) {
          target.gst_rate = String(selectedCatalogProduct.gst_rate);
        }
      }
      onChange(updated);
    }
    setCatalogPickerIndex(null);
    setSelectedCatalogProduct(undefined);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" fontWeight={600}>
          Invoice Line Items
        </Typography>
        {!disabled && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddLine}
          >
            Add Line Item
          </Button>
        )}
      </Box>

      {/* Spacious TableContainer with explicit minWidth so columns never squash */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', borderRadius: 2 }}>
        <Table size="small" sx={{ minWidth: isGst ? 1040 : 920 }} aria-label="invoice lines editor table">
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ width: 40, minWidth: 40, py: 1.5, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ minWidth: 280, py: 1.5 }}>Description of Goods</TableCell>
              <TableCell sx={{ width: 120, minWidth: 110, py: 1.5 }}>HSN/SAC</TableCell>
              <TableCell sx={{ width: 110, minWidth: 100, py: 1.5, textAlign: 'right' }}>Quantity</TableCell>
              <TableCell sx={{ width: 105, minWidth: 95, py: 1.5 }}>Unit</TableCell>
              <TableCell sx={{ width: 130, minWidth: 120, py: 1.5, textAlign: 'right' }}>Rate (₹)</TableCell>
              {isGst && <TableCell sx={{ width: 100, minWidth: 90, py: 1.5 }}>GST %</TableCell>}
              <TableCell align="right" sx={{ width: 130, minWidth: 120, py: 1.5 }}>Amount (₹)</TableCell>
              {!disabled && <TableCell align="center" sx={{ width: 80, minWidth: 80, py: 1.5 }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isGst ? (disabled ? 7 : 8) : (disabled ? 6 : 7)} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No line items added yet. Click &quot;Add Line Item&quot; to begin.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, idx) => {
                const calcLine = calculationLines[idx];
                const fallbackTotal = multiplyMoney(line.quantity || '0', line.rate || '0');
                const lineTotal = calcLine?.line_total ?? fallbackTotal;

                return (
                  <TableRow key={idx} hover sx={{ verticalAlign: 'top' }}>
                    <TableCell sx={{ pt: 2, textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                      {idx + 1}
                    </TableCell>

                    {/* Description of Goods (Spacious multi-line field) */}
                    <TableCell sx={{ minWidth: 280 }}>
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={5}
                        placeholder="e.g. IMPORTED TEAK SAWN SIZES&#10;5X4&#10;259 PCS"
                        disabled={disabled}
                        value={line.description ?? line.product_name ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...lines];
                          const target = updated[idx];
                          if (target) {
                            target.description = val;
                            target.product_name = val.split('\n')[0] || val;
                            onChange(updated);
                          }
                        }}
                      />
                    </TableCell>

                    {/* HSN / SAC */}
                    <TableCell sx={{ width: 120, minWidth: 110 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="HSN/SAC"
                        disabled={disabled}
                        value={line.hsn_sac ?? ''}
                        onChange={(e) => updateLineField(idx, 'hsn_sac', e.target.value)}
                      />
                    </TableCell>

                    {/* Quantity */}
                    <TableCell sx={{ width: 110, minWidth: 100 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="text"
                        disabled={disabled}
                        value={line.quantity}
                        onChange={(e) => updateLineField(idx, 'quantity', e.target.value)}
                        onBlur={(e) => updateLineField(idx, 'quantity', toFixed3(e.target.value || '1.000'))}
                        inputProps={{ style: { textAlign: 'right', fontWeight: 600 } }}
                      />
                    </TableCell>

                    {/* Unit */}
                    <TableCell sx={{ width: 105, minWidth: 95 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          disabled={disabled}
                          value={line.unit_name || 'PCS'}
                          onChange={(e) => updateLineField(idx, 'unit_name', e.target.value)}
                        >
                          {COMMON_UNITS.map((u) => (
                            <MenuItem key={u} value={u}>
                              {u}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    {/* Rate */}
                    <TableCell sx={{ width: 130, minWidth: 120 }}>
                      <TextField
                        size="small"
                        fullWidth
                        type="text"
                        disabled={disabled}
                        value={line.rate}
                        onChange={(e) => updateLineField(idx, 'rate', e.target.value)}
                        onBlur={(e) => updateLineField(idx, 'rate', toFixed2(e.target.value || '0.00'))}
                        inputProps={{ style: { textAlign: 'right', fontWeight: 600 } }}
                      />
                    </TableCell>

                    {/* GST Rate (%) */}
                    {isGst && (
                      <TableCell sx={{ width: 100, minWidth: 90 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            disabled={disabled}
                            value={String(line.gst_rate ?? '18')}
                            onChange={(e) => updateLineField(idx, 'gst_rate', e.target.value)}
                          >
                            {GST_RATES.map((r) => (
                              <MenuItem key={r} value={r}>
                                {r}%
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    )}

                    {/* Line Total */}
                    <TableCell align="right" sx={{ width: 130, minWidth: 120, pt: 1.5 }}>
                      <MoneyText amount={lineTotal} variant="body1" fontWeight={700} color="primary.main" />
                    </TableCell>

                    {/* Actions */}
                    {!disabled && (
                      <TableCell align="center" sx={{ width: 80, minWidth: 80, pt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Quick-fill from Catalog">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setCatalogPickerIndex(idx);
                                setSelectedCatalogProduct(undefined);
                              }}
                            >
                              <InventoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Item">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveLine(idx)}
                              disabled={lines.length <= 1}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Quick catalog product picker modal */}
      <Dialog
        open={catalogPickerIndex !== null}
        onClose={() => setCatalogPickerIndex(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quick-Fill from Product Catalog</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an existing product to automatically fill the description, HSN/SAC, unit, rate, and GST rate.
          </Typography>
          <ProductPicker
            value={selectedCatalogProduct}
            onChange={(p) => setSelectedCatalogProduct(p)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatalogPickerIndex(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedCatalogProduct}
            onClick={handleApplyCatalogProduct}
          >
            Apply to Row
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
