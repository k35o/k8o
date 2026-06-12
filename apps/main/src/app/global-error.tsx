'use client';

import { Button, Heading } from '@k8o/arte-odyssey';

import './_styles/globals.css';

import { cn } from '@repo/helpers/cn';
import { useEffect } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

import { mPlus2, notoSansJp } from './_styles/font';

// root layout ごと失敗した場合のフォールバックなので、Provider に依存しない最小構成にする
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        className={cn(
          mPlus2.variable,
          notoSansJp.variable,
          'bg-bg-surface font-m-plus-2 font-medium text-fg-base tracking-none antialiased',
        )}
      >
        <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
          <div className="flex flex-col gap-3">
            <Heading type="h1">問題が発生しました</Heading>
            <p className="text-fg-mute leading-relaxed">
              予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
            </p>
          </div>
          <Button onClick={reset} size="lg">
            再試行
          </Button>
        </div>
      </body>
    </html>
  );
}
