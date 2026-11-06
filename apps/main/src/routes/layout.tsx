import '@fontsource-variable/m-plus-2';
import '@/styles/globals.css';
import '@/i18n';
import mPlus2LatinUrl from '@fontsource-variable/m-plus-2/files/m-plus-2-latin-wght-normal.woff2?url';
import { ColorSchemeProvider, ColorSchemeScript } from '@k8ordo/color-scheme';
import type { LayoutProps } from '@k8ordo/framework';
import { preload } from 'react-dom';

import { WritingModeProvider } from '@/components/blog/blog-layout/writing-mode/writing-mode-context';
import { AppProvider } from '@/components/site/app-provider';
import { GlobalLayout } from '@/components/site/global-layout/global-layout';
import { OfflineNotice } from '@/components/site/offline-notice/offline-notice';
import { ReactScan } from '@/components/site/react-scan/react-scan';
import { RootErrorBoundary } from '@/components/site/root-error-boundary/root-error-boundary';
import { ServiceWorkerRegister } from '@/components/site/service-worker-register/service-worker-register';
import { getBrowserMinVersions } from '@/features/browser-support/interface/queries';

// CSS Modules の型は __generated__ を rootDirs で重ねて引くので、@/ ではなく相対で import する
import styles from '../components/site/root-layout.module.css';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const gaId = process.env['GOOGLE_ANALYTICS_ID'];
  // <link rel="preload"> を描くと、React がその要素とは別に同じ preload を head に書き、
  // 2 本になる。@font-face のフォントは CORS で読むので、crossOrigin が無いと別の要求になる
  preload(mPlus2LatinUrl, {
    as: 'font',
    crossOrigin: 'anonymous',
    type: 'font/woff2',
  });

  return (
    // ColorSchemeScript が hydrate の前に dark のクラスを付けるので、html の
    // 属性だけはサーバーの出力と一致しない
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <ColorSchemeScript />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="k8o" name="application-name" />
        <meta content="k8o" name="author" />
        <meta content="k8o" name="keywords" />
        <meta content="k8o" name="creator" />
        <meta content="k8o" name="publisher" />
        <meta
          content="telephone=no, address=no, email=no"
          name="format-detection"
        />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta content="k8o" name="apple-mobile-web-app-title" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <link href="/manifest.webmanifest" rel="manifest" />
        <link
          href="/favicon.ico"
          rel="icon"
          sizes="48x48"
          type="image/x-icon"
        />
        <link href="/icon.png" rel="icon" sizes="180x180" type="image/png" />
        <link
          href="/apple-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
          type="image/png"
        />
      </head>
      <body className={styles.body}>
        <RootErrorBoundary>
          <ColorSchemeProvider>
            <AppProvider>
              <GlobalLayout minVersions={getBrowserMinVersions()}>
                {/* ページを移っても縦書きの切り替えを保つため、/blog の layout ではなくルートに置く */}
                <WritingModeProvider>{children}</WritingModeProvider>
              </GlobalLayout>
              <OfflineNotice />
            </AppProvider>
          </ColorSchemeProvider>
          <ServiceWorkerRegister />
          {import.meta.env.DEV && <ReactScan />}
        </RootErrorBoundary>
        {/* /_vercel/speed-insights/script.js は Vercel だけが配るので、vite dev では読まない */}
        {import.meta.env.PROD && (
          <script defer src="/_vercel/speed-insights/script.js" />
        )}
        {gaId !== undefined && gaId !== '' && (
          <>
            {/* type で止めて取りに行かせず、ga-init.js が load の後に写して type を外す。async で React の資源にすると、
                404 で描き直すときに作り直さず（Trusted Types の sink を通さず）、今ある要素を使う */}
            <script
              async
              id="gtag-js"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              type="text/plain"
            />
            <script async data-ga-id={gaId} src="/ga-init.js" />
          </>
        )}
      </body>
    </html>
  );
}
