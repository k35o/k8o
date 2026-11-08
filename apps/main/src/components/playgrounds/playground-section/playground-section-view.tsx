import { href } from '@k8ordo/framework';
import { Anchor, Badge, Heading, Stack } from '@k8ordo/ui';
import { playgroundCategoryLabels } from '@playgrounds/types';
import type { PlaygroundSection } from '@playgrounds/types';
import type { FC } from 'react';

import { BlogLinkButton } from '../blog-link-button/blog-link-button';
import { blogSlugOf, getPublishedBlogSlugs } from '../blog-slug';
import { SectionDemos } from '../section-demos';

import styles from './playground-section-view.module.css';

export const PlaygroundSectionView: FC<{
  section: PlaygroundSection;
}> = async ({ section }) => {
  const blogSlug = blogSlugOf(section, await getPublishedBlogSlugs());

  return (
    <div className={styles.root}>
      <Anchor href={href('/playgrounds')}>← Playgrounds一覧に戻る</Anchor>
      <Stack gap="md">
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
      </Stack>
      <div>
        <SectionDemos demos={section.demos} />
      </div>
    </div>
  );
};
