'use client';

import { Button, Code, Switch } from '@k8ordo/ui';
import { range } from '@repo/helpers/array/range';
import { useEffect, useRef, useState } from 'react';

const INITIAL_COUNT = 12;
const MAP_HEIGHT = 224;

type Metrics = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  prependedHeight: number;
};

const measure = (container: HTMLElement, prepended: HTMLElement): Metrics => ({
  scrollTop: Math.round(container.scrollTop),
  scrollHeight: container.scrollHeight,
  clientHeight: container.clientHeight,
  prependedHeight: prepended.offsetHeight,
});

const scrollToMiddle = (container: HTMLElement): void => {
  container.scrollTop = container.scrollHeight / 2;
};

export function ScrollAnchoringDemo() {
  const [anchoring, setAnchoring] = useState(true);
  const [prepended, setPrepended] = useState(0);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const prependedRef = useRef<HTMLDivElement>(null);

  // 最初にスクロール位置を途中まで進めておく。位置0だと補正が抑制されて違いが見えない。
  // 以降は scroll イベントと、要素の追加で先頭ブロックの高さが変わったときに測り直す
  useEffect(() => {
    const container = containerRef.current;
    const prependedBlock = prependedRef.current;
    if (container === null || prependedBlock === null) return undefined;
    scrollToMiddle(container);
    setMetrics(measure(container, prependedBlock));
    const observer = new ResizeObserver(() => {
      setMetrics(measure(container, prependedBlock));
    });
    observer.observe(prependedBlock);
    return () => {
      observer.disconnect();
    };
  }, []);

  const scale = metrics === null ? 0 : MAP_HEIGHT / metrics.scrollHeight;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Switch
          checked={anchoring}
          label="overflow-anchor: auto（補正あり）"
          onChange={setAnchoring}
        />
        <Button
          onClick={() => {
            setPrepended((prev) => prev + 1);
          }}
        >
          先頭に要素を追加
        </Button>
        <Button
          color="base"
          onClick={() => {
            setPrepended(0);
            const container = containerRef.current;
            const prependedBlock = prependedRef.current;
            if (container !== null && prependedBlock !== null) {
              scrollToMiddle(container);
              setMetrics(measure(container, prependedBlock));
            }
          }}
          variant="outline"
        >
          リセット
        </Button>
      </div>

      <div className="flex gap-4">
        <section
          aria-label="スクロールアンカリングを確認するスクロール領域"
          className="bg-bg-mute h-56 min-w-0 flex-1 overflow-y-scroll rounded-xl p-4"
          onScroll={(e) => {
            const prependedBlock = prependedRef.current;
            if (prependedBlock !== null) {
              setMetrics(measure(e.currentTarget, prependedBlock));
            }
          }}
          ref={containerRef}
          style={{
            overflowAnchor: anchoring ? 'auto' : 'none',
            // オーバーレイスクロールバーの環境でも常に表示して、位置の変化を見せる
            scrollbarColor: 'var(--color-fg-subtle) var(--color-bg-subtle)',
          }}
          tabIndex={0}
        >
          <div className="flex flex-col gap-3">
            <div
              className="flex flex-col gap-3 empty:hidden"
              ref={prependedRef}
            >
              {range(0, prepended).map((n) => (
                <div
                  className="bg-primary-bg text-primary-fg rounded-md p-3 text-sm"
                  key={`prepended-${String(n)}`}
                >
                  あとから先頭に追加された要素 {String(prepended - n)}
                </div>
              ))}
            </div>
            {range(0, INITIAL_COUNT).map((n) => (
              <div
                className="bg-bg-base rounded-md p-3 shadow-sm"
                key={`item-${String(n)}`}
              >
                <p className="text-fg-base">アイテム {String(n + 1)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* スクロール領域の全体を縦に縮めた地図。追加した要素の領域と、いま見えている範囲を重ねる */}
        <div
          aria-hidden="true"
          className="bg-bg-subtle relative w-6 shrink-0 rounded-full"
          style={{ height: MAP_HEIGHT }}
        >
          {metrics !== null && (
            <>
              <div
                className="bg-primary-bg absolute inset-x-0 top-0 rounded-t-full"
                style={{ height: metrics.prependedHeight * scale }}
              />
              <div
                className="border-fg-base absolute inset-x-0 rounded-sm border-2 transition-[top] duration-200"
                style={{
                  top: metrics.scrollTop * scale,
                  height: metrics.clientHeight * scale,
                }}
              />
            </>
          )}
        </div>
      </div>

      {metrics !== null && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-fg-mute">scrollTop</dt>
          <dd className="text-fg-base font-mono">
            {String(metrics.scrollTop)}px
          </dd>
          <dt className="text-fg-mute">先頭に追加した要素の高さ</dt>
          <dd className="text-fg-base font-mono">
            {String(metrics.prependedHeight)}px
          </dd>
        </dl>
      )}

      <p className="text-fg-mute text-sm">
        途中までスクロールした状態で先頭に要素を足します。右の帯は領域全体を縮めた地図で、上の塗りが追加した要素、枠がいま見えている範囲です。
        <Code>auto</Code>
        では枠が追加した高さのぶん下へ動いて見えているアイテムが留まり、
        <Code>none</Code>
        では枠が動かず、見えていたアイテムが下へ押し出されます。
      </p>
    </div>
  );
}
