import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

const TITLE = 'HTMLいれ子マップ';
const DESCRIPTION =
  'HTMLタグを選ぶと、親に置ける要素と中に入れられる子要素が浮かび上がります。';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://k8o.me/html-nest',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    card: 'summary',
    description: DESCRIPTION,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/html-nest'>) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">{TITLE}</Heading>
        {children}
      </div>
    </div>
  );
}
