import { href } from '@k8ordo/framework';
import { BlogIcon, Card, ChevronIcon, Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { PlaygroundSummary } from './types';

import styles from './playground-card.module.css';

export const PlaygroundCard: FC<{
  playground: PlaygroundSummary;
  headingType?: 'h3' | 'h4';
}> = ({ playground, headingType = 'h3' }) => (
  <Card variant="shadow" interactive>
    {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- リンクの名前は中の Playground の題などの文字が持つ。規則は子を浅くしかたどらず、そこまで届かない */}
    <a
      className={styles.root}
      href={href('/playgrounds/:id', { id: playground.id })}
    >
      <div className={styles.body}>
        <Heading lineClamp={2} level={headingType}>
          {playground.title}
        </Heading>
        <p className={styles.description}>{playground.description}</p>
        <div className={styles.meta}>
          <span>デモ{playground.demoCount}件</span>
          {playground.hasBlog && (
            <span className={styles.blog}>
              <BlogIcon size="sm" />
              ブログ記事
            </span>
          )}
          <span className={styles.chevron}>
            <ChevronIcon direction="right" size="sm" />
          </span>
        </div>
      </div>
    </a>
  </Card>
);
