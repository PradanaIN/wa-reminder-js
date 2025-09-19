import { useBotStart, useBotStatus, useBotStop } from '../queries/bot';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Skeleton } from './ui/Skeleton';
import { StatusPill } from './StatusPill';

export function BotControlPanel() {
  const { data, isLoading } = useBotStatus();
  const startMutation = useBotStart();
  const stopMutation = useBotStop();

  const starting = startMutation.isLoading;
  const stopping = stopMutation.isLoading;

  return (
    <Card className="relative flex flex-col gap-5 overflow-hidden border-primary-500/20 bg-gradient-to-br from-primary-500/15 via-slate-900/70 to-slate-900/80 p-8 shadow-primary-500/20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_55%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Kontrol Bot WhatsApp</h3>
          <p className="text-sm text-slate-200">
            Pantau dan kontrol status bot untuk menjamin pengiriman pesan pengingat berjalan sesuai jadwal.
          </p>
        </div>
        {isLoading ? <Skeleton className="h-6 w-24" /> : <StatusPill active={Boolean(data?.active)} />}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={starting || data?.active}
          onClick={() => startMutation.mutate()}
        >
          {starting ? 'Mengaktifkan...' : 'Start Bot'}
        </Button>
        <Button
          variant="danger"
          disabled={stopping || !data?.active}
          onClick={() => stopMutation.mutate()}
        >
          {stopping ? 'Menghentikan...' : 'Stop Bot'}
        </Button>
      </div>
      {(startMutation.error || stopMutation.error) && (
        <p className="text-sm text-rose-300">
          {(startMutation.error || stopMutation.error)?.message}
        </p>
      )}
    </Card>
  );
}
