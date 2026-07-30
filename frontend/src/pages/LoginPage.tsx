import Loader from '@/components/Loader';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router';

export default function LoginPage() {
  const { status } = useAuth();

  if (status === 'loading') return <Loader />;

  if (status === 'authed') return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <LoginForm />
    </main>
  );
}
