'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const WORKER_URL = '/playgrounds/shared-worker.worker.js';

// 機能対応は環境依存で SSR では判定できないため、useSyncExternalStore で
// クライアント確定値を読む（サーバーは対応ありと仮定して初期描画を維持）。
const subscribeNoop = (): (() => void) => () => undefined;
const getSupportedSnapshot = (): boolean => typeof SharedWorker !== 'undefined';
const getServerSnapshot = (): boolean => true;

type WorkerMessage =
  | { type: 'init'; startedAt: number; count: number; connections: number }
  | { type: 'count'; count: number }
  | { type: 'connections'; connections: number };

const formatTime = (ms: number): string => {
  const date = new Date(ms);
  return date.toLocaleTimeString('ja-JP', { hour12: false });
};

export function SharedWorkerDemo() {
  const supported = useSyncExternalStore(
    subscribeNoop,
    getSupportedSnapshot,
    getServerSnapshot,
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [connections, setConnections] = useState(0);
  const port = useRef<MessagePort | null>(null);

  useEffect(() => {
    if (!supported) return undefined;

    const worker = new SharedWorker(WORKER_URL, {
      name: 'k8o-shared-worker-demo',
    });

    worker.port.addEventListener('message', (event) => {
      const data = event.data as WorkerMessage;
      switch (data.type) {
        case 'init':
          setStartedAt(data.startedAt);
          setCount(data.count);
          setConnections(data.connections);
          return;
        case 'count':
          setCount(data.count);
          return;
        case 'connections':
          setConnections(data.connections);
      }
    });
    worker.port.start();

    port.current = worker.port;

    // useEffectのcleanupはページ遷移・リロードでは発火しないため、
    // pagehideイベントでもdisconnectを送ってWorker側のports Setから外す
    // bfcacheに入る (event.persisted === true) ときはポートを生かしたまま離脱する
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      // oxlint-disable-next-line require-post-message-target-origin -- MessagePort.postMessageはtargetOrigin非対応
      worker.port.postMessage({ type: 'disconnect' });
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      // oxlint-disable-next-line require-post-message-target-origin -- MessagePort.postMessageはtargetOrigin非対応
      worker.port.postMessage({ type: 'disconnect' });
      worker.port.close();
      port.current = null;
    };
  }, [supported]);

  const handleIncrement = () => {
    port.current?.postMessage({ type: 'increment' });
  };

  if (!supported) {
    return (
      <p className="text-fg-mute text-sm">
        このブラウザはSharedWorkerをサポートしていません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-fg-mute text-xs">
        このページを別タブでもう一度開くと、Worker起動時刻が両タブで一致し、
        どちらかのタブで「+1」を押すと両タブのカウンタが同期するのが見えます。
      </p>
      <div className="bg-bg-base rounded-xl p-6 shadow-sm">
        <p className="text-fg-mute text-xs">共有カウンタ</p>
        <div className="mt-2 flex items-baseline gap-4">
          <span className="text-primary-fg text-emphasize font-bold tabular-nums">
            {count}
          </span>
          <Button onClick={handleIncrement} size="sm" type="button">
            +1
          </Button>
        </div>
      </div>
      <dl className="bg-bg-mute flex flex-col gap-2 rounded-xl p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-fg-mute">Worker起動時刻</dt>
          <dd>
            <Code>{startedAt === null ? '...' : formatTime(startedAt)}</Code>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-fg-mute">接続中のタブ数</dt>
          <dd className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1">
              {Array.from({ length: connections }, (_, index) => (
                <span
                  className="bg-primary-fg inline-block size-2 rounded-full"
                  key={index}
                />
              ))}
            </span>
            <Code>{String(connections)}</Code>
          </dd>
        </div>
      </dl>
    </div>
  );
}
