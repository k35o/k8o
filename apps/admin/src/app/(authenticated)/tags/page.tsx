import { PageHeader, SectionHeader } from '@/app/(authenticated)/_components';
import { getTags } from '@/features/tags/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { TagAddForm } from './_components/tag-add-form';
import { TagList } from './_components/tag-list';

export default async function TagsPage() {
  await verifySession();
  const tags = await getTags();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="ブログ・トーク・スライドで使うタグを管理します"
        title="タグ"
      />
      <section className="flex flex-col gap-4">
        <SectionHeader title="タグを追加" />
        <TagAddForm />
      </section>
      <section className="flex flex-col gap-4">
        <SectionHeader title={`一覧（${String(tags.length)}）`} />
        <TagList tags={tags} />
      </section>
    </div>
  );
}
