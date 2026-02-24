import type { FC } from 'react';

type PlaygroundDemo = {
  component: FC;
  title: string;
};

type PlaygroundSectionBase = {
  id: string;
  title: string;
  description: string;
  demos: PlaygroundDemo[];
};

export type PlaygroundSection = PlaygroundSectionBase &
  ({ type: 'blog'; slug: string } | { type: 'standalone' });
