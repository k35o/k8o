import { Suspense } from 'react';
import { ReadingListContent } from './_components/reading-list-content/reading-list-content';

export default function ReadingListPage() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-bold text-2xl">よんでいるもの</h2>
      <Suspense
        fallback={<p className="text-fg-mute text-sm">読み込み中...</p>}
      >
        <ReadingListContent />
      </Suspense>
    </div>
  );
}
