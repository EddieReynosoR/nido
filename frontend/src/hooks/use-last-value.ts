import { useState } from 'react';

/**
 * Returns the given value while it is non-null, and falls back to the last
 * non-null value once it becomes `null`.
 *
 * Useful for keeping content on screen during exit animations.
 **/
export function useLastValue<T>(value: T | null): T | null {
  const [lastValue, setLastValue] = useState(value);

  if (value !== null && value !== lastValue) setLastValue(value);

  return value ?? lastValue;
}
