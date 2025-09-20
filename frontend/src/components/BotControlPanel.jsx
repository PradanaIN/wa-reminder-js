import { useBotStart, useBotStatus, useBotStop } from "../queries/bot";
import { useQr } from "../queries/system";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { Skeleton } from "./ui/Skeleton";
import { StatusPill } from "./StatusPill";
import { useToast } from "./ui/ToastProvider.jsx";

export function BotControlPanel() {
  const { data, isLoading } = useBotStatus();
  const startMutation = useBotStart();
  const stopMutation = useBotStop();
  const { data: qrData, isLoading: qrLoading } = useQr();
  const { add: addToast } = useToast();

  const starting = startMutation.isLoading;
  const stopping = stopMutation.isLoading;
  const active = Boolean(data?.active);
  const qr = qrData?.qr || null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary-500/15 via-slate-900/70 to-slate-900/80 shadow-primary-500/20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />

      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 text-primary-400"><span className="text-base">??</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Kontrol Bot WhatsApp</h3>
              <p className="text-sm text-slate-300">Pantau dan kontrol status bot agar pengiriman pesan berjalan sesuai jadwal.</p>
            </div>
          </div>
          {isLoading ? <Skeleton className="h-6 w-24" /> : <StatusPill active={active} />}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="success"
            disabled={starting || active}
            type="button"
            onClick={() =>
              startMutation.mutate(undefined, {
                onSuccess: () => addToast('Bot berhasil diaktifkan.', { type: 'success' }),
                onError: (err) => addToast(err?.message || 'Gagal mengaktifkan bot.', { type: 'error' }),
              })
            }
          >
            {starting && <Spinner size="sm" className="mr-2" />}
            {starting ? "Mengaktifkan..." : "Start Bot"}
          </Button>
          <Button
            variant="danger"
            disabled={stopping || !active}
            type="button"
            onClick={() =>
              stopMutation.mutate(undefined, {
                onSuccess: () => addToast('Bot dihentikan.', { type: 'success' }),
                onError: (err) => addToast(err?.message || 'Gagal menghentikan bot.', { type: 'error' }),
              })
            }
          >
            {stopping && <Spinner size="sm" className="mr-2" />}
            {stopping ? "Menghentikan..." : "Stop Bot"}
          </Button>
        </div>

        {(startMutation.error || stopMutation.error) && (
          <p className="text-sm text-rose-300">{(startMutation.error || stopMutation.error)?.message}</p>
        )}

        {/* QR helper */}
        {!active && (
          <div className="mt-1 rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-white">Perlu scan QR untuk login WhatsApp</p>
              <p className="text-xs text-slate-400">Buka WhatsApp di ponsel {'>'} Perangkat tertaut {'>'} Tautkan perangkat, lalu arahkan kamera ke QR di bawah.</p>
            </div>

            {qr ? (
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qr)}`}
                  alt="QR WhatsApp"
                  className="h-auto w-40 rounded border border-white/10 bg-white/5 p-2 sm:w-48"
                />
                <div className="flex-1 text-xs text-slate-400 sm:pl-4">
                  <p className="mb-2">QR diperbarui otomatis setiap beberapa detik hingga berhasil login.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      outline
                      size="sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(qr);
                        addToast('QR disalin ke clipboard.', { type: 'info' });
                      }}
                    >
                      Salin kode mentah
                    </Button>
                    <span className="self-center text-[11px] text-slate-500">{qrLoading ? "Memuat QR..." : "Siap discan"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Spinner size="sm" />
                <span>Menunggu QR dari server... Klik "Start Bot" bila belum.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
