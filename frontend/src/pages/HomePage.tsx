import AppSidebar from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-['Courier_Prime'] text-xl font-bold tracking-tight text-sidebar-accent-foreground">
            nido
          </span>
        </header>
        <div className="p-4">
          <Button onClick={logout}>Logout</Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
