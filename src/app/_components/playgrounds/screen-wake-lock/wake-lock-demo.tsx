'use client';

import { Button } from '@/components/button';
import { FC, useCallback, useRef, useState } from 'react';

export const WakeLockDemo: FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const handleClick = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (navigator.wakeLock) {
      if (wakeLock.current) {
        wakeLock.current
          .release()
          .then(() => {
            wakeLock.current = null;
          })
          .catch((error: unknown) => {
            console.error('ロックの解除に失敗しました', error);
          });
        return;
      }
      wakeLock.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);
      wakeLock.current.addEventListener('release', () => {
        setIsLocked(false);
        wakeLock.current = null;
      });
    } else {
      console.warn('Screen Wake Lock APIがサポートされていません');
    }
  }, []);

  return (
    <Button onClick={() => void handleClick()}>
      {isLocked
        ? 'スリープ機能のロックを解除する'
        : 'スリープ機能をロックする'}
    </Button>
  );
};
