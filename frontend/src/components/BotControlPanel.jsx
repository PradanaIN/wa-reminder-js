import { useBotStart, useBotStatus, useBotStop } from "../queries/bot";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { Skeleton } from "./ui/Skeleton";
import { StatusPill } from "./StatusPill";

export function BotControlPanel() {
  const { data, isLoading } = useBotStatus();
  const startMutation = useBotStart();
  const stopMutation = useBotStop();

  const starting = startMutation.isLoading;
  const stopping = stopMutation.isLoading;
  const active = Boolean(data?.active);

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
            onClick={() => startMutation.mutate()}
          >
            {starting && <Spinner size="sm" className="mr-2" />}
            {starting ? "Mengaktifkan..." : "Start Bot"}
          </Button>
          <Button variant="danger" disabled={stopping || !active} type="button" onClick={() => stopMutation.mutate()}>
            {stopping && <Spinner size="sm" className="mr-2" />}
            {stopping ? "Menghentikan..." : "Stop Bot"}
          </Button>
        </div>

        {(startMutation.error || stopMutation.error) && (
          <p className="text-sm text-rose-300">{(startMutation.error || stopMutation.error)?.message}</p>
        )}
      </div>
    </Card>
  );
}

