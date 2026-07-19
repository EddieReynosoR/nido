import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col">
      <Link to="/login">Go to Login Page</Link>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
