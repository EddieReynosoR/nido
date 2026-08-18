import { useEffect, useState } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import type { getSpaceResponse } from '@/types/space.types';
import AddSpaceForm from './AddSpaceForm';
import { useSpace } from '@/context/SpaceContext';

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);
const modifierLabel = isMac ? '⌥' : 'Alt+';

export function SpaceSwitcherSkeleton() {
  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <div className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 transition-[width,height,padding] group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default function SpaceSwitcher({
  spaces,
}: {
  spaces: getSpaceResponse;
}) {
  const spacesContent = spaces.content;

  const { isMobile } = useSidebar();
  const [addSpaceOpen, setAddSpaceOpen] = useState(false);
  const { activeSpace, selectSpace } = useSpace();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey) return;

      // `event.code` en vez de `event.key`: en macOS `⌥1` produce '¡'.
      const match = /^Digit([1-9])$/.exec(event.code);
      if (!match) return;

      const space = spacesContent[Number(match[1]) - 1];
      if (!space) return;

      selectSpace(space);
      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [spacesContent, selectSpace]);

  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <span className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-[13px] font-bold text-background select-none">
                {activeSpace?.name[0]}
              </span>
              <span className="flex-1 truncate text-[15px] font-semibold tracking-tight select-none">
                {activeSpace?.name}
              </span>
              <ChevronsUpDown className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Spaces
            </DropdownMenuLabel>

            {spacesContent.map((space, index) => (
              <DropdownMenuItem
                key={space.spaceId}
                onSelect={() => selectSpace(space)}
                className="gap-2 p-2 data-[active=true]:bg-accent"
                data-active={space.spaceId === activeSpace?.spaceId}
              >
                <span className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background!">
                  {space.name[0]}
                </span>
                <span className="truncate">{space.name}</span>
                <DropdownMenuShortcut>
                  {modifierLabel}
                  {index + 1}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => {
                setAddSpaceOpen(true);
              }}
            >
              <span className="flex aspect-square size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                <Plus className="size-4" />
              </span>
              <span className="text-muted-foreground">New space</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddSpaceForm open={addSpaceOpen} onOpenChange={setAddSpaceOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
