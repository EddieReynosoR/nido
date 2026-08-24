import { useEffect, useRef, useState } from 'react';
import { CircleCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Space } from '@/types/space.types';

type SpaceUndoToastProps = {
  space: Space;
  onRestore: (space: Space) => void;
  duration?: number;
  onPause?: () => void;
  onResume?: () => void;
};

export default function SpaceUndoToast({
  space,
  onRestore,
  duration = 5000,
  onPause,
  onResume,
}: SpaceUndoToastProps) {
  const [paused, setPaused] = useState(false);
  const hoveredRef = useRef(false);

  const handleMouseEnter = () => {
    if (hoveredRef.current) return;
    hoveredRef.current = true;
    setPaused(true);
    onPause?.();
  };

  const handleMouseLeave = () => {
    if (!hoveredRef.current) return;
    hoveredRef.current = false;
    setPaused(false);
    onResume?.();
  };

  const onResumeRef = useRef(onResume);
  onResumeRef.current = onResume;

  useEffect(() => {
    return () => {
      if (hoveredRef.current) {
        hoveredRef.current = false;
        onResumeRef.current?.();
      }
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex w-full items-center gap-2 overflow-hidden rounded-[var(--radius)] border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg"
    >
      <div
        className="absolute inset-x-0 top-0 h-[3px] origin-left bg-popover-foreground"
        style={{
          animation: `space-undo-countdown ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />

      <CircleCheckIcon className="size-4 shrink-0" />

      <div className="flex-1 overflow-hidden">
        <p className="font-medium">Space deleted</p>
        <p className="truncate text-muted-foreground">{space.name}</p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={() => onRestore(space)}
      >
        Restore
      </Button>
    </div>
  );
}
