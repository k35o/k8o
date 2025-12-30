'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useCallback, useEffect, useRef, useState } from 'react';

// TypeScriptの型定義にinteractionIdが含まれていないため拡張
type PerformanceEventTimingWithInteractionId = PerformanceEventTiming & {
  interactionId: number;
};

type EventTimingEntry = {
  id: number;
  name: string;
  duration: number;
  inputDelay: number;
  processingTime: number;
  presentationDelay: number;
  timestamp: string;
};

/**
 * Event Timing APIのデモ
 * ボタンクリック時のイベントタイミングを計測・表示する
 */
export function EventTimingDemo() {
  const [entries, setEntries] = useState<EventTimingEntry[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const entryIdRef = useRef(0);

  useEffect(() => {
    if (
      typeof PerformanceObserver === 'undefined' ||
      !PerformanceObserver.supportedEntryTypes?.includes('event')
    ) {
      setIsSupported(false);
      return;
    }

    const interactionMap = new Map<
      number,
      PerformanceEventTimingWithInteractionId
    >();
    const timeoutIds = new Set<ReturnType<typeof setTimeout>>();

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry =
          entry as unknown as PerformanceEventTimingWithInteractionId;

        // interactionIdがないイベントはスキップ
        if (!eventEntry.interactionId) continue;

        const existing = interactionMap.get(eventEntry.interactionId);

        // 同一インタラクションの中で最大のdurationを持つエントリを記録
        if (existing) {
          if (eventEntry.duration > existing.duration) {
            interactionMap.set(eventEntry.interactionId, eventEntry);
          }
          continue;
        }

        // 新しいインタラクションを記録
        interactionMap.set(eventEntry.interactionId, eventEntry);

        // 少し待ってから結果を追加（同一インタラクションの全イベントを待つ）
        const timeoutId = setTimeout(() => {
          timeoutIds.delete(timeoutId);

          const finalEntry = interactionMap.get(eventEntry.interactionId);
          if (!finalEntry) return;

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
        }, 100);
        timeoutIds.add(timeoutId);
      }
    });

    // durationThresholdはEvent Timing APIの標準オプションだがTypeScriptの型定義に含まれていない
    observer.observe({
      type: 'event',
      buffered: false,
      durationThreshold: 16,
    } as PerformanceObserverInit & { durationThreshold?: number });

    return () => {
      observer.disconnect();
      for (const id of timeoutIds) {
        clearTimeout(id);
      }
      timeoutIds.clear();
    };
  }, []);

  const handleReset = useCallback(() => {
    setEntries([]);
    entryIdRef.current = 0;
  }, []);

  const handleClick = useCallback(() => {
    const start = performance.now();
    // 約50msの処理をシミュレート
    while (performance.now() - start < 50) {
      // 意図的に重い処理
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border-base bg-bg-mute p-4">
        <p className="text-fg-mute text-sm">
          このブラウザはEvent Timing APIをサポートしていません。
        </p>
      </div>
    );
  }

  const latestEntry = entries[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleClick}>クリックして計測</Button>
        <Button color="gray" onClick={handleReset} size="sm" variant="outlined">
          リセット
        </Button>
        <span className="text-fg-mute text-sm">
          計測回数:{' '}
          <span className="font-medium text-fg-base">{entries.length}</span>
        </span>
      </div>

      {latestEntry && (
        <div className="rounded-lg border border-border-base bg-bg-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-fg-base">最新の計測結果</h4>
              <Code>{latestEntry.name}</Code>
            </div>
            <span className="text-fg-mute text-xs">
              {latestEntry.timestamp}
            </span>
          </div>
          <div className="mb-4">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-bold text-2xl text-primary-fg">
                {latestEntry.duration.toFixed(0)}
              </span>
              <span className="text-fg-mute text-sm">ms (duration)</span>
            </div>
          </div>
          <div className="space-y-2">
            <TimingBar
              color="bg-fg-info"
              label="入力遅延"
              maxValue={latestEntry.duration}
              value={latestEntry.inputDelay}
            />
            <TimingBar
              color="bg-fg-warning"
              label="処理時間"
              maxValue={latestEntry.duration}
              value={latestEntry.processingTime}
            />
            <TimingBar
              color="bg-fg-success"
              label="描画遅延"
              maxValue={latestEntry.duration}
              value={latestEntry.presentationDelay}
            />
          </div>
        </div>
      )}

      {entries.length > 1 && (
        <div className="space-y-2">
          <h4 className="font-medium text-fg-mute text-sm">履歴</h4>
          <div className="space-y-1">
            {entries.slice(1).map((entry) => (
              <div
                className="flex items-center justify-between rounded-md bg-bg-mute px-3 py-2 text-sm"
                key={entry.id}
              >
                <div className="flex items-center gap-2">
                  <span className="text-fg-mute">{entry.timestamp}</span>
                  <Code>{entry.name}</Code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-fg-mute text-xs">
                    入力: {entry.inputDelay.toFixed(1)}ms
                  </span>
                  <span className="text-fg-mute text-xs">
                    処理: {entry.processingTime.toFixed(1)}ms
                  </span>
                  <span className="text-fg-mute text-xs">
                    描画: {entry.presentationDelay.toFixed(1)}ms
                  </span>
                  <span className="font-medium text-fg-base">
                    {entry.duration.toFixed(0)}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-fg-mute text-sm">
        ボタンをクリックすると、Event Timing
        APIを使ってイベントの処理時間を計測します。
        約50msの処理を意図的に行うため、処理時間が可視化されます。
      </p>
    </div>
  );
}

function TimingBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const percentage = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-fg-mute text-xs">{label}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-bg-mute">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right font-medium text-fg-base text-xs">
        {value.toFixed(1)}ms
      </span>
    </div>
  );
}
