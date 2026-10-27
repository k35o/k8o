import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import { PlaygroundsListContent } from '../playgrounds-list-content/playgrounds-list-content';
import type { PlaygroundSummary } from '../playgrounds-list-content/types';

import styles from './playgrounds-index.module.css';

export const PlaygroundsIndex: FC = async () => {
  // 静的に import すると、サーバーで描くデモの CSS を、デモを描かない一覧も読むので遅れて読む
  const { playgroundSections } = await import('@playgrounds/sections');
  const playgroundSummaries: PlaygroundSummary[] = playgroundSections
    .map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      category: section.category,
      demoCount: section.demos.length,
      demoTexts: section.demos.flatMap((demo) => [
        demo.title,
        demo.description,
      ]),
      hasBlog: section.type === 'blog',
    }))
    .toSorted((a, b) => a.title.localeCompare(b.title, 'ja'));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Heading level="h1">Playgrounds</Heading>
        <p className={styles.description}>
          ブログ記事や興味のある技術の試作品を集めています。気になるものを選ぶと、実際に動かせるデモページが開きます。
        </p>
      </div>
      <PlaygroundsListContent playgrounds={playgroundSummaries} />
    </div>
  );
};
