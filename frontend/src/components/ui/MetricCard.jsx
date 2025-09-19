import clsx from 'clsx';

const toneStyles = {
  slate: 'bg-slate-900/70 border-white/10 shadow-slate-900/30',
  emerald: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100 shadow-emerald-900/20',
  amber: 'bg-amber-500/15 border-amber-400/30 text-amber-100 shadow-amber-900/20',
  sky: 'bg-sky-500/15 border-sky-400/30 text-sky-100 shadow-sky-900/20',
};

export function MetricCard({ label, value, helper, tone = 'slate' }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl',
        toneStyles[tone]
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-xs text-white/70">{helper}</p> : null}
    </div>
  );
}
