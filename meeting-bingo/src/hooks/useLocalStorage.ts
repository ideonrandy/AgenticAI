import { useCallback } from 'react';

/**
 * Returns stable read/write functions for a localStorage key.
 * Does not trigger re-renders on write — use when you need side-effect-style
 * persistence without driving React state from storage.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const read = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const write = useCallback(
    (value: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // localStorage unavailable (private browsing, quota exceeded)
      }
    },
    [key],
  );

  return { read, write };
}
