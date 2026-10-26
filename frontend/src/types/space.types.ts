import type {
  RefetchOptions,
  QueryObserverResult,
} from '@tanstack/react-query';
import type { NoteTreeItem } from '@/types/note.types';
import type { Topic } from '@/types/topic.types';

export type Space = {
  spaceId: string;
  name: string;
};

export type SpaceContent = {
  topics: Topic[];
  notes: NoteTreeItem[];
};

export interface getSpaceResponse {
  content: Space[];
}

export interface SpaceContextType {
  activeSpace: Space | null;
  selectSpace: (space: Space) => void;
  clearSelectedSpace: () => void;
  data: NoInfer<getSpaceResponse | null> | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<NoInfer<getSpaceResponse | null>, Error>>;
}
