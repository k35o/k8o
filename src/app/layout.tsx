import { GlobalLayout } from '@/components/global-layout';
import './globals.css';
import { M_PLUS_2 } from 'next/font/google';
import { AppProvider } from './provider';
import { Analytics } from '@vercel/analytics/react';

const font = M_PLUS_2({
  subsets: ['latin'],
});

export const metadata = {
  title: 'k8o',
  description: 'k8o portal',
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
      </body>
    </html>
  );
}
