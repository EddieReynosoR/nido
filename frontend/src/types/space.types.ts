import type {
  RefetchOptions,
  QueryObserverResult,
} from '@tanstack/react-query';

export type Space = {
  spaceId: string;
  name: string;
};

export interface getSpaceResponse {
  content: Space[];
}

export interface SpaceContextType {
  activeSpace: Space | null;
  selectSpace: (space: Space) => void;
  data: NoInfer<getSpaceResponse | null> | undefined;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<NoInfer<getSpaceResponse | null>, Error>>;
}
