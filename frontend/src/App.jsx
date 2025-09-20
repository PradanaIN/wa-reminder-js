import { Navigate, Route, Routes } from 'react-router-dom';
import PublicStatusPage from './pages/PublicStatusPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminTemplatesPage from './pages/AdminTemplatesPage.jsx';
import AdminHolidaysPage from './pages/AdminHolidaysPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminOverridesPage from './pages/AdminOverridesPage.jsx';
import { useSession } from './queries/auth.js';
import { Spinner } from './components/ui/Spinner.jsx';

function ProtectedRoute({ children }) {
  const { data, error, isLoading } = useSession();

  const isUnauthorized =
    !!error && (error.status === 401 || error.status === 403 || /401|403|unauthorized|forbidden/i.test(error.message ?? ''));

  if (isUnauthorized || (!isLoading && !data?.authenticated)) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-center text-slate-200">
        <div className="space-y-2">
          <p className="text-lg font-semibold">Gagal memuat sesi</p>
          <p className="text-sm text-slate-400">Silakan refresh atau coba lagi nanti.</p>
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
      <Route
        path="/admin/templates"
        element={
          <ProtectedRoute>
            <AdminTemplatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overrides"
        element={
          <ProtectedRoute>
            <AdminOverridesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/holidays"
        element={
          <ProtectedRoute>
            <AdminHolidaysPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


