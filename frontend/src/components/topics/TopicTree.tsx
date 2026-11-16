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
import { FileText, Folder } from 'lucide-react';
import { toast } from 'sonner';
import AddTopicDialog from '@/components/topics/AddTopicDialog';
import AddNoteDialog from '@/components/notes/AddNoteDialog';
import DeleteNoteDialog from '@/components/notes/DeleteNoteDialog';
import DeleteTopicDialog from '@/components/topics/DeleteTopicDialog';
import EditNoteDialog from '@/components/notes/EditNoteDialog';
import EditTopicDialog from '@/components/topics/EditTopicDialog';
import TopicTreeItem from '@/components/topics/TopicTreeItem';
import NoteTreeItem from '@/components/notes/NoteTreeItem';
import { SidebarMenu } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useDeleteNote, useTopicNote } from '@/hooks/notes/use-note';
import { useDeleteTopic, useReparent } from '@/hooks/topics/use-topic';
import { canDrop, findNoteTopicPath, findTopicPath } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { NoteTreeItem as NoteTreeItemType } from '@/types/note.types';
import type { DragData, Topic } from '@/types/topic.types';
import { useNavigate, useParams } from 'react-router';
import { useNoteTabs } from '@/hooks/notes/use-note-tabs';
import { tabPath } from '@/lib/note-tabs';
import { discardNoteSaves } from '@/lib/note-save-queue';

type TopicTreeProps = {
  topics: Topic[];
  notes: NoteTreeItemType[];
  spaceId: string;
};

