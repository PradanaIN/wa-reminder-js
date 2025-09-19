import { Label } from './ui/Label';
import { Input } from './ui/Input';

const dayLabels = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

export function ScheduleGrid({ values, onChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(dayLabels).map(([day, label]) => {
        const value = values?.[day] ?? '';
        return (
          <div key={day} className="flex flex-col gap-2">
            <Label htmlFor={`day-${day}`}>{label}</Label>
            <Input
              id={`day-${day}`}
              type="time"
              value={value || ''}
              onChange={(event) =>
                onChange({
                  ...values,
                  [day]: event.target.value || null,
                })
              }
            />
            <p className="text-xs text-slate-500">
              Kosongkan jika tidak ingin menjadwalkan pengiriman pada hari ini.
            </p>
          </div>
        );
      })}
    </div>
  );
}
