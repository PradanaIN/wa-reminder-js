import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../queries/auth';
import { useAdminCalendar, useUpdateAdminCalendar } from '../queries/calendar';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Trash } from '../components/ui/icons';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { useConfirm } from '../components/ui/ConfirmProvider.jsx';

function arraysEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export default function AdminHolidaysPage() {
  const { add: addToast } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const {
    data: calendarResponse,
    isLoading: calendarLoading,
    isFetching: calendarFetching,
  } = useAdminCalendar();
  const updateMutation = useUpdateAdminCalendar();

  const calendar = calendarResponse?.calendar;

  const [holidays, setHolidays] = useState([]);
  const [jointLeaves, setJointLeaves] = useState([]);
  const [holidayInput, setHolidayInput] = useState('');
  const [jointLeaveInput, setJointLeaveInput] = useState('');
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('holidays'); // 'holidays' | 'joint'
  const [addOpen, setAddOpen] = useState(false);
  const [holidaysPage, setHolidaysPage] = useState(1);
  const [jointPage, setJointPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (calendar) {
      setHolidays([...(calendar.LIBURAN ?? [])].sort());
      setJointLeaves([...(calendar.CUTI_BERSAMA ?? [])].sort());
      setHolidayInput('');
      setJointLeaveInput('');
      setFormError('');
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarResponse?.calendar]);

  const isDirty = useMemo(() => {
    if (!calendar) return false;
    const sortedServerHolidays = [...(calendar.LIBURAN ?? [])].sort();
    const sortedServerJointLeaves = [...(calendar.CUTI_BERSAMA ?? [])].sort();
    return (
      !arraysEqual(holidays, sortedServerHolidays) ||
      !arraysEqual(jointLeaves, sortedServerJointLeaves)
    );
  }, [calendar, holidays, jointLeaves]);

  const handleAddHoliday = () => {
    if (!holidayInput) return;
    if (holidays.includes(holidayInput)) {
      setFormError('Tanggal tersebut sudah ada di daftar hari libur.');
      return;
    }
    if (jointLeaves.includes(holidayInput)) {
      setFormError('Tanggal tersebut sudah terdaftar sebagai cuti bersama.');
      return;
    }
    setFormError('');
    updateMutation.reset();
    setHolidays((prev) => [...prev, holidayInput].sort());
    setHolidayInput('');
  };

  const handleAddJointLeave = () => {
    if (!jointLeaveInput) return;
    if (jointLeaves.includes(jointLeaveInput)) {
      setFormError('Tanggal tersebut sudah ada di daftar cuti bersama.');
      return;
    }
    if (holidays.includes(jointLeaveInput)) {
      setFormError('Tanggal tersebut sudah terdaftar sebagai hari libur.');
      return;
    }
    setFormError('');
    updateMutation.reset();
    setJointLeaves((prev) => [...prev, jointLeaveInput].sort());
    setJointLeaveInput('');
  };

  const handleRemoveHoliday = async (date) => {
    const ok = await confirm({ title: 'Hapus hari libur?', message: `Tanggal ${date} akan dihapus.`, confirmText: 'Hapus', variant: 'danger' });
    if (!ok) return;
    setFormError('');
    updateMutation.reset();
    setHolidays((prev) => prev.filter((item) => item !== date));
    addToast('Tanggal libur dihapus dari daftar.', { type: 'success' });
  };

  const handleRemoveJointLeave = async (date) => {
    const ok = await confirm({ title: 'Hapus cuti bersama?', message: `Tanggal ${date} akan dihapus.`, confirmText: 'Hapus', variant: 'danger' });
    if (!ok) return;
    setFormError('');
    updateMutation.reset();
    setJointLeaves((prev) => prev.filter((item) => item !== date));
    addToast('Tanggal cuti bersama dihapus dari daftar.', { type: 'success' });
  };

  const handleSave = (event) => {
    event.preventDefault();
    setFormError('');
    updateMutation.mutate(
      {
        LIBURAN: [...holidays],
        CUTI_BERSAMA: [...jointLeaves],
      },
      {
        onSuccess: () => addToast('Kalender berhasil diperbarui.', { type: 'success' }),
        onError: (err) => addToast(err?.message || 'Gagal menyimpan kalender.', { type: 'error' }),
      }
    );
  };

  const handleReset = async () => {
    if (!calendar) return;
    const ok = await confirm({ title: 'Reset kalender?', message: 'Kembalikan ke data tersimpan.', confirmText: 'Ya, reset', variant: 'warning' });
    if (!ok) return;
    setFormError('');
    updateMutation.reset();
    setHolidays([...(calendar.LIBURAN ?? [])].sort());
    setJointLeaves([...(calendar.CUTI_BERSAMA ?? [])].sort());
    addToast('Perubahan kalender direset.', { type: 'info' });
  };

  const handleCancelAdd = async () => {
    const ok = await confirm({ title: 'Tutup formulir?', message: 'Perubahan yang belum disimpan akan hilang.', confirmText: 'Tutup', variant: 'warning' });
    if (!ok) return;
    setAddOpen(false);
    if (activeTab === 'holidays') {
      setHolidayInput('');
    } else {
      setJointLeaveInput('');
    }
  };

  const isCalendarPending = calendarLoading && !calendar;

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card
          className="space-y-6 border-white/10 bg-slate-900/70 p-0"
          header={
            <div className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">Pengaturan Kalender</h1>
                <p className="text-sm text-slate-400">Kelola tanggal Hari Libur dan Cuti Bersama.</p>
              </div>
              <Button onClick={() => setAddOpen(true)}>
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ Tambah</span>
              </Button>
            </div>
          }
        >
          {isCalendarPending ? (
            <div className="flex items-center gap-3 px-6 pb-6 text-slate-300">
              <Spinner /> Memuat data kalender...
            </div>
          ) : (
            <form className="space-y-8 px-6 pb-6" onSubmit={handleSave}>
              <div className="inline-flex w-full items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1 text-sm">
                <button type="button" onClick={() => setActiveTab('holidays')} className={activeTab === 'holidays' ? 'flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20' : 'flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white'}>
                  Hari Libur
                </button>
                <button type="button" onClick={() => setActiveTab('joint')} className={activeTab === 'joint' ? 'flex-1 rounded-lg bg-primary-500/20 px-4 py-2 font-semibold text-white shadow-inner shadow-primary-500/20' : 'flex-1 rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white'}>
                  Cuti Bersama
                </button>
              </div>

              {activeTab === 'holidays' ? (
                <div className="space-y-3">
                  <Label>Daftar Hari Libur</Label>
                  <ul className="space-y-2">
                    {holidays.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">Belum ada tanggal yang terdaftar.</li>
                    ) : (
                      holidays.slice((holidaysPage-1)*pageSize, (holidaysPage-1)*pageSize + pageSize).map((date) => (
                        <li key={date} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm">
                          <span className="font-medium text-slate-100">{date}</span>
                          <Button type="button" variant="danger" outline size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => handleRemoveHoliday(date)} aria-label="Hapus">
                            <Trash size={16} />
                          </Button>
                        </li>
                      ))
                    )}
                  </ul>
                  {holidays.length > pageSize && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                      <span>
                        Menampilkan {Math.min((holidaysPage-1)*pageSize+1, holidays.length)}–{Math.min(holidaysPage*pageSize, holidays.length)} dari {holidays.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setHolidaysPage((p) => Math.max(1, p-1))} disabled={holidaysPage<=1}>Sebelumnya</Button>
                        <span className="px-2">Hal {holidaysPage} / {Math.ceil(holidays.length/pageSize)}</span>
                        <Button variant="secondary" size="sm" onClick={() => setHolidaysPage((p) => Math.min(Math.ceil(holidays.length/pageSize), p+1))} disabled={holidaysPage>=Math.ceil(holidays.length/pageSize)}>Berikutnya</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Daftar Cuti Bersama</Label>
                  <ul className="space-y-2">
                    {jointLeaves.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">Belum ada tanggal yang terdaftar.</li>
                    ) : (
                      jointLeaves.slice((jointPage-1)*pageSize, (jointPage-1)*pageSize + pageSize).map((date) => (
                        <li key={date} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm">
                          <span className="font-medium text-slate-100">{date}</span>
                          <Button type="button" variant="danger" outline size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => handleRemoveJointLeave(date)} aria-label="Hapus">
                            <Trash size={16} />
                          </Button>
                        </li>
                      ))
                    )}
                  </ul>
                  {jointLeaves.length > pageSize && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                      <span>
                        Menampilkan {Math.min((jointPage-1)*pageSize+1, jointLeaves.length)}–{Math.min(jointPage*pageSize, jointLeaves.length)} dari {jointLeaves.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setJointPage((p) => Math.max(1, p-1))} disabled={jointPage<=1}>Sebelumnya</Button>
                        <span className="px-2">Hal {jointPage} / {Math.ceil(jointLeaves.length/pageSize)}</span>
                        <Button variant="secondary" size="sm" onClick={() => setJointPage((p) => Math.min(Math.ceil(jointLeaves.length/pageSize), p+1))} disabled={jointPage>=Math.ceil(jointLeaves.length/pageSize)}>Berikutnya</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}
                {updateMutation.error ? <p className="text-sm text-rose-300">{updateMutation.error.message}</p> : null}
                {updateMutation.isSuccess && !isDirty ? <p className="text-sm text-emerald-300">Kalender berhasil diperbarui.</p> : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={!isDirty || updateMutation.isLoading}>{updateMutation.isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                  <Button type="button" variant="secondary" onClick={handleReset} disabled={!isDirty || updateMutation.isLoading}>Reset</Button>
                </div>
              </div>
            </form>
          )}
        </Card>

        <Modal open={addOpen} onClose={handleCancelAdd} title={activeTab === 'holidays' ? 'Tambah Hari Libur' : 'Tambah Cuti Bersama'}>
          <div className="space-y-4">
            <Label htmlFor="date-input">Tanggal</Label>
            <Input
              id="date-input"
              type="date"
              value={activeTab === 'holidays' ? holidayInput : jointLeaveInput}
              onChange={(e) => (activeTab === 'holidays' ? setHolidayInput(e.target.value) : setJointLeaveInput(e.target.value))}
            />
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  if (activeTab === 'holidays') {
                    handleAddHoliday();
                  } else {
                    handleAddJointLeave();
                  }
                  // Close when input cleared by handler
                  const ok = activeTab === 'holidays' ? !holidayInput : !jointLeaveInput;
                  if (ok) setAddOpen(false);
                }}
                disabled={(activeTab === 'holidays' ? !holidayInput : !jointLeaveInput) || updateMutation.isLoading}
              >
                Tambah
              </Button>
              <Button type="button" variant="danger" outline onClick={handleCancelAdd}>Batal</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
