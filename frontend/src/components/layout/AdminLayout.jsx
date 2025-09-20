import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ThemeToggle";
import { Drawer } from "../ui/Drawer";
import {
  Home,
  Sliders,
  Users,
  Calendar as CalIcon,
  FileText,
  LogOut,
  Menu,
} from "../ui/icons";
import { useConfirm } from "../ui/ConfirmProvider.jsx";

export function AdminLayout({
  username = "Admin",
  onLogout = () => {},
  isLoggingOut = false,
  loading = false,
  children,
}) {
  const { confirm } = useConfirm();
  const { pathname } = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { to: "/admin/dashboard", label: "Dashboard", icon: Home },
      { to: "/admin/overrides", label: "Override", icon: Sliders },
      { to: "/admin/contacts", label: "Kontak", icon: Users },
      { to: "/admin/holidays", label: "Kalender", icon: CalIcon },
      { to: "/admin/templates", label: "Template", icon: FileText },
      { to: "/admin/quotes", label: "Quotes", icon: FileText },
    ],
    []
  );

  const initials = useMemo(() => {
    const s = String(username || "A").trim();
    const parts = s.split(/\s+/);
    return (parts[0]?.[0] || "A").toUpperCase();
  }, [username]);

  const NavList = ({ onNavigate }) => (
    <nav aria-label="Menu admin">
      <ul className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                onClick={() => onNavigate?.()}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none",
                  // light (default)
                  active
                    ? "bg-sky-600/10 text-sky-700 ring-1 ring-sky-500/30 hover:bg-sky-600/15"
                    : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-900",
                  // dark
                  "[.theme-dark_&]:data-[active=true]:bg-sky-500/15 [.theme-dark_&]:data-[active=true]:text-white [.theme-dark_&]:data-[active=true]:ring-1 [.theme-dark_&]:data-[active=true]:ring-sky-400/40",
                  "[.theme-dark_&]:text-slate-300 [.theme-dark_&]:hover:bg-white/5 [.theme-dark_&]:hover:text-white",
                  "focus-visible:ring-2 focus-visible:ring-sky-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 [.theme-dark_&]:focus-visible:ring-offset-slate-900"
                )}
                data-active={active || undefined}
              >
                {/* Active indicator bar (kiri) */}
                <span
                  aria-hidden
                  className={clsx(
                    "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-md transition-all",
                    active ? "w-1.5 bg-sky-500" : "w-0"
                  )}
                />
                <Icon
                  size={18}
                  className={clsx("opacity-90", active && "opacity-100")}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 [.theme-dark_&]:bg-slate-950 [.theme-dark_&]:text-slate-100">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-sky-600 focus:px-3 focus:py-1.5 focus:text-white"
      >
        Loncat ke konten
      </a>

      {/* Background accents (light/dark aware) */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_10%,rgba(79,70,229,0.2),transparent_60%)] [.theme-dark_&]:bg-[radial-gradient(60%_50%_at_20%_10%,rgba(79,70,229,0.25),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 h-72 bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/20 blur-3xl [.theme-dark_&]:from-primary-500/25 [.theme-dark_&]:via-sky-500/20 [.theme-dark_&]:to-purple-500/25" />

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-slate-950/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4">
          {/* left: brand + burger */}
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/60 bg-white/60 text-slate-700 hover:bg-white/80 md:hidden [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-slate-900/60 [.theme-dark_&]:text-slate-200 [.theme-dark_&]:hover:bg-slate-900/80"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <Link
              to="/"
              className="flex items-center text-lg font-semibold tracking-tight text-slate-900 hover:opacity-90 [.theme-dark_&]:text-white"
            >
              <img
                src="/logo.png"
                alt="SIGAP"
                className="mr-2 h-6 w-6 rounded"
              />
              <span>SIGAP 6502</span>
            </Link>
          </div>

          {/* right: theme, user, logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* user chip */}
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200/70 [.theme-dark_&]:bg-slate-800/70" />
            ) : (
              <span className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-2.5 py-1.5 text-sm text-slate-700 sm:inline-flex [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-white/5 [.theme-dark_&]:text-slate-200">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
                  {initials}
                </span>
                <span className="max-w-[10rem] truncate">{username}</span>
              </span>
            )}

            <ThemeToggle className="h-9" />

            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200/70 [.theme-dark_&]:bg-slate-800/70" />
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Keluar akun?",
                    message: "Anda akan keluar dari dashboard admin.",
                    confirmText: "Keluar",
                    variant: "danger",
                  });
                  if (ok) onLogout();
                }}
                disabled={isLoggingOut}
                className="h-9"
              >
                <LogOut size={16} />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Shell with sidebar */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)]">
        {/* Static sidebar (md+) */}
        <aside
          className="sticky top-[64px] hidden h-[calc(100vh-64px)] flex-col gap-4 border-r border-slate-200/60 bg-white/50 px-3 py-4 md:flex [.theme-dark_&]:border-white/10 [.theme-dark_&]:bg-slate-950/60"
          aria-label="Sidebar admin"
        >
          <NavList />
        </aside>

        {/* Main content */}
        <main id="main" className="relative z-10 px-4 py-8 sm:py-12 md:py-16">
          {children}
          {/* Safe area for mobile bottom UI */}
          <div className="h-[env(safe-area-inset-bottom,0)]" />
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        side="left"
        title="Menu Admin"
      >
        <NavList onNavigate={() => setMobileSidebarOpen(false)} />
      </Drawer>
    </div>
  );
}