type TopicTreeRootProps = {
  topics: Topic[];
  openIds: Set<string>;
  onOpenChange: (topicId: string, open: boolean) => void;
  onAddChild: (topic: Topic) => void;
  onAddNote: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onDeleteNote: (topic: Topic) => void;
  onDeleteNoteItem: (note: NoteTreeItemType) => void;
  onRenameNoteItem: (note: NoteTreeItemType) => void;
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
  onAddNote,
  onEdit,
  onDelete,
  onDeleteNote,
  onDeleteNoteItem,
  onRenameNoteItem,
}: TopicTreeRootProps) {
  const { source } = useDragOperation();
  const dragged = source?.data as DragData | undefined;

  const showRootStrip = !!dragged && canDrop(dragged, null);

  const { ref, isDropTarget } = useDroppable({
    id: ROOT_DROPPABLE_ID,
    collisionPriority: CollisionPriority.Lowest,
    accept: (candidate) => canDrop(candidate.data as DragData, null),
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
            onAddNote={onAddNote}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeleteNote={onDeleteNote}
            onDeleteNoteItem={onDeleteNoteItem}
            onRenameNoteItem={onRenameNoteItem}
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

export default function TopicTree({ topics, notes, spaceId }: TopicTreeProps) {
  const { accessToken } = useAuth();
  const { mutate: reparentTopic } = useReparent(accessToken);
  const { mutate: moveNote } = useTopicNote(accessToken, spaceId);
  const { mutate: deleteTopic, isPending: isDeleting } =
    useDeleteTopic(accessToken);
  const { mutate: deleteNote, isPending: isDeletingNote } = useDeleteNote(
    accessToken,
    spaceId
  );

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const { noteId, topicId } = useParams();
  const [revealedNoteId, setRevealedNoteId] = useState<string | undefined>();

  if (noteId !== revealedNoteId) {
    setRevealedNoteId(noteId);

    const path = noteId ? findNoteTopicPath(topics, noteId) : null;
    if (path) {
      setOpenIds((previous) =>
        path.every((id) => previous.has(id))
          ? previous
          : new Set([...previous, ...path])
      );
    }
  }
  const [addChildOpen, setAddChildOpen] = useState<boolean>(false);
  const [parentTopic, setParentTopic] = useState<Topic | null>(null);
  const [addNoteOpen, setAddNoteOpen] = useState<boolean>(false);
  const [noteParentTopic, setNoteParentTopic] = useState<Topic | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [noteTopicToDelete, setNoteTopicToDelete] = useState<Topic | null>(
    null
  );
  const [noteToDelete, setNoteToDelete] = useState<NoteTreeItemType | null>(
    null
  );
  const [noteToRename, setNoteToRename] = useState<NoteTreeItemType | null>(
    null
  );
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const { closeTab } = useNoteTabs();
  const navigate = useNavigate();

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

  const handleAddNote = useCallback(
    (topic: Topic) => {
      setNoteParentTopic(topic);
      setAddNoteOpen(true);
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

  const handleDeleteIntroNote = useCallback((topic: Topic) => {
    setNoteTopicToDelete(topic);
  }, []);

  const confirmDeleteIntroNote = () => {
    const target = noteTopicToDelete;
    if (!target?.noteId) return;

    discardNoteSaves(target.noteId);
    const next = closeTab({ type: 'topic', id: target.topicId });
    if (topicId === target.topicId) {
      navigate(next ? tabPath(next) : '/');
    }
    setNoteTopicToDelete(null);

    deleteNote(
      { noteId: target.noteId, topicId: target.topicId, isIntro: true },
      { onSuccess: () => toast.success('Intro note deleted') }
    );
  };

  const handleDeleteNote = useCallback((note: NoteTreeItemType) => {
    setNoteToDelete(note);
  }, []);

  const handleRenameNote = useCallback((note: NoteTreeItemType) => {
    setNoteToRename(note);
  }, []);

  const confirmDeleteNote = () => {
    const target = noteToDelete;
    if (!target) return;

    discardNoteSaves(target.noteId);
    const next = closeTab({ type: 'note', id: target.noteId });
    if (noteId === target.noteId) {
      navigate(next ? tabPath(next) : '/');
    }
    setNoteToDelete(null);

    deleteNote(
      { noteId: target.noteId, topicId: target.topicId, isIntro: false },
      { onSuccess: () => toast.success('Note deleted') }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { source, target } = event.operation;
    if (event.canceled || !source || !target) return;

    const dragged = source.data as DragData;
    const newParentId =
      target.id === ROOT_DROPPABLE_ID ? null : String(target.id);

    if (!canDrop(dragged, newParentId)) return;

    if (newParentId) handleOpenChange(newParentId, true);

    if (dragged.kind === 'note') {
      moveNote({
        noteId: dragged.noteId,
        fromTopicId: dragged.topicId,
        topicId: newParentId,
      });
      return;
    }

    reparentTopic({ topicId: dragged.topicId, spaceId, newParentId });
  };

  return (
    <DragDropProvider sensors={configureSensors} onDragEnd={handleDragEnd}>
      <TopicTreeRoot
        topics={topics}
        openIds={openIds}
        onOpenChange={handleOpenChange}
        onAddChild={handleAddChild}
        onAddNote={handleAddNote}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDeleteNote={handleDeleteIntroNote}
        onDeleteNoteItem={handleDeleteNote}
        onRenameNoteItem={handleRenameNote}
      />

      {notes.length ? (
        <SidebarMenu>
          {notes.map((note) => (
            <NoteTreeItem
              key={note.noteId}
              note={note}
              onRename={handleRenameNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </SidebarMenu>
      ) : null}

      <AddTopicDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        parentTopic={parentTopic}
      />

      <AddNoteDialog
        topic={noteParentTopic}
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
      />

      <EditTopicDialog
        topic={topicToEdit}
        spaceId={spaceId}
        open={topicToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setTopicToEdit(null);
        }}
      />

      <EditNoteDialog
        note={noteToRename}
        spaceId={spaceId}
        open={noteToRename !== null}
        onOpenChange={(open) => {
          if (!open) setNoteToRename(null);
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
        name={noteTopicToDelete?.name ?? null}
        isIntro
        open={noteTopicToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingNote) setNoteTopicToDelete(null);
        }}
        onConfirm={confirmDeleteIntroNote}
        isPending={isDeletingNote}
      />

      <DeleteNoteDialog
        name={noteToDelete?.title ?? null}
        isIntro={false}
        open={noteToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingNote) setNoteToDelete(null);
        }}
        onConfirm={confirmDeleteNote}
        isPending={isDeletingNote}
      />

      <DragOverlay dropAnimation={null}>
        {(source) => {
          const data = source.data as DragData;
          const Icon = data.kind === 'note' ? FileText : Folder;

          return (
            <div className="pointer-events-none flex items-center gap-2 rounded-md bg-sidebar px-2 py-1.5 text-sm text-sidebar-foreground shadow-md ring-1 ring-sidebar-border select-none">
              <Icon className="size-4 text-sidebar-foreground/50" />
              <span className="truncate">
                {data.kind === 'note' ? data.title : data.name}
              </span>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}
