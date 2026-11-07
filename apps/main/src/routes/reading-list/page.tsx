import { ReadingListIndex } from '@/components/reading-list/reading-list-index/reading-list-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';

export default function ReadingListPage() {
  return (
    <>
      <PageMeta
        description="気になっている記事を集めて、あとから探せるようにしています。"
        path="/reading-list"
        rssFeedPath="/reading-list/feed"
        title="Readings"
      />
      <ReadingListIndex />
    </>
  );
}
