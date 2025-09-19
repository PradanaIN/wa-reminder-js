import clsx from "clsx";

const sizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

const variants = {
  primary: "text-primary-400",
  secondary: "text-slate-400",
  white: "text-white",
  rose: "text-rose-400",
  emerald: "text-emerald-400",
};

const speeds = {
  default: "animate-spin",
  slow: "animate-[spin_2s_linear_infinite]",
  fast: "animate-[spin_.5s_linear_infinite]",
};

export function Spinner({
  size = "md",
  variant = "primary",
  speed = "default",
  className,
  ...props
}) {
  return (
    <svg
      className={clsx(speeds[speed], variants[variant], sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
