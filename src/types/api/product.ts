import type { ItemType, MovementType } from '../../constants/enums';
import type { PaginationParams, DateRangeParams } from './common';

export interface Unit {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  code: string;
  name: string;
  description: string | null;
  item_type: ItemType;
  unit: number;
  unit_name: string;
  selling_price: string;
  hsn_sac: string;
  gst_rate: string;
  reorder_level: string | null;
  current_stock: string | null;
  is_low_stock: boolean;
  is_active: boolean;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  item_type: ItemType;
  unit: number;
  unit_name: string;
  selling_price: string;
  hsn_sac: string;
  gst_rate: string;
  reorder_level?: string;
  current_stock?: string;
  is_low_stock: boolean;
  is_active: boolean;
}

export interface CreateProductRequest {
  name: string;
  code?: string;
  description?: string;
  item_type: ItemType;
  unit: number;
  selling_price: string;
  hsn_sac: string;
  gst_rate: string;
  reorder_level?: string;
  opening_stock?: string;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  description?: string;
  selling_price?: string;
  hsn_sac?: string;
  gst_rate?: string;
  reorder_level?: string;
  is_active?: boolean;
}

export interface ProductListParams extends PaginationParams {
  item_type?: ItemType;
  is_active?: boolean;
  low_stock?: boolean;
}

export interface StockInRequest {
  id: number;
  quantity: string;
  reason?: string;
}

export interface AdjustStockRequest {
  id: number;
  quantity_change: string;
  reason: string;
}

export interface StockMovementDto {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  movement_type: MovementType;
  quantity_change: string;
  balance_after: string;
  reason: string;
  invoice: number | null;
  created_by_name: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  movement_type: MovementType;
  quantity_change: string;
  balance_after: string;
  reason: string;
  invoice?: number;
  created_by_name: string;
  created_at: string;
}

export interface StockMovementListParams extends PaginationParams, DateRangeParams {
  product?: number | string;
}
