import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

import 'katex/dist/katex.min.css';
import '@/app/blog/_styles/katex-vertical.css';

const slug = 'font-family-math';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/font-family-math'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
