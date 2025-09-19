import clsx from 'clsx';

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl shadow-slate-900/40 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
