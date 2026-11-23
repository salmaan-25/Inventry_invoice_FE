import { useState, useCallback } from 'react';
import { isValidRange } from '../utils/date';
import { MESSAGES } from '../constants/messages';

export function useDateRangeFilter(initialFrom?: string, initialTo?: string) {
  const [from, setFrom] = useState<string | undefined>(initialFrom);
  const [to, setTo] = useState<string | undefined>(initialTo);

  const isValid = isValidRange(from, to);
  const error = isValid ? undefined : MESSAGES.validation.dateRangeInvalid;

  const setRange = useCallback((newFrom?: string, newTo?: string) => {
    setFrom(newFrom);
    setTo(newTo);
  }, []);

  const clearRange = useCallback(() => {
    setFrom(undefined);
    setTo(undefined);
  }, []);

  return {
    from,
    to,
    isValid,
    error,
    setFrom,
    setTo,
    setRange,
    clearRange,
  };
}
