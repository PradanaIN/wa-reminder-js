import clsx from 'clsx';

export function Label({ className, children, ...props }) {
  return (
    <label
      className={clsx('block text-sm font-semibold uppercase tracking-wide text-slate-300', className)}
      {...props}
    >
      {children}
    </label>
  );
}
