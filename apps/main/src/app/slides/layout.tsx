import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Slides',
  description: '登壇や発表で使ったスライドをまとめています。',
  alternates: {
    types: {
      'application/rss+xml': 'https://k8o.me/slides/feed',
    },
  },
  openGraph: {
    title: 'Slides',
    description: '登壇や発表で使ったスライドをまとめています。',
    url: 'https://k8o.me/slides',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Slides',
    card: 'summary',
    description: '登壇や発表で使ったスライドをまとめています。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/slides'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-6">
        <Link className="hover:underline" href="/slides">
          <Heading type="h2">Slides</Heading>
        </Link>
        {children}
      </div>
    </div>
  );
}
