import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useLogout } from '../queries/auth';
import {
  useAddOverride,
  useAdminNextRun,
  useAdminSchedule,
  useRemoveOverride,
  useUpdateSchedule,
} from '../queries/schedule';
import { BotControlPanel } from '../components/BotControlPanel';
import { LogsPanel } from '../components/LogsPanel';
import { NextRunCard } from '../components/NextRunCard';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { OverrideTable } from '../components/OverrideTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Spinner } from '../components/ui/Spinner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { MetricCard } from '../components/ui/MetricCard';

const DEFAULT_TIMES = {
  1: '15:59',
  2: '15:59',
  3: '15:59',
  4: '15:59',
  5: '16:29',
  6: '',
  7: '',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  const {
    data: scheduleResponse,
    isLoading: scheduleLoading,
    isFetching: scheduleFetching,
  } = useAdminSchedule();
  const { data: nextRun, isLoading: nextRunLoading } = useAdminNextRun();

  const updateScheduleMutation = useUpdateSchedule();
  const addOverrideMutation = useAddOverride();
  const removeOverrideMutation = useRemoveOverride();

  const schedule = scheduleResponse?.schedule;

  const isSchedulePending = scheduleLoading && !schedule;
  const isScheduleUpdating = scheduleFetching && !scheduleLoading;

  const [dailyTimes, setDailyTimes] = useState(DEFAULT_TIMES);
  const [timezone, setTimezone] = useState(schedule?.timezone || 'Asia/Makassar');
  const [paused, setPaused] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ date: '', time: '', note: '' });

  useEffect(() => {
    if (schedule) {
      setDailyTimes({ ...DEFAULT_TIMES, ...schedule.dailyTimes });
      setTimezone(schedule.timezone);
      setPaused(Boolean(schedule.paused));
    }
  }, [schedule]);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    const normalized = Object.fromEntries(Object.entries(dailyTimes).map(([day, value]) => [day, value || null]));
    updateScheduleMutation.mutate({ dailyTimes: normalized, timezone, paused });
  };

  const handleOverrideSubmit = (event) => {
    event.preventDefault();
    addOverrideMutation.mutate(overrideForm, {
      onSuccess: () => setOverrideForm({ date: '', time: '', note: '' }),
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/admin/login', { replace: true }),
    });
  };

  const overrideButtonDisabled = useMemo(
    () => !overrideForm.date || !overrideForm.time || addOverrideMutation.isLoading,
    [overrideForm, addOverrideMutation.isLoading]
  );

  const metrics = useMemo(
    () => [
      {
        label: 'Status Jadwal',
        value: schedule ? (schedule.paused ? 'Dijeda' : 'Aktif') : 'Memuat...',
        helper: schedule
          ? schedule.paused
            ? 'Penjadwalan otomatis sedang dihentikan sementara.'
            : 'Penjadwalan berjalan sesuai jadwal default.'
          : 'Menunggu data jadwal dari server.',
        tone: schedule?.paused ? 'amber' : 'emerald',
      },
      {
        label: 'Zona Waktu',
        value: schedule?.timezone || 'Asia/Makassar',
        helper: schedule
          ? 'Digunakan sebagai acuan perhitungan jadwal.'
          : 'Menunggu data jadwal dari server.',
        tone: 'sky',
      },
      {
        label: 'Override Aktif',
        value: schedule?.manualOverrides?.length ?? '...',
        helper: schedule?.manualOverrides?.length
          ? 'Override akan otomatis terhapus setelah digunakan.'
          : schedule
          ? 'Belum ada override manual.'
          : 'Menunggu data jadwal dari server.',
        tone: 'slate',
      },
    ],
    [schedule]
  );

  return (
    <AdminLayout
      username={session?.user?.username}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isLoading}
      loading={sessionLoading}
    >
      <div className="space-y-12">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="relative overflow-hidden border-white/10 bg-slate-900/70 p-8">
            <div className="absolute inset-y-0 right-[-40%] -z-10 hidden w-3/4 bg-gradient-to-l from-primary-500/25 to-transparent blur-3xl lg:block" />
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-4">
                <Badge variant="info" className="w-fit uppercase tracking-wide">
                  Ringkasan harian
                </Badge>
                <h1 className="text-3xl font-semibold text-white">
                  Halo, {session?.user?.username || 'Admin'}!
                </h1>
                <p className="max-w-xl text-sm text-slate-300">
                  Pantau performa bot dan jadwal pengiriman. Gunakan panel di bawah untuk mengatur jadwal default,
                  menambahkan override, dan memantau log aktivitas terkini.
                </p>
                {isScheduleUpdating ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary-200">
                    <Spinner size="sm" />
                    <span>Pembaruan data jadwal sedang diproses...</span>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    helper={metric.helper}
                    tone={metric.tone}
                    loading={isSchedulePending}
                  />
                ))}
              </div>
            </div>
          </Card>

          <BotControlPanel />
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="space-y-6 border-white/10 bg-slate-900/70">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-white">Pengaturan Jadwal Otomatis</h2>
              <p className="text-sm text-slate-400">
                Sesuaikan jam pengiriman untuk setiap hari serta zona waktu yang digunakan sistem.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleScheduleSubmit}>
              <ScheduleGrid values={dailyTimes} onChange={setDailyTimes} loading={isSchedulePending} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona waktu</Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Gunakan format seperti <code>Asia/Makassar</code> atau <code>Asia/Jakarta</code>.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status penjadwalan</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                    <input
                      id="paused"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={paused}
                      onChange={(event) => setPaused(event.target.checked)}
                    />
                    <label htmlFor="paused" className="text-sm text-slate-300">
                      Jeda pengiriman otomatis (override manual tetap berjalan)
                    </label>
                  </div>
                </div>
              </div>

              {updateScheduleMutation.error ? (
                <p className="text-sm text-rose-300">{updateScheduleMutation.error.message}</p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSchedulePending || updateScheduleMutation.isLoading}>
                  {updateScheduleMutation.isLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!schedule || isSchedulePending}
                  onClick={() => schedule && setDailyTimes({ ...DEFAULT_TIMES, ...schedule.dailyTimes })}
                >
                  Reset perubahan
                </Button>
              </div>
            </form>
          </Card>

          <NextRunCard nextRun={nextRun} loading={nextRunLoading} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card className="space-y-6 border-white/10 bg-slate-900/70">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-white">Override Manual</h2>
              <p className="text-sm text-slate-400">
                Tambahkan jadwal khusus untuk menggantikan jadwal otomatis pada tanggal tertentu.
              </p>
            </div>
            <form className="grid gap-4 md:grid-cols-4" onSubmit={handleOverrideSubmit}>
              <div className="space-y-2">
                <Label htmlFor="override-date">Tanggal</Label>
                <Input
                  id="override-date"
                  type="date"
                  value={overrideForm.date}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, date: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="override-time">Waktu</Label>
                <Input
                  id="override-time"
                  type="time"
                  value={overrideForm.time}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, time: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="override-note">Catatan (opsional)</Label>
                <Input
                  id="override-note"
                  placeholder="Misal: Rapat koordinasi"
                  value={overrideForm.note}
                  onChange={(event) => setOverrideForm((prev) => ({ ...prev, note: event.target.value }))}
                />
              </div>
              <div className="md:col-span-4">
                {addOverrideMutation.error ? (
                  <p className="pb-2 text-sm text-rose-300">{addOverrideMutation.error.message}</p>
                ) : null}
                <Button type="submit" disabled={overrideButtonDisabled}>
                  {addOverrideMutation.isLoading ? 'Menambahkan...' : 'Tambah Override'}
                </Button>
              </div>
            </form>

            <OverrideTable
              overrides={schedule?.manualOverrides}
              onRemove={(date) => removeOverrideMutation.mutate(date)}
            />
            {removeOverrideMutation.error ? (
              <p className="text-sm text-rose-300">{removeOverrideMutation.error.message}</p>
            ) : null}
          </Card>

          <LogsPanel />
        </section>
      </div>
    </AdminLayout>
  );
}
