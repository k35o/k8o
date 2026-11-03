import { href } from '@k8ordo/framework';
import type { FC } from 'react';

import { TagCard } from '../tag-card/tag-card';

import styles from './tags-index.module.css';

export const TagsIndex: FC<{
  tags: ReadonlyArray<{
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }>;
}> = ({ tags }) => (
  <section className={styles.root}>
    {tags.map((tag) => {
      if (tag.blogCount + tag.talkCount === 0) {
        return null;
      }
      return (
        <TagCard
          count={tag.blogCount + tag.talkCount}
          href={href('/tags/:id', { id: tag.id })}
          key={tag.id}
          label="コンテンツを見る"
          linkLabel={`「${tag.name}」に関連するコンテンツを表示する`}
          title={tag.name}
        />
      );
    })}
  </section>
);
