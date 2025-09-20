import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../queries/auth";
import { useAdminCalendar, useUpdateAdminCalendar } from "../queries/calendar";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Card } from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { Trash } from "../components/ui/icons";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { useConfirm } from "../components/ui/ConfirmProvider.jsx";
import {
  CalendarPlus,
  CalendarDays,
  CalendarX,
  Save,
  RotateCcw,
} from "lucide-react";

function arraysEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((v, i) => v === right[i]);
}

const ID_FMT = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseISODate(d) {
  // memastikan local midnight untuk stabilitas label relatif
  return new Date(`${d}T00:00:00`);
}
function formatID(d) {
  try {
    return ID_FMT.format(parseISODate(d));
  } catch {
    return d;
  }
}
function relativeLabel(d) {
  try {
    const dt = parseISODate(d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((dt - today) / 86400000); // hari
    if (diff === 0) return "Hari ini";
    if (diff === 1) return "Besok";
    if (diff === -1) return "Kemarin";
    if (diff > 1) return `${diff} hari lagi`;
    return `${Math.abs(diff)} hari lalu`;
  } catch {
    return "";
  }
}
function isValidISODate(d) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(parseISODate(d).valueOf())
  );
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
  const [holidayInput, setHolidayInput] = useState("");
  const [jointLeaveInput, setJointLeaveInput] = useState("");
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState("holidays"); // 'holidays' | 'joint'
  const [addOpen, setAddOpen] = useState(false);
  const [holidaysPage, setHolidaysPage] = useState(1);
  const [jointPage, setJointPage] = useState(1);
  const pageSize = 10;

  const addInputRef = useRef(null);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    if (calendar) {
      setHolidays([...(calendar.LIBURAN ?? [])].sort());
      setJointLeaves([...(calendar.CUTI_BERSAMA ?? [])].sort());
      setHolidayInput("");
      setJointLeaveInput("");
      setFormError("");
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarResponse?.calendar]);

  const isDirty = useMemo(() => {
    if (!calendar) return false;
    const sH = [...(calendar.LIBURAN ?? [])].sort();
    const sJ = [...(calendar.CUTI_BERSAMA ?? [])].sort();
    return !arraysEqual(holidays, sH) || !arraysEqual(jointLeaves, sJ);
  }, [calendar, holidays, jointLeaves]);

  // Hotkey: Cmd/Ctrl+S untuk simpan
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !updateMutation.isLoading) {
          handleSave(new Event("submit"));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, updateMutation.isLoading, holidays, jointLeaves]);

  const pushSortedUnique = (list, setter, value) => {
    if (!isValidISODate(value)) {
      setFormError("Format tanggal tidak valid. Gunakan YYYY-MM-DD.");
      return false;
    }
    if (list.includes(value)) {
      setFormError("Tanggal tersebut sudah ada di daftar.");
      return false;
    }
    setter((prev) => [...prev, value].sort());
    setFormError("");
    updateMutation.reset();
    return true;
  };

  const handleAddHoliday = () => {
    const ok = pushSortedUnique(holidays, setHolidays, holidayInput);
    if (ok) setHolidayInput("");
    return ok;
  };

  const handleAddJointLeave = () => {
    const ok = pushSortedUnique(jointLeaves, setJointLeaves, jointLeaveInput);
    if (ok) setJointLeaveInput("");
    return ok;
  };

  const handleRemoveHoliday = async (date) => {
    const ok = await confirm({
      title: "Hapus hari libur?",
      message: `Tanggal ${formatID(date)} akan dihapus.`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setFormError("");
    updateMutation.reset();
    setHolidays((prev) => prev.filter((d) => d !== date));
    addToast("Tanggal libur dihapus dari daftar.", { type: "success" });
  };

  const handleRemoveJointLeave = async (date) => {
    const ok = await confirm({
      title: "Hapus cuti bersama?",
      message: `Tanggal ${formatID(date)} akan dihapus.`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setFormError("");
    updateMutation.reset();
    setJointLeaves((prev) => prev.filter((d) => d !== date));
    addToast("Tanggal cuti bersama dihapus dari daftar.", { type: "success" });
  };

  const handleSave = (event) => {
    event?.preventDefault?.();
    setFormError("");
    updateMutation.mutate(
      { LIBURAN: [...holidays], CUTI_BERSAMA: [...jointLeaves] },
      {
        onSuccess: () =>
          addToast("Kalender berhasil diperbarui.", { type: "success" }),
        onError: (err) =>
          addToast(err?.message || "Gagal menyimpan kalender.", {
            type: "error",
          }),
      }
    );
  };

  const handleReset = async () => {
    if (!calendar) return;
    const ok = await confirm({
      title: "Reset kalender?",
      message: "Kembalikan ke data tersimpan.",
      confirmText: "Ya, reset",
      variant: "warning",
    });
    if (!ok) return;
    setFormError("");
    updateMutation.reset();
    setHolidays([...(calendar.LIBURAN ?? [])].sort());
    setJointLeaves([...(calendar.CUTI_BERSAMA ?? [])].sort());
    addToast("Perubahan kalender direset.", { type: "info" });
  };

  const handleCancelAdd = async () => {
    const ok = await confirm({
      title: "Tutup formulir?",
      message: "Perubahan yang belum disimpan akan hilang.",
      confirmText: "Tutup",
      variant: "warning",
    });
    if (!ok) return;
    setAddOpen(false);
    setHolidayInput("");
    setJointLeaveInput("");
  };

  const isCalendarPending = calendarLoading && !calendar;

  // pagination helpers
  const paginate = (arr, page, size) =>
    arr.slice((page - 1) * size, (page - 1) * size + size);
  const holidaysPageCount = Math.max(1, Math.ceil(holidays.length / pageSize));
  const jointPageCount = Math.max(1, Math.ceil(jointLeaves.length / pageSize));

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card
          className="relative space-y-6 border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/70 p-0 backdrop-blur-xl"
          header={
            <div className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-white">
                  Pengaturan Kalender
                </h1>
                <p className="text-sm text-slate-400">
                  Kelola tanggal Hari Libur dan Cuti Bersama.
                </p>
              </div>

              <Button
                onClick={() => {
                  setAddOpen(true);
                  setTimeout(() => addInputRef.current?.focus(), 0);
                }}
                className="
                  inline-flex items-center gap-2 rounded-lg px-3 py-2
                  bg-sky-600 text-white hover:bg-sky-500
                  border border-sky-400/30 shadow-lg shadow-sky-600/20
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60
                  focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface,#0b1220)]
                "
              >
                <CalendarPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </div>
          }
        >
          {/* fetching overlay saat refetch */}
          {calendarFetching && (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-2xl bg-slate-900/30 backdrop-blur-[1px]">
              <Spinner />
            </div>
          )}

          {isCalendarPending ? (
            <div className="flex items-center gap-3 px-6 pb-6 text-slate-300">
              <Spinner /> Memuat data kalender...
            </div>
          ) : (
            <form className="space-y-8 px-6 pb-6" onSubmit={handleSave}>
              {/* Tabs */}
              <div className="inline-flex w-full items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("holidays")}
                  className={`flex-1 rounded-lg px-4 py-2 ${
                    activeTab === "holidays"
                      ? "bg-primary-500/20 font-semibold text-white shadow-inner shadow-primary-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Hari Libur
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px]">
                      {holidays.length}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("joint")}
                  className={`flex-1 rounded-lg px-4 py-2 ${
                    activeTab === "joint"
                      ? "bg-primary-500/20 font-semibold text-white shadow-inner shadow-primary-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarX className="h-4 w-4" />
                    Cuti Bersama
                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px]">
                      {jointLeaves.length}
                    </span>
                  </span>
                </button>
              </div>

              {/* Lists */}
              {activeTab === "holidays" ? (
                <div className="space-y-3">
                  <Label>Daftar Hari Libur</Label>
                  <ul className="space-y-2">
                    {holidays.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                        Belum ada tanggal yang terdaftar.
                      </li>
                    ) : (
                      paginate(holidays, holidaysPage, pageSize).map((date) => {
                        const rel = relativeLabel(date);
                        const isToday = rel === "Hari ini";
                        const isFuture = !isToday && rel.endsWith("lagi");
                        return (
                          <li
                            key={date}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-100">
                                {formatID(date)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide
                                ${
                                  isToday
                                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                                    : isFuture
                                    ? "bg-sky-500/15 text-sky-200 border border-sky-400/30"
                                    : "bg-slate-500/15 text-slate-200 border border-slate-400/30"
                                }`}
                              >
                                {rel}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              outline
                              size="sm"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg p-0 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                              onClick={() => handleRemoveHoliday(date)}
                              aria-label="Hapus hari libur"
                              title="Hapus"
                            >
                              <Trash size={18} />
                            </Button>
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {holidays.length > pageSize && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                      <span>
                        Menampilkan{" "}
                        {Math.min(
                          (holidaysPage - 1) * pageSize + 1,
                          holidays.length
                        )}
                        –{Math.min(holidaysPage * pageSize, holidays.length)}{" "}
                        dari {holidays.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setHolidaysPage(1)}
                          disabled={holidaysPage <= 1}
                        >
                          « Awal
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setHolidaysPage((p) => Math.max(1, p - 1))
                          }
                          disabled={holidaysPage <= 1}
                        >
                          Sebelumnya
                        </Button>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                          Hal {holidaysPage} / {holidaysPageCount}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setHolidaysPage((p) =>
                              Math.min(holidaysPageCount, p + 1)
                            )
                          }
                          disabled={holidaysPage >= holidaysPageCount}
                        >
                          Berikutnya
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setHolidaysPage(holidaysPageCount)}
                          disabled={holidaysPage >= holidaysPageCount}
                        >
                          Akhir »
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Daftar Cuti Bersama</Label>
                  <ul className="space-y-2">
                    {jointLeaves.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
                        Belum ada tanggal yang terdaftar.
                      </li>
                    ) : (
                      paginate(jointLeaves, jointPage, pageSize).map((date) => {
                        const rel = relativeLabel(date);
                        const isToday = rel === "Hari ini";
                        const isFuture = !isToday && rel.endsWith("lagi");
                        return (
                          <li
                            key={date}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-100">
                                {formatID(date)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide
                                ${
                                  isToday
                                    ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                                    : isFuture
                                    ? "bg-sky-500/15 text-sky-200 border border-sky-400/30"
                                    : "bg-slate-500/15 text-slate-200 border border-slate-400/30"
                                }`}
                              >
                                {rel}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              outline
                              size="sm"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg p-0 hover:bg-rose-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                              onClick={() => handleRemoveJointLeave(date)}
                              aria-label="Hapus cuti bersama"
                              title="Hapus"
                            >
                              <Trash size={18} />
                            </Button>
                          </li>
                        );
                      })
                    )}
                  </ul>

                  {jointLeaves.length > pageSize && (
                    <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                      <span>
                        Menampilkan{" "}
                        {Math.min(
                          (jointPage - 1) * pageSize + 1,
                          jointLeaves.length
                        )}
                        –{Math.min(jointPage * pageSize, jointLeaves.length)}{" "}
                        dari {jointLeaves.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setJointPage(1)}
                          disabled={jointPage <= 1}
                        >
                          « Awal
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setJointPage((p) => Math.max(1, p - 1))
                          }
                          disabled={jointPage <= 1}
                        >
                          Sebelumnya
                        </Button>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                          Hal {jointPage} / {jointPageCount}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setJointPage((p) => Math.min(jointPageCount, p + 1))
                          }
                          disabled={jointPage >= jointPageCount}
                        >
                          Berikutnya
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setJointPage(jointPageCount)}
                          disabled={jointPage >= jointPageCount}
                        >
                          Akhir »
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save/Reset */}
              <div className="space-y-3">
                {formError ? (
                  <p className="text-sm text-rose-300">{formError}</p>
                ) : null}
                {updateMutation.error ? (
                  <p className="text-sm text-rose-300">
                    {updateMutation.error.message}
                  </p>
                ) : null}
                {updateMutation.isSuccess && !isDirty ? (
                  <p className="text-sm text-emerald-300">
                    Kalender berhasil diperbarui.
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={!isDirty || updateMutation.isLoading}
                    className="
                      inline-flex items-center gap-2 rounded-lg px-4 py-2
                      bg-sky-600 text-white hover:bg-sky-500
                      border border-sky-400/30 shadow-lg shadow-sky-600/20
                      disabled:opacity-60
                    "
                  >
                    {updateMutation.isLoading ? (
                      <>Menyimpan…</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Simpan Perubahan
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={!isDirty || updateMutation.isLoading}
                    className="inline-flex items-center gap-2 rounded-lg"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>

        {/* Modal tambah tanggal */}
        <Modal
          open={addOpen}
          onClose={handleCancelAdd}
          title={
            activeTab === "holidays"
              ? "Tambah Hari Libur"
              : "Tambah Cuti Bersama"
          }
        >
          <div className="space-y-4">
            <Label htmlFor="date-input">Tanggal</Label>
            <Input
              id="date-input"
              ref={addInputRef}
              type="date"
              value={activeTab === "holidays" ? holidayInput : jointLeaveInput}
              onChange={(e) =>
                activeTab === "holidays"
                  ? setHolidayInput(e.target.value)
                  : setJointLeaveInput(e.target.value)
              }
              min="2020-01-01"
              required
              className="rounded-lg border-slate-700 bg-slate-900/60"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  const ok =
                    activeTab === "holidays"
                      ? handleAddHoliday()
                      : handleAddJointLeave();
                  if (ok) setAddOpen(false);
                }}
                disabled={
                  (activeTab === "holidays"
                    ? !holidayInput
                    : !jointLeaveInput) || updateMutation.isLoading
                }
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 border border-sky-400/30"
              >
                Tambah
              </Button>
              <Button
                type="button"
                variant="danger"
                outline
                onClick={handleCancelAdd}
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
