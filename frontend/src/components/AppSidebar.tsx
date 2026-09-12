import { useEffect, useState, useRef } from 'react';
import { Plus, CircleUser, ChevronRight } from 'lucide-react';
import SpaceSwitcher, {
  SpaceSwitcherSkeleton,
} from '@/components/spaces/SpaceSwitcher';
import AddSpaceForm from '@/components/spaces/AddSpaceForm';
import TopicTreeItem from '@/components/topics/TopicTreeItem';
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
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { errorToast } from '@/lib/toast';
import { useSpace } from '@/context/SpaceContext';
import { useAuth } from '@/context/AuthContext';
import { useTopics } from '@/hooks/use-topic';
import { toast } from 'sonner';

export default function AppSidebar() {
  const { accessToken } = useAuth();
  const {
    data: spaces,
    activeSpace,
    isLoading,
    error,
    isError,
    refetch,
  } = useSpace();
  const {
    data: topicsData,
    isLoading: topicsLoading,
    error: topicsError,
    isError: topicsIsError,
    refetch: refetchTopics,
  } = useTopics(activeSpace?.spaceId, accessToken);

  const topics = topicsData ?? [];

  const [open, setOpen] = useState<boolean>(false);

  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (!isError || !error) return;

    errorToast({
      id: 'spaces-fetch-error',
      error,
      title: 'Could not load your spaces',
    });
  }, [isError, error]);

  useEffect(() => {
    if (!topicsIsError || !topicsError) return;

    errorToast({
      id: 'topics-fetch-error',
      error: topicsError,
      title: 'Could not load the topics of the selected space.',
    });
  }, [topicsIsError, topicsError]);

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();

      if (toast.getToasts().length === 0) return;

      const toasts = toast.getToasts();
      toasts.forEach((t) => toast.dismiss(t.id));
    };
  }, []);

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
              onClick={() => setOpen(true)}
            >
              <Plus />
              <span className="group-data-[collapsible=icon]:hidden select-none">
                New space
              </span>
            </SidebarMenuButton>
            <AddSpaceForm open={open} onOpenChange={setOpen} />
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
          <SpaceSwitcher spaces={spaces} timersRef={timersRef} />
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
            {topicsLoading ? (
              <SidebarMenu>
                {Array.from({ length: 3 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : topicsError ? (
              <div className="mt-2 flex flex-col gap-1 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
                <p className="pl-0 px-2 py-1.5 text-sm text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden select-none">
                  Couldn&apos;t load folders
                </p>
                <button
                  type="button"
                  onClick={() => void refetchTopics()}
                  className="self-start text-sm font-medium text-accent-green hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : topics.length ? (
              <SidebarMenu>
                {topics.map((topic) => (
                  <TopicTreeItem key={topic.topicId} topic={topic} />
                ))}
              </SidebarMenu>
            ) : (
              <p className="px-2 py-1.5 text-sm text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden select-none">
                No folders
              </p>
            )}
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
