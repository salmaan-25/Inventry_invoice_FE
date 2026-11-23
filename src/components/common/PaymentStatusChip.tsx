import React from 'react';
import { StatusChip } from './StatusChip';
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_COLOR,
  type PaymentStatus,
} from '../../constants/enums';

export interface PaymentStatusChipProps {
  status: PaymentStatus;
}

export const PaymentStatusChip: React.FC<PaymentStatusChipProps> = ({ status }) => {
  return (
    <StatusChip
      label={PAYMENT_STATUS_LABEL[status] ?? status}
      color={PAYMENT_STATUS_COLOR[status] ?? 'default'}
    />
  );
};
