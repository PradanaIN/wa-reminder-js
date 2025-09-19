import clsx from 'clsx';

export function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-xl bg-slate-800/60', className)} />;
}
