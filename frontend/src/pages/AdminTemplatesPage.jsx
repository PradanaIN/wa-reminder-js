import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../queries/auth';
import { useTemplate, useUpdateTemplate } from '../queries/templates';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/ToastProvider.jsx';

export default function AdminTemplatesPage() {
  const { add: addToast } = useToast();
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data, isLoading } = useTemplate();
  const updateMutation = useUpdateTemplate();

  const NAME_PLACEHOLDER = '{name}';
  const QUOTE_PLACEHOLDER = '{quote}';

  const [template, setTemplate] = useState('');
  const [activeTab, setActiveTab] = useState('template'); // 'template' | 'preview'
  const [filterName, setFilterName] = useState('');
  const preview = useMemo(
    () =>
      template
        .replaceAll(NAME_PLACEHOLDER, filterName || 'Nama')
        .replaceAll(QUOTE_PLACEHOLDER, 'Kutipan hari ini'),
    [template, filterName]
  );

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (data?.template) setTemplate(data.template);
  }, [data]);

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate(template, {
      onSuccess: () => addToast('Template berhasil disimpan.', { type: 'success' }),
      onError: (err) => addToast(err?.message || 'Gagal menyimpan template.', { type: 'error' }),
    });
  };

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Pengaturan Template Pesan</h1>
            <p className="text-sm text-slate-400">
              Gunakan placeholder <code>{NAME_PLACEHOLDER}</code> dan <code>{QUOTE_PLACEHOLDER}</code> untuk menyisipkan nama
              dan kutipan.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-300"><Spinner /> Memuat template...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="inline-flex w-full items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1 text-sm">
                <button type="button" onClick={() => setActiveTab('template')} className={activeTab === 'template' ? 'flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20' : 'flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white'}>
                  Template
                </button>
                <button type="button" onClick={() => setActiveTab('preview')} className={activeTab === 'preview' ? 'flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20' : 'flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white'}>
                  Pratinjau
                </button>
              </div>

              {activeTab === 'template' ? (
                <div className="space-y-3">
                  <Label htmlFor="template">Template</Label>
                  <textarea
                    id="template"
                    className="min-h-[260px] w-full resize-vertical rounded-xl border border-white/10 bg-slate-950/70 p-4 text-slate-100 shadow-inner shadow-black/20 focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/20"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                  />
                  {updateMutation.error ? <p className="text-sm text-rose-300">{updateMutation.error.message}</p> : null}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={updateMutation.isLoading}>{updateMutation.isLoading ? 'Menyimpan...' : 'Simpan Template'}</Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const ok = window.confirm('Reset isi template ke versi tersimpan?');
                        if (!ok) return;
                        setTemplate(data?.template || '');
                        addToast('Perubahan template direset.', { type: 'info' });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                  {updateMutation.isSuccess ? <p className="text-sm text-emerald-300">Template berhasil disimpan.</p> : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Pratinjau</Label>
                  <div className="flex items-center gap-3">
                    <Input placeholder="Coba nama..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
                  </div>
                  <div className="min-h-[260px] whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/70 p-4 text-slate-200">
                    {preview}
                  </div>
                </div>
              )}
            </form>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
