import { GlobalLayout } from './_components/global-layout';
import './_styles/globals.css';
import { M_PLUS_2, Noto_Sans_JP } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/libs/zod';
import { AppProvider } from '@/providers/app';
import { cn } from '@/utils/cn';
import { ReactNode } from 'react';
import { Metadata } from 'next';

const font = M_PLUS_2({
  subsets: ['latin'],
});

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

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
      <body
        className={cn(
          font.className,
          subFont.variable,
          'text-fg-base',
        )}
      >
        <AppProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </AppProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
