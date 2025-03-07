import { BlogLayout } from '../_components/blog-layout';
import { getBlog } from '#actions/blog';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlog({
    slug: 'color-certification-uc',
  });
  if (!blog) {
    throw new Error('Blog not found');
  }

  return {
    title: blog.title,
    description:
      blog.description === '' ? blog.description : blog.title,
    category: '色彩検定 UC級',
    openGraph: {
      title: blog.title,
      description:
        blog.description === '' ? blog.description : blog.title,
      url: 'https://k8o.me/blog/color-certification-uc',
      publishedTime: blog.createdAt.toString(),
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description:
        blog.description === '' ? blog.description : blog.title,
    },
  };
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <BlogLayout slug="color-certification-uc">{children}</BlogLayout>
  );
}
