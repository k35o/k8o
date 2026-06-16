import type { FC } from 'react';

import { ContentCard } from '@/app/_components/content-card';

type SlideCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const SlideCard: FC<SlideCardProps> = (props) => (
  <ContentCard {...props} headingType="h3" hrefPrefix="/slides" />
);
