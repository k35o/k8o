import { GlobalLayout } from './_components/global-layout';
import './_styles/globals.css';
import { cn } from '@k8o/helpers/cn';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ReactScan } from '@/libs/react-scan';
import { AppProvider } from './_providers/app';
import { mPlus2, notoSansJp } from './_styles/font';
import '@/libs/zod';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      {process.env.NODE_ENV === 'development' && <ReactScan />}
      <body
        className={cn(
          mPlus2.variable,
          notoSansJp.variable,
          'font-m-plus-2 font-medium text-fg-base tracking-none antialiased',
        )}
      >
        <AppProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </AppProvider>
        <Analytics />
        <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID ?? ''} />
        <SpeedInsights />
      </body>
    </html>
  );
}
