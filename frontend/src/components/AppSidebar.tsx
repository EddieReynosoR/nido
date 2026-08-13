import { useEffect } from 'react';
import { Plus, Folder, CircleUser, ChevronRight } from 'lucide-react';
import SpaceSwitcher, {
  SpaceSwitcherSkeleton,
} from '@/components/SpaceSwitcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useSpaces } from '@/hooks/use-space';
import { useAuth } from '@/context/AuthContext';
import { errorToast } from '@/lib/toast';

const folders = [
  { label: 'Diary attempt 234', active: false },
  { label: "Shosho's journey & other stories", active: true },
  { label: 'Work Forms and Infographics', active: false },
  { label: 'Chapter 1: It Begins', active: false },
  { label: 'Chapter 2: The New Wave', active: false },
  { label: 'Chapter 3: The Long way home or h...', active: false },
];

export default function AppSidebar() {
  const { accessToken } = useAuth();
  const {
    data: spaces,
    isLoading,
    error,
    isError,
    refetch,
  } = useSpaces(accessToken);

  useEffect(() => {
    if (!isError || !error) return;

    errorToast({
      id: 'spaces-fetch-error',
      error,
      title: 'Could not load your spaces',
    });
  }, [isError, error]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <span className="font-['Courier_Prime']  text-2xl font-bold tracking-tight text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden select-none">
            nido
          </span>
          <SidebarTrigger />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New space"
              className="h-10 justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-[width,height,padding,opacity] hover:bg-primary hover:text-primary-foreground hover:opacity-90 active:bg-primary active:text-primary-foreground"
            >
              <Plus />
              <span className="group-data-[collapsible=icon]:hidden select-none">
                New space
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {isLoading ? (
          <SpaceSwitcherSkeleton />
        ) : isError ? (
          <div className="mt-2 flex flex-col gap-1 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
            <span className="text-sm text-sidebar-foreground/60 select-none">
              Couldn&apos;t load your spaces
            </span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="self-start text-sm font-medium text-accent-green hover:underline"
            >
              Retry
            </button>
          </div>
        ) : spaces?.content.length ? (
          <SpaceSwitcher spaces={spaces} />
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wide text-sidebar-foreground/40 select-none">
            Favorites
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <p className="px-2 py-1.5 text-sm text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden select-none">
              No favorite folders
            </p>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wide text-sidebar-foreground/40 select-none">
            Folders
          </SidebarGroupLabel>
          <SidebarGroupAction
            aria-label="Add folder"
            className="text-accent-green"
          >
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <SidebarMenuItem key={folder.label}>
                  <SidebarMenuButton
                    isActive={folder.active}
                    tooltip={folder.label}
                    className={
                      folder.active ? undefined : 'text-sidebar-foreground/80'
                    }
                  >
                    <Folder
                      className={
                        folder.active
                          ? 'text-accent-green'
                          : 'text-sidebar-foreground/50'
                      }
                    />
                    <span className="select-none">{folder.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Eugen Esanu">
              <CircleUser className="text-sidebar-foreground/60" />
              <span className="flex-1 text-left">Eugen Esanu</span>
              <ChevronRight className="ml-auto text-sidebar-foreground/30" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
