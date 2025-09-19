import { Badge } from "./ui/Badge";
import clsx from "clsx";

export function StatusPill({
  active,
  labelActive = "Bot Aktif",
  labelInactive = "Bot Nonaktif",
}) {
  const dotBase = "inline-flex h-2.5 w-2.5 rounded-full";

  if (active) {
    return (
      <Badge variant="success" className="flex items-center gap-2">
        <span className={clsx(dotBase, "animate-pulse bg-emerald-300")} />
        {labelActive}
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className="flex items-center gap-2">
      <span className={clsx(dotBase, "bg-rose-300")} />
      {labelInactive}
    </Badge>
  );
}
