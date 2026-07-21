import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

const description =
  'ReadingsとBrowser Supportの更新をプッシュ通知で受け取れます。受け取った通知の履歴も確認できます。';

export const metadata = {
  title: '通知',
  description,
  openGraph: {
    title: '通知',
    description,
    url: 'https://k8o.me/notifications',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: '通知',
    card: 'summary',
    description,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/notifications'>) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-8">
        <Heading type="h2">通知</Heading>
        {children}
      </div>
    </div>
  );
}
