import clsx from "clsx";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

// Variant styles (fill)
const variants = {
  primary:
    'bg-primary-600 text-white shadow-lg shadow-primary-600/40 hover:bg-primary-500 focus-visible:ring-primary-600',
  secondary:
    'bg-slate-800 text-slate-100 shadow-inner shadow-slate-900/40 hover:bg-slate-700 focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-500',
  danger:
    'bg-rose-600 text-white shadow-lg shadow-rose-600/40 hover:bg-rose-500 focus-visible:ring-rose-600',
  success:
    'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 hover:bg-emerald-500 focus-visible:ring-emerald-600',
};

// Variant styles (outline)
const outlines = {
  primary:
    'border border-primary-600/50 text-primary-200 hover:bg-primary-600/10 focus-visible:ring-primary-600',
  secondary:
    'border border-slate-600 text-slate-200 hover:bg-slate-700/40 focus-visible:ring-slate-500',
  ghost:
    'border border-transparent text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-500',
  danger:
    'border border-rose-600/50 text-rose-200 hover:bg-rose-600/10 focus-visible:ring-rose-600',
  success:
    'border border-emerald-600/50 text-emerald-200 hover:bg-emerald-600/10 focus-visible:ring-emerald-600',
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

