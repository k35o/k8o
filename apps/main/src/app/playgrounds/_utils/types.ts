import type { PlaygroundCategory } from '@/app/_components/playgrounds/types';

export type PlaygroundSummary = {
  id: string;
  title: string;
  description: string;
  category: PlaygroundCategory;
  demoCount: number;
  demoTexts: string[];
  hasBlog: boolean;
};
