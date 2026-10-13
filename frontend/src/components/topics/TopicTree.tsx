import { useCallback, useMemo, useState } from 'react';
import { CollisionPriority } from '@dnd-kit/abstract';
import {
  PointerActivationConstraints,
  type DragEndEvent,
  type Sensors,
} from '@dnd-kit/dom';
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  useDragOperation,
  useDroppable,
} from '@dnd-kit/react';
import { Folder } from 'lucide-react';
import { toast } from 'sonner';
import AddTopicDialog from '@/components/topics/AddTopicDialog';
import DeleteNoteDialog from '@/components/notes/DeleteNoteDialog';
import DeleteTopicDialog from '@/components/topics/DeleteTopicDialog';
import EditTopicDialog from '@/components/topics/EditTopicDialog';
import TopicTreeItem from '@/components/topics/TopicTreeItem';
import { SidebarMenu } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useDeleteNote } from '@/hooks/notes/use-note';
import { useDeleteTopic, useReparent } from '@/hooks/topics/use-topic';
import { canDropTopic, findTopicPath } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { Topic, TopicDragData } from '@/types/topic.types';
import { useParams } from 'react-router';
import { useNoteTabs } from '@/hooks/notes/use-note-tabs';

type TopicTreeProps = {
  topics: Topic[];
  spaceId: string;
};

type TopicTreeRootProps = {
  topics: Topic[];
  openIds: Set<string>;
  onOpenChange: (topicId: string, open: boolean) => void;
  onAddChild: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onDeleteNote: (topic: Topic) => void;
};

const ROOT_DROPPABLE_ID = 'topic-root-dropzone';

const DRAG_ACTIVATION_DISTANCE = 6;

const configureSensors = (defaults: Sensors): Sensors => [
  ...defaults.filter((sensor) => sensor !== PointerSensor),
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({
        value: DRAG_ACTIVATION_DISTANCE,
      }),
    ],
  }),
];

function TopicTreeRoot({
  topics,
  openIds,
  onOpenChange,
  onAddChild,
  onEdit,
  onDelete,
  onDeleteNote,
}: TopicTreeRootProps) {
  const { source } = useDragOperation();
  const dragged = source?.data as TopicDragData | undefined;

  const showRootStrip = !!dragged && canDropTopic(dragged, null);

  const { ref, isDropTarget } = useDroppable({
    id: ROOT_DROPPABLE_ID,
    collisionPriority: CollisionPriority.Lowest,
    accept: (candidate) => canDropTopic(candidate.data as TopicDragData, null),
  });

  const { topicId } = useParams();
  const activePath = useMemo(
    () => (topicId ? findTopicPath(topics, topicId) : null),
    [topics, topicId]
  );

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-md',
        isDropTarget && 'bg-sidebar-accent/40 ring-2 ring-sidebar-ring/60'
      )}
    >
      <SidebarMenu>
        {topics.map((topic) => (
          <TopicTreeItem
            key={topic.topicId}
            topic={topic}
            openIds={openIds}
            activePath={activePath?.[0] === topic.topicId ? activePath : null}
            onOpenChange={onOpenChange}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeleteNote={onDeleteNote}
          />
        ))}
      </SidebarMenu>

      {showRootStrip ? (
        <div
          className={cn(
            'mt-1 rounded-md border border-dashed border-sidebar-border px-2 py-2 text-xs text-sidebar-foreground/50 select-none group-data-[collapsible=icon]:hidden',
            isDropTarget && 'border-sidebar-ring text-sidebar-foreground/80'
          )}
        >
          Move to top level
        </div>
      ) : null}
    </div>
  );
}

export default function TopicTree({ topics, spaceId }: TopicTreeProps) {
  const { accessToken } = useAuth();
  const { mutate: reparentTopic } = useReparent(accessToken);
  const { mutate: deleteTopic, isPending: isDeleting } =
    useDeleteTopic(accessToken);
  const { mutate: deleteNote, isPending: isDeletingNote } = useDeleteNote(
    accessToken,
    spaceId
  );

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [addChildOpen, setAddChildOpen] = useState<boolean>(false);
  const [parentTopic, setParentTopic] = useState<Topic | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [noteTopicToDelete, setNoteTopicToDelete] = useState<Topic | null>(
    null
  );
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const { closeTab } = useNoteTabs(spaceId);

  const handleOpenChange = useCallback((topicId: string, open: boolean) => {
    setOpenIds((previous) => {
      if (previous.has(topicId) === open) return previous;

      const next = new Set(previous);
      if (open) next.add(topicId);
      else next.delete(topicId);

      return next;
    });
  }, []);

  const handleAddChild = useCallback(
    (topic: Topic) => {
      setParentTopic(topic);
      setAddChildOpen(true);
      handleOpenChange(topic.topicId, true);
    },
    [handleOpenChange]
  );

  const handleEdit = useCallback((topic: Topic) => {
    setTopicToEdit(topic);
  }, []);

  const handleDelete = useCallback((topic: Topic) => {
    setTopicToDelete(topic);
  }, []);

  const confirmDelete = () => {
    if (!topicToDelete) return;

    deleteTopic(
      { topicId: topicToDelete.topicId, spaceId },
      {
        onSuccess: () => {
          toast.success('Topic deleted');
          handleOpenChange(topicToDelete.topicId, false);
          setTopicToDelete(null);
        },
      }
    );
  };

  const handleDeleteNote = useCallback((topic: Topic) => {
    setNoteTopicToDelete(topic);
  }, []);

  const confirmDeleteNote = () => {
    if (!noteTopicToDelete?.noteId) return;

    deleteNote(
      {
        noteId: noteTopicToDelete.noteId,
        topicId: noteTopicToDelete.topicId,
      },
      {
        onSuccess: () => {
          toast.success('Intro note deleted');
          closeTab(noteTopicToDelete.topicId);
          setNoteTopicToDelete(null);
        },
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;
    if (event.canceled || !source || !target) return;

    const dragged = source.data as TopicDragData;
    const newParentId =
      target.id === ROOT_DROPPABLE_ID ? null : String(target.id);

    if (!canDropTopic(dragged, newParentId)) return;

    if (newParentId) handleOpenChange(newParentId, true);

    reparentTopic({ topicId: dragged.topicId, spaceId, newParentId });
  };

  return (
    <DragDropProvider sensors={configureSensors} onDragEnd={handleDragEnd}>
      <TopicTreeRoot
        topics={topics}
        openIds={openIds}
        onOpenChange={handleOpenChange}
        onAddChild={handleAddChild}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteNote={handleDeleteNote}
      />

      <AddTopicDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        parentTopic={parentTopic}
      />

      <EditTopicDialog
        topic={topicToEdit}
        spaceId={spaceId}
        open={topicToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setTopicToEdit(null);
        }}
      />

      <DeleteTopicDialog
        topic={topicToDelete}
        open={topicToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setTopicToDelete(null);
        }}
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />

      <DeleteNoteDialog
        topic={noteTopicToDelete}
        open={noteTopicToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingNote) setNoteTopicToDelete(null);
        }}
        onConfirm={confirmDeleteNote}
        isPending={isDeletingNote}
      />

      <DragOverlay dropAnimation={null}>
        {(source) => (
          <div className="pointer-events-none flex items-center gap-2 rounded-md bg-sidebar px-2 py-1.5 text-sm text-sidebar-foreground shadow-md ring-1 ring-sidebar-border select-none">
            <Folder className="size-4 text-sidebar-foreground/50" />
            <span className="truncate">
              {(source.data as TopicDragData).name}
            </span>
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
