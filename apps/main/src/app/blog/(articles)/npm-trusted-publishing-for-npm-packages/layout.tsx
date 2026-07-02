import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'npm-trusted-publishing-for-npm-packages';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/npm-trusted-publishing-for-npm-packages'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
