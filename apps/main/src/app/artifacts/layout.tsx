import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Artifacts',
  description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
  openGraph: {
    title: 'Artifacts',
    description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
    url: 'https://k8o.me/artifacts',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Artifacts',
    card: 'summary',
    description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/artifacts'>) {
  return (
    <div className="flex flex-col gap-6">
      <Heading type="h2">Artifacts</Heading>
      {children}
    </div>
  );
}
