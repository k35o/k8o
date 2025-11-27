import type { Route } from 'next';
import { getTags } from '@/services/tags/tags';
import { TagCard } from './_components/tag-card';

export default async function Page() {
  const tags = await getTags();
  return (
    <section className="grid grid-cols-auto-fill-70 justify-items-center gap-4">
      {tags.map((tag) => {
        if (tag.blogCount + tag.serviceCount + tag.talkCount === 0) {
          return null;
        }
        return (
          <TagCard
            count={tag.blogCount + tag.serviceCount + tag.talkCount}
            href={`/tags/${tag.id.toString()}` as Route}
            key={tag.id}
            label="コンテンツを見る"
            linkLabel={`「${tag.name}」に関連するコンテンツを表示する`}
            title={tag.name}
          />
        );
      })}
    </section>
  );
}
