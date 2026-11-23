import { useState, useEffect } from 'react';
import { DEBOUNCE_DELAY_MS } from '../constants/pagination';

export function useDebounce<T>(value: T, delayMs: number = DEBOUNCE_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
