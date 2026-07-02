import type { Metadata } from 'next';

import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { buildBlogMetadata } from '@/features/blog/interface/metadata';

const slug = 'uint8array-base64-hex';

export function generateMetadata(): Promise<Metadata> {
  return buildBlogMetadata(slug);
}

export default function Layout({
  children,
}: LayoutProps<'/blog/uint8array-base64-hex'>) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
