import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../queries/auth';
import { useAdminSchedule, useAddOverride, useRemoveOverride } from '../queries/schedule';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { OverrideTable } from '../components/OverrideTable';

export default function AdminOverridesPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: scheduleResponse, isLoading: scheduleLoading } = useAdminSchedule();
  const addOverrideMutation = useAddOverride();
  const removeOverrideMutation = useRemoveOverride();

  const schedule = scheduleResponse?.schedule;

  const [overrideForm, setOverrideForm] = useState({ date: '', time: '', note: '' });

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    addOverrideMutation.mutate(overrideForm, {
      onSuccess: () => setOverrideForm({ date: '', time: '', note: '' }),
    });
  };

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-white">Override Manual</h1>
              <p className="text-sm text-slate-400">Kelola jadwal khusus untuk menggantikan jadwal otomatis pada tanggal tertentu.</p>
            </div>
          </div>

          <form className="grid gap-4 md:grid-cols-4" onSubmit={handleOverrideSubmit}>
            <div className="space-y-2">
              <Label htmlFor="override-date">Tanggal</Label>
              <Input
                id="override-date"
                type="date"
                value={overrideForm.date}
                onChange={(e) => setOverrideForm((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="override-time">Waktu</Label>
              <Input
                id="override-time"
                type="time"
                value={overrideForm.time}
                onChange={(e) => setOverrideForm((p) => ({ ...p, time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="override-note">Catatan (opsional)</Label>
              <Input
                id="override-note"
                placeholder="Misal: Rapat koordinasi"
                value={overrideForm.note}
                onChange={(e) => setOverrideForm((p) => ({ ...p, note: e.target.value }))}
              />
            </div>
            <div className="md:col-span-4">
              {addOverrideMutation.error && (
                <p className="pb-2 text-sm text-rose-300">{addOverrideMutation.error.message}</p>
              )}
              <Button type="submit" disabled={!overrideForm.date || !overrideForm.time || addOverrideMutation.isLoading}>
                {addOverrideMutation.isLoading ? 'Menambahkan...' : 'Tambah Override'}
              </Button>
            </div>
          </form>

          <OverrideTable overrides={schedule?.manualOverrides} onRemove={(date) => removeOverrideMutation.mutate(date)} />
          {removeOverrideMutation.error && (
            <p className="text-sm text-rose-300">{removeOverrideMutation.error.message}</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
