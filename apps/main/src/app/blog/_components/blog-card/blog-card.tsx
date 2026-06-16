import type { FC } from 'react';

import { ContentCard } from '@/app/_components/content-card';

type BlogCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const BlogCard: FC<BlogCardProps> = (props) => (
  <ContentCard {...props} headingType="h4" hrefPrefix="/blog" />
);
