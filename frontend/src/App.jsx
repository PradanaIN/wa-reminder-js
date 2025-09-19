import { Navigate, Route, Routes } from 'react-router-dom';
import PublicStatusPage from './pages/PublicStatusPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useSession } from './queries/auth.js';
import { Spinner } from './components/ui/Spinner.jsx';

function ProtectedRoute({ children }) {
  const { data, error, isLoading } = useSession();
  const isUnauthorized =
    !!error &&
    (error.status === 401 ||
      error.status === 403 ||
      /401|403|unauthorized|forbidden/i.test(error.message ?? ''));

  if (isUnauthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p>Gagal memuat sesi. Silakan coba lagi.</p>
      </div>
    );
  }

  if (!data?.authenticated) {
    return <Navigate to="/admin/login" replace />;
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
