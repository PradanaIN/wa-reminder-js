import { useLogs } from '../queries/system';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';

export function LogsPanel() {
  const { data, isLoading, isError, error } = useLogs(100);

  return (
    <Card className="flex h-full flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">Log Terbaru</h3>
        <p className="text-sm text-slate-400">Memperbarui otomatis setiap 15 detik.</p>
      </div>
      <div className="relative h-64 overflow-hidden rounded-xl border border-white/5 bg-slate-950/60 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="text-sm text-rose-300">{error.message}</p>
        ) : (
          <pre className="h-full overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
            {(data?.logs || []).join('\n')}
          </pre>
        )}
      </div>
    </Card>
  );
}
