export const API_TAGS = {
  AUTH: 'Auth',
  STAFF: 'Staff',
  COMPANY: 'Company',
  CUSTOMER: 'Customer',
  CUSTOMER_STATEMENT: 'CustomerStatement',
  OPEN_INVOICES: 'OpenInvoices',
  PRODUCT: 'Product',
  UNIT: 'Unit',
  STOCK_MOVEMENT: 'StockMovement',
  INVOICE: 'Invoice',
  AWAITING_DISPATCH: 'AwaitingDispatch',
  CHALLAN: 'Challan',
  PAYMENT: 'Payment',
  EXPENSE: 'Expense',
  EXPENSE_CATEGORY: 'ExpenseCategory',
  INCOME: 'Income',
  INCOME_CATEGORY: 'IncomeCategory',
  DASHBOARD: 'Dashboard',
} as const;

export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];

export const ALL_API_TAGS: readonly ApiTag[] = Object.values(API_TAGS);
