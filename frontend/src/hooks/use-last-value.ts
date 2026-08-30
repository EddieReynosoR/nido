import { useState } from 'react';

export function useLastValue<T>(value: T | null): T | null {
  const [lastValue, setLastValue] = useState(value);

  if (value !== null && value !== lastValue) setLastValue(value);

  return value ?? lastValue;
}
