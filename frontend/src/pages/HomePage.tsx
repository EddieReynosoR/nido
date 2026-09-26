import AppSidebar from '@/components/AppSidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function HomePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-['Courier_Prime'] text-xl font-bold tracking-tight text-sidebar-accent-foreground">
            nido
          </span>
        </header>
        <main className="flex-1 overflow-auto py-10 px-2 md:px-8">
          <NoteEditor />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
