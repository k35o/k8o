import type { FC } from 'react';

export const playgroundCategories = [
  'css',
  'html',
  'js-api',
  'performance',
  'react',
] as const;

export type PlaygroundCategory = (typeof playgroundCategories)[number];

export const playgroundCategoryLabels = {
  css: 'CSS',
  html: 'HTML',
  'js-api': 'Web API',
  performance: 'パフォーマンス',
  react: 'React',
} as const satisfies Record<PlaygroundCategory, string>;

type PlaygroundDemo = {
  component: FC;
  title: string;
  description: string;
};

type PlaygroundSectionBase = {
  id: string;
  title: string;
  description: string;
  category: PlaygroundCategory;
  demos: PlaygroundDemo[];
};

export type PlaygroundSection = PlaygroundSectionBase &
  ({ type: 'blog'; slug: string } | { type: 'standalone' });
