import { href } from '@k8ordo/framework';
import { Anchor, Badge, Heading } from '@k8ordo/ui';
import { playgroundCategoryLabels } from '@playgrounds/types';
import type { PlaygroundSection } from '@playgrounds/types';
import type { FC } from 'react';

import { getBlogContents } from '@/features/blog/interface/queries';

import { BlogLinkButton } from '../blog-link-button/blog-link-button';
import { SectionDemos } from '../section-demos';

import styles from './playground-section-view.module.css';

export const PlaygroundSectionView: FC<{
  section: PlaygroundSection;
}> = async ({ section }) => {
  const blogs = await getBlogContents();
  const blogSlug =
    section.type === 'blog' && blogs.some((blog) => blog.slug === section.slug)
      ? section.slug
      : undefined;

  return (
    <div className={styles.root}>
      <Anchor href={href('/playgrounds')}>← Playgrounds一覧に戻る</Anchor>
      <div className={styles.header}>
        <div className={styles.meta}>
          <Badge label={playgroundCategoryLabels[section.category]} size="sm" />
          <span className={styles.count}>デモ{section.demos.length}件</span>
        </div>
        <Heading level="h1">{section.title}</Heading>
        <p className={styles.description}>{section.description}</p>
        {blogSlug !== undefined && (
          <div className={styles.blogLink}>
            <BlogLinkButton slug={blogSlug} />
          </div>
        )}
      </div>
      <div>
        <SectionDemos demos={section.demos} />
      </div>
    </div>
  );
};
