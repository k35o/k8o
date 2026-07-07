import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';

export const metadata = {
  title: 'いろばしご',
  description:
    'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
  openGraph: {
    title: 'いろばしご',
    description:
      'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
    url: 'https://k8o.me/palette-maker',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'いろばしご',
    card: 'summary',
    description:
      'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/palette-maker'>) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex h-full flex-col gap-4">
        <Heading type="h2">いろばしご</Heading>
        {children}
      </div>
    </div>
  );
}
