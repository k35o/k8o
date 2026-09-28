import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'arianotify';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({ children }: LayoutProps<'/blog/arianotify'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
