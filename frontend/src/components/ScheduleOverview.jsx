import { ScheduleGrid } from './ScheduleGrid';
import { Card } from './ui/Card';
import { DataPlaceholder } from './ui/DataPlaceholder';

export function ScheduleOverview({ schedule, loading }) {
  if (loading) {
    return (
      <Card className="space-y-6 border-white/10 bg-slate-900/65">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-44 animate-pulse rounded-full bg-slate-800/70" />
          <div className="h-4 w-72 animate-pulse rounded-full bg-slate-800/70" />
        </div>
        <ScheduleGrid loading readOnly values={null} />
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card className="space-y-6 border-white/10 bg-slate-900/65">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white">Jadwal Otomatis</h2>
          <p className="text-sm text-slate-400">
            Jadwal pengiriman pesan yang diterapkan secara berkala. Anda bisa mengubahnya melalui dashboard admin.
          </p>
        </div>
        <DataPlaceholder
          icon="??"
          title="Belum ada jadwal"
          description="Sistem belum memiliki pengaturan jam pengiriman harian. Masuk sebagai admin untuk mengatur jadwal."
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-6 border-white/10 bg-slate-900/65">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-white">Jadwal Otomatis</h2>
        <p className="text-sm text-slate-400">
          Jadwal pengiriman pesan yang diterapkan secara berkala. Anda bisa mengubahnya melalui dashboard admin.
        </p>
      </div>
      <ScheduleGrid readOnly values={schedule.dailyTimes} />
      {schedule.paused ? (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
          Penjadwalan otomatis sementara dijeda. Override manual tetap berjalan.
        </div>
      ) : null}
    </Card>
  );
}
