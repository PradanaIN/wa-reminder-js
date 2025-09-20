import { Pencil, Trash2 } from "lucide-react";
import { ContactStatusBadge } from "./ContactStatusBadge";
import { Button } from "./ui/Button";
import { DataPlaceholder } from "./ui/DataPlaceholder";

function formatStatusLabel(status) {
  if (!status) return "";
  return status
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
    a.name.localeCompare(b.name, "id", { sensitivity: "base" })
  );

  const options = allowedStatuses.length
    ? allowedStatuses
    : [...new Set(contacts.map((c) => c.status))];

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
              const disableRow =
                isStatusUpdating && statusUpdatingId === contact.id;

              return (
                <tr
                  key={contact.id}
                  className="group bg-slate-900/50 text-slate-200 transition hover:bg-slate-900/70"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {contact.name}
                  </td>

                  {/* Nomor WA: terang di dark, tegas di light */}
                  <td className="px-4 py-3">
                    <span
                      className="
                        font-mono text-sm tracking-wide
                        text-slate-800
                        [.theme-dark_&]:text-slate-100
                      "
                    >
                      {contact.number}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <ContactStatusBadge status={contact.status} />
                      <select
                        className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 shadow-inner shadow-black/30 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20 disabled:opacity-60"
                        value={contact.status}
                        disabled={disableRow}
                        onChange={(event) => {
                          const nextStatus = event.target.value;
                          if (nextStatus !== contact.status) {
                            onStatusChange?.(contact.id, nextStatus);
                          }
                        }}
                        aria-label={`Ubah status ${contact.name ?? "kontak"}`}
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
                    <div className="flex justify-end gap-1.5">
                      {/* Edit */}
                      <Button
                        variant="secondary"
                        outline
                        className="
                          inline-flex h-9 w-9 items-center justify-center rounded-lg p-0
                          hover:bg-white/5 focus:outline-none
                          focus-visible:ring-2 focus-visible:ring-sky-300/60
                          focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                        "
                        onClick={() => onEdit?.(contact)}
                        aria-label={`Edit ${contact.name ?? "kontak"}`}
                        title="Edit"
                      >
                        <Pencil
                          className="
                            h-5 w-5
                            text-slate-700
                            [.theme-dark_&]:text-slate-200
                          "
                        />
                      </Button>

                      {/* Hapus */}
                      <Button
                        variant="danger"
                        outline
                        className="
                          inline-flex h-9 w-9 items-center justify-center rounded-lg p-0
                          hover:bg-rose-500/10 focus:outline-none
                          focus-visible:ring-2 focus-visible:ring-rose-300/60
                          focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                        "
                        onClick={() => onDelete?.(contact)}
                        aria-label={`Hapus ${contact.name ?? "kontak"}`}
                        title="Hapus"
                      >
                        <Trash2
                          className="
                            h-5 w-5
                            text-rose-600
                            [.theme-dark_&]:text-rose-400
                          "
                        />
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
