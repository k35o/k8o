export type Slug = 'tanstack-router-introduction' | 'color-contrast';

export type Blog = {
  id: number;
  title: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};
