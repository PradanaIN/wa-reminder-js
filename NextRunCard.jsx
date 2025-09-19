import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';
import { DataPlaceholder } from './ui/DataPlaceholder';

export function NextRunCard({ nextRun, loading }) {
  if (loading) {
    return (
      <Card className="space-y-4 border-white/10 bg-slate-900/65">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-32" />
      </Card>
    );
  }

  if (!nextRun || !nextRun.nextRun?.timestamp) {
    return (
      <Card className="space-y-4 border-white/10 bg-slate-900/65">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-white">Pengiriman Berikutnya</h2>
          <p className="text-sm text-slate-400">
            Informasi jadwal terdekat yang akan dieksekusi oleh sistem pengingat.
          </p>
        </div>
        <DataPlaceholder
          icon="??"
          title="Belum ada jadwal berikutnya"
          description="Hubungi administrator untuk menentukan jadwal pengiriman yang baru."
        />
      </Card>
    );
  }

  const details = nextRun.nextRun;

  return (
    <Card className="flex flex-col gap-5 border-white/10 bg-slate-900/65">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">Pengiriman Berikutnya</h2>
        <p className="text-sm text-slate-400">
          Informasi jadwal terdekat yang akan dieksekusi oleh sistem pengingat.
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Waktu pengiriman</p>
          <p className="mt-1 text-2xl font-semibold text-white">{details.formatted}</p>
          <p className="text-sm text-slate-400">{details.timezone}</p>
        </div>
        {details.override ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 p-4 text-sm text-amber-100">
            <p className="font-semibold">Override manual aktif</p>
            <p>
              {details.override.date} pukul {details.override.time}
              {details.override.note ? ` - ${details.override.note}` : ''}
            </p>
          </div>
        ) : (
          <Badge variant="info" className="w-fit uppercase tracking-wide">
            Mengikuti jadwal default
          </Badge>
        )}
      </div>
    </Card>
  );
}
