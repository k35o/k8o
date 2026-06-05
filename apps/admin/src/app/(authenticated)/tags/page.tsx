import { Suspense } from 'react';

import {
  ContentFallback,
  PageHeader,
  SectionHeader,
} from '@/app/(authenticated)/_components';

import { TagAddForm } from './_components/tag-add-form';
import { TagsContent } from './_components/tags-content/tags-content';

export default function TagsPage() {
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
      <Suspense fallback={<ContentFallback />}>
        <TagsContent />
      </Suspense>
    </div>
  );
}
