'use client';

import { type FC, useSyncExternalStore } from 'react';

let didInit = false;

declare global {
  // biome-ignore lint/style/noNamespace: 上書きなので
  namespace React {
    // biome-ignore lint/style/noNamespace: 上書きなので
    namespace JSX {
      // biome-ignore lint/nursery/useConsistentTypeDefinitions: 上書きなので
      interface IntrinsicElements {
        'baseline-status': { featureId: string; className: string };
      }
    }
  }
}

export const BaselineStatus: FC<{ featureId: string }> = ({ featureId }) => {
  const isLoad = useSyncExternalStore(
    (onStoreChange: () => void) => {
      if (!didInit) {
        didInit = true;
        void import('baseline-status' as string).then(() => {
          onStoreChange();
        });
      }
      return () => {
        /* noop */
      };
    },
    () => didInit,
    () => false,
  );

  if (!isLoad) {
    // TODO: レスポンシブな見た目に対応する
    return (
      <div
        className="max-w-full animate-pulse rounded-md border border-border-base bg-bg-base p-4"
        style={{ height: '120px' }}
      />
    );
  }

  return (
    <baseline-status
      className="wrap-normal max-w-full rounded-md border border-border-base bg-bg-base p-4"
      featureId={featureId}
    />
  );
};
