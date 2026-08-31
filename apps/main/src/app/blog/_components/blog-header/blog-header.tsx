import { Heading } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import { WritingModeSwitcher } from '../blog-layout/writing-mode';
import { ExternalBlog } from '../external-blog';

export const BlogHeader: FC = () => (
  <div className="flex items-center justify-between">
    <Link className="hover:underline" href="/blog">
      <Heading level="h2">Blog</Heading>
    </Link>
    <div className="flex items-center gap-4">
      <WritingModeSwitcher />
      <ExternalBlog />
    </div>
  </div>
);
