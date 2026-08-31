import { Heading } from '@k8ordo/ui';
import type { FC } from 'react';

import type { BlogSummary } from '../../_utils/types';
import { BlogCard } from '../blog-card';

type Props = {
  year: number;
  blogs: readonly BlogSummary[];
};

export const YearSection: FC<Props> = ({ year, blogs }) => (
  <section className="flex flex-col gap-4">
    <Heading level="h3">{year}年</Heading>
    <div className="flex flex-col gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  </section>
);
