import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast, ToastVariant } from '@/components/ui/Toast';

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<ToastVariant>('error');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, v: ToastVariant = 'error') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setVariant(v);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} variant={variant} visible={visible} />
    </ToastContext.Provider>
  );
}
