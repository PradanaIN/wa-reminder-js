import clsx from 'clsx';

// CSS-based loader (no SVG), using borders + animation
export function Spinner({ size = 'md', className }) {
  const dimension = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  return (
    <span
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-primary-400',
        dimension,
        className
      )}
      aria-label="Loading"
      role="status"
    />
  );
}
