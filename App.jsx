import { Navigate, Route, Routes } from 'react-router-dom';
import PublicStatusPage from './pages/PublicStatusPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useSession } from './queries/auth.js';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { Skeleton } from './components/ui/Skeleton.jsx';

function ProtectedRoute({ children }) {
  const { data, isLoading } = useSession();

  if (isLoading) {
    return (
      <AdminLayout loading>
        <div className="space-y-8">
          <Skeleton className="h-44 w-full" />
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </AdminLayout>
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
