import React from 'react';
import { StatusChip } from '../common/StatusChip';
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
  type InvoiceStatus,
} from '../../constants/enums';

export interface InvoiceStatusChipProps {
  status: InvoiceStatus;
}

export const InvoiceStatusChip: React.FC<InvoiceStatusChipProps> = ({ status }) => {
  return (
    <StatusChip
      label={INVOICE_STATUS_LABEL[status] ?? status}
      color={INVOICE_STATUS_COLOR[status] ?? 'default'}
    />
  );
};
