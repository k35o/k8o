import { GlobalLayout } from '@/components/global-layout';
import './globals.css';
import { Fredoka } from 'next/font/google';
import { AppProvider } from './provider';

const font = Fredoka({ subsets: ['latin'] });

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
      </body>
    </html>
  );
}
