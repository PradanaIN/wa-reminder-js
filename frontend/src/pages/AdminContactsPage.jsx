import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ContactForm } from '../components/ContactForm';
import { ContactTable } from '../components/ContactTable';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { DataPlaceholder } from '../components/ui/DataPlaceholder';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { useSession, useLogout } from '../queries/auth';
import {
  useAdminContacts,
  useCreateContact,
  useUpdateContact,
  useUpdateContactStatus,
  useDeleteContact,
} from '../queries/contacts';

export default function AdminContactsPage() {
  const navigate = useNavigate();
  const { add: addToast } = useToast();
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  const { data, isLoading, isError, error } = useAdminContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const updateStatusMutation = useUpdateContactStatus();
  const deleteMutation = useDeleteContact();

  const [editingContact, setEditingContact] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const contacts = data?.contacts ?? [];
  const allowedStatuses = data?.allowedStatuses ?? ['masuk'];

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setEditingContact(null);
      setFormOpen(false);
      addToast('Kontak berhasil diperbarui.', { type: 'success' });
    }
  }, [updateMutation.isSuccess]);

  useEffect(() => {
    if (createMutation.isSuccess) {
      setEditingContact(null);
      setFormOpen(false);
      addToast('Kontak berhasil ditambahkan.', { type: 'success' });
    }
  }, [createMutation.isSuccess]);

  const statusUpdatingId = updateStatusMutation.variables?.id;

  const formError =
    updateMutation.error?.message || createMutation.error?.message || '';

  const tableError =
    deleteMutation.error?.message || updateStatusMutation.error?.message || '';

  const handleSubmit = (values) => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleCancel = () => {
    const ok = window.confirm('Batalkan perubahan?');
    if (!ok) return;
    setEditingContact(null);
    setFormOpen(false);
  };

  const handleDelete = (contact) => {
    if (!contact?.id) return;
    const confirmed = window.confirm(`Hapus kontak ${contact.name}?`);
    if (!confirmed) return;
    deleteMutation.mutate(contact.id, {
      onSuccess: () => {
        if (editingContact?.id === contact.id) {
          setEditingContact(null);
        }
        addToast('Kontak dihapus.', { type: 'success' });
      },
      onError: (err) => addToast(err?.message || 'Gagal menghapus kontak.', { type: 'error' }),
    });
  };

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const isFormSubmitting = createMutation.isLoading || updateMutation.isLoading;

  const formInitialValues = editingContact
    ? {
        name: editingContact.name,
        number: editingContact.number,
        status: editingContact.status,
      }
    : {
        status: allowedStatuses[0] ?? 'masuk',
      };

  const formTitle = editingContact ? 'Edit Kontak Pegawai' : 'Tambah Kontak Baru';
  const formDescription = editingContact
    ? 'Perbarui informasi kontak pegawai dan status kehadiran.'
    : 'Simpan nomor WhatsApp pegawai untuk daftar penerima pengingat otomatis.';
  const submitLabel = editingContact ? 'Simpan Perubahan' : 'Tambah Kontak';

  return (
    <AdminLayout
      username={session?.user?.username}
      loading={sessionLoading}
      onLogout={() =>
        logoutMutation.mutate(undefined, {
          onSuccess: () => navigate('/admin/login', { replace: true }),
        })
      }
      isLoggingOut={logoutMutation.isLoading}
    >
      <div className="space-y-8">
        <Card
          className="space-y-6 border-white/10 bg-slate-900/70 p-6"
          header={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Manajemen Kontak Pegawai</h1>
                <p className="text-sm text-slate-400">Atur daftar penerima pengingat WhatsApp dan tandai status kehadiran mereka.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Cari nama atau nomor..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-48 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
                />
                <Button onClick={() => { setEditingContact(null); setFormOpen(true); }}>
                  <span className="sm:hidden">+</span>
                  <span className="hidden sm:inline">+ Tambah Kontak</span>
                </Button>
              </div>
            </div>
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300">
              <Spinner size="sm" /> Memuat kontak...
            </div>
          ) : isError ? (
            <DataPlaceholder icon="⚠️" title="Gagal memuat kontak" description={error?.message || 'Terjadi kesalahan pada server.'} />
          ) : (
            <>
              {tableError ? (
                <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{tableError}</p>
              ) : null}
              {(() => {
                const q = search.trim().toLowerCase();
                const filtered = q
                  ? contacts.filter((c) =>
                      (c.name || '').toLowerCase().includes(q) || (c.number || '').toLowerCase().includes(q)
                    )
                  : contacts;
                const total = filtered.length;
                const pageCount = Math.max(1, Math.ceil(total / pageSize));
                const current = Math.min(page, pageCount);
                const start = (current - 1) * pageSize;
                const visible = filtered.slice(start, start + pageSize);

                return (
                  <>
                    <ContactTable
                      contacts={visible}
                      allowedStatuses={allowedStatuses}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      statusUpdatingId={statusUpdatingId}
                      isStatusUpdating={updateStatusMutation.isLoading}
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Menampilkan {visible.length ? start + 1 : 0}
                        {visible.length ? `–${start + visible.length}` : ''} dari {total}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={current <= 1}
                        >
                          Sebelumnya
                        </Button>
                        <span className="px-2">Hal {current} / {pageCount}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                          disabled={current >= pageCount}
                        >
                          Berikutnya
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </Card>

        <Modal open={formOpen} onClose={handleCancel} title={formTitle}>
          <ContactForm
            key={editingContact?.id || 'new-contact'}
            allowedStatuses={allowedStatuses}
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isFormSubmitting}
            submitLabel={submitLabel}
            title={formTitle}
            description={formDescription}
            errorMessage={formError}
          />
        </Modal>
      </div>
    </AdminLayout>
  );
}
