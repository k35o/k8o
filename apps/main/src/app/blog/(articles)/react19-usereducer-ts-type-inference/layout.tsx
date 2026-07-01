import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'react19-usereducer-ts-type-inference';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/react19-usereducer-ts-type-inference'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
