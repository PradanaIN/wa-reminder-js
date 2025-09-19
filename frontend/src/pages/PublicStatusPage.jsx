import { usePublicNextRun, usePublicSchedule } from '../queries/schedule';
import { useSystemHealth } from '../queries/system';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { DataPlaceholder } from '../components/ui/DataPlaceholder';
import { StatusPill } from '../components/StatusPill';
import { PublicLayout } from '../components/layout/PublicLayout';

export default function PublicStatusPage() {
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: scheduleData, isLoading: scheduleLoading } = usePublicSchedule();
  const { data: nextRunData, isLoading: nextRunLoading } = usePublicNextRun();

  const schedule = scheduleData?.schedule;
  const nextRun = nextRunData?.nextRun;
  const hasDailySchedule = Boolean(
    schedule?.dailyTimes && Object.values(schedule.dailyTimes).some(Boolean)
  );

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
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : nextRun?.timestamp ? (
                  <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Waktu pengiriman</p>
                      <p className="mt-1 text-2xl font-semibold text-white">{nextRun.formatted}</p>
                      <p className="text-sm text-slate-400">{nextRun.timezone}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span className="rounded-full bg-primary-500/15 px-3 py-1 text-primary-200">
                        {nextRun.override ? 'Override manual' : 'Jadwal default'}
                      </span>
                      {schedule?.timezone ? (
                        <span className="rounded-full bg-slate-800/70 px-3 py-1 text-slate-300">
                          Zona waktu {schedule.timezone}
                        </span>
                      ) : null}
                    </div>
                    {nextRun.override ? (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 p-4 text-sm text-amber-100">
                        <p className="font-semibold">Override aktif</p>
                        <p>
                          {nextRun.override.date} pukul {nextRun.override.time}
                          {nextRun.override.note ? ' - ' + nextRun.override.note : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                        Pengiriman akan mengikuti jadwal default harian.
                      </p>
                    )}
                  </div>
                ) : (
                  <DataPlaceholder
                    title="Belum ada jadwal berikutnya"
                    description="Hubungi administrator untuk mengatur jadwal pengiriman yang baru."
                    icon={null}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

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

      <section id="schedule" className="mt-16 space-y-10">
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/75 px-6 py-10 shadow-2xl sm:px-10">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-gradient-to-l from-primary-500/20 to-transparent blur-3xl sm:block" />
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <div className="space-y-6">
              <Badge variant="info" className="w-fit uppercase tracking-wide">
                Jadwal otomatis
              </Badge>
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Lihat jam pengiriman default setiap harinya.
                </h2>
                <p className="text-base text-slate-300">
                  Jadwal ini menjadi acuan utama kapan bot mengirim pesan pengingat ke tim Anda. Override manual akan
                  menggantikan jadwal di tanggal tertentu, tetapi akan kembali ke pola default setelahnya.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {schedule?.timezone ? (
                  <span className="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">
                    Zona waktu {schedule.timezone}
                  </span>
                ) : null}
                {schedule?.paused ? (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-100">
                    Penjadwalan dijeda
                  </span>
                ) : hasDailySchedule ? (
                  <span className="rounded-full bg-primary-500/15 px-3 py-1 text-primary-200">
                    Penjadwalan aktif
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-400">
                Untuk mengubah jam pengiriman atau menambah override manual, masuk ke dashboard admin dan atur jadwal
                sesuai kebutuhan operasional Anda.
              </p>
            </div>

            <div className="space-y-4">
              {scheduleLoading ? (
                <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <ScheduleGrid loading readOnly values={null} />
                </div>
              ) : hasDailySchedule ? (
                <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Jadwal default</p>
                    <p className="text-sm text-slate-300">
                      Waktu yang ditampilkan mengikuti zona waktu {schedule?.timezone ?? 'yang ditentukan'}.
                    </p>
                  </div>
                  <ScheduleGrid readOnly values={schedule.dailyTimes} />
                  {schedule?.paused ? (
                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
                      Penjadwalan otomatis sementara dijeda. Override manual tetap berjalan sesuai rencana.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Jadwal default</p>
                    <p className="text-sm text-slate-300">
                      Belum ada jam pengiriman harian yang diatur. Semua pengiriman akan mengandalkan override manual.
                    </p>
                  </div>
                  <DataPlaceholder
                    icon={null}
                    title="Belum ada jadwal"
                    description="Masuk sebagai admin untuk menetapkan jam pengiriman harian agar bot berjalan otomatis."
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}



