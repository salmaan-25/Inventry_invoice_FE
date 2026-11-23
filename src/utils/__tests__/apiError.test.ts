import { describe, it, expect } from 'vitest';
import { parseApiError, resolveApiError } from '../apiError';
import { API_ERROR_CODE } from '../../constants/apiErrorCodes';

describe('parseApiError util', () => {
  it('parses structured backend error responses', () => {
    const error = {
      status: 400,
      data: {
        code: 'INSUFFICIENT_STOCK',
        detail: 'Product P0001 only has 2.000 in stock; 5.000 requested.',
        field_errors: {},
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe('INSUFFICIENT_STOCK');
    expect(parsed.detail).toContain('Product P0001');
    expect(parsed.status).toBe(400);
  });

  it('maps field errors accurately', () => {
    const error = {
      status: 400,
      data: {
        code: 'VALIDATION_ERROR',
        detail: 'Invalid input.',
        field_errors: {
          phone: ['Phone number must be between 10 and 15 digits.'],
          name: ['This field is required.'],
        },
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe(API_ERROR_CODE.VALIDATION_ERROR);
    expect(parsed.fieldErrors['phone']).toEqual(['Phone number must be between 10 and 15 digits.']);
    expect(parsed.fieldErrors['name']).toEqual(['This field is required.']);
  });

  it('handles 401 session expiration', () => {
    const parsed = parseApiError({ status: 401 });
    expect(parsed.code).toBe(API_ERROR_CODE.NOT_AUTHENTICATED);
    expect(parsed.status).toBe(401);
  });

  it('handles 403 forbidden access', () => {
    const parsed = parseApiError({ status: 403 });
    expect(parsed.code).toBe(API_ERROR_CODE.PERMISSION_DENIED);
  });

  it('handles network / fetch failure', () => {
    const parsed = parseApiError({ status: 'FETCH_ERROR' });
    expect(parsed.code).toBe(API_ERROR_CODE.NETWORK_ERROR);
  });

  it('handles unexpected non-object errors gracefully', () => {
    const parsed = parseApiError(null);
    expect(parsed.code).toBe(API_ERROR_CODE.UNKNOWN_ERROR);
  });

  it('extracts backend message property correctly (e.g. export error)', () => {
    const error = {
      status: 400,
      data: {
        code: 'INVALID_DATE_RANGE',
        message: "Both 'from' and 'to' dates are required in YYYY-MM-DD format.",
        details: [],
        fields: {},
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe('INVALID_DATE_RANGE');
    expect(parsed.detail).toBe("Both 'from' and 'to' dates are required in YYYY-MM-DD format.");
    expect(parsed.status).toBe(400);
  });

  it('maps fields property as fieldErrors', () => {
    const error = {
      status: 400,
      data: {
        code: 'VALIDATION_ERROR',
        fields: {
          from: ["Both 'from' and 'to' dates are required."],
        },
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.fieldErrors['from']).toEqual(["Both 'from' and 'to' dates are required."]);
    expect(parsed.detail).toContain("from: Both 'from' and 'to' dates are required.");
  });

  it('parses stringified JSON backend payload', () => {
    const error = {
      status: 400,
      data: JSON.stringify({
        code: 'INVALID_DATE_RANGE',
        message: 'Invalid date selection.',
      }),
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe('INVALID_DATE_RANGE');
    expect(parsed.detail).toBe('Invalid date selection.');
  });

  it('prioritizes custom backend message over default status message on 403', () => {
    const error = {
      status: 403,
      data: {
        code: 'ROLE_FORBIDDEN',
        message: 'Only managers can access this resource.',
      },
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe('ROLE_FORBIDDEN');
    expect(parsed.detail).toBe('Only managers can access this resource.');
    expect(parsed.status).toBe(403);
  });

  it('falls back to status default when backend payload has no message', () => {
    const error = {
      status: 404,
      data: {},
    };

    const parsed = parseApiError(error);
    expect(parsed.code).toBe(API_ERROR_CODE.NOT_FOUND);
    expect(parsed.detail).toBe('The requested resource was not found.');
    expect(parsed.status).toBe(404);
  });

  it('resolveApiError unpacks a Blob error payload containing JSON', async () => {
    const errorBlob = new Blob([
      JSON.stringify({
        code: 'INVALID_DATE_RANGE',
        message: "Both 'from' and 'to' dates are required in YYYY-MM-DD format.",
      }),
    ], { type: 'application/json' });

    const error = {
      status: 400,
      data: errorBlob,
    };

    const parsed = await resolveApiError(error);
    expect(parsed.code).toBe('INVALID_DATE_RANGE');
    expect(parsed.detail).toBe("Both 'from' and 'to' dates are required in YYYY-MM-DD format.");
    expect(parsed.status).toBe(400);
  });
});
