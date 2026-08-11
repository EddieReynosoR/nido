import {
  ChevronsUpDown,
  PanelLeftClose,
  Plus,
  Folder,
  CircleUser,
  ChevronRight,
} from 'lucide-react';

const folders = [
  { label: 'Diary attempt 234', active: false },
  { label: "Shosho's journey & other stories", active: true },
  { label: 'Work Forms and Infographics', active: false },
  { label: 'Chapter 1: It Begins', active: false },
  { label: 'Chapter 2: The New Wave', active: false },
  { label: 'Chapter 3: The Long way home or h...', active: false },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar overflow-y-auto">
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="font-['Courier_Prime'] text-2xl font-bold tracking-tight text-sidebar-accent-foreground">
          nido
        </span>
        <button
          aria-label="Collapse sidebar"
          className="rounded-md p-1 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-2">
        <button className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          New space
        </button>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-[13px] font-bold text-background">
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Buunto
          </span>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground"
          aria-label="Switch workspace"
        >
          <ChevronsUpDown className="size-4" />
        </button>
      </div>

      <div className="mt-5 px-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/40">
          Favorites
        </p>
        <p className="mt-2 text-sm text-sidebar-foreground/40">
          No favorite folders
        </p>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto px-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/40">
            Folders
          </p>
          <button
            aria-label="Add folder"
            className="rounded p-0.5 text-accent-green transition-colors hover:bg-sidebar-accent"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <ul className="mt-2 flex flex-col gap-0.5">
          {folders.map((folder) => (
            <li key={folder.label}>
              <button
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sidebar-accent ${
                  folder.active
                    ? 'font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80'
                }`}
              >
                <Folder
                  className={`size-4 shrink-0 ${
                    folder.active
                      ? 'text-accent-green'
                      : 'text-sidebar-foreground/50'
                  }`}
                />
                <span className="truncate">{folder.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-sidebar-border px-5 py-3">
        <button className="flex w-full items-center gap-2.5 text-sm text-sidebar-foreground">
          <CircleUser className="size-5 text-sidebar-foreground/60" />
          <span className="flex-1 text-left">Eugen Esanu</span>
          <ChevronRight className="size-3.5 text-sidebar-foreground/30" />
        </button>
      </div>
    </aside>
  );
}
