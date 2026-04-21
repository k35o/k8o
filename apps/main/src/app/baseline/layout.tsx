import { Heading } from '@k8o/arte-odyssey';
import type { Metadata } from 'next';
import { BaselineHelpDialog } from './_components/baseline-help-dialog';

const description =
  'Web Platform Baselineのステータスを追跡します。Newly AvailableやWidely Availableになった機能を年ごとに確認できます。';

export const metadata = {
  title: 'Baseline',
  description,
  openGraph: {
    title: 'Baseline',
    description,
    url: 'https://k8o.me/baseline',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'Baseline',
    card: 'summary',
    description,
  },
} satisfies Metadata;

export default function Layout({ children }: LayoutProps<'/baseline'>) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Heading type="h2">Baseline</Heading>
          <BaselineHelpDialog />
        </div>
        {children}
      </div>
    </div>
  );
}
