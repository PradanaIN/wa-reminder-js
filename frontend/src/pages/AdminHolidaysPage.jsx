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

function arraysEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export default function AdminHolidaysPage() {
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

  const handleRemoveHoliday = (date) => {
    setFormError('');
    updateMutation.reset();
    setHolidays((prev) => prev.filter((item) => item !== date));
  };

  const handleRemoveJointLeave = (date) => {
    setFormError('');
    updateMutation.reset();
    setJointLeaves((prev) => prev.filter((item) => item !== date));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setFormError('');
    updateMutation.mutate({
      LIBURAN: [...holidays],
      CUTI_BERSAMA: [...jointLeaves],
    });
  };

  const handleReset = () => {
    if (!calendar) return;
    setFormError('');
    updateMutation.reset();
    setHolidays([...(calendar.LIBURAN ?? [])].sort());
    setJointLeaves([...(calendar.CUTI_BERSAMA ?? [])].sort());
  };

  const isCalendarPending = calendarLoading && !calendar;

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card className="space-y-6 border-white/10 bg-slate-900/70 p-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">Kalender Hari Libur Lokal</h1>
            <p className="text-sm text-slate-400">
              Atur daftar hari libur dan cuti bersama yang digunakan penjadwal saat Google
              Calendar tidak tersedia.
            </p>
            {calendarFetching && !calendarLoading ? (
              <p className="text-xs text-slate-400">Memuat pembaruan terbaru...</p>
            ) : null}
          </div>

          {isCalendarPending ? (
            <div className="flex items-center gap-3 text-slate-300">
              <Spinner /> Memuat data kalender...
            </div>
          ) : (
            <form className="space-y-10" onSubmit={handleSave}>
              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="holiday-date">Tambah Hari Libur</Label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="holiday-date"
                        type="date"
                        value={holidayInput}
                        onChange={(event) => setHolidayInput(event.target.value)}
                        className="sm:flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddHoliday}
                        disabled={!holidayInput || updateMutation.isLoading}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Daftar Hari Libur</Label>
                    <ul className="space-y-2">
                      {holidays.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                          Belum ada tanggal yang terdaftar.
                        </li>
                      ) : (
                        holidays.map((date) => (
                          <li
                            key={date}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm"
                          >
                            <span className="font-medium text-slate-100">{date}</span>
                            <Button
                              type="button"
                              variant="danger"
                              outline
                              size="sm"
                              onClick={() => handleRemoveHoliday(date)}
                            >
                              Hapus
                            </Button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joint-leave-date">Tambah Cuti Bersama</Label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id="joint-leave-date"
                        type="date"
                        value={jointLeaveInput}
                        onChange={(event) => setJointLeaveInput(event.target.value)}
                        className="sm:flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddJointLeave}
                        disabled={!jointLeaveInput || updateMutation.isLoading}
                        variant="secondary"
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Daftar Cuti Bersama</Label>
                    <ul className="space-y-2">
                      {jointLeaves.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                          Belum ada tanggal yang terdaftar.
                        </li>
                      ) : (
                        jointLeaves.map((date) => (
                          <li
                            key={date}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm"
                          >
                            <span className="font-medium text-slate-100">{date}</span>
                            <Button
                              type="button"
                              variant="danger"
                              outline
                              size="sm"
                              onClick={() => handleRemoveJointLeave(date)}
                            >
                              Hapus
                            </Button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              <div className="space-y-3">
                {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}
                {updateMutation.error ? (
                  <p className="text-sm text-rose-300">{updateMutation.error.message}</p>
                ) : null}
                {updateMutation.isSuccess && !isDirty ? (
                  <p className="text-sm text-emerald-300">Kalender berhasil diperbarui.</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={!isDirty || updateMutation.isLoading}>
                    {updateMutation.isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    disabled={!isDirty || updateMutation.isLoading}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
