import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'OSS',
  description: '公開しているオープンソースプロジェクトをまとめています。',
  openGraph: {
    title: 'OSS',
    description: '公開しているオープンソースプロジェクトをまとめています。',
    url: 'https://k8o.me/oss',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'OSS',
    card: 'summary',
    description: '公開しているオープンソースプロジェクトをまとめています。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/oss'>) {
  return (
    <div className="flex flex-col gap-6">
      <Heading type="h2">OSS</Heading>
      {children}
    </div>
  );
}
