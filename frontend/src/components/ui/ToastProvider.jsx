import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({ add: () => {} });

let idSeq = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = idSeq++;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ add, remove }), [add, remove]);

  const tone = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 text-white shadow-emerald-600/40';
      case 'error':
        return 'bg-rose-600 text-white shadow-rose-600/40';
      case 'warning':
        return 'bg-amber-500 text-slate-900 shadow-amber-500/40';
      default:
        return 'bg-sky-600 text-white shadow-sky-600/40';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-80 max-w-[92vw] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-2 text-sm shadow-lg ${tone(t.type)}`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

