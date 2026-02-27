import { Heading } from '@k8o/arte-odyssey/heading';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalBlog } from './_components/external-blog';

export const metadata = {
  title: 'Blog',
  description: 'Webフロントエンドの話題を中心に、日々のことも書くブログ。',
  openGraph: {
    title: 'Blog',
    description: 'Webフロントエンドの話題を中心に、日々のことも書くブログ。',
    url: 'https://k8o.me/blog',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Blog',
    card: 'summary',
    description: 'Webフロントエンドの話題を中心に、日々のことも書くブログ。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <>
      {/* Get the latest one from: https://katex.org/docs/browser */}
      <link
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        rel="stylesheet"
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link className="hover:underline" href="/blog">
            <Heading type="h2">Blog</Heading>
          </Link>
          <ExternalBlog />
        </div>
        {children}
      </div>
    </>
  );
}
