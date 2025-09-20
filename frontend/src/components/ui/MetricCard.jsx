import clsx from 'clsx';

function toneToKey(tone) {
  if (tone === 'emerald') return 'success';
  if (tone === 'amber') return 'warning';
  if (tone === 'sky') return 'info';
  if (tone === 'rose') return 'danger';
  return 'neutral';
}

export function MetricCard({ label, value, helper, tone = 'slate', loading = false }) {
  const key = toneToKey(tone);
  if (loading) {
    return (
      <div className={clsx('rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-sm')}>
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/20" />
        <div className="mt-4 h-6 w-28 animate-pulse rounded-full bg-white/30" />
        <div className="mt-3 h-3 w-40 animate-pulse rounded-full bg-white/20" />
      </div>
    );
  }

  const style = {
    backgroundColor: `var(--tone-${key}-bg)`,
    color: `var(--tone-${key}-text)`,
    borderColor: `var(--tone-${key}-border)`,
  };

  return (
    <div
      style={style}
      className={clsx(
        'rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl'
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--tone-neutral-text, currentColor)' }}>{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {helper ? <p className="mt-2 text-xs" style={{ color: 'var(--text-2)' }}>{helper}</p> : null}
    </div>
  );
}
