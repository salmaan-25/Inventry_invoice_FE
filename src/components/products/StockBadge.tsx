import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { formatQuantity } from '../../utils/format';
import { ITEM_TYPE, type ItemType } from '../../constants/enums';

export interface StockBadgeProps {
  itemType: ItemType;
  currentStock?: string;
  isLowStock?: boolean;
  unitName?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  itemType,
  currentStock,
  isLowStock = false,
  unitName,
}) => {
  if (itemType === ITEM_TYPE.SERVICE) {
    return (
      <Chip
        label="N/A (Service)"
        size="small"
        variant="outlined"
        sx={{ color: 'text.secondary', borderColor: 'divider', fontSize: '0.75rem' }}
      />
    );
  }

  const formattedQty = formatQuantity(currentStock, unitName);

  if (isLowStock) {
    return (
      <Tooltip title="Low stock warning: inventory is at or below reorder level">
        <Chip
          icon={<WarningAmberIcon fontSize="small" />}
          label={formattedQty}
          size="small"
          color="warning"
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      </Tooltip>
    );
  }

  return (
    <Box component="span" sx={{ fontWeight: 500 }}>
      {formattedQty}
    </Box>
  );
};
