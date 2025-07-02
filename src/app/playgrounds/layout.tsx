import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Playgrounds',
  description:
    'Blogのために作成したサンプルや趣味で作成した試作品を集めました。',
  openGraph: {
    title: 'Playgrounds',
    description:
      'Blogのために作成したサンプルや趣味で作成した試作品を集めました。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playgrounds',
    description:
      'Blogのために作成したサンプルや趣味で作成した試作品を集めました。',
  },
};

type LayoutProps = {
  children: ReactNode;
};

export default function PlaygroundsLayout({ children }: LayoutProps) {
  return children;
}
