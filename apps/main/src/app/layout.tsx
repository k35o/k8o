import './_styles/globals.css';
import '@repo/code-highlight/styles.css';
import '@/i18n';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import { ReactScan } from '@/app/_components/react-scan';
import { getBrowserMinVersions } from '@/features/browser-support/interface/queries';

import { GlobalLayout } from './_components/global-layout';
import { OfflineNotice } from './_components/offline-notice';
import { ServiceWorkerRegister } from './_components/service-worker-register';
import { AppProvider } from './_providers/app';
import { mPlus2 } from './_styles/font';

import styles from './layout.module.css';

export const metadata = {
  metadataBase: new URL('https://k8o.me'),
  title: {
    default: 'k8o',
    template: '%s | k8o',
  },
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
} satisfies Metadata;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // フロアはコミット済み生成物由来の同期読み。全ページの静的シェルが実行時 I/O に
  // 依存しないことを保証する(DB 障害でもシェルは無傷)。
  const minVersions = getBrowserMinVersions();
  const gaId = process.env['NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'];

  return (
    <html lang="ja" suppressHydrationWarning>
      {process.env.NODE_ENV === 'development' && <ReactScan />}
      <body className={`${mPlus2.variable} ${styles.body}`}>
        <AppProvider>
          <GlobalLayout minVersions={minVersions}>{children}</GlobalLayout>
          <OfflineNotice />
        </AppProvider>
        <ServiceWorkerRegister />
        <SpeedInsights />
        {/* next/script は script を JS で差し込み、Trusted Types の sink の違反になるので、素の script で HTML に書く */}
        {gaId !== undefined && gaId !== '' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script async src="/ga-init.js" data-ga-id={gaId} />
          </>
        )}
      </body>
    </html>
  );
}
