import type { PaymentStatus } from '../../constants/enums';

export interface MonthSales {
  amount: string;
  invoice_count: number;
}

export interface StockSummary {
  tracked_product_count: number;
  low_stock_count: number;
}

export interface RecentInvoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  grand_total: string;
  payment_status: PaymentStatus;
}

export interface LowStockProduct {
  id: number;
  name: string;
  current_stock: string;
  reorder_level: string;
  unit: string;
}

export interface DashboardSummary {
  as_of: string;
  today_sales: string;
  month_sales: MonthSales;
  month_payments_received: string;
  outstanding_amount: string;
  stock: StockSummary;
  month_expenses: string;
  month_other_income: string;
  open_challans_to_dispatch: number;
  recent_invoices: RecentInvoice[];
  low_stock_products: LowStockProduct[];
}
