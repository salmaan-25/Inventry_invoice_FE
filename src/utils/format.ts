import dayjs from 'dayjs';
import { toFixed2, toFixed3 } from './money';

export function formatCurrency(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') {
    return '₹ 0.00';
  }
  const fixed = toFixed2(amount);
  const parts = fixed.split('.');
  const integerPart = parts[0] ?? '0';
  const decimalPart = parts[1] ?? '00';

  // Indian numbering format (e.g., 12,34,567.89)
  const isNegative = integerPart.startsWith('-');
  const cleanInt = isNegative ? integerPart.slice(1) : integerPart;

  const lastThree = cleanInt.slice(-3);
  const otherNumbers = cleanInt.slice(0, -3);
  const formattedInt =
    otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return `${isNegative ? '-' : ''}₹ ${formattedInt}.${decimalPart}`;
}

export function formatQuantity(
  qty: string | number | undefined | null,
  unitName?: string
): string {
  if (qty === undefined || qty === null || qty === '') {
    return unitName ? `0.000 ${unitName}` : '0.000';
  }
  const formatted = toFixed3(qty);
  return unitName ? `${formatted} ${unitName}` : formatted;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : dateStr;
}

export function formatDateTime(dateTimeStr: string | undefined | null): string {
  if (!dateTimeStr) return '-';
  const parsed = dayjs(dateTimeStr);
  return parsed.isValid() ? parsed.format('DD MMM YYYY, hh:mm A') : dateTimeStr;
}
