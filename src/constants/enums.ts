export const ROLE = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_LABEL: Record<Role, string> = {
  [ROLE.ADMIN]: 'Administrator',
  [ROLE.STAFF]: 'Staff',
};

export const ITEM_TYPE = {
  GOODS: 'GOODS',
  GOODS_HARDWARE: 'GOODS_HARDWARE',
  SERVICE: 'SERVICE',
} as const;
export type ItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE];

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  [ITEM_TYPE.GOODS]: 'Goods',
  [ITEM_TYPE.GOODS_HARDWARE]: 'Hardware Goods',
  [ITEM_TYPE.SERVICE]: 'Service',
};

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
} as const;
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  [INVOICE_STATUS.DRAFT]: 'Draft',
  [INVOICE_STATUS.ISSUED]: 'Issued',
};

export const INVOICE_STATUS_COLOR: Record<
  InvoiceStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [INVOICE_STATUS.DRAFT]: 'warning',
  [INVOICE_STATUS.ISSUED]: 'success',
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
} as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.UNPAID]: 'Unpaid',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'Partially Paid',
  [PAYMENT_STATUS.PAID]: 'Paid',
};

export const PAYMENT_STATUS_COLOR: Record<
  PaymentStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [PAYMENT_STATUS.UNPAID]: 'error',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'warning',
  [PAYMENT_STATUS.PAID]: 'success',
};

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  CHEQUE: 'CHEQUE',
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer (NEFT/RTGS/IMPS)',
  [PAYMENT_METHOD.UPI]: 'UPI',
  [PAYMENT_METHOD.CHEQUE]: 'Cheque',
};

export const MOVEMENT_TYPE = {
  OPENING_STOCK: 'OPENING_STOCK',
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;
export type MovementType = (typeof MOVEMENT_TYPE)[keyof typeof MOVEMENT_TYPE];

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  [MOVEMENT_TYPE.OPENING_STOCK]: 'Opening Stock',
  [MOVEMENT_TYPE.STOCK_IN]: 'Stock In',
  [MOVEMENT_TYPE.STOCK_OUT]: 'Stock Out',
  [MOVEMENT_TYPE.ADJUSTMENT]: 'Adjustment',
};

export const MOVEMENT_TYPE_COLOR: Record<
  MovementType,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [MOVEMENT_TYPE.OPENING_STOCK]: 'info',
  [MOVEMENT_TYPE.STOCK_IN]: 'success',
  [MOVEMENT_TYPE.STOCK_OUT]: 'warning',
  [MOVEMENT_TYPE.ADJUSTMENT]: 'default',
};
