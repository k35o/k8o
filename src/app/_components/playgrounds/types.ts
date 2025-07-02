import { ComponentType } from 'react';

export type PlaygroundDemo = {
  component: ComponentType;
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
