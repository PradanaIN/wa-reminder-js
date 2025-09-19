import { Badge } from './ui/Badge';

export function StatusPill({ active }) {
  if (active) {
    return (
      <Badge variant="success" className="flex items-center gap-2">
        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300" />
        Bot Aktif
      </Badge>
    );
  }
  return (
    <Badge variant="danger" className="flex items-center gap-2">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-300" />
      Bot Nonaktif
    </Badge>
  );
}
