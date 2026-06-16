'use client';

import { useCallback, useState, useTransition } from 'react';

type ActionResult = {
  error?: string;
};

type RunHandlers<T> = {
  onSuccess?: (result: T) => void;
  onError?: (message: string) => void;
};

export const useAsyncAction = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const run = useCallback(
    <T extends ActionResult>(
      action: () => Promise<T>,
      handlers?: RunHandlers<T>,
    ): void => {
      setError(undefined);
      startTransition(async () => {
        const result = await action();
        if (result.error !== undefined) {
          if (handlers?.onError) {
            handlers.onError(result.error);
          } else {
            setError(result.error);
          }
          return;
        }
        handlers?.onSuccess?.(result);
      });
    },
    [],
  );

  return { isPending, error, run };
};
