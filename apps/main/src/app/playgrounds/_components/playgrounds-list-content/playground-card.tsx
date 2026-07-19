import { BlogIcon, Card, ChevronIcon, Heading } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { PlaygroundSummary } from '../../_utils/types';

export const PlaygroundCard: FC<{
  playground: PlaygroundSummary;
  headingType?: 'h3' | 'h4';
}> = ({ playground, headingType = 'h3' }) => (
  <Card appearance="shadow" interactive>
    <Link
      className="group block h-full"
      href={`/playgrounds/${playground.id}` as Route}
    >
      <div className="flex h-full flex-col gap-3 p-6">
        <Heading lineClamp={2} type={headingType}>
          {playground.title}
        </Heading>
        <p className="text-fg-mute line-clamp-2 flex-1 text-sm leading-relaxed">
          {playground.description}
        </p>
        <div className="text-fg-subtle flex items-center gap-3 text-xs">
          <span>デモ{playground.demoCount}件</span>
          {playground.hasBlog && (
            <span className="flex items-center gap-1">
              <BlogIcon size="sm" />
              ブログ記事
            </span>
          )}
          <span className="group-hover:text-primary-fg ml-auto flex items-center transition-all duration-150 ease-out group-hover:translate-x-0.5">
            <ChevronIcon direction="right" size="sm" />
          </span>
        </div>
      </div>
    </Link>
  </Card>
);
