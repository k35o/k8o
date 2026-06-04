'use client';

import { useCallback, useState, useTransition } from 'react';

// Server Action はエラー時に error へメッセージを入れて返す共通形を持つ。
type ActionResult = {
  error?: string;
};

type RunHandlers<T> = {
  onSuccess?: (result: T) => void;
  // 省略時は内部の error ステートにメッセージを格納する。
  // toast 等で独自にエラー表示したい場合に上書きする。
  onError?: (message: string) => void;
};

// isPending + error の定型（transition 実行・エラー初期化・結果分岐）をまとめる。
export const useAsyncAction = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  // run を公開 API として返すため参照を固定する（呼び出し元が useEffect 依存に
  // 入れても安全にする）。setError・startTransition は安定参照なので依存配列は空でよい。
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
