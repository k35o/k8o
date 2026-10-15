import type { Route } from 'next';

import { getTags } from '@/features/tags/interface/queries';

import { TagCard } from './_components/tag-card';

import styles from './page.module.css';

export default async function Page() {
  const tags = await getTags();
  return (
    <section className={styles.root}>
      {tags.map((tag) => {
        if (tag.blogCount + tag.talkCount === 0) {
          return null;
        }
        return (
          <TagCard
            count={tag.blogCount + tag.talkCount}
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
