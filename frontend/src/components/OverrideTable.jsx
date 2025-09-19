import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

export function OverrideTable({ overrides = [], onRemove }) {
  if (!overrides.length) {
    return (
      <EmptyState
        title="Belum ada override manual"
        description="Tambahkan jadwal khusus untuk mengganti jadwal otomatis pada tanggal tertentu."
      />
    );
  }

  const sorted = [...overrides].sort((a, b) => (a.date > b.date ? 1 : -1));

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="max-h-72 overflow-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sorted.map((item) => (
              <tr key={item.id || `${item.date}-${item.time}`} className="bg-slate-900/50 text-slate-200">
                <td className="px-4 py-3 font-medium">{item.date}</td>
                <td className="px-4 py-3">{item.time}</td>
                <td className="px-4 py-3 text-slate-300">{item.note || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    className="text-sm text-rose-300 hover:text-rose-200"
                    onClick={() => onRemove?.(item.date)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
