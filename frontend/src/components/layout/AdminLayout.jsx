import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ThemeToggle";
import { Drawer } from "../ui/Drawer";
import { Home, Sliders, Users, Calendar as CalIcon, FileText, LogOut, Menu } from "../ui/icons";
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

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: Home },
    { to: "/admin/overrides", label: "Override", icon: Sliders },
    { to: "/admin/contacts", label: "Kontak", icon: Users },
    { to: "/admin/holidays", label: "Kalender", icon: CalIcon },
    { to: "/admin/templates", label: "Template", icon: FileText },
    { to: "/admin/quotes", label: "Quotes", icon: FileText },
  ];

  const NavList = ({ onNavigate }) => (
    <ul className="space-y-1">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <li key={to}>
            <Link
              to={to}
              onClick={() => onNavigate?.()}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition", 
                active
                  ? "bg-primary-500/15 text-white shadow-inner shadow-primary-500/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className="opacity-90" />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 h-72 bg-gradient-to-r from-primary-500/25 via-sky-500/20 to-purple-500/25 blur-3xl" />

      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4">
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-900/80 md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <Link to="/" className="flex items-center text-lg font-semibold tracking-tight text-white">
              <img src="/logo.png" alt="SIGAP" className="mr-2 h-6 w-6 rounded" />
              <span>SIGAP 6502</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-300 sm:gap-4">
            <ThemeToggle className="h-9" />
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-800/70" />
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({ title: 'Keluar akun?', message: 'Anda akan keluar dari dashboard admin.', confirmText: 'Keluar', variant: 'danger' });
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

      {/* Layout with sidebar */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)]">
        {/* Static sidebar for md+ */}
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] flex-col gap-4 border-r border-white/10 bg-slate-950/60 px-3 py-4 md:flex">
          <NavList />
        </aside>

        {/* Main content */}
        <main className="relative z-10 px-4 py-8 sm:py-12 md:py-16">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} side="left" title="Menu Admin">
        <NavList onNavigate={() => setMobileSidebarOpen(false)} />
      </Drawer>
    </div>
  );
}
