import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Playgrounds',
  description:
    'インタラクティブなWeb技術のデモとサンプルコード集。最新のWeb API、CSS機能、React技術を実際に試せるプレイグラウンドです。',
  openGraph: {
    title: 'Playgrounds | K8O',
    description:
      'インタラクティブなWeb技術のデモとサンプルコード集。最新のWeb API、CSS機能、React技術を実際に試せるプレイグラウンドです。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playgrounds | K8O',
    description:
      'インタラクティブなWeb技術のデモとサンプルコード集。最新のWeb API、CSS機能、React技術を実際に試せるプレイグラウンドです。',
  },
};

type LayoutProps = {
  children: ReactNode;
};

export default function PlaygroundsLayout({ children }: LayoutProps) {
  return children;
}
