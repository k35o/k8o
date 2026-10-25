import '@/styles/globals.css';
import '@/i18n';
import { ColorSchemeProvider } from '@k8ordo/color-scheme';
import type { LayoutProps } from '@k8ordo/framework';

import { AppProvider } from '@/components/site/app-provider';

// CSS Modules の型は __generated__ を rootDirs で重ねて引くので、@/ ではなく相対で import する
import styles from '../components/site/root-layout.module.css';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const gaId = process.env['GOOGLE_ANALYTICS_ID'];

  return (
    // ColorSchemeProvider のスクリプトが hydrate の前に dark のクラスを付けるので、html の
    // 属性だけはサーバーの出力と一致しない
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body className={styles.body}>
        <ColorSchemeProvider>
          <AppProvider>{children}</AppProvider>
        </ColorSchemeProvider>
        {/* /_vercel/speed-insights/script.js は Vercel だけが配るので、vite dev では読まない */}
        {import.meta.env.PROD && (
          <script defer src="/_vercel/speed-insights/script.js" />
        )}
        {gaId !== undefined && gaId !== '' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script async data-ga-id={gaId} src="/ga-init.js" />
          </>
        )}
      </body>
    </html>
  );
}
