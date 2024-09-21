import Link from 'next/link';
import { Heading } from '../../components/heading';
import { ExternalBlog } from './_components/external-blog';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'Blog',
  description: 'k8oのブログです。',
  openGraph: {
    title: 'Blog',
    description: 'k8oのブログです。',
    url: 'https://k8o.me/blog',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Blog',
    card: 'summary',
    description: 'k8oのブログです。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      {/* Get the latest one from: https://katex.org/docs/browser */}
      <link
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        rel="stylesheet"
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/blog">
            <Heading type="h2">Blog</Heading>
          </Link>
          <ExternalBlog />
        </div>
        {children}
      </div>
    </>
  );
}
