import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ThemeToggle";

export function AdminLayout({
  username = "Admin",
  onLogout = () => {},
  isLoggingOut = false,
  loading = false,
  children,
}) {
  const { pathname } = useLocation();
  const tabBaseClass =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
  const isActive = (p) =>
    clsx(
      tabBaseClass,
      pathname.startsWith(p)
        ? "bg-white/15 text-white shadow-sm"
        : "text-slate-300 hover:text-white hover:bg-white/5"
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 h-72 bg-gradient-to-r from-primary-500/25 via-sky-500/20 to-purple-500/25 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:py-4">
          <Link
            to="/"
            className="flex items-center text-lg font-semibold tracking-tight text-white"
          >
            <img src="/logo.png" alt="SIGAP" className="mr-2 h-6 w-6 rounded" />
            <span>SIGAP 6502</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300 sm:gap-4">
            <ThemeToggle className="h-9 rounded-xl border border-white/10 bg-slate-900/60 px-3" />
            {loading ? (
              <div className="hidden h-4 w-32 animate-pulse rounded-full bg-slate-800/70 sm:block" />
            ) : (
              <span className="hidden sm:inline">{`Masuk sebagai ${username}`}</span>
            )}
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-slate-800/70" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="h-9"
              >
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </Button>
            )}
          </div>
        </nav>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
            <Link
              to="/admin/dashboard"
              className={isActive("/admin/dashboard")}
            >
              Dashboard
            </Link>
          <Link
            to="/admin/overrides"
            className={isActive("/admin/overrides")}
          >
            Override
          </Link>
          <Link
            to="/admin/holidays"
            className={isActive("/admin/holidays")}
          >
            Kalender
          </Link>
          <Link
            to="/admin/templates"
            className={isActive("/admin/templates")}
          >
            Template
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        {children}
      </main>
    </div>
  );
}
