import { useLocation } from 'react-router';
import NoteTabs from '@/components/notes/NoteTabs';
import TopicTree from '@/components/topics/TopicTree';
import { useSpaceContent } from '@/hooks/spaces/use-space-content';
import { SPACE_ID } from '@/test/topic-tree-mocks';

export default function Sidebar() {
  const { data } = useSpaceContent(SPACE_ID, 'token');
  const { pathname } = useLocation();
  if (!data) return null;

  return (
    <>
      <output data-testid="location">{pathname}</output>
      <NoteTabs />
      <TopicTree topics={data.topics} notes={data.notes} spaceId={SPACE_ID} />
    </>
  );
}
