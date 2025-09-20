import { useEffect, useState } from 'react';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sigap_theme') || getSystemTheme());

  useEffect(() => {
    const root = document.documentElement;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    localStorage.setItem('sigap_theme', theme);

    if (!prefersReduced) {
      root.classList.add('theme-animate');
      const t = setTimeout(() => root.classList.remove('theme-animate'), 300);
      return () => clearTimeout(t);
    }
  }, [theme]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sun icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="M4.2 4.2l2.1 2.1" />
          <path d="M17.7 17.7l2.1 2.1" />
          <path d="M4.2 19.8l2.1-2.1" />
          <path d="M17.7 6.3l2.1-2.1" />
        </g>
      </svg>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={theme === 'light'}
          onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
        />
        <div className="relative h-5 w-10 rounded-full bg-slate-600 transition peer-checked:bg-primary-500">
          <div className="absolute m-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out peer-checked:translate-x-5" />
        </div>
      </label>

      {/* Moon icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-300">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" />
      </svg>
    </div>
  );
}

