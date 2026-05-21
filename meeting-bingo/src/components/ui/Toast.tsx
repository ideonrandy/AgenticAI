import { useEffect } from 'react';
import { type Toast } from '../../types';

const COLOR_MAP: Record<Toast['type'], string> = {
  success: 'bg-green-100 border-green-300 text-green-800',
  info: 'bg-blue-100 border-blue-300 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

// Duration defaults: word-detection toasts 1500ms, error/warning toasts 3000ms (H8)
const DEFAULT_DURATION: Record<Toast['type'], number> = {
  success: 1500,
  info: 1500,
  warning: 3000,
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const ms = toast.duration ?? DEFAULT_DURATION[toast.type];
    const timer = setTimeout(() => onRemove(toast.id), ms);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`px-4 py-2 rounded-lg border shadow-md text-sm font-medium whitespace-nowrap ${COLOR_MAP[toast.type]}`}
    >
      {toast.message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-40 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
