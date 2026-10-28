'use client';

import { Badge, Button, Callout } from '@k8ordo/ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { findOtherLoadedPathname } from './loaded-pathname';

import styles from './lcp-demo.module.css';

const isLargestContentfulPaint = (
  entry: PerformanceEntry,
): entry is LargestContentfulPaint =>
  entry.entryType === 'largest-contentful-paint';

// 機能対応は環境依存で SSR では判定できないため、useSyncExternalStore で
// クライアント確定値を読む（サーバーは対応ありと仮定して初期描画を維持）。
const subscribeNoop = (): (() => void) => () => undefined;
const getSupportedSnapshot = (): boolean =>
  typeof PerformanceObserver !== 'undefined' &&
  PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint');
const getServerSnapshot = (): boolean => true;

const getOtherLoadedPathname = (): string | null =>
  findOtherLoadedPathname(
    performance.getEntriesByType('navigation')[0]?.name,
    location.pathname,
  );
const getOtherLoadedPathnameOnServer = (): string | null => null;

const reloadDocument = (): void => {
  location.reload();
};

type LCPEntry = {
  id: number;
  startTime: number;
  renderTime: number;
  loadTime: number;
  size: number;
  element: string | null;
  url: string;
  elementId: string;
  timestamp: string;
};

export function LCPDemo() {
  const [entries, setEntries] = useState<LCPEntry[]>([]);
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    getSupportedSnapshot,
    getServerSnapshot,
  );
  // URL を先に確定させる router（k8ordo）では、戻る・進むで去っていくページが
  // 行き先の URL で読み直してしまうので購読しない
  const otherLoadedPathname = useSyncExternalStore(
    subscribeNoop,
    getOtherLoadedPathname,
    getOtherLoadedPathnameOnServer,
  );
  // 受信済みエントリは ref に持ち、state には毎回その写しを入れる。buffered: true は
  // observe のたびに過去エントリを再配信するため、effect の開始時に ref を空にして
  // 再マウント時の重複を避ける（state の初期化を effect 内で行わないため）
  const collectedRef = useRef<LCPEntry[]>([]);
  const entryIdRef = useRef(0);

  useEffect(() => {
    if (!isSupported) return undefined;

    collectedRef.current = [];
    entryIdRef.current = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!isLargestContentfulPaint(entry)) continue;

        entryIdRef.current += 1;
        collectedRef.current = [
          {
            id: entryIdRef.current,
            startTime: entry.startTime,
            renderTime: entry.renderTime,
            loadTime: entry.loadTime,
            size: entry.size,
            element: entry.element?.tagName ?? null,
            url: entry.url,
            elementId: entry.id,
            timestamp: new Date().toLocaleTimeString('ja-JP'),
          },
          ...collectedRef.current,
        ].slice(0, 10);
      }
      setEntries(collectedRef.current);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    return () => {
      observer.disconnect();
    };
  }, [isSupported]);

  const handleReset = useCallback(() => {
    collectedRef.current = [];
    entryIdRef.current = 0;
    setEntries([]);
  }, []);

  if (!isSupported) {
    return (
      <div>
        <p className={styles.note}>
          このブラウザはLargest Contentful Paint APIをサポートしていません。
        </p>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className={styles.root}>
      {otherLoadedPathname !== null && (
        <Callout tone="info">
          <p>
            このページへは文書を読み込まずに移動したため、表示しているのは文書を読み込んだページ（
            <code>{otherLoadedPathname}</code>）のLCPです。
          </p>
          <div>
            <Button
              color="primary"
              onClick={reloadDocument}
              size="sm"
              variant="outline"
            >
              読み込み直して測る
            </Button>
          </div>
        </Callout>
      )}
      <div className={styles.toolbar}>
        <Button color="base" onClick={handleReset} size="sm" variant="outline">
          リセット
        </Button>
        <span className={styles.count}>
          検出回数: <span className={styles.countValue}>{entries.length}</span>
        </span>
      </div>

      {latestEntry === undefined ? (
        <div>
          <p className={styles.note}>
            LCPエントリを待機中...ページを再読み込みすると計測されます。
          </p>
        </div>
      ) : (
        <div>
          <div className={styles.latestHeader}>
            <div className={styles.latestTitle}>
              <h4 className={styles.heading}>
                {otherLoadedPathname === null
                  ? '現在のLCP'
                  : '文書を読み込んだページのLCP'}
              </h4>
              {latestEntry.element !== null && (
                <code className={styles.tag}>{latestEntry.element}</code>
              )}
            </div>
            <span className={styles.timestamp}>{latestEntry.timestamp}</span>
          </div>
          <div className={styles.primary}>
            <div className={styles.primaryRow}>
              <span className={styles.startTime}>
                {latestEntry.startTime.toFixed(0)}
              </span>
              <span className={styles.unit}>ms (startTime)</span>
            </div>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <span className={styles.metricName}>renderTime</span>
              <span className={styles.metricValue}>
                {latestEntry.renderTime.toFixed(1)}ms
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricName}>loadTime</span>
              <span className={styles.metricValue}>
                {latestEntry.loadTime.toFixed(1)}ms
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricName}>size</span>
              <span className={styles.metricValue}>
                {latestEntry.size.toLocaleString()}px²
              </span>
            </div>
            {latestEntry.url && (
              <div className={styles.metricUrl}>
                <span className={styles.metricUrlName}>url</span>
                <span className={styles.metricUrlValue}>{latestEntry.url}</span>
              </div>
            )}
            {latestEntry.elementId && (
              <div className={styles.metric}>
                <span className={styles.metricName}>id</span>
                <span className={styles.metricValue}>
                  {latestEntry.elementId}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {entries.length > 1 && (
        <div className={styles.history}>
          <h4 className={styles.historyHeading}>LCP候補の履歴</h4>
          <div className={styles.historyList}>
            {entries.slice(1).map((entry) => (
              <div className={styles.historyItem} key={entry.id}>
                <div className={styles.historyMeta}>
                  <span className={styles.historyTime}>{entry.timestamp}</span>
                  {entry.element !== null && (
                    <Badge size="sm" label={entry.element} />
                  )}
                </div>
                <div className={styles.historyValues}>
                  <span className={styles.historySize}>
                    {entry.size.toLocaleString()}px²
                  </span>
                  <span className={styles.historyStart}>
                    {entry.startTime.toFixed(0)}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.note}>
        {otherLoadedPathname === null
          ? 'ページ読み込み時のLCP（Largest Contentful Paint）を計測しています。ページを再読み込みすると新しい計測結果が表示されます。'
          : 'LCP（Largest Contentful Paint）は文書を読み込んだときにだけ報告され、文書を読み込まないページの移動では新しく報告されません。'}
      </p>
    </div>
  );
}
