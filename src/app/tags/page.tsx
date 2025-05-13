import { TagCard } from './_components/tag-card';
import { getTags } from '@/services/tags';
import { unstable_cache as cache } from 'next/cache';

export default async function Page() {
  const tags = await cache(getTags)();
  return (
    <section className="grid-cols-auto-fill-70 grid justify-items-center gap-4">
      {tags.map((tag) => (
        <TagCard
          key={tag.id}
          id={tag.id}
          name={tag.name}
          count={tag.blogCount + tag.serviceCount}
        />
      ))}
    </section>
  );
}
