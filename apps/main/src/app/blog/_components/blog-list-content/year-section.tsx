import { Heading } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import type { BlogSummary } from '../../_utils/types';
import { BlogCard } from '../blog-card';

type Props = {
  year: number;
  blogs: readonly BlogSummary[];
};

export const YearSection: FC<Props> = ({ year, blogs }) => (
  <section className="flex flex-col gap-4">
    <Heading type="h3">{year}年</Heading>
    <div className="flex flex-col gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} {...blog} />
      ))}
    </div>
  </section>
);
