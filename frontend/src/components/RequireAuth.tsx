import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router';

export default function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  console.log(status);

  if (status === 'loading') return <div>Cargando...</div>;

  if (status === 'guest')
    return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
