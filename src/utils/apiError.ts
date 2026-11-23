import { API_ERROR_CODE, type ApiErrorCode } from '../constants/apiErrorCodes';
import { MESSAGES } from '../constants/messages';
import type { ApiError } from '../types/api/common';

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

/**
 * Extracts a human-readable error message from backend payload objects.
 * Supports:
 * - message (string)
 * - detail (string)
 * - error (string or { message: string })
 * - msg (string)
 * - non_field_errors (array or string)
 * - details (array or string)
 */
function extractBackendMessage(payload: Record<string, unknown>): string | undefined {
  if (typeof payload.message === 'string' && payload.message.trim() !== '') {
    return payload.message.trim();
  }

  if (typeof payload.detail === 'string' && payload.detail.trim() !== '') {
    return payload.detail.trim();
  }

  if (typeof payload.error === 'string' && payload.error.trim() !== '') {
    return payload.error.trim();
  }

  if (isObject(payload.error) && typeof payload.error.message === 'string' && payload.error.message.trim() !== '') {
    return payload.error.message.trim();
  }

  if (typeof payload.msg === 'string' && payload.msg.trim() !== '') {
    return payload.msg.trim();
  }

  if (Array.isArray(payload.non_field_errors)) {
    const nonFieldMsgs = payload.non_field_errors
      .filter((m): m is string => typeof m === 'string' && m.trim() !== '')
      .map((m) => m.trim());
    if (nonFieldMsgs.length > 0) {
      return nonFieldMsgs.join(' ');
    }
  } else if (typeof payload.non_field_errors === 'string' && payload.non_field_errors.trim() !== '') {
    return payload.non_field_errors.trim();
  }

  if (Array.isArray(payload.details)) {
    const detailMsgs = payload.details
      .filter((m): m is string => typeof m === 'string' && m.trim() !== '')
      .map((m) => m.trim());
    if (detailMsgs.length > 0) {
      return detailMsgs.join(' ');
    }
  } else if (typeof payload.details === 'string' && payload.details.trim() !== '') {
    return payload.details.trim();
  }

  return undefined;
}

/**
 * Extracts field-level validation errors from either `field_errors` or `fields`.
 */
function extractFieldErrors(payload: Record<string, unknown>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  const rawFields = isObject(payload.field_errors)
    ? payload.field_errors
    : (isObject(payload.fields) ? payload.fields : undefined);

  if (rawFields) {
    for (const [key, val] of Object.entries(rawFields)) {
      if (Array.isArray(val)) {
        const strings = val
          .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
          .map((s) => s.trim());
        if (strings.length > 0) {
          fieldErrors[key] = strings;
        }
      } else if (typeof val === 'string' && val.trim() !== '') {
        fieldErrors[key] = [val.trim()];
      }
    }
  }

  return fieldErrors;
}

/**
 * Formats aggregated field errors into a readable summary string if no top-level message is present.
 */
function formatFieldErrorsSummary(fieldErrors: Record<string, string[]>): string | undefined {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) {
    return undefined;
  }
  return entries.map(([field, errs]) => `${field}: ${errs.join(', ')}`).join('; ');
}

/**
 * Returns a fallback error message based on the HTTP status code.
 */
function getStatusFallbackMessage(status?: number): string {
  if (status === 401) return MESSAGES.general.sessionExpired;
  if (status === 403) return MESSAGES.general.forbidden;
  if (status === 404) return 'The requested resource was not found.';
  if (status === 429) return MESSAGES.auth.throttled;
  if (status && status >= 500) return 'Server error. Please try again later.';
  return MESSAGES.general.unexpectedError;
}

/**
 * Returns an appropriate error code based on payload or status.
 */
function resolveErrorCode(codeFromPayload?: unknown, status?: number): string {
  if (typeof codeFromPayload === 'string' && codeFromPayload.trim() !== '') {
    return codeFromPayload.trim();
  }
  if (status === 400) return API_ERROR_CODE.VALIDATION_ERROR;
  if (status === 401) return API_ERROR_CODE.NOT_AUTHENTICATED;
  if (status === 403) return API_ERROR_CODE.PERMISSION_DENIED;
  if (status === 404) return API_ERROR_CODE.NOT_FOUND;
  if (status === 429) return API_ERROR_CODE.THROTTLED;
  return API_ERROR_CODE.UNKNOWN_ERROR;
}

