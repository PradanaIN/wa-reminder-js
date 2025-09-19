import clsx from "clsx";

const toneStyles = {
  slate: "bg-slate-900/70 border-white/10 text-slate-100 shadow-slate-900/30",
  emerald:
    "bg-emerald-500/15 border-emerald-400/30 text-emerald-100 shadow-emerald-900/20",
  amber:
    "bg-amber-500/15 border-amber-400/30 text-amber-100 shadow-amber-900/20",
  sky: "bg-sky-500/15 border-sky-400/30 text-sky-100 shadow-sky-900/20",
  rose: "bg-rose-500/15 border-rose-400/30 text-rose-100 shadow-rose-900/20",
};

const sizes = {
  sm: "px-4 py-3 text-sm",
  md: "px-5 py-4 text-base",
  lg: "px-6 py-5 text-lg",
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "slate",
  size = "md",
  icon,
  className,
}) {
  return (
    <div
      className={clsx(
        "relative rounded-2xl border shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:shadow-xl",
        toneStyles[tone] || toneStyles.slate,
        sizes[size],
        className
      )}
    >
      {icon && (
        <div className="absolute right-4 top-4 text-2xl opacity-60">{icon}</div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {label}
      </p>

      <p
        className={clsx(
          "mt-2 font-semibold text-white",
          size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl"
        )}
      >
        {value}
      </p>

      {helper && <p className="mt-2 text-xs text-white/70">{helper}</p>}
    </div>
  );
}
