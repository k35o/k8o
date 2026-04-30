import { verifySession } from '@/shared/auth/verify-session';
import { ReadingListContent } from './_components/reading-list-content/reading-list-content';

export default async function ReadingListPage() {
  await verifySession();
  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-bold text-2xl">よんでいるもの</h2>
      <ReadingListContent />
    </div>
  );
}
