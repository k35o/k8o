'use client';

import { Button, Heading } from '@k8o/arte-odyssey';
import type { FC } from 'react';

// html / body は font とグローバル CSS をアプリ側が持つため、呼び出し側の
// global-error.tsx に残す。ここは中身だけを共有する
export const GlobalErrorContent: FC<{ reset: () => void }> = ({ reset }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
    <div className="flex flex-col gap-3">
      <Heading level="h1">問題が発生しました</Heading>
      <p className="text-fg-mute leading-relaxed">
        予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
      </p>
    </div>
    <Button onClick={reset} size="lg">
      再試行
    </Button>
  </div>
);
