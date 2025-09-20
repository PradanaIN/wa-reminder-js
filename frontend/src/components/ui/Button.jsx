import clsx from "clsx";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

// Variant styles (fill)
const variants = {
  primary:
    'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-400 focus-visible:ring-primary-500',
  secondary:
    'bg-slate-800 text-slate-100 shadow-inner shadow-slate-900/40 hover:bg-slate-700 focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-500',
  danger:
    'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-400 focus-visible:ring-rose-500',
  success:
    'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 focus-visible:ring-emerald-500',
};

// Variant styles (outline)
const outlines = {
  primary:
    'border border-primary-500/50 text-primary-200 hover:bg-primary-500/10 focus-visible:ring-primary-500',
  secondary:
    'border border-slate-600 text-slate-200 hover:bg-slate-700/40 focus-visible:ring-slate-500',
  ghost:
    'border border-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-500',
  danger:
    'border border-rose-500/40 text-rose-200 hover:bg-rose-500/10 focus-visible:ring-rose-500',
  success:
    'border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/10 focus-visible:ring-emerald-500',
};

// Sizes
const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  outline = false,
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        baseClasses,
        sizes[size],
        outline ? outlines[variant] : variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

