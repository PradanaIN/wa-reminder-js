import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../queries/auth";
import {
  useAdminSchedule,
  useAddOverride,
  useRemoveOverride,
} from "../queries/schedule";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Card } from "../components/ui/Card";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { OverrideTable } from "../components/OverrideTable";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { useConfirm } from "../components/ui/ConfirmProvider.jsx";
import { CalendarPlus, Info, X } from "lucide-react";

function localTodayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function toDateKey(item) {
  // manualOverrides bisa berupa array string atau objek {date, time, note}
  return typeof item === "string" ? item : item?.date || "";
}

export default function AdminOverridesPage() {
  const navigate = useNavigate();
  const { add: addToast } = useToast();
  const { confirm } = useConfirm();
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: scheduleResponse, isFetching } = useAdminSchedule();
  const addOverrideMutation = useAddOverride();
  const removeOverrideMutation = useRemoveOverride();

  const schedule = scheduleResponse?.schedule;

  const [overrideForm, setOverrideForm] = useState({
    date: "",
    time: "",
    note: "",
  });
  const [formError, setFormError] = useState("");
  const dateRef = useRef(null);

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [session, sessionLoading, navigate]);

  const existingDates = useMemo(() => {
    const list = schedule?.manualOverrides ?? [];
    return new Set(list.map(toDateKey).filter(Boolean));
  }, [schedule]);

  const isDuplicate =
    !!overrideForm.date && existingDates.has(overrideForm.date);
  const isInvalid = !overrideForm.date || !overrideForm.time;

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (isDuplicate) {
      setFormError(
        "Tanggal tersebut sudah memiliki override. Hapus dulu untuk mengganti."
      );
      return;
    }
    if (isInvalid) return;

    addOverrideMutation.mutate(overrideForm, {
      onSuccess: () => {
        setOverrideForm({ date: "", time: "", note: "" });
        addToast("Override ditambahkan.", { type: "success" });
        // fokus balik ke field tanggal untuk entry cepat berikutnya
        setTimeout(() => dateRef.current?.focus(), 0);
      },
      onError: (err) => {
        setFormError(err?.message || "Gagal menambahkan override.");
      },
    });
  };

  const handleRemove = async (date) => {
    const ok = await confirm({
      title: "Hapus override?",
      message: `Override pada tanggal ${date} akan dihapus.`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;

    removeOverrideMutation.mutate(date, {
      onSuccess: () => addToast("Override dihapus.", { type: "success" }),
      onError: (err) =>
        addToast(err?.message || "Gagal menghapus override.", {
          type: "error",
        }),
    });
  };

  const clearForm = () => {
    setOverrideForm({ date: "", time: "", note: "" });
    setFormError("");
    dateRef.current?.focus();
  };

  return (
    <AdminLayout username={session?.user?.username} loading={sessionLoading}>
      <div className="space-y-8">
        <Card className="space-y-6 border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/70 p-6 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-white">
                Override Manual
              </h1>
              <p className="text-sm text-slate-400">
                Jadwalkan pengiriman khusus yang <em>menggantikan</em> jadwal
                otomatis pada tanggal tertentu.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-200">
              <Info className="h-3.5 w-3.5" />
              {existingDates.size} override
            </span>
          </div>

          {/* Form */}
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={handleOverrideSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="override-date">Tanggal</Label>
              <Input
                id="override-date"
                ref={dateRef}
                type="date"
                min={localTodayISO()}
                value={overrideForm.date}
                onChange={(e) => {
                  setOverrideForm((p) => ({ ...p, date: e.target.value }));
                  setFormError("");
                }}
                required
                aria-invalid={Boolean(formError)}
                className="rounded-lg border-slate-700 bg-slate-900/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-time">Waktu</Label>
              <Input
                id="override-time"
                type="time"
                value={overrideForm.time}
                onChange={(e) => {
                  setOverrideForm((p) => ({ ...p, time: e.target.value }));
                  setFormError("");
                }}
                required
                className="rounded-lg border-slate-700 bg-slate-900/60"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="override-note">Catatan (opsional)</Label>
                {overrideForm.note && (
                  <button
                    type="button"
                    onClick={() => setOverrideForm((p) => ({ ...p, note: "" }))}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-slate-300 hover:bg-white/5"
                    aria-label="Bersihkan catatan"
                  >
                    <X className="h-3.5 w-3.5" /> Bersihkan
                  </button>
                )}
              </div>
              <Input
                id="override-note"
                placeholder="Misal: Rapat koordinasi"
                value={overrideForm.note}
                onChange={(e) =>
                  setOverrideForm((p) => ({ ...p, note: e.target.value }))
                }
                className="rounded-lg border-slate-700 bg-slate-900/60"
              />
            </div>

            <div className="md:col-span-4 flex flex-wrap items-center gap-3">
              {formError ? (
                <p className="text-sm text-rose-300">{formError}</p>
              ) : removeOverrideMutation.error ? (
                <p className="text-sm text-rose-300">
                  {removeOverrideMutation.error.message}
                </p>
              ) : null}

              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearForm}
                  disabled={addOverrideMutation.isLoading}
                  className="rounded-lg"
                >
                  Bersihkan
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isInvalid || isDuplicate || addOverrideMutation.isLoading
                  }
                  className="
                    inline-flex items-center gap-2 rounded-lg px-4 py-2
                    bg-sky-600 text-white hover:bg-sky-500
                    border border-sky-400/30 shadow-lg shadow-sky-600/20
                    disabled:opacity-60
                  "
                >
                  <CalendarPlus className="h-4 w-4" />
                  {addOverrideMutation.isLoading
                    ? "Menambahkan…"
                    : "Tambah Override"}
                </Button>
              </div>
            </div>
          </form>

          {/* Table */}
          <OverrideTable
            overrides={schedule?.manualOverrides}
            onRemove={async (date) => handleRemove(date)}
          />

          {/* Fetching badge */}
          {isFetching && (
            <p className="text-xs text-slate-400">Menyinkronkan jadwal…</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
