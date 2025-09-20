import { useEffect, useRef } from 'react';
import { useLogs } from '../queries/system';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Skeleton } from './ui/Skeleton';
import { DataPlaceholder } from './ui/DataPlaceholder';
import { ScrollText } from 'lucide-react';

export function LogsPanel() {
  const { data, isLoading, isError, error } = useLogs(100);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <Card className="flex h-full flex-col gap-4 border-white/10 bg-slate-900/70">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
          <ScrollText size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Log Aktivitas</h2>
          <p className="text-xs text-slate-400">Memuat 100 entri log terakhir. Refresh otomatis setiap 15 detik.</p>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
        {isLoading ? (
          <div className="flex h-full flex-col gap-4 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-full" />
          </div>
        ) : isError ? (
          <DataPlaceholder icon="??" title="Gagal memuat log" description={error?.message || 'Terjadi kesalahan.'} />
        ) : data?.logs?.length ? (
          <pre ref={logContainerRef} className="h-full overflow-y-auto bg-transparent p-4 text-xs leading-relaxed text-slate-300">
            {data.logs.join('\n')}
          </pre>
        ) : (
          <DataPlaceholder icon="??" title="Belum ada log" description="Aktivitas sistem akan ditampilkan di sini." />
        )}
      </div>
    </Card>
  );
}
