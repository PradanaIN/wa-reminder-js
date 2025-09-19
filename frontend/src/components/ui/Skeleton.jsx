import clsx from "clsx";

const variants = {
  default: "bg-slate-800/60",
  light: "bg-slate-700/40",
  dark: "bg-slate-900/70",
};

const shapes = {
  rounded: "rounded-xl",
  circle: "rounded-full",
  square: "rounded-none",
};

export function Skeleton({
  className,
  variant = "default",
  shape = "rounded",
  animated = true,
  ...props
}) {
  return (
    <div
      className={clsx(
        animated && "animate-pulse",
        variants[variant],
        shapes[shape],
        className
      )}
      {...props}
    />
  );
}
