'use client';

import { useCallback, useRef, useState, useTransition } from 'react';

type ActionResult = {
  error?: string;
};

type RunHandlers<T> = {
  onSuccess?: (result: T) => void;
  onError?: (message: string) => void;
};

const FALLBACK_ERROR_MESSAGE =
  '処理に失敗しました。時間をおいて再度お試しください。';

export const useAsyncAction = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  // 連続実行時、古い run の結果で最新の状態を上書きしないための世代カウンタ
  const runIdRef = useRef(0);

  const run = useCallback(
    <T extends ActionResult>(
      action: () => Promise<T>,
      handlers?: RunHandlers<T>,
    ): void => {
      const runId = (runIdRef.current += 1);
      const isStale = (): boolean => runId !== runIdRef.current;
      const handleError = (message: string): void => {
        if (isStale()) {
          return;
        }
        if (handlers?.onError) {
          handlers.onError(message);
        } else {
          setError(message);
        }
      };

      setError(undefined);
      startTransition(async () => {
        try {
          const result = await action();
          if (isStale()) {
            return;
          }
          if (result.error !== undefined) {
            handleError(result.error);
            return;
          }
          handlers?.onSuccess?.(result);
        } catch {
          // action 自体の reject（ネットワーク断・500 等）でも UI を無反応にせずエラー表示する
          handleError(FALLBACK_ERROR_MESSAGE);
        }
      });
    },
    [],
  );

  return { isPending, error, run };
};
