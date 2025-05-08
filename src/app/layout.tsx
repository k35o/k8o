import { GlobalLayout } from './_components/global-layout';
import './_styles/globals.css';
import { mPlus2, notoSansJp } from './_styles/font';
import { ReactScan } from '@/libs/react-scan';
import { AppProvider } from '@/providers/app';
import { cn } from '@/utils/cn';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/libs/zod';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL('https://k8o.me'),
  title: 'k8o',
  description: 'k8oのトップページ',
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
    description: 'k8oのトップページ',
    url: 'https://k8o.me',
    siteName: 'k8o',
    locale: 'ja',
    type: 'website',
  },
  twitter: {
    title: 'k8o',
    card: 'summary',
    description: 'k8oのトップページ',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <ReactScan />
      <body
        className={cn(
          mPlus2.variable,
          notoSansJp.variable,
          'text-fg-base font-m-plus-2 tracking-none font-medium antialiased',
        )}
      >
        <AppProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </AppProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
