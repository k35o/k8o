import { getReadingList } from '@/features/reading-list/interface/queries';

import { ReadingListContent } from './_components/reading-list-content';

export default async function Page() {
  const readingList = await getReadingList();

  return <ReadingListContent readingList={readingList} />;
}
