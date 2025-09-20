import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../queries/auth';
import { useQuotes, useCreateQuote, useUpdateQuote, useDeleteQuote } from '../queries/quotes';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { useConfirm } from '../components/ui/ConfirmProvider.jsx';

export default function AdminQuotesPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data, isLoading, isError, error } = useQuotes();
  const createMutation = useCreateQuote();
  const updateMutation = useUpdateQuote();
  const deleteMutation = useDeleteQuote();
  const { add: addToast } = useToast();
  const { confirm } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  const quotes = data?.quotes || [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((x) => (x.content || '').toLowerCase().includes(q));
  }, [quotes, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const openAdd = () => { setEditing(null); setContent(''); setModalOpen(true); };
  const openEdit = (q) => { setEditing(q); setContent(q.content || ''); setModalOpen(true); };
  const closeModal = async () => {
    const ok = await confirm({ title: 'Tutup formulir?', message: 'Perubahan yang belum disimpan akan hilang.', confirmText: 'Tutup', variant: 'warning' });
    if (ok) setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, content: content.trim() },
        {
          onSuccess: () => { setModalOpen(false); addToast('Quote diperbarui.', { type: 'success' }); },
          onError: (err) => addToast(err?.message || 'Gagal menyimpan.', { type: 'error' }),
        }
      );
    } else {
      createMutation.mutate(
        { content: content.trim() },
        {
          onSuccess: () => { setModalOpen(false); addToast('Quote ditambahkan.', { type: 'success' }); },
          onError: (err) => addToast(err?.message || 'Gagal menambah.', { type: 'error' }),
        }
      );
    }
  };

  const handleDelete = async (q) => {
    const ok = await confirm({ title: 'Hapus quote?', message: 'Tindakan ini tidak dapat dibatalkan.', confirmText: 'Hapus', variant: 'danger' });
    if (!ok) return;
    deleteMutation.mutate(q.id, {
      onSuccess: () => addToast('Quote dihapus.', { type: 'success' }),
      onError: (err) => addToast(err?.message || 'Gagal menghapus.', { type: 'error' }),
    });
  };

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card
          className="space-y-6 border-white/10 bg-slate-900/70 p-6"
          header={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Manajemen Quotes</h1>
                <p className="text-sm text-slate-400">Tambah, edit, dan hapus kutipan yang digunakan dalam pesan.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Cari isi quote..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-48 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
                />
                <Button onClick={openAdd}>+ Tambah Quote</Button>
              </div>
            </div>
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300"><Spinner size="sm" /> Memuat quotes...</div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error?.message || 'Gagal memuat data.'}</div>
          ) : (
            <>
              {visible.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">Tidak ada data.</div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="max-h-[520px] overflow-auto">
                    <table className="min-w-full divide-y divide-white/10 text-sm">
                      <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Quote</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {visible.map((q) => (
                          <tr key={q.id} className="group bg-slate-900/50 text-slate-200 transition hover:bg-slate-900/70">
                            <td className="px-4 py-3">{q.content}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button variant="secondary" outline size="sm" onClick={() => openEdit(q)}>Edit</Button>
                                <Button variant="danger" outline size="sm" onClick={() => handleDelete(q)}>Hapus</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Menampilkan {visible.length ? start + 1 : 0}{visible.length ? `–${start + visible.length}` : ''} dari {filtered.length}</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={current<=1}>Sebelumnya</Button>
                  <span className="px-2">Hal {current} / {pageCount}</span>
                  <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p+1))} disabled={current>=pageCount}>Berikutnya</Button>
                </div>
              </div>
            </>
          )}
        </Card>

        <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Quote' : 'Tambah Quote'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-content">Isi Quote</Label>
              <Input id="q-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Masukkan kutipan..." />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>{editing ? 'Simpan Perubahan' : 'Tambah'}</Button>
              <Button type="button" variant="danger" outline onClick={closeModal}>Batal</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

