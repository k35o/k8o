'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * Largest Contentful Paint APIのデモ
 * ページ内のLCP要素の情報を表示する
 */
export function LCPDemo() {
  const [entries, setEntries] = useState<LCPEntry[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const entryIdRef = useRef(0);

  useEffect(() => {
    if (
      typeof PerformanceObserver === 'undefined' ||
      !PerformanceObserver.supportedEntryTypes?.includes(
        'largest-contentful-paint',
      )
    ) {
      setIsSupported(false);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcpEntry = entry as LargestContentfulPaint;

        entryIdRef.current += 1;

        setEntries((prev) =>
          [
            {
              id: entryIdRef.current,
              startTime: lcpEntry.startTime,
              renderTime: lcpEntry.renderTime,
              loadTime: lcpEntry.loadTime,
              size: lcpEntry.size,
              element: lcpEntry.element?.tagName ?? null,
              url: lcpEntry.url,
              elementId: lcpEntry.id,
              timestamp: new Date().toLocaleTimeString('ja-JP'),
            },
            ...prev,
          ].slice(0, 10),
        );
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleReset = useCallback(() => {
    setEntries([]);
    entryIdRef.current = 0;
  }, []);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border-base bg-bg-mute p-4">
        <p className="text-fg-mute text-sm">
          このブラウザはLargest Contentful Paint APIをサポートしていません。
        </p>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button color="gray" onClick={handleReset} size="sm" variant="outlined">
          リセット
        </Button>
        <span className="text-fg-mute text-sm">
          検出回数:{' '}
          <span className="font-medium text-fg-base">{entries.length}</span>
        </span>
      </div>

      {latestEntry ? (
        <div className="rounded-lg border border-border-base bg-bg-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-fg-base">現在のLCP</h4>
              {latestEntry.element && (
                <code className="rounded bg-bg-mute px-1.5 py-0.5 text-xs">
                  {latestEntry.element}
                </code>
              )}
            </div>
            <span className="text-fg-mute text-xs">
              {latestEntry.timestamp}
            </span>
          </div>
          <div className="mb-4">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-bold text-2xl text-primary-fg">
                {latestEntry.startTime.toFixed(0)}
              </span>
              <span className="text-fg-mute text-sm">ms (startTime)</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fg-mute">renderTime</span>
              <span className="font-medium text-fg-base">
                {latestEntry.renderTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-mute">loadTime</span>
              <span className="font-medium text-fg-base">
                {latestEntry.loadTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg-mute">size</span>
              <span className="font-medium text-fg-base">
                {latestEntry.size.toLocaleString()}px²
              </span>
            </div>
            {latestEntry.url && (
              <div className="flex justify-between gap-2">
                <span className="shrink-0 text-fg-mute">url</span>
                <span className="truncate font-medium text-fg-base text-xs">
                  {latestEntry.url}
                </span>
              </div>
            )}
            {latestEntry.elementId && (
              <div className="flex justify-between">
                <span className="text-fg-mute">id</span>
                <span className="font-medium text-fg-base">
                  {latestEntry.elementId}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border-base bg-bg-mute p-4">
          <p className="text-fg-mute text-sm">
            LCPエントリを待機中...ページを再読み込みすると計測されます。
          </p>
        </div>
      )}

      {entries.length > 1 && (
        <div className="space-y-2">
          <h4 className="font-medium text-fg-mute text-sm">LCP候補の履歴</h4>
          <div className="space-y-1">
            {entries.slice(1).map((entry) => (
              <div
                className="flex items-center justify-between rounded-md bg-bg-mute px-3 py-2 text-sm"
                key={entry.id}
              >
                <div className="flex items-center gap-2">
                  <span className="text-fg-mute">{entry.timestamp}</span>
                  {entry.element && <TextTag size="sm" text={entry.element} />}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-fg-mute text-xs">
                    {entry.size.toLocaleString()}px²
                  </span>
                  <span className="font-medium text-fg-base">
                    {entry.startTime.toFixed(0)}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-fg-mute text-sm">
        ページ読み込み時のLCP（Largest Contentful
        Paint）を計測しています。ページを再読み込みすると新しい計測結果が表示されます。
      </p>
    </div>
  );
}
