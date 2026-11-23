import { describe, it, expect } from 'vitest';
import {
  toFixed2,
  toFixed3,
  addMoney,
  subMoney,
  sumMoney,
  multiplyMoney,
  compareMoney,
  isZeroMoney,
  isPositiveMoney,
  isLessThanOrEqual,
} from '../money';

describe('money utils (Decimal backed)', () => {
  it('formats to fixed 2 decimal places', () => {
    expect(toFixed2('1250')).toBe('1250.00');
    expect(toFixed2('1250.5')).toBe('1250.50');
    expect(toFixed2('1250.555')).toBe('1250.56');
    expect(toFixed2(0)).toBe('0.00');
    expect(toFixed2('')).toBe('0.00');
  });

  it('formats to fixed 3 decimal places for quantities', () => {
    expect(toFixed3('10')).toBe('10.000');
    expect(toFixed3('10.5')).toBe('10.500');
    expect(toFixed3('10.5555')).toBe('10.556');
    expect(toFixed3('')).toBe('0.000');
  });

  it('adds money strings accurately without floating point flaws', () => {
    expect(addMoney('0.1', '0.2')).toBe('0.30');
    expect(addMoney('100.50', '250.75')).toBe('351.25');
  });

  it('subtracts money strings accurately', () => {
    expect(subMoney('100.00', '45.50')).toBe('54.50');
    expect(subMoney('10.00', '15.00')).toBe('-5.00');
  });

  it('sums multiple money values', () => {
    expect(sumMoney(['10.50', '20.25', '5.25'])).toBe('36.00');
    expect(sumMoney([])).toBe('0.00');
  });

  it('multiplies money values', () => {
    expect(multiplyMoney('10.00', '1.18')).toBe('11.80');
    expect(multiplyMoney('5.50', '2')).toBe('11.00');
  });

  it('compares money values correctly', () => {
    expect(compareMoney('100.00', '50.00')).toBe(1);
    expect(compareMoney('50.00', '100.00')).toBe(-1);
    expect(compareMoney('100.00', '100.00')).toBe(0);
  });

  it('checks zero and positive money', () => {
    expect(isZeroMoney('0.00')).toBe(true);
    expect(isZeroMoney('0')).toBe(true);
    expect(isZeroMoney('1.00')).toBe(false);

    expect(isPositiveMoney('10.00')).toBe(true);
    expect(isPositiveMoney('0.00')).toBe(false);
    expect(isPositiveMoney('-5.00')).toBe(false);
  });

  it('checks less than or equal', () => {
    expect(isLessThanOrEqual('50.00', '100.00')).toBe(true);
    expect(isLessThanOrEqual('100.00', '100.00')).toBe(true);
    expect(isLessThanOrEqual('150.00', '100.00')).toBe(false);
  });
});
