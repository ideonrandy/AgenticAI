import { useState, useCallback } from 'react';
import { type Toast } from '../types';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success', duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      // Keep max 3 toasts: drop the oldest if already at capacity
      setToasts(prev => [...prev.slice(-2), { id, message, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
