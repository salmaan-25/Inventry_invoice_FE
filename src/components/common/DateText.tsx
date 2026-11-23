import React from 'react';
import { Typography, type TypographyProps } from '@mui/material';
import { formatDate, formatDateTime } from '../../utils/format';

export interface DateTextProps extends Omit<TypographyProps, 'children'> {
  value: string | undefined | null;
  includeTime?: boolean;
}

export const DateText: React.FC<DateTextProps> = ({
  value,
  includeTime = false,
  variant = 'body2',
  ...props
}) => {
  return (
    <Typography variant={variant} component="span" {...props}>
      {includeTime ? formatDateTime(value) : formatDate(value)}
    </Typography>
  );
};
