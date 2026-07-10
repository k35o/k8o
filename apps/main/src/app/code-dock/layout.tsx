import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

const TITLE = 'コードドック';
const DESCRIPTION =
  'JavaScript/TypeScriptのコードをoxlintで検査し、oxfmtで整形します。';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://k8o.me/code-dock',
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

export default function Layout({ children }: LayoutProps<'/code-dock'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">{TITLE}</Heading>
        {children}
      </div>
    </div>
  );
}
