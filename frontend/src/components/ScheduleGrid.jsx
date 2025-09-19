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

export function ScheduleGrid({ values, onChange, readOnly = false, loading = false }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
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
        return (
          <div key={day} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-inner shadow-black/20">
            <Label htmlFor={day-}>{label}</Label>
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
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
