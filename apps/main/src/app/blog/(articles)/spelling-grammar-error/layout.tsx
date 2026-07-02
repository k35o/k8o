import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'spelling-grammar-error';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/spelling-grammar-error'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
