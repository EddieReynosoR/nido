import AppSidebar from '@/components/AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function HomePage() {
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
      </SidebarInset>
    </SidebarProvider>
  );
}
