import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div
      className="flex min-h-svh items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
