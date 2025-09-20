import { Link } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";

export function PublicLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 [.theme-dark_&]:bg-slate-950 [.theme-dark_&]:text-slate-100">
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-sky-600 focus:px-3 focus:py-1.5 focus:text-white"
      >
        Loncat ke konten
      </a>

      {/* Background layers (light/dark aware) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_10%,rgba(56,189,248,0.18),transparent_60%)] [.theme-dark_&]:bg-[radial-gradient(60%_50%_at_20%_10%,rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-20%] -z-10 w-[60%] rounded-full bg-sky-400/15 blur-3xl [.theme-dark_&]:bg-primary-500/15" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm shadow-slate-900/5 [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-slate-950/80 [.theme-dark_&]:shadow-slate-900/20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 transition-colors hover:opacity-90 [.theme-dark_&]:text-white"
          >
            <img src="/logo.png" alt="SIGAP" className="h-7 w-7 rounded" />
            <span>SIGAP 6502</span>
          </Link>

          <div
            className="
              flex items-center gap-4 text-xs font-semibold uppercase tracking-wide
              text-slate-600 [.theme-dark_&]:text-slate-300
            "
          >
            <ThemeToggle className="h-9" />

            <a
              href="#status"
              className="rounded-md px-1.5 py-1 text-slate-700 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white [.theme-dark_&]:text-slate-300 [.theme-dark_&]:hover:text-white [.theme-dark_&]:focus-visible:ring-offset-slate-900"
            >
              Status
            </a>
            <a
              href="#schedule"
              className="rounded-md px-1.5 py-1 text-slate-700 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white [.theme-dark_&]:text-slate-300 [.theme-dark_&]:hover:text-white [.theme-dark_&]:focus-visible:ring-offset-slate-900"
            >
              Jadwal
            </a>

            {/* Tombol Admin: selalu biru, kontras di light/dark */}
            <Link
              to="/admin/login"
              className="
                rounded-full border border-sky-400/30 bg-sky-600 px-4 py-2 text-xs font-semibold
                uppercase tracking-wide text-white shadow-lg shadow-sky-600/20
                transition hover:scale-105 hover:bg-sky-500 hover:shadow-sky-500/30
                focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2
                focus-visible:ring-offset-white [.theme-dark_&]:focus-visible:ring-offset-slate-950
              "
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main
        id="main"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 md:py-16 scroll-mt-24"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/70 pb-6 pt-10 text-sm text-slate-500 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-slate-950/80 [.theme-dark_&]:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p>&copy; 2025 Badan Pusat Statistik Kabupaten Bulungan</p>
        </div>
      </footer>
    </div>
  );
}
