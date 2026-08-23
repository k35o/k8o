import type { Metadata } from 'next';

import { WritingModeProvider } from './_components/blog-layout/writing-mode';
import { ScrollToTopOnPathChange } from './_components/scroll-to-top-on-path-change';

import './_styles/vertical-inline-code.css';

export const metadata = {
  title: 'Blog',
  description: 'Webフロントエンドを中心に、日々のことも書いています。',
  alternates: {
    types: {
      'application/rss+xml': 'https://k8o.me/blog/feed',
    },
  },
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
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/blog'>) {
  return (
    <>
      <ScrollToTopOnPathChange />
      <WritingModeProvider>{children}</WritingModeProvider>
    </>
  );
}
