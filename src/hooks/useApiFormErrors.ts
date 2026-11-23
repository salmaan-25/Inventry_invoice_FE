import { useCallback } from 'react';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { parseApiError } from '../utils/apiError';
import { useNotify } from './useNotify';

export function useApiFormErrors<T extends FieldValues>(
  setError: UseFormSetError<T>
) {
  const { notifyError } = useNotify();

  const handleApiFormErrors = useCallback(
    (error: unknown): string => {
      const parsed = parseApiError(error);

      // Map backend field errors into RHF
      if (Object.keys(parsed.fieldErrors).length > 0) {
        for (const [field, messages] of Object.entries(parsed.fieldErrors)) {
          if (messages && messages.length > 0) {
            setError(field as Path<T>, {
              type: 'server',
              message: messages[0],
            });
          }
        }
      }

      // If detail exists, return it and toast it
      if (parsed.detail) {
        notifyError(parsed.detail);
      }

      return parsed.detail;
    },
    [setError, notifyError]
  );

  return { handleApiFormErrors };
}
