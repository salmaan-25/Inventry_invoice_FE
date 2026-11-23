import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  stockInSchema,
  adjustStockSchema,
} from '../product';
import { ITEM_TYPE } from '../../constants/enums';

describe('product schemas', () => {
  it('validates a valid goods product', () => {
    const valid = {
      name: 'Copper Cable 2.5mm',
      code: '',
      description: 'Insulated copper wire',
      item_type: ITEM_TYPE.GOODS,
      unit: 3,
      selling_price: '45.00',
      hsn_sac: '8544',
      gst_rate: '18.00',
      reorder_level: '100.000',
      opening_stock: '500.000',
    };
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects opening stock / reorder level for service items', () => {
    const invalidService = {
      name: 'Installation Service',
      item_type: ITEM_TYPE.SERVICE,
      unit: 4,
      selling_price: '500.00',
      hsn_sac: '9987',
      gst_rate: '18.00',
      reorder_level: '10.000', // not allowed for SERVICE
    };
    expect(createProductSchema.safeParse(invalidService).success).toBe(false);
  });

  it('validates updateProductSchema', () => {
    const valid = {
      name: 'Copper Cable Updated',
      selling_price: '50.00',
      hsn_sac: '8544',
      gst_rate: '18.00',
      is_active: true,
    };
    expect(updateProductSchema.safeParse(valid).success).toBe(true);
  });

  it('validates stockInSchema', () => {
    expect(stockInSchema.safeParse({ quantity: '50.000', reason: 'PO #101' }).success).toBe(true);
    expect(stockInSchema.safeParse({ quantity: '0' }).success).toBe(false);
  });

  it('validates adjustStockSchema with signed numbers and required reason', () => {
    expect(adjustStockSchema.safeParse({ quantity_change: '-5.000', reason: 'Damaged' }).success).toBe(true);
    expect(adjustStockSchema.safeParse({ quantity_change: '+10.000', reason: 'Found extra' }).success).toBe(true);
    expect(adjustStockSchema.safeParse({ quantity_change: '0', reason: 'None' }).success).toBe(false);
    expect(adjustStockSchema.safeParse({ quantity_change: '-5.000', reason: '' }).success).toBe(false);
  });
});
