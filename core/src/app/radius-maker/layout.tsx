import { Heading } from '@k8o/arte-odyssey/heading';
import type { PropsWithChildren } from 'react';

export const metadata = {
  title: 'かどまるラボ',
  description: '角丸を変化させてお気に入りの図形を探しましょう',
  openGraph: {
    title: 'かどまるラボ',
    description: '角丸を変化させてお気に入りの図形を探しましょう',
    url: 'https://k8o.me/rounded-maker',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'かどまるラボ',
    card: 'summary',
    description: '角丸を変化させてお気に入りの図形を探しましょう',
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Heading type="h2">かどまるラボ</Heading>
      {children}
    </div>
  );
}
