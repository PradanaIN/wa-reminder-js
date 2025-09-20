import { Pencil, Trash2 } from 'lucide-react';
import { ContactStatusBadge } from './ContactStatusBadge';
import { Button } from './ui/Button';
import { DataPlaceholder } from './ui/DataPlaceholder';

function formatStatusLabel(status) {
  if (!status) return '';
  return status
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function ContactTable({
  contacts = [],
  allowedStatuses = [],
  onEdit,
  onDelete,
  onStatusChange,
  statusUpdatingId,
  isStatusUpdating = false,
}) {
  if (!contacts.length) {
    return (
      <DataPlaceholder
        icon="📇"
        title="Belum ada kontak"
        description="Tambahkan kontak pegawai untuk mengatur penerima pesan pengingat."
      />
    );
  }

  const sorted = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
  );

  const options = allowedStatuses.length ? allowedStatuses : [...new Set(contacts.map((c) => c.status))];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Nomor WhatsApp</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sorted.map((contact) => {
              const disableRow = isStatusUpdating && statusUpdatingId === contact.id;
              return (
                <tr
                  key={contact.id}
                  className="group bg-slate-900/50 text-slate-200 transition hover:bg-slate-900/70"
                >
                  <td className="px-4 py-3 font-medium text-white">{contact.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary-200">
                    {contact.number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <ContactStatusBadge status={contact.status} />
                      <select
                        className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 shadow-inner shadow-black/30 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
                        value={contact.status}
                        disabled={disableRow}
                        onChange={(event) => {
                          const nextStatus = event.target.value;
                          if (nextStatus !== contact.status) {
                            onStatusChange?.(contact.id, nextStatus);
                          }
                        }}
                      >
                        {options.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        outline
                        size="sm"
                        className="h-8 w-8 rounded-lg p-0 text-sky-200 hover:text-sky-100"
                        onClick={() => onEdit?.(contact)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        outline
                        size="sm"
                        className="h-8 w-8 rounded-lg p-0 text-rose-300 hover:text-rose-200"
                        onClick={() => onDelete?.(contact)}
                        aria-label="Hapus"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
