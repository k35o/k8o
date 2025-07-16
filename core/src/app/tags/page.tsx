import { TagCard } from './_components/tag-card';
import { getTags } from '@/services/tags/tags';
import { unstable_cache as cache } from 'next/cache';

export default async function Page() {
  const tags = await cache(getTags)();
  return (
    <section className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
      {tags.map((tag) => {
        if (tag.blogCount + tag.serviceCount + tag.talkCount === 0) {
          return null;
        }
        return (
          <TagCard
            key={tag.id}
            title={tag.name}
            href={`/tags/${tag.id.toString()}`}
            count={tag.blogCount + tag.serviceCount + tag.talkCount}
            label="コンテンツを見る"
            linkLabel={`「${tag.name}」に関連するコンテンツを表示する`}
          />
        );
      })}
    </section>
  );
}
