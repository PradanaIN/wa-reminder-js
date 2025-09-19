import clsx from 'clsx';

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary:
    'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-400 focus-visible:outline-primary-500',
  secondary:
    'bg-slate-800 text-slate-100 shadow-inner shadow-slate-900/40 hover:bg-slate-700 focus-visible:outline-slate-500',
  ghost:
    'bg-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:outline-slate-500',
  danger:
    'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-400 focus-visible:outline-rose-500',
};

export function Button({ variant = 'primary', className, ...props }) {
  return <button className={clsx(baseClasses, variants[variant], className)} {...props} />;
}
