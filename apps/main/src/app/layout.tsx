import { GoogleAnalytics } from '@next/third-parties/google';

import './_styles/globals.css';
import '@repo/code-highlight/styles.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';

import { getBaselineMinVersions } from '@/features/baseline/interface/queries';
import { ReactScan } from '@/shared/browser/react-scan';

import { GlobalLayout } from './_components/global-layout';
import { ServiceWorkerRegister } from './_components/service-worker-register';
import { TrustedTypesInit } from './_components/trusted-types-init';
import { AppProvider } from './_providers/app';
import { mPlus2 } from './_styles/font';

export const metadata = {
  metadataBase: new URL('https://k8o.me'),
  title: 'k8o',
  description: 'k8oの活動や制作物をまとめた個人サイト',
  generator: 'Next.js',
  applicationName: 'k8o',
  referrer: 'origin-when-cross-origin',
  keywords: ['k8o'],
  authors: [{ name: 'k8o' }],
  creator: 'k8o',
  publisher: 'k8o',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'k8o',
    description: 'k8oの活動や制作物をまとめた個人サイト',
    url: 'https://k8o.me',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'k8o',
    card: 'summary',
    description: 'k8oの活動や制作物をまとめた個人サイト',
  },
  appleWebApp: {
    capable: true,
    title: 'k8o',
  },
} satisfies Metadata;

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const minVersions = await getBaselineMinVersions();
  const gaId = process.env['NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'];

  return (
    <html lang="ja" suppressHydrationWarning>
      {process.env['NODE_ENV'] === 'development' && <ReactScan />}
      <head>
        <TrustedTypesInit />
      </head>
      <body
        className={`${mPlus2.variable} bg-bg-surface font-m-plus-2 text-fg-base tracking-none font-medium antialiased`}
      >
        <AppProvider>
          <GlobalLayout minVersions={minVersions}>{children}</GlobalLayout>
        </AppProvider>
        <ServiceWorkerRegister />
        <Analytics />
        {gaId !== undefined && gaId !== '' && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
