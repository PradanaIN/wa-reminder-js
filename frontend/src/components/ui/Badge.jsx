import clsx from 'clsx';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-800 text-slate-100',
    success: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30',
    danger: 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/30',
    warning: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30',
    info: 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
