import { Heading } from '@k8o/arte-odyssey/heading';
import { PropsWithChildren } from 'react';

export const metadata = {
  title: 'ArteOdyssey',
  description:
    'k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。',
  openGraph: {
    title: 'ArteOdyssey',
    description:
      'k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。',
    url: 'https://k8o.me/design-system',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'ArteOdyssey',
    card: 'summary',
    description:
      'k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">ArteOdyssey</Heading>
      {children}
    </div>
  );
}
