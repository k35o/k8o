'use client';

import { Button, Code } from '@k8ordo/ui';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import styles from './shared-worker-demo.module.css';

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
      worker.port.postMessage({ type: 'disconnect' });
    };
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
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
      <p className={styles.unsupported}>
        このブラウザはSharedWorkerをサポートしていません。
      </p>
    );
  }

  return (
    <div className={styles.root}>
      <p className={styles.note}>
        このページを別タブでもう一度開くと、Worker起動時刻が両タブで一致し、
        どちらかのタブで「+1」を押すと両タブのカウンタが同期するのが見えます。
      </p>
      <div>
        <p className={styles.note}>共有カウンタ</p>
        <div className={styles.counter}>
          <span className={styles.count}>{count}</span>
          <Button onClick={handleIncrement} size="sm" type="button">
            +1
          </Button>
        </div>
      </div>
      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt className={styles.term}>Worker起動時刻</dt>
          <dd>
            <Code>{startedAt === null ? '...' : formatTime(startedAt)}</Code>
          </dd>
        </div>
        <div className={styles.detail}>
          <dt className={styles.term}>接続中のタブ数</dt>
          <dd className={styles.connections}>
            <span aria-hidden className={styles.dots}>
              {Array.from({ length: connections }, (_, index) => (
                <span className={styles.dot} key={index} />
              ))}
            </span>
            <Code>{String(connections)}</Code>
          </dd>
        </div>
      </dl>
    </div>
  );
}
