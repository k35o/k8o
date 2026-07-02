import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'text-indent-keywords';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/text-indent-keywords'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
