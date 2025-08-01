import { getBlogContent } from '#api/blog';
import { BlogLayout } from '@/app/blog/_components/blog-layout';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

const slug = 'color-contrast';

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlogContent(slug);

  return {
    title: blog.title,
    description: blog.description,
    category: blog.tags.map((tag) => tag.name).join(', '),
    openGraph: {
      title: blog.title,
      description: blog.description ?? undefined,
      url: `https://k8o.me/blog/${slug}`,
      publishedTime: blog.createdAt.toString(),
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description: blog.description ?? undefined,
    },
  };
}

export default function Layout({ children }: PropsWithChildren) {
  return <BlogLayout slug={slug}>{children}</BlogLayout>;
}
