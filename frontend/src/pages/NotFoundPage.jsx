import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-[-20%] h-[420px] w-[55%] rounded-full bg-primary-500/25 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-xl rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center shadow-2xl shadow-slate-900/40 backdrop-blur">
        <p className="text-sm uppercase tracking-wide text-primary-200">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-slate-300">
          Maaf, halaman yang Anda cari sudah tidak tersedia atau terjadi kesalahan penulisan alamat. Silakan kembali ke beranda untuk melanjutkan.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-400"
          >
            Ke halaman utama
          </Link>
          <Link
            to="/admin/login"
            className="rounded-full border border-white/10 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-100 hover:border-white/30 hover:bg-white/5"
          >
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </div>
  );
}
