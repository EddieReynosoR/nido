import type { ReactNode } from 'react';

export default function NoteMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground select-none">
      {children}
    </div>
  );
}
