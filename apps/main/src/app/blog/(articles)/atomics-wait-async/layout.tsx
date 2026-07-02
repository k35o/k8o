import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'atomics-wait-async';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/atomics-wait-async'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
