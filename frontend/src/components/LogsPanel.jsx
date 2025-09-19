import { useLogs } from '../queries/system';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Skeleton } from './ui/Skeleton';
import { DataPlaceholder } from './ui/DataPlaceholder';

export function LogsPanel() {
  const { data, isLoading, isError, error } = useLogs(100);

  return (
    <Card className="flex h-full flex-col gap-4 border-white/10 bg-slate-900/70">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Log Aktivitas</h2>
        <p className="text-sm text-slate-400">Memuat 100 entri log terakhir. Refresh otomatis setiap 15 detik.</p>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
        {isLoading ? (
          <div className="flex h-full flex-col gap-4 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-full" />
          </div>
        ) : isError ? (
          <DataPlaceholder
            icon="??"
            title="Gagal memuat log"
            description={error.message}
          />
        ) : (data?.logs?.length ? (
          <pre className="h-full overflow-y-auto bg-transparent p-4 text-xs leading-relaxed text-slate-300">
            {data.logs.join('\n')}
          </pre>
        ) : (
          <DataPlaceholder
            icon="??"
            title="Belum ada log"
            description="Aktivitas sistem akan ditampilkan di sini."
          />
        ))}
      </div>
    </Card>
  );
}
