import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../queries/auth";
import {
  useQuotes,
  useCreateQuote,
  useUpdateQuote,
  useDeleteQuote,
} from "../queries/quotes";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { useConfirm } from "../components/ui/ConfirmProvider.jsx";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";

/** Debounce kecil untuk pencarian */
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

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
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 250);
  const searchRef = useRef(null);
  const textareaRef = useRef(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  /** Hotkey: "/" fokus ke search, Ctrl/Cmd+Enter submit modal */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (modalOpen && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!createMutation.isLoading && !updateMutation.isLoading) {
          handleSubmit(new Event("submit"));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, createMutation.isLoading, updateMutation.isLoading]);

  const quotes = data?.quotes || [];
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter((x) => (x.content || "").toLowerCase().includes(q));
  }, [quotes, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const openAdd = () => {
    setEditing(null);
    setContent("");
    setModalOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };
  const openEdit = (q) => {
    setEditing(q);
    setContent(q.content || "");
    setModalOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };
  const closeModal = async () => {
    const ok = await confirm({
      title: "Tutup formulir?",
      message: "Perubahan yang belum disimpan akan hilang.",
      confirmText: "Tutup",
      variant: "warning",
    });
    if (ok) setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = content.trim();
    if (!body) return;
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, content: body },
        {
          onSuccess: () => {
            setModalOpen(false);
            addToast("Quote diperbarui.", { type: "success" });
          },
          onError: (err) =>
            addToast(err?.message || "Gagal menyimpan.", { type: "error" }),
        }
      );
    } else {
      createMutation.mutate(
        { content: body },
        {
          onSuccess: () => {
            setModalOpen(false);
            addToast("Quote ditambahkan.", { type: "success" });
          },
          onError: (err) =>
            addToast(err?.message || "Gagal menambah.", { type: "error" }),
        }
      );
    }
  };

  const handleDelete = async (q) => {
    const ok = await confirm({
      title: "Hapus quote?",
      message: "Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(q.id, {
      onSuccess: () => addToast("Quote dihapus.", { type: "success" }),
      onError: (err) =>
        addToast(err?.message || "Gagal menghapus.", { type: "error" }),
    });
  };

  const isMutating = createMutation.isLoading || updateMutation.isLoading;

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card
          className="space-y-6 border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/70 p-6 backdrop-blur-xl"
          header={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">
                  Manajemen Quotes
                </h1>
                <p className="text-sm text-slate-400">
                  Tambah, edit, dan hapus kutipan yang digunakan dalam pesan.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search with icon + clear */}
                <div className="relative w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Cari isi quote…  (tekan /)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/60 pl-9 pr-9 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Bersihkan pencarian"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Add button: selalu biru di light/dark */}
                <Button
                  onClick={openAdd}
                  className="
                    inline-flex items-center gap-2 rounded-lg px-3 py-2
                    bg-sky-600 text-white hover:bg-sky-500
                    border border-sky-400/30 shadow-lg shadow-sky-600/20
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60
                    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,#0b1220)]
                  "
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tambah Quote</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
              </div>
            </div>
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300">
              <Spinner size="sm" /> Memuat quotes...
            </div>
          ) : isError ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span>{error?.message || "Gagal memuat data."}</span>
            </div>
          ) : (
            <>
              {visible.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-300">
                  Tidak ada data.
                </div>
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
                          <tr
                            key={q.id}
                            className="group bg-slate-900/50 text-slate-200 transition hover:bg-slate-900/70"
                          >
                            <td className="px-4 py-3 leading-relaxed">
                              {q.content}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1.5">
                                {/* Edit icon button */}
                                <Button
                                  variant="secondary"
                                  outline
                                  className="
                                    inline-flex h-9 w-9 items-center justify-center rounded-lg p-0
                                    hover:bg-white/5 focus:outline-none
                                    focus-visible:ring-2 focus-visible:ring-sky-300/60
                                    focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                                  "
                                  onClick={() => openEdit(q)}
                                  aria-label="Edit quote"
                                  title="Edit"
                                >
                                  <Pencil className="h-5 w-5 text-slate-200" />
                                </Button>

                                {/* Delete icon button */}
                                <Button
                                  variant="danger"
                                  outline
                                  className="
                                    inline-flex h-9 w-9 items-center justify-center rounded-lg p-0
                                    hover:bg-rose-500/10 focus:outline-none
                                    focus-visible:ring-2 focus-visible:ring-rose-300/60
                                    focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                                  "
                                  onClick={() => handleDelete(q)}
                                  aria-label="Hapus quote"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-5 w-5 text-rose-400" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Menampilkan {visible.length ? start + 1 : 0}
                  {visible.length ? `–${start + visible.length}` : ""} dari{" "}
                  {filtered.length}
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
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                    Hal {current} / {pageCount}
                  </span>
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
          )}
        </Card>

        {/* Modal Add/Edit */}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={editing ? "Edit Quote" : "Tambah Quote"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="q-content">Isi Quote</Label>
              <textarea
                id="q-content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan kutipan…"
                className="min-h-[140px] w-full resize-vertical rounded-xl border border-white/10 bg-slate-950/70 p-3 text-slate-100 shadow-inner shadow-black/20 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{content.trim().length} karakter</span>
                <span className="opacity-80">
                  Ctrl/Cmd + Enter untuk simpan
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isMutating}>
                {isMutating
                  ? "Menyimpan…"
                  : editing
                  ? "Simpan Perubahan"
                  : "Tambah"}
              </Button>
              <Button
                type="button"
                variant="danger"
                outline
                onClick={closeModal}
              >
                Batal
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
