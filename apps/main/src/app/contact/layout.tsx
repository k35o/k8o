import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

const DESCRIPTION = 'k8oへの連絡手段の一覧です。';

export const metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact',
    description: DESCRIPTION,
    url: 'https://k8o.me/contact',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Contact',
    card: 'summary',
    description: DESCRIPTION,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/contact'>) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-8">
        <Heading level="h2">Contact</Heading>
        {children}
      </div>
    </div>
  );
}
