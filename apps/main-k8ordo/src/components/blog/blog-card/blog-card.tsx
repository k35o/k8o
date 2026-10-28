import { href } from '@k8ordo/framework';
import type { FC } from 'react';

import { ContentCard } from '@/components/site/content-card/content-card';

type BlogCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  readingTime?: number;
};

export const BlogCard: FC<BlogCardProps> = ({ slug, ...props }) => (
  <ContentCard
    {...props}
    headingType="h4"
    href={href('/blog/:slug', { slug })}
  />
);
