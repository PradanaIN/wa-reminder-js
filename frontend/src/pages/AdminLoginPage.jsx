import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin, useSession } from "../queries/auth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import { Eye, EyeOff, User, Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession();
  const loginMutation = useLogin();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const userRef = useRef(null);
  const passRef = useRef(null);

  useEffect(() => {
    if (session?.authenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [session, navigate]);

  // simple client-side validation for instant UX feedback
  const errors = useMemo(() => {
    const e = {};
    if (!form.username.trim()) e.username = "Username wajib diisi.";
    if (!form.password) e.password = "Password wajib diisi.";
    else if (form.password.length < 6) e.password = "Minimal 6 karakter.";
    return e;
  }, [form]);

  const firstErrorKey = useMemo(() => Object.keys(errors)[0], [errors]);

  useEffect(() => {
    if (loginMutation.isError && firstErrorKey) {
      // focus the first error field when submit fails
      if (firstErrorKey === "username") userRef.current?.focus();
      if (firstErrorKey === "password") passRef.current?.focus();
    }
  }, [loginMutation.isError, firstErrorKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ username: true, password: true });

    if (Object.keys(errors).length) {
      // focus first invalid field
      if (firstErrorKey === "username") userRef.current?.focus();
      if (firstErrorKey === "password") passRef.current?.focus();
      return;
    }

    loginMutation.mutate(
      {
        username: form.username.trim(),
        password: form.password,
        remember: form.remember,
      },
      { onSuccess: () => navigate("/admin/dashboard", { replace: true }) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      {/* Soft gradient background + particles */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(56,189,248,0.15),transparent_60%),radial-gradient(50%_50%_at_80%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(40%_60%_at_50%_90%,rgba(14,165,233,0.12),transparent_60%)]" />
      <div className="absolute inset-x-0 top-[-10%] h-[400px] bg-gradient-to-b from-sky-500/10 via-primary-500/5 to-transparent blur-3xl" />

      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-800/70 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5" /> SIGAP ADMIN
          </span>
        </div>

        {/* Title */}
        <div className="mb-7 space-y-1">
          <h1 className="text-2xl font-bold leading-tight text-white">
            Masuk Dashboard Admin
          </h1>
          <p className="text-sm text-slate-300/80">
            Silakan masuk dengan kredensial yang terdaftar.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <User className="h-4 w-4 text-slate-400" />
              </span>
              <Input
                id="username"
                ref={userRef}
                autoComplete="username"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                required
                aria-invalid={Boolean(touched.username && errors.username)}
                aria-describedby={
                  touched.username && errors.username
                    ? "username-error"
                    : undefined
                }
                className="rounded-lg border-slate-700 bg-slate-900/60 pl-10 focus:border-primary-500 focus:ring focus:ring-primary-500/30"
              />
            </div>
            {touched.username && errors.username && (
              <p id="username-error" className="text-xs text-rose-300">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              {capsLockOn && (
                <span className="text-xs text-amber-300">Caps Lock aktif</span>
              )}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-4 w-4 text-slate-400" />
              </span>
              <Input
                id="password"
                ref={passRef}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                onKeyUp={(e) => setCapsLockOn(e.getModifierState?.("CapsLock"))}
                required
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby={
                  touched.password && errors.password
                    ? "password-error"
                    : undefined
                }
                className="rounded-lg border-slate-700 bg-slate-900/60 pl-10 pr-12 focus:border-primary-500 focus:ring focus:ring-primary-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-2 my-1.5 inline-flex items-center rounded-md px-2 text-slate-300 hover:bg-white/5"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p id="password-error" className="text-xs text-rose-300">
                {errors.password}
              </p>
            )}
          </div>

          {/* Server error */}
          {loginMutation.error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
            >
              {loginMutation.error.message || "Gagal masuk. Coba lagi."}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="group w-full rounded-lg py-2.5 font-semibold"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> Memverifikasi...
              </span>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
