import { ReadingListIndex } from '@/components/reading-list/reading-list-index/reading-list-index';
import { PageMeta } from '@/components/site/page-meta/page-meta';
import { getReadingList } from '@/features/reading-list/interface/queries';

export default async function ReadingListPage() {
  const readingList = await getReadingList();

  return (
    <>
      <PageMeta
        description="気になっている記事を集めて、あとから探せるようにしています。"
        path="/reading-list"
        rssFeedPath="/reading-list/feed"
        title="Readings"
      />
      <ReadingListIndex readingList={readingList} />
    </>
  );
}
