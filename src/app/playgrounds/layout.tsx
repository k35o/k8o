import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Playgrounds',
  description:
    'Blogや趣味で作成した簡単なWeb技術の試作を集めたページです。',
  openGraph: {
    title: 'Playgrounds',
    description:
      'Blogや趣味で作成した簡単なWeb技術の試作を集めたページです。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playgrounds',
    description:
      'Blogや趣味で作成した簡単なWeb技術の試作を集めたページです。',
  },
};

type LayoutProps = {
  children: ReactNode;
};

export default function PlaygroundsLayout({ children }: LayoutProps) {
  return children;
}
