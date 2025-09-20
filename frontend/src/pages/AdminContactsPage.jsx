import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ContactForm } from '../components/ContactForm';
import { ContactTable } from '../components/ContactTable';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { DataPlaceholder } from '../components/ui/DataPlaceholder';
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
  const { data: session, isLoading: sessionLoading } = useSession();
  const logoutMutation = useLogout();

  const { data, isLoading, isError, error } = useAdminContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const updateStatusMutation = useUpdateContactStatus();
  const deleteMutation = useDeleteContact();

  const [editingContact, setEditingContact] = useState(null);

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
    }
  }, [updateMutation.isSuccess]);

  useEffect(() => {
    if (createMutation.isSuccess) {
      setEditingContact(null);
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
  };

  const handleCancel = () => {
    setEditingContact(null);
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
      },
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
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Manajemen Kontak Pegawai</h1>
            <p className="text-sm text-slate-400">
              Atur daftar penerima pengingat WhatsApp dan tandai status kehadiran mereka.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300">
              <Spinner size="sm" /> Memuat kontak...
            </div>
          ) : isError ? (
            <DataPlaceholder
              icon="⚠️"
              title="Gagal memuat kontak"
              description={error?.message || 'Terjadi kesalahan pada server.'}
            />
          ) : (
            <>
              {tableError ? (
                <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {tableError}
                </p>
              ) : null}
              <ContactTable
                contacts={contacts}
                allowedStatuses={allowedStatuses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                statusUpdatingId={statusUpdatingId}
                isStatusUpdating={updateStatusMutation.isLoading}
              />
            </>
          )}
        </Card>

        <ContactForm
          key={editingContact?.id || 'new-contact'}
          allowedStatuses={allowedStatuses}
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={editingContact ? handleCancel : undefined}
          isSubmitting={isFormSubmitting}
          submitLabel={submitLabel}
          title={formTitle}
          description={formDescription}
          errorMessage={formError}
        />
      </div>
    </AdminLayout>
  );
}
