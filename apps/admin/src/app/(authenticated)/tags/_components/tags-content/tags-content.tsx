import { SectionHeader } from '@/app/(authenticated)/_components';
import { getTags } from '@/features/tags/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TagList } from '../tag-list';

export const TagsContent = async () => {
  await verifySession();
  const tags = await getTags();

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title={`一覧（${String(tags.length)}）`} />
      <TagList tags={tags} />
    </section>
  );
};
