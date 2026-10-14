'use client';

import { GlobalErrorContent } from '@repo/auth-shell/global-error-content';

// root layout ごと置き換わるので、ロケール集合もここから読み込む
import '@/i18n';

import './_styles/globals.css';

import { cn } from '@repo/helpers/cn';

import { mPlus2, notoSansJp } from './_styles/font';

// root layout ごと失敗した場合のフォールバックなので、Provider に依存しない最小構成にする
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body
        className={cn(
          mPlus2.variable,
          notoSansJp.variable,
          'bg-bg-surface font-m-plus-2 font-medium text-fg-base antialiased',
        )}
      >
        <GlobalErrorContent reset={reset} />
      </body>
    </html>
  );
}
