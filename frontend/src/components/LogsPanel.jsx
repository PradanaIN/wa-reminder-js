import { useEffect, useMemo, useRef } from "react";
import { useLogs } from "../queries/system";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { Skeleton } from "./ui/Skeleton";
import { DataPlaceholder } from "./ui/DataPlaceholder";

function classify(line) {
  if (/\[Message\]/i.test(line)) return "message";
  if (/\[Scheduler\]/i.test(line)) return "scheduler";
  if (/\[System\]/i.test(line)) return "system";
  if (/\[KeepAlive\]/i.test(line)) return "keepalive";
  if (/\[Auth\]/i.test(line)) return "auth";
  if (/\[Bot\]/i.test(line)) return "bot";
  return "default";
}

export function LogsPanel() {
  const { data, isLoading, isError, error } = useLogs(100);
  const logContainerRef = useRef(null);

  const items = useMemo(
    () => (data?.logs || []).map((line, idx) => ({ id: idx, line, tone: classify(line) })),
    [data]
  );

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <Card className="flex h-full flex-col gap-4 border-white/10 bg-slate-900/70 sm:max-h-none max-h-[420px]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
          <span className="text-base">??</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Log Aktivitas</h2>
          <p className="text-xs text-slate-400">Memuat 100 entri log terakhir. Refresh otomatis setiap 15 detik.</p>
        </div>
      </div>

      <div ref={logContainerRef} className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
        {isLoading ? (
          <div className="flex h-full flex-col gap-4 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-full" />
          </div>
        ) : isError ? (
          <DataPlaceholder icon="??" title="Gagal memuat log" description={error?.message || "Terjadi kesalahan."} />
        ) : items.length ? (
          <ul className="h-full overflow-y-auto p-4 text-xs leading-relaxed">
            {items.map(({ id, line, tone }) => (
              <li key={id} className="mb-1">
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor:
                      tone === "message"
                        ? "var(--tone-info-bg)"
                        : tone === "scheduler"
                        ? "var(--tone-warning-bg)"
                        : tone === "system"
                        ? "var(--tone-neutral-bg)"
                        : tone === "bot"
                        ? "var(--tone-success-bg)"
                        : tone === "auth"
                        ? "var(--tone-danger-bg)"
                        : "transparent",
                    color:
                      tone === "message"
                        ? "var(--tone-info-text)"
                        : tone === "scheduler"
                        ? "var(--tone-warning-text)"
                        : tone === "system"
                        ? "var(--tone-neutral-text)"
                        : tone === "bot"
                        ? "var(--tone-success-text)"
                        : tone === "auth"
                        ? "var(--tone-danger-text)"
                        : "var(--text-2)",
                  }}
                >
                  {tone}
                </span>
                <span className="ml-2 font-mono" style={{ color: "var(--text-2)" }}>
                  {line}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <DataPlaceholder icon="??" title="Belum ada log" description="Aktivitas sistem akan ditampilkan di sini." />
        )}
      </div>
    </Card>
  );
}
