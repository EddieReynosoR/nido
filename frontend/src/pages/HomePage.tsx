import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <Button onClick={logout}>Logout</Button>
    </main>
  );
}
