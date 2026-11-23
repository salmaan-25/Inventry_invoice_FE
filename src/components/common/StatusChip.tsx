import React from 'react';
import { Chip, type ChipProps } from '@mui/material';

export interface StatusChipProps {
  label: string;
  color?: ChipProps['color'];
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  color = 'default',
  size = 'small',
}) => {
  return (
    <Chip
      label={label}
      color={color}
      size={size}
      sx={{ fontWeight: 500, fontSize: '0.75rem' }}
    />
  );
};
