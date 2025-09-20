import { useEffect } from 'react';
import clsx from 'clsx';

export function Drawer({ open, onClose, title, side = 'right', children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={clsx(
        'fixed inset-0 z-[60] transition',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className={clsx(
          'absolute inset-0 bg-black/40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'absolute h-full w-full max-w-md bg-slate-950 text-slate-100 shadow-2xl transition-transform',
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded px-2 py-1 text-sm text-slate-300 hover:bg-white/10">Tutup</button>
        </div>
        <div className="h-[calc(100%-48px)] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