export function parseApiError(error: unknown): ApiError {
  if (!error) {
    return {
      code: API_ERROR_CODE.UNKNOWN_ERROR,
      detail: MESSAGES.general.unexpectedError,
      fieldErrors: {},
    };
  }

  // Handle RTK Query FetchBaseQueryError
  if (isObject(error) && 'status' in error) {
    const status = typeof error.status === 'number' ? error.status : undefined;

    if (error.status === 'FETCH_ERROR') {
      return {
        code: API_ERROR_CODE.NETWORK_ERROR,
        detail: MESSAGES.general.networkError,
        fieldErrors: {},
      };
    }

    if (error.status === 'TIMEOUT_ERROR') {
      return {
        code: 'TIMEOUT_ERROR',
        detail: 'Request timed out. Please try again.',
        fieldErrors: {},
      };
    }

    let payload = error.data;

    // Handle stringified JSON responses
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        if (isObject(parsed)) {
          payload = parsed;
        }
      } catch {
        // Not a JSON string
      }
    }

    if (isObject(payload)) {
      const code = resolveErrorCode(payload.code, status);
      const fieldErrors = extractFieldErrors(payload);
      const backendMessage = extractBackendMessage(payload);
      const fieldSummary = formatFieldErrorsSummary(fieldErrors);
      const detail = backendMessage || fieldSummary || getStatusFallbackMessage(status);

      return {
        code,
        detail,
        fieldErrors,
        status,
      };
    }

    if (typeof payload === 'string' && payload.trim() !== '') {
      return {
        code: resolveErrorCode(undefined, status),
        detail: payload.trim(),
        fieldErrors: {},
        status,
      };
    }

    // If RTK error has an error string property
    if ('error' in error && typeof error.error === 'string' && error.error.trim() !== '') {
      return {
        code: resolveErrorCode(undefined, status),
        detail: error.error.trim(),
        fieldErrors: {},
        status,
      };
    }

    return {
      code: resolveErrorCode(undefined, status),
      detail: getStatusFallbackMessage(status),
      fieldErrors: {},
      status,
    };
  }

  // Standard Error instance
  if (error instanceof Error) {
    return {
      code: API_ERROR_CODE.UNKNOWN_ERROR,
      detail: error.message.trim() || MESSAGES.general.unexpectedError,
      fieldErrors: {},
    };
  }

  // Object with message or detail property
  if (isObject(error)) {
    if (typeof error.message === 'string' && error.message.trim() !== '') {
      return {
        code: typeof error.code === 'string' ? error.code : API_ERROR_CODE.UNKNOWN_ERROR,
        detail: error.message.trim(),
        fieldErrors: {},
      };
    }
    if (typeof error.detail === 'string' && error.detail.trim() !== '') {
      return {
        code: typeof error.code === 'string' ? error.code : API_ERROR_CODE.UNKNOWN_ERROR,
        detail: error.detail.trim(),
        fieldErrors: {},
      };
    }
  }

  // String error
  if (typeof error === 'string' && error.trim() !== '') {
    return {
      code: API_ERROR_CODE.UNKNOWN_ERROR,
      detail: error.trim(),
      fieldErrors: {},
    };
  }

  return {
    code: API_ERROR_CODE.UNKNOWN_ERROR,
    detail: MESSAGES.general.unexpectedError,
    fieldErrors: {},
  };
}

export function isSpecificApiError(error: ApiError, code: ApiErrorCode): boolean {
  return error.code === code;
}

function isBlobLike(val: unknown): val is Blob {
  if (!val || typeof val !== 'object') return false;
  return (
    (typeof Blob !== 'undefined' && val instanceof Blob) ||
    Object.prototype.toString.call(val) === '[object Blob]' ||
    ('size' in val && 'type' in val && typeof (val as { text?: unknown }).text === 'function')
  );
}

async function extractBlobText(blob: unknown): Promise<string> {
  if (isObject(blob) && typeof (blob as { text?: () => Promise<string> }).text === 'function') {
    try {
      return await (blob as { text: () => Promise<string> }).text();
    } catch {
      // fallback to FileReader
    }
  }
  if (typeof FileReader !== 'undefined' && isBlobLike(blob)) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsText(blob as Blob);
    });
  }
  return '';
}

/**
 * Asynchronously resolves an API error, automatically unpacking binary Blob error payloads
 * (commonly encountered when file download or export endpoints return HTTP 4xx/5xx errors).
 */
export async function resolveApiError(error: unknown): Promise<ApiError> {
  if (isObject(error) && 'data' in error && isBlobLike(error.data)) {
    try {
      const text = await extractBlobText(error.data);
      if (text.trim() !== '') {
        try {
          return parseApiError({ ...error, data: JSON.parse(text) });
        } catch {
          return parseApiError({ ...error, data: text });
        }
      }
    } catch {
      return parseApiError(error);
    }
  }

  return parseApiError(error);
}
