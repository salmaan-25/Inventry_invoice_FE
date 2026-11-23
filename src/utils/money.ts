import Decimal from 'decimal.js';
import { NUMBER_LIMITS } from '../constants/validation';

/**
 * Ensures value is valid for Decimal construction, fallback to "0".
 */
function cleanVal(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return '0';
  const str = String(v).trim();
  return str === '' ? '0' : str;
}

export function toFixed2(val: string | number | undefined | null): string {
  return new Decimal(cleanVal(val)).toFixed(NUMBER_LIMITS.MONEY_DECIMAL_PLACES);
}

export function toFixed3(val: string | number | undefined | null): string {
  return new Decimal(cleanVal(val)).toFixed(NUMBER_LIMITS.QUANTITY_DECIMAL_PLACES);
}

export function addMoney(a: string | number, b: string | number): string {
  return new Decimal(cleanVal(a)).plus(new Decimal(cleanVal(b))).toFixed(NUMBER_LIMITS.MONEY_DECIMAL_PLACES);
}

export function subMoney(a: string | number, b: string | number): string {
  return new Decimal(cleanVal(a)).minus(new Decimal(cleanVal(b))).toFixed(NUMBER_LIMITS.MONEY_DECIMAL_PLACES);
}

export function sumMoney(values: readonly (string | number)[]): string {
  return values
    .reduce<Decimal>((acc, cur) => acc.plus(new Decimal(cleanVal(cur))), new Decimal(0))
    .toFixed(NUMBER_LIMITS.MONEY_DECIMAL_PLACES);
}

export function multiplyMoney(a: string | number, b: string | number): string {
  return new Decimal(cleanVal(a)).times(new Decimal(cleanVal(b))).toFixed(NUMBER_LIMITS.MONEY_DECIMAL_PLACES);
}

export function compareMoney(a: string | number, b: string | number): number {
  return new Decimal(cleanVal(a)).comparedTo(new Decimal(cleanVal(b)));
}

export function isZeroMoney(val: string | number | undefined | null): boolean {
  return new Decimal(cleanVal(val)).isZero();
}

export function isPositiveMoney(val: string | number | undefined | null): boolean {
  return new Decimal(cleanVal(val)).isPositive() && !new Decimal(cleanVal(val)).isZero();
}

export function isLessThanOrEqual(a: string | number, b: string | number): boolean {
  return new Decimal(cleanVal(a)).lessThanOrEqualTo(new Decimal(cleanVal(b)));
}
