import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Space, SpaceContextType } from '@/types/space.types';
import { Outlet } from 'react-router';
import { useSpaces } from '@/hooks/use-space';
import { useAuth } from '@/context/AuthContext';
import { ACTIVE_SPACE_KEY } from '@/lib/space';

const SpaceContext = createContext<SpaceContextType | null>(null);

function spaceFallback(space: Space | undefined, selectSpace: (space: Space) => void) {

  if (!space) return undefined;

  selectSpace(space);
  return space;
}

export function SpaceProvider() {
  const { accessToken } = useAuth();
  const { data, isLoading, error, isError, refetch } = useSpaces(accessToken);

  const [selectedId, setSelectedId] = useState(() =>
    localStorage.getItem(ACTIVE_SPACE_KEY)
  );

  const spaces = data?.content;

  const selectSpace = useCallback((space: Space) => {
    setSelectedId(space.spaceId);
    localStorage.setItem(ACTIVE_SPACE_KEY, space.spaceId);
  }, []);

  const activeSpace =
    spaces?.find((space) => space.spaceId === selectedId) ??
    spaceFallback(spaces?.[0], selectSpace) ??
    null;

  const value = useMemo(
    () => ({
      activeSpace,
      selectSpace,
      data,
      isLoading,
      error,
      isError,
      refetch,
    }),
    [activeSpace, selectSpace, data, isLoading, error, isError, refetch]
  );

  return (
    <SpaceContext value={value}>
      <Outlet />
    </SpaceContext>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);

  if (!context) {
    throw new Error('useSpace must be used within an SpaceProvider');
  }

  return context;
}
