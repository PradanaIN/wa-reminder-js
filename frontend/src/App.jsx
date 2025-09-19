import { Navigate, Route, Routes } from "react-router-dom";
import PublicStatusPage from "./pages/PublicStatusPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { useSession } from "./queries/auth.js";
import { Spinner } from "./components/ui/Spinner.jsx";

function ProtectedRoute({ children }) {
  const { data, error, isLoading } = useSession();

  // Unauthorized jika error status 401/403
  const isUnauthorized =
    !!error &&
    (error.status === 401 ||
      error.status === 403 ||
      /401|403|unauthorized|forbidden/i.test(error.message ?? ""));

  // Jika unauthorized langsung ke login
  if (isUnauthorized || (!isLoading && !data?.authenticated)) {
    return <Navigate to="/admin/login" replace />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error selain unauthorized
  if (error && !isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-center text-slate-200">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Gagal memuat sesi</p>
          <p className="text-sm text-slate-400">
            Silakan refresh atau coba lagi nanti.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicStatusPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
