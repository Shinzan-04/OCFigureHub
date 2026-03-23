import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
