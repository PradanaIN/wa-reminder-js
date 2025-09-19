import { Link } from 'react-router-dom';

export function PublicLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-20%] w-[60%] -z-10 rounded-full bg-primary-500/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-100">
            WA Reminder
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#status" className="hover:text-slate-100">
              Status Sistem
            </a>
            <a href="#schedule" className="hover:text-slate-100">
              Jadwal
            </a>
            <Link
              to="/admin/login"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary-500/20 transition hover:border-white/30 hover:bg-white/20"
            >
              Masuk Admin
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:py-16">{children}</main>

      <footer className="border-t border-white/5 bg-slate-950/80 pb-6 pt-10 text-sm text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} WA Reminder. Semua hak dilindungi.</p>
          <div className="flex gap-4">
            <a href="mailto:support@example.com" className="hover:text-slate-200">
              Dukungan
            </a>
            <a href="https://github.com" className="hover:text-slate-200">
              Dokumentasi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
