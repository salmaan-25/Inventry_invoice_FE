import React from 'react';
import { Typography, type TypographyProps } from '@mui/material';
import { formatCurrency } from '../../utils/format';

export interface MoneyTextProps extends Omit<TypographyProps, 'children'> {
  amount: string | number | undefined | null;
}

export const MoneyText: React.FC<MoneyTextProps> = ({
  amount,
  variant = 'body2',
  ...props
}) => {
  return (
    <Typography variant={variant} component="span" {...props}>
      {formatCurrency(amount)}
    </Typography>
  );
};
