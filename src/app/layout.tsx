import { GlobalLayout } from './_components/global-layout';
import './_styles/globals.css';
import { M_PLUS_2 } from 'next/font/google';
import { AppProvider } from './_providers/app';
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
