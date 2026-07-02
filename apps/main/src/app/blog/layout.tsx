import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  WritingModeProvider,
  WritingModeSwitcher,
} from './_components/blog-layout/writing-mode';
import { ExternalBlog } from './_components/external-blog';
import { ScrollToTopOnPathChange } from './_components/scroll-to-top-on-path-change';

import './_styles/katex-vertical.css';

export const metadata = {
  title: 'Blog',
  description: 'Webフロントエンドを中心に、日々のことも書いています。',
  openGraph: {
    title: 'Blog',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
    url: 'https://k8o.me/blog',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Blog',
    card: 'summary',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://k8o.me/blog/feed',
    },
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        rel="stylesheet"
      />
      <ScrollToTopOnPathChange />
      <WritingModeProvider>
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Link className="hover:underline" href="/blog">
                <Heading type="h2">Blog</Heading>
              </Link>
              <div className="flex items-center gap-4">
                <WritingModeSwitcher />
                <ExternalBlog />
              </div>
            </div>
            {children}
          </div>
        </div>
      </WritingModeProvider>
    </>
  );
}
