import { describe, it, expect } from 'vitest';
import { buildQueryParams } from '../query';

describe('query utils', () => {
  it('strips null, undefined, and empty string params', () => {
    const params = {
      search: 'Acme',
      page: 1,
      page_size: 25,
      is_active: true,
      category: undefined,
      emptyStr: '   ',
      nullVal: null,
    };

    const cleaned = buildQueryParams(params);
    expect(cleaned).toEqual({
      search: 'Acme',
      page: 1,
      page_size: 25,
      is_active: true,
    });
  });
});
