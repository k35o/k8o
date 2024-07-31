import { GlobalLayout } from './_components/global-layout';
import './_styles/globals.css';
import { M_PLUS_2 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/libs/zod';
import { AppProvider } from '@/providers/app';

const font = M_PLUS_2({
  subsets: ['latin'],
});

export const metadata = {
  title: 'k8o',
  description: 'k8o portal',
  openGraph: {
    title: 'k8o',
    description: 'k8oのトップページ',
    url: 'https://k8o.me',
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
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={font.className}>
        <AppProvider>
          <GlobalLayout>{children}</GlobalLayout>
        </AppProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
