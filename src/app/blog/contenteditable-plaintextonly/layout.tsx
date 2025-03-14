import { BlogLayout } from '../_components/blog-layout';
import { getBlog } from '#actions/blog';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const blog = await getBlog({
    slug: 'contenteditable-plaintextonly',
  });
  if (!blog) {
    throw new Error('Blog not found');
  }

  return {
    title: blog.title,
    description: blog.description,
    category: blog.tags.join(', '),
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: 'https://k8o.me/blog/contenteditable-plaintextonly',
      publishedTime: blog.createdAt.toString(),
      authors: ['k8o'],
      siteName: 'k8o',
      locale: 'ja',
      type: 'article',
    },
    twitter: {
      title: blog.title,
      card: 'summary_large_image',
      description: blog.description,
    },
  };
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <BlogLayout slug="contenteditable-plaintextonly">
      {children}
    </BlogLayout>
  );
}
