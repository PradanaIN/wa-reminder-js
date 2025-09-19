import clsx from 'clsx';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Skeleton } from './ui/Skeleton';
import { DataPlaceholder } from './ui/DataPlaceholder';

const dayLabels = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

function getCurrentDayIndex() {
  const today = new Date().getDay();
  return today === 0 ? 7 : today;
}

export function ScheduleGrid({
  values,
  onChange,
  readOnly = false,
  loading = false,
  highlightToday = false,
}) {
  const todayIndex = highlightToday ? getCurrentDayIndex() : null;

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Object.keys(dayLabels).map((day) => (
          <div
            key={day}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner shadow-black/20"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
            {!readOnly ? <Skeleton className="h-3 w-40" /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (!readOnly && !values) {
    return (
      <DataPlaceholder
        icon="???"
        title="Belum ada jadwal"
        description="Atur jadwal harian terlebih dahulu untuk mengaktifkan pengiriman otomatis."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Object.entries(dayLabels).map(([day, label]) => {
        const value = values?.[day] ?? '';
        const isToday = Number(day) === todayIndex;
        return (
          <div
            key={day}
            className={clsx(
              'flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner shadow-black/20 transition',
              isToday && readOnly
                ? 'border-primary-400/60 bg-primary-500/10 shadow-primary-500/30'
                : null
            )}
          >
            <div className="flex items-center justify-between">
              <Label htmlFor={readOnly ? undefined : day-} className="text-white/80">
                {label}
              </Label>
              {isToday && readOnly ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-primary-200">Hari ini</span>
              ) : null}
            </div>
            {readOnly ? (
              <p className="text-lg font-semibold text-white">
                {value ? ${value} WIB : 'Tidak dijadwalkan'}
              </p>
            ) : (
              <Input
                id={day-}
                type="time"
                value={value || ''}
                onChange={(event) =>
                  onChange({
                    ...values,
                    [day]: event.target.value || null,
                  })
                }
              />
            )}
            {!readOnly ? (
              <p className="text-xs text-slate-500">
                Kosongkan jika tidak ingin menjadwalkan pengiriman pada hari ini.
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                {value ? 'Mengikuti jadwal default.' : 'Belum ada jadwal untuk hari ini.'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
