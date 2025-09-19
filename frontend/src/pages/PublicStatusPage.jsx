import { usePublicNextRun, usePublicSchedule } from '../queries/schedule';
import { useSystemHealth } from '../queries/system';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/StatusPill';
import { PublicLayout } from '../components/layout/PublicLayout';

const dayLabels = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

export default function PublicStatusPage() {
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: scheduleData, isLoading: scheduleLoading } = usePublicSchedule();
  const { data: nextRunData, isLoading: nextRunLoading } = usePublicNextRun();

  const schedule = scheduleData?.schedule;
  const nextRun = nextRunData?.nextRun;

  return (
    <PublicLayout>
      <section id="status" className="space-y-12">
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/75 px-6 py-10 shadow-2xl sm:px-10">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-gradient-to-l from-primary-500/20 to-transparent blur-3xl sm:block" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <Badge variant="info" className="w-fit uppercase tracking-wide">
                Monitor status harian
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Pantau kiriman pengingat WhatsApp tim Anda dalam satu halaman.
              </h1>
              <p className="text-base text-slate-300">
                Sistem ini mengatur jadwal pengiriman otomatis, override manual, serta status koneksi bot. Nikmati
                transparansi penuh mengenai kapan pesan terakhir dikirim dan kapan pengiriman berikutnya akan dilakukan.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                {healthLoading ? <Spinner size="sm" /> : <StatusPill active={Boolean(health?.botActive)} />}
                {!healthLoading && health?.timezone ? (
                  <Badge variant="info" className="uppercase tracking-wide">
                    Zona waktu: {health.timezone}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Bot</span>
                {healthLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="font-semibold text-white">{health?.botActive ? 'Aktif' : 'Nonaktif'}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Override aktif</span>
                <span className="font-semibold text-white">{schedule?.overridesCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pengiriman berikutnya</span>
                {nextRunLoading ? (
                  <Spinner size="sm" />
                ) : nextRun?.timestamp ? (
                  <span className="font-semibold text-white">{nextRun.formatted}</span>
                ) : (
                  <span className="font-medium text-amber-200">Belum dijadwalkan</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <section id="schedule" className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="space-y-6 border-white/10 bg-slate-900/65">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-white">Jadwal Otomatis</h2>
              <p className="text-sm text-slate-400">
                Jadwal pengiriman pesan yang diterapkan secara berkala. Anda bisa mengubahnya melalui dashboard admin.
              </p>
            </div>
            {scheduleLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <div key={day} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner shadow-black/20">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {schedule?.dailyTimes?.[day] ? `${schedule.dailyTimes[day]} WIB` : 'Tidak dijadwalkan'}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {schedule?.paused ? (
              <Badge variant="warning" className="w-fit uppercase tracking-wide">
                Penjadwalan otomatis sementara dijeda
              </Badge>
            ) : null}
          </Card>

          <Card className="space-y-5 border-white/10 bg-slate-900/65">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Pengiriman Berikutnya</h2>
              <p className="text-sm text-slate-400">
                Informasi jadwal terdekat yang akan dieksekusi oleh sistem pengingat.
              </p>
            </div>
            {nextRunLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner />
              </div>
            ) : nextRun?.timestamp ? (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Waktu pengiriman</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{nextRun.formatted}</p>
                  <p className="text-sm text-slate-400">{nextRun.timezone}</p>
                </div>
                {nextRun.override ? (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 p-4 text-sm text-amber-100">
                    <p className="font-semibold">Override manual aktif</p>
                    <p>
                      {nextRun.override.date} pukul {nextRun.override.time}
                      {nextRun.override.note ? ' — ' + nextRun.override.note : ''}
                    </p>
                  </div>
                ) : (
                  <Badge variant="info" className="w-fit uppercase tracking-wide">
                    Mengikuti jadwal default
                  </Badge>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
                Belum ada jadwal pengiriman berikutnya. Hubungi administrator untuk mengatur jadwal baru.
              </div>
            )}
          </Card>
        </section>

        <Card className="flex flex-col items-center gap-4 border-white/10 bg-slate-900/75 py-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Ingin menyesuaikan jadwal?</h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Masuk sebagai admin untuk mengatur jadwal default per hari, menambahkan override manual untuk tanggal tertentu,
            serta menjalankan bot secara langsung.
          </p>
          <a
            href="/admin/login"
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
          >
            Buka dashboard admin
          </a>
        </Card>
      </section>
    </PublicLayout>
  );
}



