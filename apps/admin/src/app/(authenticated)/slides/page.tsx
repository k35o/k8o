import { PageHeader } from '@/app/(authenticated)/_components';
import { getSlides } from '@/features/slides/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { SlideTable } from './_components/slide-table';

export default async function SlidesPage() {
  await verifySession();
  const slides = await getSlides();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="スライドの公開状態を管理します（タイトル/本文は MDX 管理のため slug で表示）。"
        title="スライド"
      />
      <SlideTable slides={slides} />
    </div>
  );
}
