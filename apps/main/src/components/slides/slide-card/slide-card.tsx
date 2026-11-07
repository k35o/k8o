import { href } from '@k8ordo/framework';
import type { FC } from 'react';

import { ContentCard } from '@/components/site/content-card/content-card';

type SlideCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const SlideCard: FC<SlideCardProps> = (props) => (
  <ContentCard
    {...props}
    headingType="h3"
    href={href('/slides/:slug', { slug: props.slug })}
  />
);
