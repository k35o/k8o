'use client';

import { Button } from '@k8o/arte-odyssey';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

export const WakeLockDemo: FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const isRequesting = useRef(false);
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    setIsSupported('wakeLock' in navigator);
    return () => {
      isUnmounted.current = true;
      wakeLock.current?.release().catch((error: unknown) => {
        console.error('ロックの解除に失敗しました', error);
      });
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock APIがサポートされていません');
      return;
    }
    if (wakeLock.current) {
      wakeLock.current
        .release()
        .then(() => {
          wakeLock.current = null;
          return undefined;
        })
        .catch((error: unknown) => {
          console.error('ロックの解除に失敗しました', error);
        });
      return;
    }
    // request の解決を待つ間の再クリックで sentinel を二重取得しないためのガード
    if (isRequesting.current) {
      return;
    }
    isRequesting.current = true;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      // 待機中にアンマウントされると cleanup が sentinel を掴めないため、ここで解放する
      if (isUnmounted.current) {
        sentinel.release().catch((error: unknown) => {
          console.error('ロックの解除に失敗しました', error);
        });
        return;
      }
      wakeLock.current = sentinel;
      setIsLocked(true);
      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        wakeLock.current = null;
      });
    } catch (error) {
      console.error('ロックの取得に失敗しました', error);
    } finally {
      isRequesting.current = false;
    }
  }, []);

  return (
    <Button disabled={!isSupported} onClick={() => void handleClick()}>
      {isLocked ? 'スリープ機能のロックを解除する' : 'スリープ機能をロックする'}
    </Button>
  );
};
