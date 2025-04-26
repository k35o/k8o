import { getBlog, getBlogMetadata } from '#services/blog';
import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

const slug = 'screen-wake-lock';

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlog(slug);
  const metadata = await getBlogMetadata(slug);

  return {
    title: metadata.title,
    description: metadata.description,
    category: blog.tags.map((tag) => tag.name).join(', '),
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `https://k8o.me/blog/${slug}`,
      publishedTime: metadata.createdAt.toString(),
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: metadata.title,
      card: 'summary_large_image',
      description: metadata.description,
    },
  };
}

export default function Layout({ children }: PropsWithChildren) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
