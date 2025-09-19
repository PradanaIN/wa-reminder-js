import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

export function NextRunCard({ nextRun }) {
  if (!nextRun?.nextRun?.timestamp) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-slate-100">Pengiriman Berikutnya</h3>
        <p className="mt-2 text-sm text-slate-400">
          Belum ada jadwal pengiriman. Perbarui jadwal untuk mengaktifkan pengiriman otomatis.
        </p>
      </Card>
    );
  }

  const { nextRun: details } = nextRun;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Pengiriman Berikutnya</h3>
        {details.override ? <Badge variant="warning">Override</Badge> : <Badge variant="info">Default</Badge>}
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <p>
          <span className="text-slate-400">Waktu: </span>
          <span className="font-semibold text-slate-100">{details.formatted}</span> ({details.timezone})
        </p>
        {details.override ? (
          <p>
            <span className="text-slate-400">Catatan override: </span>
            <span className="text-slate-200">
              {details.override.note || 'Override manual tanpa catatan'}
            </span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
