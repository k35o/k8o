'use client';

import { Button, Code } from '@k8ordo/ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import styles from './event-timing-demo.module.css';

const isPerformanceEventTiming = (
  entry: PerformanceEntry,
): entry is PerformanceEventTiming => entry.entryType === 'event';

// 機能対応は環境依存で SSR では判定できないため、useSyncExternalStore で
// クライアント確定値を読む（サーバーは対応ありと仮定して初期描画を維持）。
const subscribeNoop = (): (() => void) => () => undefined;
const getSupportedSnapshot = (): boolean =>
  typeof PerformanceObserver !== 'undefined' &&
  PerformanceObserver.supportedEntryTypes.includes('event');
const getServerSnapshot = (): boolean => true;

type EventTimingEntry = {
  id: number;
  name: string;
  duration: number;
  inputDelay: number;
  processingTime: number;
  presentationDelay: number;
  timestamp: string;
};

export function EventTimingDemo() {
  const [entries, setEntries] = useState<EventTimingEntry[]>([]);
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    getSupportedSnapshot,
    getServerSnapshot,
  );
  const entryIdRef = useRef(0);

  useEffect(() => {
    if (!isSupported) return undefined;

    const interactionMap = new Map<number, PerformanceEventTiming>();
    const timeoutIds = new Set<ReturnType<typeof setTimeout>>();

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!isPerformanceEventTiming(entry)) continue;
        const eventEntry = entry;
        if (eventEntry.interactionId === 0) continue;

        const existing = interactionMap.get(eventEntry.interactionId);
        if (existing) {
          if (eventEntry.duration > existing.duration) {
            interactionMap.set(eventEntry.interactionId, eventEntry);
          }
          continue;
        }
        interactionMap.set(eventEntry.interactionId, eventEntry);

        // 同一 interactionId のイベントが順次到着するので、少し待って最大 duration を確定させる
        const timeoutId = setTimeout(() => {
          timeoutIds.delete(timeoutId);

          const finalEntry = interactionMap.get(eventEntry.interactionId);
          if (!finalEntry) return undefined;

          interactionMap.delete(eventEntry.interactionId);

          const inputDelay = finalEntry.processingStart - finalEntry.startTime;
          const processingTime =
            finalEntry.processingEnd - finalEntry.processingStart;
          const presentationDelay =
            finalEntry.duration -
            (finalEntry.processingEnd - finalEntry.startTime);

          entryIdRef.current += 1;

          setEntries((prev) =>
            [
              {
                id: entryIdRef.current,
                name: finalEntry.name,
                duration: finalEntry.duration,
                inputDelay: Math.max(0, inputDelay),
                processingTime: Math.max(0, processingTime),
                presentationDelay: Math.max(0, presentationDelay),
                timestamp: new Date().toLocaleTimeString('ja-JP'),
              },
              ...prev,
            ].slice(0, 5),
          );
          return undefined;
        }, 100);
        timeoutIds.add(timeoutId);
      }
    });

    observer.observe({
      type: 'event',
      buffered: false,
      // @ts-expect-error durationThreshold は PerformanceObserverInit に未収録（追加されたら削除）
      durationThreshold: 16,
    });

    return () => {
      observer.disconnect();
      for (const id of timeoutIds) {
        clearTimeout(id);
      }
      timeoutIds.clear();
    };
  }, [isSupported]);

  const handleReset = useCallback(() => {
    setEntries([]);
    entryIdRef.current = 0;
  }, []);

  const handleClick = useCallback(() => {
    const start = performance.now();
    while (performance.now() - start < 50) {
      // 意図的に重い処理
    }
  }, []);

  if (!isSupported) {
    return (
      <div>
        <p className={styles.note}>
          このブラウザはEvent Timing APIをサポートしていません。
        </p>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <Button onClick={handleClick}>クリックして計測</Button>
        <Button color="base" onClick={handleReset} size="sm" variant="outline">
          リセット
        </Button>
        <span className={styles.count}>
          計測回数: <span className={styles.countValue}>{entries.length}</span>
        </span>
      </div>

      {latestEntry && (
        <div>
          <div className={styles.latestHeader}>
            <div className={styles.latestTitle}>
              <h4 className={styles.latestHeading}>最新の計測結果</h4>
              <Code>{latestEntry.name}</Code>
            </div>
            <span className={styles.timestamp}>{latestEntry.timestamp}</span>
          </div>
          <div className={styles.duration}>
            <div className={styles.durationRow}>
              <span className={styles.durationValue}>
                {latestEntry.duration.toFixed(0)}
              </span>
              <span className={styles.durationUnit}>ms (duration)</span>
            </div>
          </div>
          <div className={styles.bars}>
            <TimingBar
              tone="info"
              label="入力遅延"
              maxValue={latestEntry.duration}
              value={latestEntry.inputDelay}
            />
            <TimingBar
              tone="warning"
              label="処理時間"
              maxValue={latestEntry.duration}
              value={latestEntry.processingTime}
            />
            <TimingBar
              tone="success"
              label="描画遅延"
              maxValue={latestEntry.duration}
              value={latestEntry.presentationDelay}
            />
          </div>
        </div>
      )}

      {entries.length > 1 && (
        <div className={styles.history}>
          <h4 className={styles.historyHeading}>履歴</h4>
          <div className={styles.historyList}>
            {entries.slice(1).map((entry) => (
              <div className={styles.historyRow} key={entry.id}>
                <div className={styles.historyName}>
                  <span className={styles.historyTime}>{entry.timestamp}</span>
                  <Code>{entry.name}</Code>
                </div>
                <div className={styles.historyMetrics}>
                  <span className={styles.metric}>
                    入力: {entry.inputDelay.toFixed(1)}ms
                  </span>
                  <span className={styles.metric}>
                    処理: {entry.processingTime.toFixed(1)}ms
                  </span>
                  <span className={styles.metric}>
                    描画: {entry.presentationDelay.toFixed(1)}ms
                  </span>
                  <span className={styles.historyDuration}>
                    {entry.duration.toFixed(0)}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.note}>
        ボタンをクリックすると、Event Timing
        APIを使ってイベントの処理時間を計測します。
        約50msの処理を意図的に行うため、処理時間が可視化されます。
      </p>
    </div>
  );
}

type TimingTone = 'info' | 'warning' | 'success';

function TimingBar({
  label,
  value,
  maxValue,
  tone,
}: {
  label: string;
  value: number;
  maxValue: number;
  tone: TimingTone;
}) {
  const percentage = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          data-tone={tone}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={styles.barValue}>{value.toFixed(1)}ms</span>
    </div>
  );
}
