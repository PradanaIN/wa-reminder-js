import clsx from "clsx";

export function Badge({
  children,
  variant = "default",
  outline = false,
  className,
  ...props
}) {
  // Base styles
  const baseStyles =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors";

  // Variants
  const variants = {
    default: outline
      ? "border border-slate-700 text-slate-100"
      : "bg-slate-800 text-slate-100",
    success: outline
      ? "border border-emerald-400/40 text-emerald-200"
      : "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30",
    danger: outline
      ? "border border-rose-400/40 text-rose-200"
      : "bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/30",
    warning: outline
      ? "border border-amber-400/40 text-amber-200"
      : "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30",
    info: outline
      ? "border border-sky-400/40 text-sky-200"
      : "bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30",
  };

  return (
    <span
      role="status"
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
