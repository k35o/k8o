'use client';

import { FC, useSyncExternalStore } from 'react';

let didInit = false;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
      interface IntrinsicElements {
        ['baseline-status']: { featureId: string; className: string };
      }
    }
  }
}

export const BaselineStatus: FC<{ featureId: string }> = ({
  featureId,
}) => {
  const isLoad = useSyncExternalStore(
    (onStoreChange: () => void) => {
      if (!didInit) {
        didInit = true;
        void import('baseline-status').then(() => {
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
        className="bg-bg-base border-border-base max-w-full animate-pulse rounded-md border p-4"
        style={{ height: '120px' }}
      />
    );
  }

  return (
    <baseline-status
      className="bg-bg-base border-border-base wrap-normal max-w-full rounded-md border p-4"
      featureId={featureId}
    ></baseline-status>
  );
};
