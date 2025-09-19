import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useSession } from '../queries/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Spinner } from '../components/ui/Spinner';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession();
  const loginMutation = useLogin();
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (session?.authenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.mutate(form, {
      onSuccess: () => navigate('/admin/dashboard', { replace: true }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_55%)]" />
      <div className="absolute inset-y-0 right-[-15%] h-[420px] w-[55%] rounded-full bg-primary-500/25 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/70 p-10 shadow-2xl shadow-slate-900/40 backdrop-blur">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-slate-300 hover:text-white">
            &larr; Kembali ke status publik
          </Link>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
            WA Reminder Admin
          </span>
        </div>

        <div className="mb-6 space-y-3">
          <h1 className="text-3xl font-semibold text-white">Masuk ke Dashboard Admin</h1>
          <p className="text-sm text-slate-300">
            Kelola penjadwalan otomatis, override manual, serta monitoring log aktivitas bot WhatsApp.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>
          {loginMutation.error ? (
            <p className="text-sm text-rose-300">{loginMutation.error.message}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loginMutation.isLoading}>
            {loginMutation.isLoading ? 'Memverifikasi...' : 'Masuk' }
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Butuh bantuan? Hubungi administrator sistem untuk mendapatkan kredensial atau reset password.
        </p>
      </div>
    </div>
  );
}
