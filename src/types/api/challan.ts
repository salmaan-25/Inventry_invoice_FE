import type { ItemType } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export interface ChallanItem {
  id: number;
  invoice_item: number;
  line_no: number;
  product: number;
  product_name: string;
  product_code: string;
  hsn_sac?: string;
  unit_name: string;
  item_type: ItemType;
  quantity: string;
}

export interface ChallanListItem {
  id: number;
  invoice: number;
  invoice_number: string;
  invoice_date: string;
  customer: number;
  customer_name: string;
  delivery_date: string;
  delivered_by: string;
  received_by: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface Challan extends ChallanListItem {
  items: ChallanItem[];
}

export interface CreateChallanItemInput {
  invoice_item: number;
  quantity: string;
}

export interface CreateChallanRequest {
  invoice: number;
  delivery_date: string;
  delivered_by: string;
  received_by: string;
  items: CreateChallanItemInput[];
}

export interface ChallanListParams extends PaginationParams, DateRangeParams {
  invoice?: number | string;
  customer?: number | string;
}
