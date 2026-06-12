'use client';

import { Button, Heading } from '@k8o/arte-odyssey';
import Link from 'next/link';
import { useEffect } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

export default function ErrorPage({
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
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <div className="flex flex-col gap-3">
        <Heading type="h2">問題が発生しました</Heading>
        <p className="text-fg-mute leading-relaxed">
          予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button onClick={reset} size="lg">
          再試行
        </Button>
        <Button
          color="gray"
          renderItem={({ className, children }) => (
            <Link className={className} href="/">
              {children}
            </Link>
          )}
          size="lg"
          variant="outline"
        >
          トップへ戻る
        </Button>
      </div>
    </div>
  );
}
