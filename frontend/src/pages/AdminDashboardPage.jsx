import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useLogout } from "../queries/auth";
import {
  useAdminNextRun,
  useAdminSchedule,
  useUpdateSchedule,
} from "../queries/schedule";
import { BotControlPanel } from "../components/BotControlPanel";
import { LogsPanel } from "../components/LogsPanel";
import { NextRunCard as NextRunCard } from "../components/NextRunCard2.jsx";
import { ScheduleGrid } from "../components/ScheduleGrid";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { AdminLayout } from "../components/layout/AdminLayout";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { useConfirm } from "../components/ui/ConfirmProvider.jsx";
import { MetricCard } from "../components/ui/MetricCard";

const DEFAULT_TIMES = {
  1: "15:59",
  2: "15:59",
  3: "15:59",
  4: "15:59",
  5: "16:29",
  6: "",
  7: "",
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();
  const { add: addToast } = useToast();
  const { confirm } = useConfirm();

  const {
    data: scheduleResponse,
    isLoading: scheduleLoading,
    isFetching: scheduleFetching,
  } = useAdminSchedule();
  const { data: nextRun, isLoading: nextRunLoading } = useAdminNextRun();

  const updateScheduleMutation = useUpdateSchedule();

  const schedule = scheduleResponse?.schedule;

  const isSchedulePending = scheduleLoading && !schedule;
  const isScheduleUpdating = scheduleFetching && !scheduleLoading;

  const [dailyTimes, setDailyTimes] = useState(DEFAULT_TIMES);
  const [timezone, setTimezone] = useState("Asia/Makassar");
  const [paused, setPaused] = useState(false);

  // Tabs for content card
  const [panelTab, setPanelTab] = useState("logs"); // logs | schedule | next

  useEffect(() => {
    if (schedule) {
      setDailyTimes({ ...DEFAULT_TIMES, ...(schedule.dailyTimes ?? {}) });
      setTimezone(schedule.timezone || "Asia/Makassar");
      setPaused(Boolean(schedule.paused));
    }
  }, [schedule]);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    const normalized = Object.fromEntries(
      Object.entries(dailyTimes).map(([day, value]) => [day, value || null])
    );
    updateScheduleMutation.mutate(
      { dailyTimes: normalized, timezone, paused },
      {
        onSuccess: () => addToast("Jadwal berhasil disimpan.", { type: "success" }),
        onError: (err) => addToast(err?.message || "Gagal menyimpan jadwal.", { type: "error" }),
      }
    );
  };

  const metrics = useMemo(
    () => [
      {
        label: "Status Jadwal",
        value: schedule ? (schedule.paused ? "Dijeda" : "Aktif") : "Memuat...",
        helper: schedule
          ? schedule.paused
            ? "Penjadwalan otomatis sedang dihentikan sementara."
            : "Penjadwalan berjalan sesuai jadwal default."
          : "Menunggu data jadwal dari server.",
        tone: schedule?.paused ? "amber" : "emerald",
      },
      {
        label: "Zona Waktu",
        value: schedule?.timezone || "Asia/Makassar",
        helper: schedule
          ? "Digunakan sebagai acuan perhitungan jadwal."
          : "Menunggu data jadwal dari server.",
        tone: "sky",
      },
      {
        label: "Override Aktif",
        value: schedule?.manualOverrides?.length ?? "...",
        helper: schedule?.manualOverrides?.length
          ? "Override akan otomatis terhapus setelah digunakan."
          : schedule
          ? "Belum ada override manual."
          : "Menunggu data jadwal dari server.",
        tone: "slate",
      },
    ],
    [schedule]
  );

  // Sticky action bar (shows only on schedule tab when dirty)
  const scheduleDirty = useMemo(() => {
    const normalized = Object.fromEntries(
      Object.entries(dailyTimes).map(([d, v]) => [d, v || null])
    );
    const server = Object.fromEntries(
      Object.entries({ ...DEFAULT_TIMES, ...(schedule?.dailyTimes || {}) }).map(
        ([d, v]) => [d, v || null]
      )
    );
    return (
      JSON.stringify(normalized) !== JSON.stringify(server) ||
      timezone !== (schedule?.timezone || "Asia/Makassar") ||
      Boolean(paused) !== Boolean(schedule?.paused)
    );
  }, [dailyTimes, timezone, paused, schedule?.dailyTimes, schedule?.timezone, schedule?.paused]);

  return (
    <AdminLayout
      username={session?.user?.username}
      onLogout={() => logoutMutation.mutate(undefined, { onSuccess: () => navigate("/admin/login", { replace: true }) })}
      isLoggingOut={logoutMutation.isLoading}
      loading={sessionLoading}
    >
      <div className="space-y-12">
        {/* Ringkasan Harian + Kontrol Bot */}
        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-8 shadow-xl backdrop-blur-md">
            <div className="absolute inset-y-0 right-[-40%] -z-10 hidden w-3/4 bg-gradient-to-l from-primary-500/20 to-transparent blur-3xl lg:block" />
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="space-y-5">
                <Badge variant="info" className="w-fit uppercase tracking-wide">
                  Ringkasan Harian
                </Badge>
                <h1 className="text-4xl font-bold text-white">
                  Halo, {session?.user?.username || "Admin"}!
                </h1>
                <p className="max-w-xl text-base text-slate-400">
                  Pantau performa bot dan jadwal pengiriman. Gunakan panel di bawah untuk mengatur jadwal default dan
                  memantau log aktivitas terkini.
                </p>
                {isScheduleUpdating && (
                  <div className="flex items-center gap-2 text-xs font-medium text-primary-200 animate-pulse">
                    <Spinner size="sm" />
                    <span>Pembaruan data jadwal sedang diproses...</span>
                  </div>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
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

        {/* Content Tabs: Log | Jadwal | Berikutnya */}
        <section>
          <Card className="space-y-6 border-white/10 bg-slate-900/70 p-0">
            <div className="px-4 pt-4">
              <div className="inline-flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-1 text-sm">
                <button
                  onClick={() => setPanelTab("logs")}
                  className={
                    panelTab === "logs"
                      ? "flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20"
                      : "flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                >
                  Log
                </button>
                <button
                  onClick={() => setPanelTab("schedule")}
                  className={
                    panelTab === "schedule"
                      ? "flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20"
                      : "flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                >
                  Jadwal
                </button>
                <button
                  onClick={() => setPanelTab("next")}
                  className={
                    panelTab === "next"
                      ? "flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20"
                      : "flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                >
                  Berikutnya
                </button>
              </div>
            </div>

            <div className="p-6">
              {panelTab === "logs" && (
                <div className="sm:max-h-none max-h-[480px]">
                  <LogsPanel />
                </div>
              )}

              {panelTab === "schedule" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-white">Pengaturan Jadwal Otomatis</h2>
                    <p className="text-sm text-slate-400">Sesuaikan jam pengiriman untuk setiap hari serta zona waktu yang digunakan sistem.</p>
                  </div>

                  <form className="space-y-6" onSubmit={handleScheduleSubmit}>
                    {(() => {
                      const tzMap = { 'Asia/Makassar': 'WITA', 'Asia/Jakarta': 'WIB', 'Asia/Jayapura': 'WIT' };
                      const suffix = tzMap[timezone] || undefined;
                      return (
                        <ScheduleGrid values={dailyTimes} onChange={setDailyTimes} timeSuffix={suffix} />
                      );
                    })()}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Zona waktu</Label>
                        <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
                        <p className="text-xs text-slate-500">Gunakan format seperti <code>Asia/Makassar</code> atau <code>Asia/Jakarta</code>.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Status penjadwalan</Label>
                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                          <input id="paused" type="checkbox" className="h-4 w-4 accent-primary-500" checked={paused} onChange={(e) => setPaused(e.target.checked)} />
                          <label htmlFor="paused" className="text-sm text-slate-300">Jeda pengiriman otomatis (override manual tetap berjalan)</label>
                        </div>
                      </div>
                    </div>

                    {updateScheduleMutation.error && (
                      <p className="text-sm text-rose-300">{updateScheduleMutation.error.message}</p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" disabled={updateScheduleMutation.isLoading}>
                        {updateScheduleMutation.isLoading ? "Menyimpan..." : "Simpan Jadwal"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                          if (!schedule) return;
                          const ok = await confirm({
                            title: 'Reset perubahan?',
                            message: 'Perubahan yang belum disimpan akan hilang.',
                            confirmText: 'Ya, reset',
                            variant: 'warning',
                          });
                          if (!ok) return;
                          setDailyTimes({ ...DEFAULT_TIMES, ...(schedule.dailyTimes || {}) });
                          addToast("Perubahan jadwal direset.", { type: "info" });
                        }}
                      >
                        Reset perubahan
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {panelTab === "next" && (
                <NextRunCard nextRun={nextRun} loading={nextRunLoading} />
              )}
            </div>
          </Card>

          {/* Sticky Action Bar for schedule */}
          {panelTab === "schedule" && scheduleDirty && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/80 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs text-slate-300">Perubahan belum disimpan</p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      if (!schedule) return;
                      const ok = await confirm({
                        title: 'Reset perubahan?',
                        message: 'Perubahan yang belum disimpan akan hilang.',
                        confirmText: 'Ya, reset',
                        variant: 'warning',
                      });
                      if (!ok) return;
                      setDailyTimes({ ...DEFAULT_TIMES, ...(schedule.dailyTimes || {}) });
                      setTimezone(schedule.timezone || "Asia/Makassar");
                      setPaused(Boolean(schedule.paused));
                      addToast("Perubahan jadwal direset.", { type: "info" });
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleScheduleSubmit}>Simpan</Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
