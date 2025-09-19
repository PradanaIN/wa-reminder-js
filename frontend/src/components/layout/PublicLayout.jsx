import { Link } from "react-router-dom";

export function PublicLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-20%] w-[60%] -z-10 rounded-full bg-primary-500/15 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-md shadow-md shadow-slate-900/20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-white hover:text-primary-400 transition-colors"
          >
            WA Reminder
          </Link>
          <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wide text-slate-300">
            <a
              href="#status"
              className="hover:text-slate-100 transition-colors"
            >
              Status Sistem
            </a>
            <a
              href="#schedule"
              className="hover:text-slate-100 transition-colors"
            >
              Jadwal
            </a>
            <Link
              to="/admin/login"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary-500/20 transition hover:scale-105 hover:border-white/30 hover:bg-white/20 hover:shadow-primary-400/30"
            >
              Masuk Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 pb-6 pt-10 text-sm text-slate-400 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} WA Reminder. Semua hak dilindungi.
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:support@example.com"
              className="hover:text-slate-200 transition-colors"
            >
              Dukungan
            </a>
            <a
              href="https://https://github.com/PradanaIN/wa-reminder-js"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              Dokumentasi
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
