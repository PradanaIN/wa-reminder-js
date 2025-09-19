import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      {/* Background gradient layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-1/4 top-1/3 h-[420px] w-[55%] rounded-full bg-primary-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-1/4 bottom-1/4 h-[300px] w-[40%] rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-10 text-center shadow-xl backdrop-blur-md">
        <p className="text-sm uppercase tracking-wide text-primary-200">404</p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-4 text-base text-slate-400">
          Maaf, halaman yang Anda cari sudah tidak tersedia atau terjadi
          kesalahan penulisan alamat. Silakan kembali ke beranda untuk
          melanjutkan.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-primary-500/30 transition hover:scale-105 hover:bg-primary-400 hover:shadow-primary-400/40"
          >
            Ke Halaman Utama
          </Link>
          <Link
            to="/admin/login"
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-100 transition hover:scale-105 hover:border-white/30 hover:bg-white/5"
          >
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
