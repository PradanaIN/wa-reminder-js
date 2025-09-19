import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function AdminLayout({ username = 'Admin', onLogout, isLoggingOut = false, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 h-72 bg-gradient-to-r from-primary-500/25 via-sky-500/20 to-purple-500/25 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            WA Reminder • Admin
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span className="hidden sm:inline">{`Masuk sebagai ${username}`}</span>
            <Button variant="ghost" onClick={onLogout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:py-16">{children}</main>
    </div>
  );
}

